import React from "react";
import { BotIcon, CloudSunIcon, BarChart2Icon, LeafIcon } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const services = [
  {
    icon: <BotIcon className="w-8 h-8 text-white" />,
    bg: "bg-green-700",
    title: "AI Phân Tích Cây Trồng",
    desc: "Nhận diện bệnh hại, sâu bọ chính xác đến 95% qua ảnh chụp từ điện thoại.",
  },
  {
    icon: <CloudSunIcon className="w-8 h-8 text-white" />,
    bg: "bg-sky-500",
    title: "Dự Báo Thời Tiết Nông Nghiệp",
    desc: "Cảnh báo sớm mưa, hạn hán, sương muối ảnh hưởng mùa vụ của bạn.",
  },
  {
    icon: <BarChart2Icon className="w-8 h-8 text-white" />,
    bg: "bg-amber-500",
    title: "Báo Cáo Thu Hoạch",
    desc: "Thống kê năng suất, chi phí, lợi nhuận theo từng vụ và từng thửa ruộng.",
  },
  {
    icon: <LeafIcon className="w-8 h-8 text-white" />,
    bg: "bg-emerald-600",
    title: "Lịch Chăm Sóc Thông Minh",
    desc: "Nhắc nhở tưới nước, bón phân, phun thuốc đúng thời điểm tối ưu.",
  },
];

// HOC to inject useReveal hooks (class components can't use hooks directly)
const withReveal = (Component: React.ComponentType<ServicesSectionProps>) => {
  return () => {
    const headReveal = useReveal(0.2);
    const gridReveal = useReveal(0.1);
    return (
      <Component
        headRef={headReveal.ref}
        headVisible={headReveal.visible}
        gridRef={gridReveal.ref}
        gridVisible={gridReveal.visible}
      />
    );
  };
};

interface ServicesSectionProps {
  headRef: React.RefObject<HTMLDivElement>;
  headVisible: boolean;
  gridRef: React.RefObject<HTMLDivElement>;
  gridVisible: boolean;
}

class ServicesSection extends React.Component<ServicesSectionProps> {
  render() {
    const { headRef, headVisible, gridRef, gridVisible } = this.props;

    return (
      <section id="section-3" className="w-full bg-[#1A2E10] py-[100px] px-[93px]">
        {/* Heading */}
        <div
          ref={headRef}
          className={`text-center mb-14 transition-all duration-[700ms] ease-out
            ${headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="font-roboto text-[13px] font-semibold text-green-400 uppercase tracking-widest">
            Dịch Vụ
          </span>
          <h2 className="font-playfair text-[48px] font-semibold text-white mt-3 leading-tight">
            Công nghệ phục vụ <br />
            <span className="text-[#E8C840]">nông nghiệp hiện đại</span>
          </h2>
          <p className="font-roboto text-[15px] text-green-300 mt-4 max-w-[480px] mx-auto leading-relaxed">
            Bộ giải pháp toàn diện giúp nông dân Việt Nam tối ưu hóa mùa vụ, giảm rủi ro và
            tăng thu nhập.
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-2 gap-6 max-w-[860px] mx-auto">
          {services.map((s, i) => (
            <div
              key={i}
              className={`bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10
                transition-all duration-[600ms] ease-out
                ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
              style={{ transitionDelay: gridVisible ? `${i * 120}ms` : "0ms" }}
            >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-5`}>
                {s.icon}
              </div>
              <h3 className="font-playfair text-[22px] font-semibold text-white mb-3">{s.title}</h3>
              <p className="font-roboto text-[14px] text-green-300 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export default withReveal(ServicesSection);
