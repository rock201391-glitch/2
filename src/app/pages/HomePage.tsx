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

<div className="relative w-full max-w-2xl h-[480px]
rounded-[36px]
bg-gradient-to-br from-[#FFFDF7] via-[#F8F5EA] to-[#EDE7D8]
border border-[#D8CFB8]
shadow-[0_25px_70px_rgba(15,58,43,0.18)]
overflow-hidden">

<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(15,58,43,0.14),transparent_40%)]" />
<div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0F3A2B]/15 to-transparent" />
  
<video
  src="/omani-drone.mp4"
  autoPlay
  muted
  loop
  playsInline
  className="relative z-10 w-full h-full object-cover rounded-[36px]"
/>

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
