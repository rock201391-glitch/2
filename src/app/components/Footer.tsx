import { Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F8F7F2] border-t border-[#D8D2C5] px-4 py-9" dir="rtl">
      <div className="max-w-[1440px] mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-[1.55fr_0.7fr_0.9fr] gap-16 items-start text-right">

          {/* Right: Logo + About */}
          <div className="flex justify-end items-start gap-8">
            <img
              src="/merqab.png"
              alt="مرقاب"
              className="h-24 w-auto object-contain mt-0"
            />

            <div className="max-w-[520px]">
              <h3 className="font-bold mb-5" style={{ color: '#0F3A2B' }}>
                عن مرقاب
              </h3>
              <p className="text-sm leading-8 text-gray-600">
                نوفر أحدث منتجات DJI والطائرات الاحترافية في سلطنة عمان بجودة
                عالية وأسعار منافسة، نظرتكم من فوق.
              </p>
            </div>
          </div>

          {/* Middle: Links */}
          <div>
            <h3 className="font-bold mb-5" style={{ color: '#0F3A2B' }}>
              الروابط
            </h3>
            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <button onClick={() => onNavigate('shop')} className="text-right hover:text-[#0F3A2B] transition-all">
                المتجر
              </button>
              <button onClick={() => onNavigate('my-orders')} className="text-right hover:text-[#0F3A2B] transition-all">
                مشترياتي
              </button>
              <button onClick={() => onNavigate('track-order')} className="text-right hover:text-[#0F3A2B] transition-all">
                تتبع طلبك
              </button>
              <button className="text-right hover:text-[#0F3A2B] transition-all">
                سياسة الخصوصية
              </button>
            </div>
          </div>

          {/* Left: Contact */}
          <div>
            <h3 className="font-bold mb-5" style={{ color: '#0F3A2B' }}>
              تواصل معنا
            </h3>

            <div className="flex flex-col gap-4 text-sm font-bold text-gray-600">
              <a
                href="https://instagram.com/MERGAB.0M"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-fit transition-all hover:scale-105"
              >
                <span>MERGAB.0M</span>
                <div className="w-10 h-10 rounded-2xl bg-[#F1EDE3] flex items-center justify-center transition-all group-hover:bg-[#0F3A2B]">
                  <Instagram className="w-5 h-5 text-[#0F3A2B] group-hover:text-white transition-all" />
                </div>
              </a>

              <a
                href="https://wa.me/96890977867"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-fit transition-all hover:scale-105"
              >
                <span dir="ltr">+968 9097 7867</span>
                <div className="w-10 h-10 rounded-2xl bg-[#F1EDE3] flex items-center justify-center transition-all group-hover:bg-[#0F3A2B]">
                  <MessageCircle className="w-5 h-5 text-[#0F3A2B] group-hover:text-white transition-all" />
                </div>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-[#D8D2C5] mt-10 pt-5 text-right">
          <p className="text-xs tracking-[0.22em] text-gray-400">
            © MERGAB 2026 — جميع الحقوق محفوظة.
          </p>
        </div>

      </div>
    </footer>
  );
}
