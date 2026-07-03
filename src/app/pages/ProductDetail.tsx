import { useState } from 'react';
import { ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-8 cursor-pointer"
        >
          <ChevronRight style={{ color: '#0F3A2B' }} />
          <span style={{ color: '#0F3A2B' }} className="font-semibold">
            العودة
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div
              className="w-full h-96 rounded-3xl flex items-center justify-center text-9xl"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              {product.image}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#0F3A2B' }}>
              {product.name}
            </h1>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="mb-8">
              <span className="text-sm text-gray-600">التصنيف:</span>
              <div className="inline-block mx-2 px-4 py-2 rounded-full text-sm" style={{ backgroundColor: '#FBF7EF', color: '#0F3A2B' }}>
                {product.category}
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <span className="text-5xl font-bold" style={{ color: '#0F3A2B' }}>
                {product.price}
              </span>
              <span className="text-2xl text-gray-600 mr-2">ر.ع</span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3" style={{ color: '#0F3A2B' }}>
                الكمية
              </label>
              <div className="flex items-center gap-4 bg-white rounded-full px-6 py-3 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Minus className="w-5 h-5" style={{ color: '#0F3A2B' }} />
                </button>
                <span className="text-xl font-bold min-w-8 text-center" style={{ color: '#0F3A2B' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5" style={{ color: '#0F3A2B' }} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-full text-white font-bold text-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#0F3A2B' }}
            >
              {addedToCart ? '✓ تمت الإضافة' : 'إضافة للسلة'}
            </button>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold mb-2" style={{ color: '#0F3A2B' }}>
                  جودة عالية
                </h3>
                <p className="text-sm text-gray-600">منتجات أصلية معتمدة</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold mb-2" style={{ color: '#0F3A2B' }}>
                  ضمان
                </h3>
                <p className="text-sm text-gray-600">ضمان شامل على جميع المنتجات</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold mb-2" style={{ color: '#0F3A2B' }}>
                  شحن سريع
                </h3>
                <p className="text-sm text-gray-600">توصيل في سلطنة عمان</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold mb-2" style={{ color: '#0F3A2B' }}>
                  دعم العملاء
                </h3>
                <p className="text-sm text-gray-600">فريق دعم متخصص</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}