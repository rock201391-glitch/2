import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    // Header
    'nav.home': 'الرئيسية',
    'nav.shop': 'المتجر',
    'nav.wholesale': 'الجملة',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.search': 'بحث...',

    // Hero
    'hero.title': 'مجموعة العبايات الفاخرة',
    'hero.subtitle': 'تصاميم عصرية تجمع بين الأناقة والرقي',
    'hero.cta': 'اكتشف المجموعة',
    'hero.wholesale': 'أسعار الجملة',

    // Products
    'products.title': 'أحدث التصاميم',
    'products.viewAll': 'عرض الكل',
    'products.newCollection': 'المجموعة الجديدة',
    'products.addToCart': 'أضف للسلة',
    'products.quickView': 'عرض سريع',
    'products.wholesale': 'سعر الجملة',
    'products.retail': 'سعر القطاعي',

    // Categories
    'categories.title': 'التصنيفات',
    'categories.classic': 'كلاسيكي',
    'categories.modern': 'عصري',
    'categories.elegant': 'أنيق',
    'categories.casual': 'يومي',

    // Features
    'features.quality': 'جودة عالية',
    'features.qualityDesc': 'خامات فاخرة وتصنيع متقن',
    'features.shipping': 'شحن سريع',
    'features.shippingDesc': 'توصيل لجميع أنحاء العالم',
    'features.wholesale': 'أسعار الجملة',
    'features.wholesaleDesc': 'خصومات خاصة للكميات الكبيرة',
    'features.support': 'دعم 24/7',
    'features.supportDesc': 'فريق دعم متواجد دائماً',

    // Footer
    'footer.description': 'وجهتك المثالية للعبايات الفاخرة بأسعار تنافسية',
    'footer.quickLinks': 'روابط سريعة',
    'footer.customerService': 'خدمة العملاء',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة',

    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.logout': 'تسجيل الخروج',
    'auth.dashboard': 'لوحة التحكم',
    'auth.profile': 'الملف الشخصي',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.wholesale': 'Wholesale',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.search': 'Search...',

    // Hero
    'hero.title': 'Luxury Abaya Collection',
    'hero.subtitle': 'Modern Designs Combining Elegance and Sophistication',
    'hero.cta': 'Discover Collection',
    'hero.wholesale': 'Wholesale Prices',

    // Products
    'products.title': 'Latest Designs',
    'products.viewAll': 'View All',
    'products.newCollection': 'New Collection',
    'products.addToCart': 'Add to Cart',
    'products.quickView': 'Quick View',
    'products.wholesale': 'Wholesale Price',
    'products.retail': 'Retail Price',

    // Categories
    'categories.title': 'Categories',
    'categories.classic': 'Classic',
    'categories.modern': 'Modern',
    'categories.elegant': 'Elegant',
    'categories.casual': 'Casual',

    // Features
    'features.quality': 'High Quality',
    'features.qualityDesc': 'Premium fabrics and excellent craftsmanship',
    'features.shipping': 'Fast Shipping',
    'features.shippingDesc': 'Worldwide delivery',
    'features.wholesale': 'Wholesale Prices',
    'features.wholesaleDesc': 'Special discounts for bulk orders',
    'features.support': '24/7 Support',
    'features.supportDesc': 'Always here to help',

    // Footer
    'footer.description': 'Your destination for luxury abayas at competitive prices',
    'footer.quickLinks': 'Quick Links',
    'footer.customerService': 'Customer Service',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.dashboard': 'Dashboard',
    'auth.profile': 'Profile',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
