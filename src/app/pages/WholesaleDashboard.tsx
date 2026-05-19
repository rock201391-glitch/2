import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, TrendingDown, ShoppingCart, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductsContext';
import { useCart } from '../contexts/CartContext';

interface WholesaleDashboardProps {
  onProductClick: (product: any) => void;
}

export default function WholesaleDashboard({ onProductClick }: WholesaleDashboardProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { products } = useProducts();
  const { addToCart } = useCart();

  const stats = [
    {
      icon: ShoppingCart,
      label: language === 'ar' ? 'طلبات هذا الشهر' : 'Orders This Month',
      value: '24',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Package,
      label: language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases',
      value: '$12,450',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: TrendingDown,
      label: language === 'ar' ? 'الخصم الإجمالي' : 'Total Savings',
      value: '35%',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Calendar,
      label: language === 'ar' ? 'عضو منذ' : 'Member Since',
      value: 'Jan 2026',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {language === 'ar' ? 'مرحباً' : 'Welcome'}, {user?.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {user?.businessName}
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
            <span className="text-green-600 dark:text-green-400 font-semibold">
              {language === 'ar' ? 'حساب جملة نشط' : 'Active Wholesale Account'}
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Special Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
        >
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ar' ? 'عروض خاصة للجملة' : 'Special Wholesale Offers'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar'
              ? 'احصل على خصم إضافي 10% على الطلبات فوق 1000$'
              : 'Get an extra 10% off on orders over $1000'}
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-xl">
              <span className="font-semibold">
                {language === 'ar' ? 'ينتهي في 5 أيام' : 'Expires in 5 days'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">
            {language === 'ar' ? 'المنتجات المتاحة - أسعار الجملة' : 'Available Products - Wholesale Prices'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onClick={() => onProductClick(product)}
                className="group relative cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.image}
                      alt={language === 'ar' ? product.nameAr : product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Wholesale Badge */}
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-green-500 text-white text-xs font-bold">
                      {language === 'ar' ? 'جملة' : 'Wholesale'}
                    </div>

                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                      -{Math.round(((product.retailPrice - product.wholesalePrice) / product.retailPrice) * 100)}%
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {language === 'ar' ? product.nameAr : product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ${product.retailPrice}
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${product.wholesalePrice}
                      </span>
                    </div>

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
                          price: product.wholesalePrice,
                          image: product.image,
                          type: 'wholesale',
                        });
                      }}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold"
                    >
                      {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
