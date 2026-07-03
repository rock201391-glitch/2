import { useState } from 'react';
import { useCart } from '../contexts/CartContext';

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
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());

  const categories = Array.from(new Set(DJI_PRODUCTS.map(p => p.category)));
  const filteredProducts = selectedCategory
    ? DJI_PRODUCTS.filter(p => p.category === selectedCategory)
    : DJI_PRODUCTS;

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

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
              className="bg-white rounded-3xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col"
            >
              <div 
                className="flex items-center justify-center h-32 text-5xl mb-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#FBF7EF' }}
                onClick={() => onProductClick(product)}
              >
                {product.image}
              </div>
              <h3 
                className="text-lg font-bold mb-2 cursor-pointer hover:underline"
                style={{ color: '#0F3A2B' }}
                onClick={() => onProductClick(product)}
              >
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
                  {product.price}ر.ع
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="flex-1 px-4 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#0F3A2B' }}
                >
                  {addedProducts.has(product.id) ? '✓ تمت الإضافة' : 'إضافة للسلة'}
                </button>
                <button
                  onClick={() => onProductClick(product)}
                  className="px-4 py-3 rounded-full font-semibold transition-all border-2"
                  style={{
                    borderColor: '#0F3A2B',
                    color: '#0F3A2B',
                    backgroundColor: 'transparent'
                  }}
                >
                  التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
