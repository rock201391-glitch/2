import { motion } from 'motion/react';
import { Award, Users, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { language } = useLanguage();

  const stats = [
    {
      icon: Award,
      value: '10+',
      label: language === 'ar' ? 'سنوات من الخبرة' : 'Years of Excellence',
    },
    {
      icon: Users,
      value: '50K+',
      label: language === 'ar' ? 'عميل سعيد' : 'Happy Customers',
    },
    {
      icon: Globe,
      value: '30+',
      label: language === 'ar' ? 'دولة حول العالم' : 'Countries Worldwide',
    },
    {
      icon: Heart,
      value: '100%',
      label: language === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction',
    },
  ];

  const values = [
    {
      title: language === 'ar' ? 'الجودة الفاخرة' : 'Premium Quality',
      desc: language === 'ar'
        ? 'نختار أجود الخامات لنقدم لك أفضل تجربة'
        : 'We select the finest materials to provide you the best experience',
    },
    {
      title: language === 'ar' ? 'التصميم العصري' : 'Modern Design',
      desc: language === 'ar'
        ? 'تصاميم مبتكرة تواكب أحدث صيحات الموضة'
        : 'Innovative designs that keep up with the latest fashion trends',
    },
    {
      title: language === 'ar' ? 'الاستدامة' : 'Sustainability',
      desc: language === 'ar'
        ? 'نلتزم بممارسات صديقة للبيئة في كل مراحل الإنتاج'
        : 'We commit to eco-friendly practices at every production stage',
    },
    {
      title: language === 'ar' ? 'الابتكار' : 'Innovation',
      desc: language === 'ar'
        ? 'نسعى دائماً لتطوير منتجاتنا وخدماتنا'
        : 'We constantly strive to improve our products and services',
    },
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {language === 'ar' ? 'من نحن' : 'About Us'}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto mb-8" />
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {language === 'ar'
                ? 'نحن نؤمن بأن الأناقة ليست مجرد ملابس، بل هي أسلوب حياة. منذ أكثر من عشر سنوات، نقدم لعملائنا أرقى العبايات التي تجمع بين التراث والعصرية.'
                : 'We believe that elegance is not just clothing, but a lifestyle. For over a decade, we have been providing our customers with the finest abayas that combine heritage and modernity.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
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
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                {language === 'ar' ? 'قصتنا' : 'Our Story'}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  {language === 'ar'
                    ? 'بدأت رحلتنا من حلم بسيط: تقديم عبايات فاخرة بأسعار عادلة. اليوم، نفخر بكوننا واحدة من أبرز العلامات التجارية في مجال الأزياء النسائية المحتشمة.'
                    : 'Our journey began with a simple dream: to provide luxury abayas at fair prices. Today, we are proud to be one of the leading brands in modest womens fashion.'}
                </p>
                <p>
                  {language === 'ar'
                    ? 'نعمل مع أمهر المصممين والحرفيين لنضمن أن كل قطعة تحمل توقيعنا تعكس التزامنا بالجودة والأناقة. نستخدم فقط أفضل الأقمشة ونهتم بكل تفصيل صغير.'
                    : 'We work with the most skilled designers and artisans to ensure that every piece bearing our signature reflects our commitment to quality and elegance. We use only the finest fabrics and pay attention to every small detail.'}
                </p>
                <p>
                  {language === 'ar'
                    ? 'رؤيتنا هي أن نكون الخيار الأول لكل امرأة تبحث عن الأناقة والراحة في آن واحد، محلياً وعالمياً.'
                    : 'Our vision is to be the first choice for every woman seeking elegance and comfort simultaneously, locally and globally.'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="About Us"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'قيمنا' : 'Our Values'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
              >
                <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
