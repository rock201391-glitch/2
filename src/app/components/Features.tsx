import { motion } from 'motion/react';
import { Gem, Truck, Tag, Headphones } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Gem,
      titleKey: 'features.quality',
      descKey: 'features.qualityDesc',
    },
    {
      icon: Truck,
      titleKey: 'features.shipping',
      descKey: 'features.shippingDesc',
    },
    {
      icon: Tag,
      titleKey: 'features.wholesale',
      descKey: 'features.wholesaleDesc',
    },
    {
      icon: Headphones,
      titleKey: 'features.support',
      descKey: 'features.supportDesc',
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                {/* Glassmorphism Card */}
                <div className="relative p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 text-center">
                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-black/10 to-black/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center"
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400">
                    {t(feature.descKey)}
                  </p>

                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-black/10 to-transparent dark:from-white/10 blur-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
