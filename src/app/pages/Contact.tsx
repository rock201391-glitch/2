import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { language } = useLanguage();

  const contactInfo = [
    {
      icon: Mail,
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: 'info@luxuryabaya.com',
      link: 'mailto:info@luxuryabaya.com',
    },
    {
      icon: Phone,
      title: language === 'ar' ? 'الهاتف' : 'Phone',
      value: '+966 50 123 4567',
      link: 'tel:+966501234567',
    },
    {
      icon: MapPin,
      title: language === 'ar' ? 'العنوان' : 'Address',
      value: language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia',
      link: null,
    },
    {
      icon: Clock,
      title: language === 'ar' ? 'ساعات العمل' : 'Working Hours',
      value: language === 'ar' ? 'السبت - الخميس: 9 ص - 9 م' : 'Sat - Thu: 9 AM - 9 PM',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent mx-auto mb-8" />
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'نحن هنا للإجابة على جميع استفساراتك. تواصل معنا وسنرد عليك في أقرب وقت ممكن.'
              : 'We are here to answer all your inquiries. Contact us and we will respond to you as soon as possible.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
          >
            <h2 className="text-3xl font-bold mb-8">
              {language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}
            </h2>

            <form className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone'}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  rows={6}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors resize-none"
                  placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Send className="w-5 h-5" />
                {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const content = (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-black/10 to-black/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center flex-shrink-0"
                    >
                      <Icon className="w-7 h-7" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{info.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{info.value}</p>
                    </div>
                  </div>
                </motion.div>
              );

              return info.link ? (
                <a key={index} href={info.link}>
                  {content}
                </a>
              ) : (
                <div key={index}>{content}</div>
              );
            })}

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="h-64 rounded-3xl overflow-hidden bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
            >
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
