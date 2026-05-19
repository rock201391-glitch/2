import { useState } from 'react';
import { motion } from 'motion/react';
import {
  User, ShoppingBag, Heart, Settings, Package,
  MapPin, CreditCard, Bell, ChevronRight, Star,
  Clock, CheckCircle, Truck, RotateCcw, Edit3, LogOut
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface CustomerDashboardProps {
  onNavigate: (page: string) => void;
}

const mockOrders = [
  {
    id: '#ORD-2024-001',
    date: '2024-05-10',
    status: 'delivered',
    total: 450,
    items: 2,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&q=80',
  },
  {
    id: '#ORD-2024-002',
    date: '2024-05-14',
    status: 'shipping',
    total: 280,
    items: 1,
    image: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=200&q=80',
  },
  {
    id: '#ORD-2024-003',
    date: '2024-05-18',
    status: 'processing',
    total: 620,
    items: 3,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80',
  },
];

const mockWishlist = [
  {
    id: 1,
    name: 'Royal Abaya',
    nameAr: 'عباية ملكية',
    price: 450,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'Luxury Kaftan',
    nameAr: 'قفطان فاخر',
    price: 380,
    image: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400&q=80',
    rating: 4,
  },
  {
    id: 3,
    name: 'Silk Bisht',
    nameAr: 'بشت حريري',
    price: 680,
    image: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400&q=80',
    rating: 5,
  },
];

export default function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'profile' | 'settings'>('overview');

  const ar = language === 'ar';

  const statusInfo = {
    delivered: {
      label: ar ? 'تم التوصيل' : 'Delivered',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    shipping: {
      label: ar ? 'في الشحن' : 'Shipping',
      icon: <Truck className="w-4 h-4" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    processing: {
      label: ar ? 'قيد المعالجة' : 'Processing',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  };

  const tabs = [
    { key: 'overview', label: ar ? 'نظرة عامة' : 'Overview', icon: <User className="w-5 h-5" /> },
    { key: 'orders', label: ar ? 'طلباتي' : 'My Orders', icon: <Package className="w-5 h-5" /> },
    { key: 'wishlist', label: ar ? 'المفضلة' : 'Wishlist', icon: <Heart className="w-5 h-5" /> },
    { key: 'profile', label: ar ? 'الملف الشخصي' : 'Profile', icon: <Edit3 className="w-5 h-5" /> },
    { key: 'settings', label: ar ? 'الإعدادات' : 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const stats = [
    { label: ar ? 'إجمالي الطلبات' : 'Total Orders', value: '12', icon: <ShoppingBag className="w-6 h-6" />, color: 'from-violet-500 to-purple-600' },
    { label: ar ? 'المفضلة' : 'Wishlist', value: '8', icon: <Heart className="w-6 h-6" />, color: 'from-rose-500 to-pink-600' },
    { label: ar ? 'النقاط المكتسبة' : 'Points Earned', value: '1,240', icon: <Star className="w-6 h-6" />, color: 'from-amber-500 to-orange-600' },
    { label: ar ? 'إجمالي الإنفاق' : 'Total Spent', value: '$3,450', icon: <CreditCard className="w-6 h-6" />, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {ar ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {ar ? 'إدارة حسابك وتتبع طلباتك' : 'Manage your account and track your orders'}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { logout(); onNavigate('home'); }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {ar ? 'تسجيل الخروج' : 'Logout'}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: ar ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            {/* User Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center mb-4">
                <User className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm opacity-70">{user?.email}</p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/20 dark:bg-black/20 text-xs">
                {ar ? 'عميل مميز' : 'Premium Member'}
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.key}
                  type="button"
                  whileHover={{ x: ar ? -4 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all text-sm font-medium ${
                    activeTab === tab.key
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {activeTab !== tab.key && <ChevronRight className={`w-4 h-4 ${ar ? 'mr-auto rotate-180' : 'ml-auto'}`} />}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{ar ? 'أحدث الطلبات' : 'Recent Orders'}</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {ar ? 'عرض الكل' : 'View all'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 2).map((order) => {
                      const info = statusInfo[order.status as keyof typeof statusInfo];
                      return (
                        <div key={order.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                          <img src={order.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <p className="font-semibold">{order.id}</p>
                            <p className="text-sm text-gray-500">{order.date} · {order.items} {ar ? 'منتجات' : 'items'}</p>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${info.color} ${info.bg}`}>
                            {info.icon}
                            {info.label}
                          </div>
                          <div className="font-bold text-lg">${order.total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: <ShoppingBag className="w-6 h-6" />, label: ar ? 'تسوق الآن' : 'Shop Now', action: () => onNavigate('home'), color: 'from-violet-500 to-purple-600' },
                    { icon: <Truck className="w-6 h-6" />, label: ar ? 'تتبع الطلب' : 'Track Order', action: () => setActiveTab('orders'), color: 'from-blue-500 to-cyan-600' },
                    { icon: <RotateCcw className="w-6 h-6" />, label: ar ? 'إرجاع منتج' : 'Return Item', action: () => setActiveTab('orders'), color: 'from-rose-500 to-pink-600' },
                  ].map((action, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={action.action}
                      className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 flex flex-col items-center gap-3 hover:border-black/30 dark:hover:border-white/30 transition-all"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-semibold">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                <h2 className="text-2xl font-bold mb-6">{ar ? 'طلباتي' : 'My Orders'}</h2>
                <div className="space-y-4">
                  {mockOrders.map((order, i) => {
                    const info = statusInfo[order.status as keyof typeof statusInfo];
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-wrap items-center gap-4 p-5 rounded-2xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <img src={order.image} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                        <div className="flex-1 min-w-[140px]">
                          <p className="font-bold text-lg">{order.id}</p>
                          <p className="text-sm text-gray-500 mb-1">{order.date}</p>
                          <p className="text-sm">{order.items} {ar ? 'منتجات' : 'items'}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${info.color} ${info.bg}`}>
                          {info.icon}
                          {info.label}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${order.total}</div>
                          <button
                            type="button"
                            className="text-xs text-gray-500 hover:text-black dark:hover:text-white mt-1 transition-colors"
                          >
                            {ar ? 'عرض التفاصيل' : 'View Details'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                <h2 className="text-2xl font-bold mb-6">{ar ? 'قائمة المفضلة' : 'Wishlist'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockWishlist.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 group"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={ar ? item.nameAr : item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 rounded-full"
                        >
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{ar ? item.nameAr : item.name}</h3>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(item.rating)].map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold">${item.price}</span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate('home')}
                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-semibold"
                          >
                            {ar ? 'اشتري' : 'Buy'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                <h2 className="text-2xl font-bold mb-6">{ar ? 'الملف الشخصي' : 'My Profile'}</h2>
                <div className="space-y-5">
                  {[
                    { label: ar ? 'الاسم الكامل' : 'Full Name', value: user?.name, icon: <User className="w-5 h-5" /> },
                    { label: ar ? 'البريد الإلكتروني' : 'Email', value: user?.email, icon: <Bell className="w-5 h-5" /> },
                    { label: ar ? 'العنوان' : 'Address', value: ar ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia', icon: <MapPin className="w-5 h-5" /> },
                    { label: ar ? 'طريقة الدفع' : 'Payment Method', value: '**** **** **** 4242', icon: <CreditCard className="w-5 h-5" /> },
                  ].map((field, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                      <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-white/10 flex items-center justify-center">
                        {field.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
                        <p className="font-semibold">{field.value}</p>
                      </div>
                      <button type="button" className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <Edit3 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold mt-4"
                  >
                    {ar ? 'حفظ التغييرات' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="p-8 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
                <h2 className="text-2xl font-bold mb-6">{ar ? 'الإعدادات' : 'Settings'}</h2>
                <div className="space-y-4">
                  {[
                    { label: ar ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', enabled: true },
                    { label: ar ? 'إشعارات العروض' : 'Promotional Notifications', enabled: false },
                    { label: ar ? 'تحديثات الطلبات' : 'Order Updates', enabled: true },
                    { label: ar ? 'المصادقة الثنائية' : 'Two-Factor Auth', enabled: false },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5">
                      <span className="font-medium">{setting.label}</span>
                      <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${setting.enabled ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${setting.enabled ? 'bg-white dark:bg-black right-1' : 'bg-white dark:bg-gray-400 left-1'}`} />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-black/10 dark:border-white/10">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { logout(); onNavigate('home'); }}
                      className="w-full py-4 rounded-full border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      {ar ? 'تسجيل الخروج' : 'Logout'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
