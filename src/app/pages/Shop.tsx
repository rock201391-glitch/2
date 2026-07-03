import { useState } from 'react';
import { X } from 'lucide-react';

interface ShopProps {
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
  },
  {
    id: 7,
    name: 'حقائب DJI',
    category: 'الملحقات',
    price: 40,
    image: '🎒',
    description: 'حقائب حماية عملية'
  },
  {
    id: 8,
    name: 'ملحقات DJI',
    category: 'الملحقات',
    price: 30,
    image: '⚙️',
    description: 'ملحقات متنوعة'
  }
];

export default function Shop({ onProductClick }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(DJI_PRODUCTS.map(p => p.category)));
  const filteredProducts = selectedCategory
    ? DJI_PRODUCTS.filter(p => p.category === selectedCategory)
    : DJI_PRODUCTS;

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#0F3A2B' }}>
          متجر مرقاب
        </h1>

        {/* Filter */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={selectedCategory === null ? { backgroundColor: '#0F3A2B' } : {}}
          >
            الكل
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={selectedCategory === category ? { backgroundColor: '#0F3A2B' } : {}}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-center h-32 text-5xl mb-4 rounded-2xl" style={{ backgroundColor: '#FBF7EF' }}>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}