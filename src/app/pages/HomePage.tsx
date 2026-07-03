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
<section className="w-full px-4 py-16 md:py-24 bg-gradient-to-b from-[#F8F7F2] to-[#F1F0E8] overflow-hidden">
  <style>{`
    @keyframes droneFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-18px) rotate(2deg); }
    }
    @keyframes personFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-7px); }
    }
    @keyframes propellerSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>

  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Animation */}
    <div className="order-1 lg:order-1 flex justify-center">
      <div className="relative w-full max-w-xl h-[430px] rounded-[36px] bg-[#FBF7EF] border border-[#E8E3D9] shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBF7EF] via-[#F8F7F2] to-[#EFE9DD]" />

        {/* Drone */}
        <div className="absolute top-20 left-1/2" style={{ animation: 'droneFloat 3s ease-in-out infinite' }}>
          <div className="relative w-44 h-20 -translate-x-1/2">
            <div className="absolute top-7 left-16 w-12 h-8 rounded-xl bg-[#0F3A2B]" />
            <div className="absolute top-9 left-[78px] w-4 h-3 rounded bg-[#D8CDBB]" />
            <div className="absolute top-10 left-2 w-40 h-1.5 bg-[#0F3A2B] rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-2 border-[#0F3A2B] rounded-full opacity-40" style={{ animation: 'propellerSpin 1.2s linear infinite' }} />
            <div className="absolute top-0 right-0 w-12 h-12 border-2 border-[#0F3A2B] rounded-full opacity-40" style={{ animation: 'propellerSpin 1.2s linear infinite' }} />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-2 border-[#0F3A2B] rounded-full opacity-40" style={{ animation: 'propellerSpin 1.2s linear infinite' }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-2 border-[#0F3A2B] rounded-full opacity-40" style={{ animation: 'propellerSpin 1.2s linear infinite' }} />
          </div>
        </div>

        {/* Omani Person */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-72" style={{ animation: 'personFloat 4s ease-in-out infinite' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-14 rounded-full bg-[#F1E5D3] border-4 border-[#C8B68E]" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-[#D9B58C]" />
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-40 h-44 rounded-t-[55px] bg-white border border-[#E8E3D9] shadow-sm" />
          
          {/* Controller */}
          <div className="absolute top-44 left-1/2 -translate-x-1/2 w-32 h-16 rounded-2xl bg-[#0F3A2B] shadow-lg">
            <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-[#FBF7EF]" />
            <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-[#FBF7EF]" />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-5 rounded bg-[#D8CDBB]" />
            <div className="absolute -top-6 left-9 w-1 h-8 bg-[#0F3A2B] rotate-[-25deg]" />
            <div className="absolute -top-6 right-9 w-1 h-8 bg-[#0F3A2B] rotate-[25deg]" />
          </div>
        </div>

        <div className="absolute bottom-6 right-6 text-[#0F3A2B] font-bold opacity-10 text-7xl">
          مرقاب
        </div>
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

      <button
        onClick={() => onNavigate('shop')}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-lg"
        style={{ backgroundColor: '#0F3A2B' }}
      >
        تصفح المتجر
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  </div>
</section>
      {/* Featured Products */}
      <section className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: '#0F3A2B' }}>
            المنتجات المميزة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DJI_PRODUCTS.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-center h-40 text-6xl mb-4 rounded-2xl" style={{ backgroundColor: '#FBF7EF' }}>
                  {product.image}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#0F3A2B' }}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
                    {product.price}ر.ع
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                    className="px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
                    style={{ backgroundColor: '#0F3A2B' }}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
