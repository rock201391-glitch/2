import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSuccess: (role: 'admin' | 'user' | 'wholesale') => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { language } = useLanguage();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'wholesale'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    taxId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Detect role by email for demo accounts
        let role: 'admin' | 'user' | 'wholesale' = 'user';
        if (formData.email === 'admin@luxury.com') role = 'admin';
        else if (formData.email === 'wholesale@luxury.com') role = 'wholesale';
        const success = await login(formData.email, formData.password);
        if (success) {
          onSuccess(role);
        } else {
          setError(language === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials');
        }
      } else {
        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          accountType,
          formData.businessName,
          formData.taxId
        );
        if (success) {
          onSuccess(accountType);
        } else {
          setError(language === 'ar' ? 'حدث خطأ في التسجيل' : 'Registration failed');
        }
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="p-8 md:p-12 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {isLogin
                ? language === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Login'
                : language === 'ar'
                ? 'إنشاء حساب'
                : 'Sign Up'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin
                ? language === 'ar'
                  ? 'مرحباً بعودتك'
                  : 'Welcome back'
                : language === 'ar'
                ? 'انضم إلينا اليوم'
                : 'Join us today'}
            </p>
          </div>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="space-y-3 mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
              >
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                  {language === 'ar' ? 'حساب تجريبي للمسؤول:' : 'Demo Admin Account:'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Email: admin@luxury.com
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Password: admin123
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
              >
                <p className="text-sm text-green-600 dark:text-green-400 mb-2 font-semibold">
                  {language === 'ar' ? 'حساب تجريبي للجملة:' : 'Demo Wholesale Account:'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Email: wholesale@luxury.com
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Password: wholesale123
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20"
              >
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2 font-semibold">
                  {language === 'ar' ? 'حساب تجريبي للزبون:' : 'Demo Customer Account:'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Email: customer@luxury.com
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Password: customer123
                </p>
              </motion.div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type (Sign Up only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-3">
                  {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType('user')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      accountType === 'user'
                        ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {language === 'ar' ? 'عميل عادي' : 'Regular Customer'}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('wholesale')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      accountType === 'wholesale'
                        ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="text-sm font-semibold">
                      {language === 'ar' ? 'تاجر جملة' : 'Wholesale'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Name Field (Sign Up only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Wholesale Fields */}
            {!isLogin && accountType === 'wholesale' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'ar' ? 'اسم المتجر' : 'Business Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                    placeholder={language === 'ar' ? 'أدخل اسم المتجر' : 'Enter business name'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {language === 'ar' ? 'الرقم الضريبي' : 'Tax ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                    placeholder={language === 'ar' ? 'أدخل الرقم الضريبي' : 'Enter tax ID'}
                    required
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold disabled:opacity-50"
            >
              {loading
                ? language === 'ar'
                  ? 'جاري التحميل...'
                  : 'Loading...'
                : isLogin
                ? language === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Login'
                : language === 'ar'
                ? 'إنشاء حساب'
                : 'Sign Up'}
            </motion.button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {isLogin
                ? language === 'ar'
                  ? 'ليس لديك حساب؟ سجل الآن'
                  : "Don't have an account? Sign up"
                : language === 'ar'
                ? 'لديك حساب؟ سجل الدخول'
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
