// src/components/dashboard/DonutChart.tsx

interface DonutChartProps {
  pct?: number;
  isLoading?: boolean;
}

export default function DonutChart({
  pct = 0,
  isLoading = false,
}: DonutChartProps) {
  const r = 80;
  const circ = 2 * Math.PI * r;

  // Đảm bảo phần trăm luôn nằm trong khoảng 0 - 100 để tránh vỡ giao diện
  const safePct = Math.min(Math.max(pct, 0), 100);
  const offset = circ * (1 - safePct / 100);

  return (
    <div
      className="bg-[#f5f5f0] rounded-2xl flex flex-col items-center justify-between p-4 w-full h-full min-h-0"
    >
      <p className="text-[13px] font-medium text-[#3A3A8C] uppercase tracking-wider">
        Hiệu suất nông trại
      </p>

      <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#C8E2C0] border-t-[#5A9A44] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* 3. Bỏ class -rotate-90 ở thẻ svg */}
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {/* Vòng nền */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="#C8E2C0"
                strokeWidth="24" // Giảm nhẹ chút để viền mượt hơn
              />
              {/* Vòng hiển thị tiến độ (Data) */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="#5A9A44"
                strokeWidth="24"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                /* 4. Đưa tâm xoay vào trực tiếp thẻ circle thay vì xoay nguyên cái SVG */
                transform="rotate(-90 100 100)"
                className="transition-all duration-1000 ease-out"
              />
              {/* Vòng marker nhỏ (Nếu không cần có thể xóa đi) */}
              <circle
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="#A8D49A"
                strokeWidth="24"
                strokeDasharray={`${circ * 0.07} ${circ * 0.93}`}
                strokeDashoffset={-circ * 0.72}
                transform="rotate(-90 100 100)"
              />
            </svg>

            {/* 5. Căn chỉnh lại text bên trong, sử dụng leading-none để số % nằm đúng giữa */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-[#8D8D8D] font-medium uppercase tracking-tighter mb-0.5">
                Điểm
              </span>
              <span className="text-[35px] font-semibold text-[#1a1a1a] leading-none">
                {safePct}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
