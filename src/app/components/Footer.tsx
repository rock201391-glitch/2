import { Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F8F7F2] border-t border-[#E8E3D9] px-4 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start text-right">

          <div className="flex justify-center md:justify-start">
            <img
              src="/merqab.png"
              alt="مرقاب"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div>
            <h3 className="font-bold mb-3" style={{ color: '#0F3A2B' }}>عن مرقاب</h3>
            <p className="text-sm leading-7 text-gray-600">
              نوفر أحدث منتجات DJI والدرونات الاحترافية في سلطنة عمان
              بجودة عالية وأسعار منافسة، نظرتكم من فوق.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3" style={{ color: '#0F3A2B' }}>الروابط</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <button onClick={() => onNavigate('shop')} className="text-right">المتجر</button>
              <button onClick={() => onNavigate('my-orders')} className="text-right">مشترياتي</button>
              <button onClick={() => onNavigate('track-order')} className="text-right">تتبع طلبك</button>
              <button className="text-right">سياسة الخصوصية</button>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-3" style={{ color: '#0F3A2B' }}>تواصل معنا</h3>

            <div className="flex flex-col gap-3 text-sm font-bold text-gray-600">
              <a
                href="https://instagram.com/MERGAB.0M"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#F1EDE3] flex items-center justify-center">
                  <Instagram className="w-5 h-5" style={{ color: '#0F3A2B' }} />
                </div>
                <span>MERGAB.0M</span>
              </a>

              <a
                href="https://wa.me/96890977867"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#F1EDE3] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" style={{ color: '#0F3A2B' }} />
                </div>
                <span dir="ltr">+968 9097 7867</span>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-[#D8D2C5] mt-8 pt-5 text-right">
          <p className="text-xs tracking-[0.2em] text-gray-400">
            © MERGAB 2026 — جميع الحقوق محفوظة.
          </p>
        </div>

      </div>
    </footer>
  );
}
