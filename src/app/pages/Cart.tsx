import { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface CartProps {
  onNavigate: (page: string) => void;
  onCheckout: () => void;
}

const PRODUCT_IMAGE_BUCKET = 'product-images';
const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;

function getCartItemImageSrc(image: string | null | undefined) {
  const value = image?.trim();

  if (!value) {
    return null;
  }

  if (
    ABSOLUTE_URL_PATTERN.test(value) ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  const normalized = value.replace(/^\/+/, '');
  const storagePathMatch = normalized.match(/^storage\/v1\/object\/public\/([^/]+)\/(.+)$/);

  if (storagePathMatch) {
    const [, bucket, path] = storagePathMatch;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  const pathSegments = normalized.split('/').filter(Boolean);
  const hasBucketPrefix = pathSegments[0] === PRODUCT_IMAGE_BUCKET;
  const bucket = PRODUCT_IMAGE_BUCKET;
  const path = hasBucketPrefix ? pathSegments.slice(1).join('/') : normalized;

  if (!path) {
    return null;
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export default function Cart({ onNavigate, onCheckout }: CartProps) {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  const handleCheckout = () => {
    if (items.length > 0) {
      setIsOpen(false);
      onCheckout();
    }
  };

  const total = getTotal();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-30 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Side Cart */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FBF7EF] z-40 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E3D9]">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" style={{ color: '#0F3A2B' }} />
          </button>
          <h2 className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
            السلة
          </h2>
          <span className="text-sm font-bold bg-white rounded-full px-3 py-1" style={{ color: '#0F3A2B' }}>
            ({items.length})
          </span>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-600 mb-4">سلتك فارغة</p>
                <button
  onClick={() => onNavigate('shop')}
  className="group px-8 py-4 rounded-full text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
  style={{ backgroundColor: '#0F3A2B' }}
>
  <span className="relative z-10">
    تصفح المتجر
  </span>
</button>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const imageSrc = getCartItemImageSrc(item.image);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 flex flex-row-reverse items-center gap-4"
                >
                {/* Product Image */}
                <div
                  className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#F8F7F2]"
                  style={{ backgroundColor: '#F8F7F2' }}
                >
                  {imageSrc ? (
                    <ImageWithFallback
                      src={imageSrc}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#8A8374]">
                      لا توجد صورة
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 text-right">
                  <h3 className="font-bold text-sm mb-1 truncate" style={{ color: '#0F3A2B' }}>
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold mb-2" style={{ color: '#0F3A2B' }}>
                    {item.price} ر.ع
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 bg-[#F8F7F2] rounded-full p-1 w-fit">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, (item.quantity || 1) + 1)
                        }
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        aria-label={`زيادة كمية ${item.name}`}
                      >
                        <Plus className="w-4 h-4" style={{ color: '#0F3A2B' }} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm" style={{ color: '#0F3A2B' }}>
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                        }
                        className="p-1.5 hover:bg-white rounded-full transition-colors"
                        aria-label={`تقليل كمية ${item.name}`}
                      >
                        <Minus className="w-4 h-4" style={{ color: '#0F3A2B' }} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      aria-label={`حذف ${item.name} من السلة`}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E8E3D9] p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[#E8E3D9]">
              <span className="font-bold" style={{ color: '#0F3A2B' }}>
                الإجمالي
              </span>
              <span className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
                {total.toFixed(2)} ر.ع
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-full text-white font-bold text-lg transition-all hover:shadow-lg"
              style={{ backgroundColor: '#0F3A2B' }}
            >
              إتمام الطلب
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('shop');
              }}
              className="w-full py-3 rounded-full font-semibold transition-all border-2"
              style={{
                borderColor: '#0F3A2B',
                color: '#0F3A2B',
                backgroundColor: 'transparent'
              }}
            >
              متابعة التسوق
            </button>
          </div>
        )}
      </div>
    </>
  );
}
