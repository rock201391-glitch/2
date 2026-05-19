import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

interface ProductDetailProps {
  onBack: () => void;
  product: {
    id: number;
    name: string;
    nameAr: string;
    category: string;
    categoryAr: string;
    retailPrice: number;
    wholesalePrice: number;
    image: string;
    additionalImages?: string[];
  };
}

export default function ProductDetail({ onBack, product }: ProductDetailProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedType, setSelectedType] = useState<'retail' | 'wholesale'>('retail');
  const [quantity, setQuantity] = useState(1);
  const [customSize, setCustomSize] = useState({
    height: 160,
    width: 60,
    sleeveLength: 60,
  });
  const [useCustomSize, setUseCustomSize] = useState(false);

  const images = [
    product.image,
    ...(product.additionalImages || []),
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: selectedType === 'retail' ? product.retailPrice : product.wholesalePrice,
      image: product.image,
      type: selectedType,
      size: useCustomSize ? customSize : undefined,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Back Button */}
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
            >
              <img
                src={images[selectedImage]}
                alt={language === 'ar' ? product.nameAr : product.name}
                className="w-full h-full object-cover"
              />

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-full"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-black dark:border-white'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Badge */}
            <div className="inline-block px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 text-sm">
              {language === 'ar' ? product.categoryAr : product.category}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold">
              {language === 'ar' ? product.nameAr : product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (128 {language === 'ar' ? 'تقييم' : 'reviews'})
              </span>
            </div>

            {/* Price Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">
                {language === 'ar' ? 'نوع السعر' : 'Price Type'}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType('retail')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedType === 'retail'
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('products.retail')}
                  </div>
                  <div className="text-2xl font-bold">${product.retailPrice}</div>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType('wholesale')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedType === 'wholesale'
                      ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                      : 'border-black/10 dark:border-white/10'
                  }`}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('products.wholesale')}
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${product.wholesalePrice}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">
                {language === 'ar' ? 'الكمية' : 'Quantity'}
              </label>
              <div className="flex items-center gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-xl font-bold"
                >
                  -
                </motion.button>
                <div className="w-20 text-center text-2xl font-bold">{quantity}</div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-xl font-bold"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Custom Size Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="customSize"
                  checked={useCustomSize}
                  onChange={(e) => setUseCustomSize(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="customSize" className="text-sm font-semibold cursor-pointer">
                  {language === 'ar' ? 'مقاس مخصص' : 'Custom Size'}
                </label>
              </div>

              {useCustomSize && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        {language === 'ar' ? 'الطول (سم)' : 'Height (cm)'}
                      </label>
                      <input
                        type="number"
                        value={customSize.height}
                        onChange={(e) => setCustomSize({ ...customSize, height: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors text-center font-semibold"
                        min="100"
                        max="200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        {language === 'ar' ? 'العرض (سم)' : 'Width (cm)'}
                      </label>
                      <input
                        type="number"
                        value={customSize.width}
                        onChange={(e) => setCustomSize({ ...customSize, width: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors text-center font-semibold"
                        min="40"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        {language === 'ar' ? 'طول اليد (سم)' : 'Sleeve (cm)'}
                      </label>
                      <input
                        type="number"
                        value={customSize.sleeveLength}
                        onChange={(e) => setCustomSize({ ...customSize, sleeveLength: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors text-center font-semibold"
                        min="40"
                        max="80"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center gap-3 text-lg font-semibold"
            >
              <ShoppingCart className="w-6 h-6" />
              {t('products.addToCart')}
            </motion.button>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <Truck className="w-5 h-5" />
                <div className="text-sm">
                  {language === 'ar' ? 'شحن مجاني' : 'Free Shipping'}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <Shield className="w-5 h-5" />
                <div className="text-sm">
                  {language === 'ar' ? 'ضمان الجودة' : 'Quality Guarantee'}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                <RefreshCw className="w-5 h-5" />
                <div className="text-sm">
                  {language === 'ar' ? 'إرجاع سهل' : 'Easy Returns'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 space-y-4">
              <h3 className="text-xl font-bold">
                {language === 'ar' ? 'الوصف' : 'Description'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {language === 'ar'
                  ? 'عباية فاخرة مصنوعة من أجود أنواع الأقمشة، تتميز بتصميم عصري وأنيق يناسب جميع المناسبات. صُنعت بعناية فائقة لتوفر لك الراحة والأناقة في آن واحد.'
                  : 'Luxury abaya crafted from the finest fabrics, featuring a modern and elegant design suitable for all occasions. Meticulously crafted to provide you with comfort and elegance simultaneously.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
