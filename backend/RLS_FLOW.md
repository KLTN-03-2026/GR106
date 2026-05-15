# RLS (Row Level Security) — Luồng xử lý chi tiết

## Tổng quan

FarmSmart dùng PostgreSQL RLS để tự động filter dữ liệu theo `farmId` và `userId` của người dùng hiện tại.
Mỗi query chạy đều bị giới hạn đúng phạm vi farm/user — không cần lọc thủ công trong code.

---

## Các file liên quan

| File | Vai trò |
|------|---------|
| `JwtAuthenticationFilter.java` | Parse JWT, ghi context vào ThreadLocal, cleanup sau request |
| `RlsContext.java` | Lưu farmId / userId / bypass vào ThreadLocal per-thread |
| `RlsDataSourceWrapper.java` | Intercept `getConnection()`, apply RLS config lên PostgreSQL |
| `DataSourceConfig.java` | Đăng ký wrapper là datasource chính; Flyway dùng hikari trực tiếp |
| `RlsUtils.java` | Chạy logic với bypass RLS; `syncToDb()` force-apply khi context thay đổi giữa transaction |
| `V1__complete_schema.sql` | Định nghĩa RLS functions (`is_bypass_rls`, `current_farm_id`, ...) và policies |

---

## Luồng chi tiết per-request

### Bước 1 — Parse JWT & ghi context
**`JwtAuthenticationFilter.java`**

```
HTTP Request (Authorization: Bearer <token>)
    │
    ├─ resolveToken()              → tách JWT từ header
    ├─ jwtProvider.validate()      → kiểm tra chữ ký, hết hạn
    ├─ jwtProvider.getPrincipal()  → lấy userId, farmId từ claims
    ├─ SecurityContextHolder.setAuthentication()
    └─ RlsContext.set(farmId, userId)  ← ghi vào ThreadLocal
```

Với **public endpoint** (không có JWT): `RlsContext` rỗng → wrapper set `userId=""`, `farmId=""` →
RLS policy tự block hoặc trả về rỗng tuỳ policy định nghĩa.

---

### Bước 2 — Lưu context vào ThreadLocal
**`RlsContext.java`**

```
ThreadLocal<UUID>    FARM_ID = farmId
ThreadLocal<UUID>    USER_ID = userId
ThreadLocal<Boolean> BYPASS  = false   ← mặc định false

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
    ├─ delegate.getConnection()    → lấy connection vật lý từ HikariCP pool
    └─ applyRls(conn)
            ├─ đọc RlsContext.getUserId()   → từ ThreadLocal
            ├─ đọc RlsContext.getFarmId()   → từ ThreadLocal
            ├─ đọc RlsContext.isBypass()    → từ ThreadLocal
            └─ PreparedStatement:
                set_config('app.current_user_id', userId, false)
                set_config('app.current_farm_id', farmId, false)
                set_config('app.bypass_rls',      bypass, false)
                        │
                        ▼
                PostgreSQL session nhận config
```

> `false` = session-level — giá trị tồn tại suốt vòng đời connection.
> HikariCP tái sử dụng connection → `applyRls()` ghi đè hoàn toàn mỗi lần `getConnection()`,
> không bao giờ còn sót giá trị cũ từ request trước.

---

### Bước 5 — PostgreSQL thực thi RLS
**`V1__complete_schema.sql`**

```sql
-- Hàm đọc config từ session
current_farm_id()      → current_setting('app.current_farm_id')
current_app_user_id()  → current_setting('app.current_user_id')
is_bypass_rls()        → current_setting('app.bypass_rls') = 'true'

-- RLS Policy (ví dụ bảng có farm_id)
CREATE POLICY plans_select ON plans FOR SELECT
    USING (is_bypass_rls() OR farm_id = current_farm_id());

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

Connection trả về HikariCP pool
    → lần getConnection() tiếp theo applyRls() ghi đè hoàn toàn
    → không có giá trị cũ còn sót
```

---

## Sơ đồ tổng thể (happy path)

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Request                        │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  JwtAuthentication  │  parse JWT
              │  Filter.java        │  RlsContext.set(farmId, userId)
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Controller         │
              │  Service            │  logic bình thường
              │  Repository         │  không biết RLS tồn tại
              └──────────┬──────────┘
                         │ dataSource.getConnection()
              ┌──────────▼──────────┐
              │  RlsDataSource      │  đọc RlsContext (ThreadLocal)
              │  Wrapper.java       │  set_config → PostgreSQL session
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  PostgreSQL         │  is_bypass_rls() / current_farm_id()
              │  RLS policies       │  tự filter đúng farm — query trả về
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  JwtAuthentication  │  finally: RlsContext.clear()
              │  Filter.java        │  thread sạch → trả về Tomcat pool
              └─────────────────────┘
```

---

## Bypass RLS — `RlsUtils.java`

Dùng khi cần chạy logic với quyền admin, bỏ qua RLS policy.
Ví dụ: login, register, IPN callback, ghi audit log, seed data, cross-farm query.

```java
// Có return value
T result = rlsUtils.runAsAdmin(() -> {
    return someRepository.findAll(); // không bị filter bởi RLS
});

// Không có return value
rlsUtils.runAsAdmin(() -> {
    auditRepository.save(log);
});
```

### Luồng bypass — trường hợp bình thường (connection chưa được lấy)

```
rlsUtils.runAsAdmin()
    ├─ lưu prevFarmId, prevUserId từ RlsContext
    ├─ RlsContext.setBypass(true)      ← ghi vào ThreadLocal
    ├─ syncToDb()                      ← force apply ngay vào DB session
    │       └─ EntityManager.createNativeQuery(set_config bypass=true)
    │
    ├─ action.run()
    │       └─ getConnection()
    │               └─ applyRls()
    │                       └─ set_config('app.bypass_rls', 'true', false) ✅
    │
    └─ finally:
            ├─ RlsContext.setBypass(false)
            ├─ RlsContext.set(prevFarmId, prevUserId)   ← restore
            └─ syncToDb()                               ← reset vào DB session
```

### Vì sao cần `syncToDb()`

`RlsDataSourceWrapper` chỉ chạy khi `getConnection()` được gọi — tức là khi
`@Transactional` mở transaction. Nếu `runAsAdmin()` được gọi **trong transaction
đang chạy**, connection đã được checkout từ trước, `applyRls()` không được gọi lại.

`syncToDb()` giải quyết: force-push `RlsContext` vào connection đang dùng ngay lập tức,
không cần chờ `getConnection()` tiếp theo.

```
Ví dụ — login():
    @Transactional login()
        │
        T=0: getConnection() → applyRls(bypass=false)  ← connection checkout
        │
        ├─ runAsAdmin()
        │       ├─ RlsContext.setBypass(true)
        │       ├─ syncToDb() → set_config(bypass=true) NGAY TRÊN connection hiện tại ✅
        │       ├─ userRepository.findByEmail()         ← bypass=true, RLS pass
        │       ├─ refreshTokenRepository.save()        ← bypass=true, RLS pass
        │       └─ finally: syncToDb() → set_config(bypass=false) ← restore
        │
        T=end: COMMIT → connection trả về pool
```

---

## Phân tích an toàn

| Kịch bản | Trạng thái | Lý do |
|----------|------------|-------|
| Leak ThreadLocal giữa các request | ✅ An toàn | `finally` trong filter luôn `RlsContext.clear()` |
| Leak config giữa connection pool | ✅ An toàn | Wrapper ghi đè `set_config` mỗi lần `getConnection()` |
| Nhiều connection trong 1 request | ✅ An toàn | Mỗi `getConnection()` đều đọc lại ThreadLocal |
| `bypass_rls` còn sót trên connection | ✅ An toàn | Wrapper luôn reset `bypass_rls=false` khi không có bypass |
| `runAsAdmin` lồng nhau (nested) | ✅ An toàn | `syncToDb()` ghi đúng giá trị; `finally` restore về trạng thái trước |
| `runAsAdmin` trong `@Transactional` đang chạy | ✅ An toàn | `syncToDb()` force-push vào connection hiện tại |
| Flyway migration khi startup | ✅ An toàn | Flyway dùng `hikariDataSource` trực tiếp, bỏ qua wrapper |
| Public endpoint (không có JWT) | ✅ An toàn | RlsContext rỗng → farmId="" → RLS block tự nhiên |
| `@Async` / virtual thread | ⚠️ Chưa xử lý | ThreadLocal không truyền sang thread con — cần `RlsContextDecorator` |
| `@Scheduled` job | ⚠️ Chưa xử lý | Không có JWT context — cần bypass thủ công hoặc system user |

---

## Lưu ý quan trọng

### `@Transactional` không bắt buộc cho RLS

RLS được apply tại tầng **connection** (trong `getConnection()`), không phải tầng transaction.
Dù method có `@Transactional` hay không, chỉ cần JPA/JDBC gọi `getConnection()` là RLS
tự động hoạt động.

`@Transactional` vẫn cần thiết cho **atomicity** và khi dùng `runAsAdmin()` có `syncToDb()`
(vì `syncToDb()` dùng `EntityManager` cần transaction active).

### Flyway dùng connection riêng

**`DataSourceConfig.java`** — Flyway được cấu hình dùng `hikariDataSource` trực tiếp
(không qua wrapper) để tránh lỗi khi chạy migration (không có JWT context lúc startup).

```java
@Bean
public FlywayConfigurationCustomizer flywayCustomizer(
        @Qualifier("hikariDataSource") HikariDataSource hikariDataSource) {
    return configuration -> configuration.dataSource(hikariDataSource);
}
```

### `set_config(..., false)` — session-level

Dùng `false` (session-level) thay vì `true` (transaction-local) để tránh mất config
khi có nested transaction hoặc savepoint bên trong Spring.
An toàn vì `finally` trong `runAsAdmin()` luôn reset về `false` trước khi trả connection về pool.

---

## TODO

- [ ] `@Async` — implement `RlsContextDecorator` + `AsyncConfig` để truyền ThreadLocal sang thread con
- [ ] `@Scheduled` — bypass thủ công hoặc dùng system account không có RLS
- [ ] Cross-farm query (admin) — dùng `runAsAdmin()` + explicit membership check trong JPQL