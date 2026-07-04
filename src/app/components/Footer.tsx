import { Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F8F7F2] border-t border-[#E8E3D9] py-12 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">

          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: '#0F3A2B' }}>
              عن مرقاب
            </h3>
            <p className="text-sm leading-8 text-gray-600 max-w-md mx-auto md:mx-0">
              نوفر أحدث منتجات DJI والدرونات الاحترافية في سلطنة عمان
              بجودة عالية وأسعار منافسة، نظرتكم من فوق.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: '#0F3A2B' }}>
              الروابط
            </h3>

            <div className="flex flex-col gap-4 text-sm text-gray-600">
              <button onClick={() => onNavigate('shop')} className="hover:text-[#0F3A2B]">
                المتجر
              </button>
              <button onClick={() => onNavigate('my-orders')} className="hover:text-[#0F3A2B]">
                مشترياتي
              </button>
              <button onClick={() => onNavigate('track-order')} className="hover:text-[#0F3A2B]">
                تتبع الطلب
              </button>
              <button className="hover:text-[#0F3A2B]">
                سياسة الخصوصية
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-5" style={{ color: '#0F3A2B' }}>
              تواصل معنا
            </h3>

            <div className="flex items-center justify-center gap-6">
              <Instagram className="w-6 h-6" style={{ color: '#0F3A2B' }} />
              <MessageCircle className="w-6 h-6" style={{ color: '#0F3A2B' }} />
            </div>
          </div>

        </div>

        <div className="border-t border-[#E8E3D9] mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            جميع الحقوق محفوظة © MERGAB 2026
          </p>
        </div>

      </div>
    </footer>
  );
}
