# 🌾 Farm Loading Components

## 📦 Components đã tạo

### 1. **LoadingPage** - Full-page loading

Trang loading toàn màn hình với animation đẹp mắt, dùng làm fallback khi app đang khởi động.

**Features:**

- ☀️ Animated sun (mặt trời)
- 🌧️ Animated clouds (mây)
- 💨 Wind effect (gió)
- 🌱 Growing sprout (cây mọc)
- 🍃 Rotating leaves (lá xoay)
- 🌾 Animated grass (cỏ lắc)

**Sử dụng:**
\`\`\`tsx
import { LoadingPage } from './components/ui/LoadingPage';

// Trong App.tsx hoặc React.lazy fallback
<Suspense fallback={<LoadingPage />}>
<YourComponent />
</Suspense>
\`\`\`

---

### 2. **LoadingSpinner** - Component loading

Spinner nhỏ dùng trong component, có icon Tractor.

**Props:**

- \`size\`: 'sm' | 'md' | 'lg' (default: 'md')
- \`text\`: string (default: 'Đang tải...')

**Sử dụng:**
\`\`\`tsx
import { LoadingSpinner, InlineLoadingSpinner } from './components/ui/LoadingSpinner';

// Trong component
{isLoading && <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />}

// Inline trong button
<button disabled={isLoading}>
{isLoading ? <InlineLoadingSpinner /> : 'Lưu'}
</button>
\`\`\`

---

### 3. **LoadingSkeleton** - Skeleton loading

Skeleton cho list/table, với icon farm đa dạng (Wheat, Milk, Egg, Beef).

**Props:**

- \`rows\`: number (default: 3) - Số hàng skeleton

**Sử dụng:**
\`\`\`tsx
import { LoadingSkeleton, LoadingCard } from './components/ui/LoadingSkeleton';

// Loading list
{isLoading ? <LoadingSkeleton rows={5} /> : <DataList />}

// Loading card
{isLoading ? <LoadingCard /> : <DataCard />}
\`\`\`

---

## 🎨 Lucide Icons được sử dụng

| Icon      | Component       | Ý nghĩa                          |
| --------- | --------------- | -------------------------------- |
| Sprout    | LoadingPage     | Cây non (tượng trưng trang trại) |
| Sun       | LoadingPage     | Mặt trời                         |
| CloudRain | LoadingPage     | Mây mưa                          |
| Leaf      | LoadingPage     | Lá cây                           |
| Wind      | LoadingPage     | Gió                              |
| Tractor   | LoadingSpinner  | Máy cày (biểu tượng farm)        |
| Wheat     | LoadingSkeleton | Lúa mì                           |
| Milk      | LoadingSkeleton | Sữa                              |
| Egg       | LoadingSkeleton | Trứng                            |
| Beef      | LoadingSkeleton | Thịt bò                          |

---

## 🔧 Tích hợp vào App

### Cách 1: Initial App Loading

\`\`\`tsx
// App.tsx
import { LoadingPage } from './components/ui/LoadingPage';
import { Suspense, lazy } from 'react';

const AppRoutes = lazy(() => import('./routes/AppRoutes'));

function App() {
return (
<Suspense fallback={<LoadingPage />}>
<AppRoutes />
</Suspense>
);
}
\`\`\`

### Cách 2: Route-level loading

\`\`\`tsx
import { lazy, Suspense } from 'react';
import { LoadingPage } from '../components/ui/LoadingPage';

const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));

<Route
path="/dashboard"
element={
<Suspense fallback={<LoadingPage />}>
<DashboardPage />
</Suspense>
}
/>
\`\`\`

### Cách 3: Data loading state

\`\`\`tsx
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

function FarmList() {
const { data, isLoading } = useFetchFarms();

if (isLoading) {
return <LoadingSkeleton rows={5} />;
}

return <FarmTable data={data} />;
}
\`\`\`

### Cách 4: Button loading

\`\`\`tsx
import { InlineLoadingSpinner } from '../components/ui/LoadingSpinner';

<button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <InlineLoadingSpinner />
      <span className="ml-2">Đang lưu...</span>
    </>
  ) : (
    'Lưu thay đổi'
  )}
</button>
\`\`\`

---

## 🎯 Best Practices

1. **Full-page loading**: Dùng \`<LoadingPage />\` cho initial load hoặc lazy routes
2. **Component loading**: Dùng \`<LoadingSpinner />\` cho loading state trong component
3. **List/Table loading**: Dùng \`<LoadingSkeleton />\` cho better UX
4. **Button loading**: Dùng \`<InlineLoadingSpinner />\` để không thay đổi layout

---

## 🎨 Customization

Tất cả components đều sử dụng Tailwind CSS, bạn có thể dễ dàng customize:

\`\`\`tsx
// Thay đổi màu chủ đạo từ green sang blue
className="bg-blue-600" // thay vì bg-green-600

// Thay đổi size
className="h-24 w-24" // thay vì h-20 w-20

// Thay đổi animation speed
style={{ animationDuration: '1s' }} // thay vì 2s
\`\`\`
