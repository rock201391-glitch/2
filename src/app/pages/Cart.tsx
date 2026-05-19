import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  onNavigate: (page: string) => void;
}

export default function Cart({ onNavigate }: CartProps) {
  const { language, t } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">
            {language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {language === 'ar'
              ? 'ابدأ بإضافة منتجات إلى سلة التسوق'
              : 'Start adding products to your cart'}
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full"
          >
            {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalItems} {language === 'ar' ? 'منتجات' : 'items'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.type}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={language === 'ar' ? item.nameAr : item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {language === 'ar' ? item.nameAr : item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="inline-block px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs">
                          {item.type === 'retail'
                            ? t('products.retail')
                            : t('products.wholesale')}
                        </div>
                        {item.size && (
                          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs">
                            {language === 'ar' ? 'مقاس مخصص' : 'Custom Size'}
                          </div>
                        )}
                      </div>

                      {item.size && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex gap-3">
                          <span>{language === 'ar' ? 'طول' : 'H'}: {item.size.height}cm</span>
                          <span>{language === 'ar' ? 'عرض' : 'W'}: {item.size.width}cm</span>
                          <span>{language === 'ar' ? 'يد' : 'S'}: {item.size.sleeveLength}cm</span>
                        </div>
                      )}

                      <div className="text-2xl font-bold">
                        ${item.price}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                        className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="text-lg font-semibold w-12 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                        className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="p-3 h-fit rounded-full hover:bg-red-500/10 text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Item Total */}
                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'الإجمالي' : 'Total'}
                  </div>
                  <div className="text-2xl font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
            >
              <h2 className="text-2xl font-bold mb-6">
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'الشحن' : 'Shipping'}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {language === 'ar' ? 'مجاني' : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'الضريبة' : 'Tax'}
                  </span>
                  <span className="font-semibold">${(totalPrice * 0.15).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10 dark:border-white/10 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span>${(totalPrice * 1.15).toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center gap-2 text-lg font-semibold"
              >
                {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 py-4 rounded-full border-2 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors"
                onClick={() => onNavigate('home')}
              >
                {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
