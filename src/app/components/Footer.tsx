import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FBF7EF] border-t border-[#E8E3D9] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0F3A2B' }}>
              عن مرقاب
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              نوفر أحدث منتجات DJI والدرونات الاحترافية في سلطنة عمان بجودة عالية وأسعار منافسة. نظرتك من فوق.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0F3A2B' }}>
              الروابط
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0F3A2B] transition-colors">
                  المتجر
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0F3A2B] transition-colors">
                  مشترياتي
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0F3A2B] transition-colors">
                  تتبع الطلب
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0F3A2B] transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#0F3A2B' }}>
              تواصل معنا
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/mergab.0m"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-[#E8E3D9] transition-colors"
              >
                <Instagram className="w-5 h-5" style={{ color: '#0F3A2B' }} />
              </a>
              <a
                href="https://wa.me/96895999999"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-[#E8E3D9] transition-colors"
              >
                <MessageCircle className="w-5 h-5" style={{ color: '#0F3A2B' }} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E3D9] mt-8 pt-8 text-center text-sm text-gray-600">
          <p>جميع الحقوق محفوظة © MERGAB 2026</p>
        </div>
      </div>
    </footer>
  );
}
