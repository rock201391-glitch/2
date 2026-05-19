import { motion } from 'motion/react';
import { Package, TrendingDown, Truck, FileText, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Wholesale() {
  const { language } = useLanguage();

  const benefits = [
    {
      icon: TrendingDown,
      title: language === 'ar' ? 'أسعار تنافسية' : 'Competitive Prices',
      desc: language === 'ar'
        ? 'خصومات تصل إلى 40% للطلبات الكبيرة'
        : 'Discounts up to 40% for bulk orders',
    },
    {
      icon: Package,
      title: language === 'ar' ? 'طلبات مرنة' : 'Flexible Orders',
      desc: language === 'ar'
        ? 'لا يوجد حد أدنى للطلب الأول'
        : 'No minimum order for first purchase',
    },
    {
      icon: Truck,
      title: language === 'ar' ? 'شحن سريع' : 'Fast Shipping',
      desc: language === 'ar'
        ? 'شحن مجاني للطلبات فوق 1000$'
        : 'Free shipping for orders over $1000',
    },
    {
      icon: FileText,
      title: language === 'ar' ? 'دعم كامل' : 'Full Support',
      desc: language === 'ar'
        ? 'مدير حساب مخصص لكل عميل'
        : 'Dedicated account manager for each client',
    },
  ];

  const pricingTiers = [
    {
      quantity: '10-50',
      discount: '15%',
      priceRange: '$240-280',
    },
    {
      quantity: '51-100',
      discount: '25%',
      priceRange: '$210-240',
      popular: true,
    },
    {
      quantity: '101-500',
      discount: '35%',
      priceRange: '$180-210',
    },
    {
      quantity: '500+',
      discount: '40%',
      priceRange: '$150-180',
    },
  ];

  const features = [
    language === 'ar' ? 'جودة مضمونة 100%' : '100% Quality Guaranteed',
    language === 'ar' ? 'إمكانية التخصيص' : 'Customization Available',
    language === 'ar' ? 'تغليف احترافي' : 'Professional Packaging',
    language === 'ar' ? 'دفع مرن' : 'Flexible Payment',
    language === 'ar' ? 'إرجاع مجاني' : 'Free Returns',
    language === 'ar' ? 'شحن عالمي' : 'Worldwide Shipping',
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-6 py-2 rounded-full bg-black/5 dark:bg-white/5 text-sm mb-6">
              {language === 'ar' ? 'للتجار والموزعين' : 'For Retailers & Distributors'}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {language === 'ar' ? 'أسعار الجملة' : 'Wholesale Pricing'}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto mb-8" />
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {language === 'ar'
                ? 'انضم إلى شبكة شركائنا واحصل على أفضل الأسعار مع خدمة استثنائية'
                : 'Join our partner network and get the best prices with exceptional service'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 text-center"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-black/10 to-black/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'مستويات الأسعار' : 'Pricing Tiers'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative p-8 rounded-3xl backdrop-blur-xl border ${
                  tier.popular
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white/50 dark:bg-black/50 border-black/10 dark:border-white/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-xs rounded-full">
                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                  </div>
                )}

                <div className="text-center">
                  <div className={`text-sm mb-2 ${tier.popular ? 'text-white/80 dark:text-black/80' : 'text-gray-600 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'الكمية' : 'Quantity'}
                  </div>
                  <div className="text-3xl font-bold mb-4">{tier.quantity}</div>

                  <div className="text-5xl font-bold mb-2">{tier.discount}</div>
                  <div className={`text-sm mb-6 ${tier.popular ? 'text-white/80 dark:text-black/80' : 'text-gray-600 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'خصم' : 'Discount'}
                  </div>

                  <div className={`text-lg ${tier.popular ? 'text-white/90 dark:text-black/90' : 'text-gray-600 dark:text-gray-400'}`}>
                    {tier.priceRange}
                  </div>
                  <div className={`text-xs ${tier.popular ? 'text-white/70 dark:text-black/70' : 'text-gray-500 dark:text-gray-500'}`}>
                    {language === 'ar' ? 'للقطعة' : 'per piece'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="p-12 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {language === 'ar' ? 'ما نقدمه لشركائنا' : 'What We Offer Our Partners'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-lg">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Start?'}
            </h2>
            <p className="text-xl mb-8 text-white/80 dark:text-black/80 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'تواصل معنا اليوم واحصل على عرض سعر مخصص لاحتياجاتك'
                : 'Contact us today and get a custom quote for your needs'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white dark:bg-black text-black dark:text-white rounded-full font-semibold"
              >
                {language === 'ar' ? 'طلب عرض سعر' : 'Request Quote'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-white dark:border-black text-white dark:text-black rounded-full font-semibold hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
              >
                {language === 'ar' ? 'تحدث مع مستشار' : 'Talk to Consultant'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
