import { forwardRef } from "react";
import { PhoneIcon, MailIcon, MapPinIcon } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui";

const ContactSection = forwardRef<HTMLDivElement>((_, ref) => {
  const { ref: revealRef, visible } = useReveal(0.1);

  return (
    <section
      ref={ref}
      id="section-4"
      className="w-full bg-[#FDF6E3] py-[100px] px-[93px] relative"
    >
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-[#FDF6E3]/85"></div>
      
      <div className="relative z-10">
        <div ref={revealRef} className="flex items-start gap-20">
          {/* Left: Info */}
          <div
            className={`flex-1 transition-all duration-[800ms] ease-out
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <span className="font-roboto text-[13px] font-semibold text-green-600 uppercase tracking-widest">
              Liên Hệ
            </span>
            <h2 className="font-playfair text-[44px] font-semibold text-[#2D3A1E] mt-3 mb-6 leading-tight">
              Bắt đầu hành trình <br />
              <span className="text-green-700">canh tác thông minh</span>
            </h2>
            <p className="font-roboto text-[15px] text-[#5A6045] leading-relaxed mb-10 max-w-[400px]">
              Đội ngũ FarmerAI sẵn sàng hỗ trợ bạn từ khâu cài đặt đến vận hành. Liên hệ ngay
              để được tư vấn miễn phí.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { Icon: PhoneIcon, text: "0901 234 567" },
                { Icon: MailIcon, text: "hello@farmerai.vn" },
                { Icon: MapPinIcon, text: "Đà Nẵng, Việt Nam" },
              ].map(({ Icon, text }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-[500ms] ease-out
                    ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
                  style={{ transitionDelay: visible ? `${200 + i * 100}ms` : "0ms" }}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="font-roboto text-[15px] text-[#2D3A1E] font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div
            className={`flex-1 bg-white rounded-3xl shadow-xl p-10 border border-[#E8E0D0]
              transition-all duration-[900ms] ease-out delay-[250ms]
              ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          >
            <h3 className="font-playfair text-[24px] font-semibold text-[#2D3A1E] mb-6">
              Gửi tin nhắn cho chúng tôi
            </h3>
            <div className="flex flex-col gap-4">
              <Input type="text" placeholder="Họ và tên" />
              <Input type="email" placeholder="Địa chỉ email" />
              <Textarea
                placeholder="Nội dung tin nhắn..."
                rows={4}
              />
              <Button variant="cta-yellow" size="md" fullWidth>
                Gửi tin nhắn →
              </Button>
            </div>
          </div>
        </div>

      {/* Footer strip */}
      <div className="relative z-10 mt-20 pt-8 border-t border-[#E0D8C8] flex items-center justify-between">
        <span className="font-roboto text-[13px] text-[#8A7A5A]">
          © 2025 FarmerAI. All rights reserved.
        </span>
        <span className="font-roboto text-[13px] text-[#8A7A5A]">
          🌽 Trồng thông minh – Sống bền vững
        </span>
      </div>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";
export default ContactSection;
