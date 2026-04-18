# RLS (Row Level Security) — Luồng xử lý chi tiết

## Tổng quan

FarmSmart dùng PostgreSQL RLS để tự động filter dữ liệu theo `farmId` và `userId` của người dùng hiện tại.
Mỗi query chạy đều bị giới hạn đúng phạm vi farm/user — không cần lọc thủ công trong code.

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `JwtAuthenticationFilter.java` | Parse JWT, ghi context vào ThreadLocal |
| `RlsContext.java` | Lưu farmId/userId vào ThreadLocal per-thread |
| `RlsDataSourceWrapper.java` | Intercept `getConnection()`, set config lên PostgreSQL |
| `DataSourceConfig.java` | Cấu hình wrapper vào datasource chính |
| `V1__init.sql` (migration) | Định nghĩa RLS functions và policies |

---

## Luồng chi tiết per-request

### Bước 1 — Parse JWT & ghi context
**`JwtAuthenticationFilter.java`**

```
HTTP Request (Authorization: Bearer <token>)
    │
    ├─ resolveToken()             → tách JWT từ header
    ├─ jwtProvider.validate()     → kiểm tra chữ ký, hết hạn
    ├─ jwtProvider.getPrincipal() → lấy userId, farmId từ claims
    ├─ SecurityContextHolder.setAuthentication()
    └─ RlsContext.set(farmId, userId)  ← ghi vào ThreadLocal
```

---

### Bước 2 — Lưu context vào ThreadLocal
**`RlsContext.java`**

```
ThreadLocal<UUID> FARM_ID = farmId
ThreadLocal<UUID> USER_ID = userId

Mỗi thread (= mỗi request) có vùng nhớ riêng
→ hoàn toàn isolated giữa các request đồng thời
```

---

### Bước 3 — Business logic chạy bình thường
**`Controller → Service → Repository`**

```
Không cần biết RLS tồn tại
Gọi JPA/JDBC như bình thường
    │
    ▼
JPA cần thực thi query → gọi dataSource.getConnection()
```

---

### Bước 4 — Wrapper intercept mỗi lần lấy connection
**`RlsDataSourceWrapper.java`**

```
getConnection() được gọi
    ├─ hikari.getConnection()      → lấy connection vật lý từ pool
    └─ applyRls(conn)
            ├─ đọc RlsContext.getUserId()   → từ ThreadLocal
            ├─ đọc RlsContext.getFarmId()   → từ ThreadLocal
            └─ PreparedStatement:
                set_config('app.current_user_id', userId, false)
                set_config('app.current_farm_id', farmId, false)
                set_config('app.bypass_rls',     'false', false)
                        │
                        ▼
                PostgreSQL session nhận config
```

> `false` (session-level) đảm bảo giá trị luôn bị ghi đè mỗi lần
> Hikari tái sử dụng connection → không bao giờ còn sót giá trị cũ

---

### Bước 5 — PostgreSQL thực thi RLS
**`V1__init.sql`**

```sql
-- Hàm đọc config từ session
current_farm_id()      → current_setting('app.current_farm_id')
current_app_user_id()  → current_setting('app.current_user_id')
is_bypass_rls()        → current_setting('app.bypass_rls') = 'true'

-- RLS Policy (ví dụ)
CREATE POLICY farm_isolation ON some_table
    USING (farm_id = current_farm_id());

-- Query chạy → PostgreSQL tự filter đúng farm/user
```

---

### Bước 6 — Cleanup sau request
**`JwtAuthenticationFilter.java`**

```
finally {
    RlsContext.clear()   → xóa ThreadLocal
                         → thread trả về Tomcat pool sạch
}

Connection trả về Hikari pool
    → lần getConnection() tiếp theo applyRls() ghi đè hoàn toàn
    → không có giá trị cũ còn sót
```

---

## Sơ đồ tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Request                        │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ JwtAuthentication   │  parse JWT
              │ Filter.java         │  RlsContext.set()
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ Controller          │
              │ Service             │  logic bình thường
              │ Repository          │  không biết RLS
              └──────────┬──────────┘
                         │ getConnection()
              ┌──────────▼──────────┐
              │ RlsDataSource       │  đọc RlsContext
              │ Wrapper.java        │  set_config → PostgreSQL
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ PostgreSQL          │  RLS policy chạy
              │ (RLS functions)     │  tự filter đúng farm
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │ JwtAuthentication   │  finally:
              │ Filter.java         │  RlsContext.clear()
              └─────────────────────┘
```

---

## Phân tích an toàn

| Kịch bản | Trạng thái | Lý do |
|----------|------------|-------|
| Leak giữa các request (ThreadLocal) | ✅ An toàn | `finally` trong filter luôn clear ThreadLocal |
| Leak giữa connection pool | ✅ An toàn | Wrapper ghi đè `set_config` mỗi lần `getConnection()` |
| Nhiều connection trong 1 request | ✅ An toàn | Mỗi lần `getConnection()` đều đọc lại ThreadLocal |
| `bypass_rls` còn sót trên connection cũ | ✅ An toàn | Wrapper luôn reset `bypass_rls=false` |
| Flyway migration | ✅ An toàn | Dùng `hikariDataSource` trực tiếp, bỏ qua wrapper |
| `@Async` / virtual thread | ⚠️ Chưa xử lý | ThreadLocal không truyền sang thread con — cần `RlsContextDecorator` |

---

## Lưu ý quan trọng

### `@Transactional` không bắt buộc

RLS được apply tại tầng **connection**, không phải tầng transaction.
Dù method có `@Transactional` hay không, chỉ cần JPA/JDBC gọi `getConnection()` là RLS tự động hoạt động.

### Flyway dùng connection riêng

**`DataSourceConfig.java`** — Flyway được cấu hình dùng `hikariDataSource` trực tiếp (không qua wrapper)
để tránh lỗi khi chạy migration (không có JWT context lúc startup).

```java
@Bean
public FlywayConfigurationCustomizer flywayCustomizer(
        @Qualifier("hikariDataSource") HikariDataSource hikariDataSource) {
    return configuration -> configuration.dataSource(hikariDataSource);
}
```

### Public endpoint

Với request không có JWT (public endpoint), `RlsContext` rỗng →
wrapper set `userId=""`, `farmId=""` → RLS policy tự block hoặc trả về rỗng tùy policy định nghĩa.

---

## TODO

- [ ] Xử lý `@Async` — implement `RlsContextDecorator` + `AsyncConfig` để truyền context sang thread con
- [ ] Xử lý `@Scheduled` — truyền context thủ công hoặc dùng system user không có RLS
