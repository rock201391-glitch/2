import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onProductClick: (product: any) => void;
}

const DJI_PRODUCTS = [
  {
    id: 1,
    name: 'DJI Mini 5 Pro',
    category: 'الدرونات',
    price: 95,
    image: '🚁',
    description: 'درون محمول بتقنية متقدمة'
  },
  {
    id: 2,
    name: 'DJI Mini 4 Pro',
    category: 'الدرونات',
    price: 85,
    image: '🚁',
    description: 'درون خفيف الوزن عملي'
  },
  {
    id: 3,
    name: 'DJI Neo 2',
    category: 'الدرونات',
    price: 45,
    image: '🚁',
    description: 'أصغر درون من DJI'
  },
  {
    id: 4,
    name: 'Osmo Pocket 4',
    category: 'الكاميرات',
    price: 125,
    image: '📹',
    description: 'كاميرا محمولة احترافية'
  },
  {
    id: 5,
    name: 'DJI Mic',
    category: 'الميكروفونات',
    price: 35,
    image: '🎤',
    description: 'نظام ميكروفون لاسلكي'
  },
  {
    id: 6,
    name: 'بطاريات DJI',
    category: 'الملحقات',
    price: 25,
    image: '🔋',
    description: 'بطاريات عالية الجودة'
  }
];

export default function HomePage({ onNavigate, onProductClick }: HomePageProps) {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* Hero Section */}
      <section className="w-full px-4 py-16 md:py-24 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #F8F7F2, #F1F0E8)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Video */}
          <div className="order-1 lg:order-1 flex justify-center">
            <div
              className="relative w-full max-w-2xl h-[480px] rounded-[42px] overflow-hidden border"
              style={{
                background: 'linear-gradient(135deg,#FFFDF7 0%,#F8F5EA 50%,#EDE7D8 100%)',
                borderColor: '#D8CFB8',
                boxShadow: '0 30px 80px rgba(15,58,43,0.18)',
              }}
            >
              <video
                src="/omani-drone.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-[42px]"
              />
            </div>
          </div>

          {/* Right Text */}
          <div className="order-2 lg:order-2 text-right">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#0F3A2B' }}>
              نظرتكم من فوق
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mr-0 ml-auto leading-relaxed">
              نوفر أحدث منتجات DJI والدرونات الاحترافية في سلطنة عمان بجودة عالية وأسعار منافسة
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                style={{ backgroundColor: '#0F3A2B' }}
              >
                <span className="transition-all duration-300 group-hover:translate-x-1">
                  تصفح المتجر
                </span>
                <ChevronLeft className="w-5 h-5 transition-all duration-300 group-hover:-translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('auctions')}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 border-2"
                style={{
                  borderColor: '#0F3A2B',
                  color: '#0F3A2B',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <span className="transition-all duration-300 group-hover:translate-x-1">
                  الدخول إلى المزاد
                </span>
                <ChevronLeft className="w-5 h-5 transition-all duration-300 group-hover:-translate-x-1" />
              </button>
            </div>
          </div>

        </div>
      </section>
      {/* Featured Products */}
    </div>
  );
}
