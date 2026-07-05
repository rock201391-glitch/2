import { useState, useMemo } from 'react';
import { ChevronRight, Plus, Minus, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';

interface ProductDetailProps {
  product: any;
  onBack: () => void;
  onProductClick?: (product: any) => void;
}

export default function ProductDetail({ product, onBack, onProductClick }: ProductDetailProps) {
  const { addItem } = useCart();
  const { products } = useProducts();
  const maxQty = Math.max(1, product.quantity ?? 1);
  const [quantity, setQuantity] = useState(() => Math.min(1, maxQty));
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Build image gallery – support single image_url or future multi-image array/JSON
  const images: string[] = useMemo(() => {
    const imgs: string[] = [];
    // If product has an images array field (future multi-image support)
    if (Array.isArray(product.images) && product.images.length > 0) {
      imgs.push(...product.images.filter(Boolean));
    }
    // Always include image_url if present and not already in list
    if (product.image_url && !imgs.includes(product.image_url)) {
      imgs.unshift(product.image_url);
    }
    // Fallback: legacy image field
    if (imgs.length === 0 && product.image && typeof product.image === 'string' && !product.image.startsWith('📦')) {
      imgs.push(product.image);
    }
    return imgs;
  }, [product]);

  const currentImage = images[selectedImageIndex] || null;

  // Parse colors safely
  const colors: string[] = useMemo(() => {
    if (!product.colors) return [];
    if (Array.isArray(product.colors)) return product.colors.filter(Boolean);
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        if (product.colors.trim()) return [product.colors.trim()];
      }
    }
    return [];
  }, [product.colors]);

  const isInStock = product.quantity > 0;

  // Similar products: same category, exclude current product
  const similarProducts = useMemo(() => {
    return products
      .filter(p => p.id !== product.id && p.category_id === product.category_id && p.is_active)
      .slice(0, 4);
  }, [products, product.id, product.category_id]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url || product.image || '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url || product.image || '',
    });
    // Dispatch custom event so App.tsx navigates to checkout
    window.dispatchEvent(new CustomEvent('navigate-to-checkout'));
  };

  const handleSimilarProductClick = (p: any) => {
    if (onProductClick) {
      onProductClick({ ...p, image: p.image_url || '' });
    } else {
      window.dispatchEvent(new CustomEvent('product-click', { detail: p }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* ── Breadcrumb / Back ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline transition-colors"
          style={{ color: '#0F3A2B' }}
        >
          <ChevronRight className="w-4 h-4" />
          <span>متجر مرقاب</span>
        </button>
      </div>

      {/* ── Main product section ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: '#FBF7EF',
                aspectRatio: '1 / 1',
                border: '1px solid #EDE9E1',
              }}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">📦</span>
              )}
            </div>

            {/* Thumbnails – only shown when > 1 image */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#0F3A2B]' : 'border-[#EDE9E1]'
                    }`}
                    style={{ backgroundColor: '#FBF7EF' }}
                  >
                    <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category + availability row */}
            <div className="flex items-center gap-3 mb-3">
              {product.category && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#0F3A2B', color: '#F8F7F2' }}
                >
                  {product.category}
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isInStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {isInStock ? 'متوفر' : 'نفذت الكمية'}
              </span>
            </div>

            {/* Name */}
            <h1
              className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
              style={{ color: '#0F3A2B' }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-4xl font-bold" style={{ color: '#0F3A2B' }}>
                {product.price}
              </span>
              <span className="text-lg text-gray-500 font-medium">ر.ع</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                {product.description}
              </p>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                  الألوان المتاحة
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: '#0F3A2B', color: '#0F3A2B' }}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity available */}
            {isInStock && (
              <p className="text-xs text-gray-400 mb-5">
                الكمية المتاحة: {product.quantity} قطعة
              </p>
            )}

            {/* Quantity selector */}
            {isInStock && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                  الكمية
                </p>
                <div
                  className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-2"
                  style={{ border: '1px solid #EDE9E1' }}
                >
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" style={{ color: '#0F3A2B' }} />
                  </button>
                  <span className="text-lg font-bold min-w-8 text-center" style={{ color: '#0F3A2B' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" style={{ color: '#0F3A2B' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-bold text-base transition-all hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0F3A2B' }}
              >
                <ShoppingCart className="w-5 h-5" />
                {addedToCart ? '✓ تمت الإضافة' : 'إضافة للسلة'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!isInStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-base transition-all hover:shadow-lg border-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: '#0F3A2B', color: '#0F3A2B', backgroundColor: 'transparent' }}
              >
                <Zap className="w-5 h-5" />
                شراء الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-10 border-t border-[#EDE9E1] mt-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {similarProducts.map(p => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                style={{ border: '1px solid #EDE9E1' }}
                onClick={() => handleSimilarProductClick(p)}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '1 / 1', backgroundColor: '#FBF7EF' }}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-sm font-bold line-clamp-2 mb-1" style={{ color: '#0F3A2B' }}>
                    {p.name}
                  </p>
                  <span className="text-base font-bold mt-auto" style={{ color: '#0F3A2B' }}>
                    {p.price} <span className="text-xs font-medium">ر.ع</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}