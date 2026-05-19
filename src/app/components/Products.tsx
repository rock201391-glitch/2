import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useProducts, Product } from '../contexts/ProductsContext';

interface ProductsProps {
  onProductClick: (product: Product) => void;
  onViewAll?: () => void;
  limit?: number; // how many products to show, undefined = all
}

export default function Products({ onProductClick, onViewAll, limit = 5 }: ProductsProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Show newest products first (highest id), then limit
  const displayed = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);

  return (
    <section id="shop" className="py-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            {t('products.title')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
            {language === 'ar' ? 'أحدث 5 منتجات في مجموعتنا الفاخرة' : 'Latest 5 products from our luxury collection'}
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(product.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative"
            >
              {/* Card */}
              <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={language === 'ar' ? product.nameAr : product.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredId === product.id ? 1.08 : 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Overlay on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === product.id ? 1 : 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-4"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product);
                      }}
                      className="p-4 bg-white dark:bg-black rounded-full"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                      className="p-4 bg-white dark:bg-black rounded-full"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                  </motion.div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-xl text-xs">
                    {language === 'ar' ? product.categoryAr : product.category}
                  </div>

                  {/* NEW Badge */}
                  {index === 0 && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold">
                      {language === 'ar' ? 'جديد' : 'NEW'}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {language === 'ar' ? product.nameAr : product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('products.retail')}
                      </div>
                      <div className="text-2xl font-bold">
                        ${product.retailPrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('products.wholesale')}
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        ${product.wholesalePrice}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        name: product.name,
                        nameAr: product.nameAr,
                        price: product.retailPrice,
                        image: product.image,
                        type: 'retail',
                      });
                    }}
                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    {t('products.addToCart')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewAll}
            className="inline-flex items-center gap-3 px-12 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-lg shadow-lg"
          >
            {language === 'ar' ? 'عرض جميع المنتجات' : 'View All Products'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
