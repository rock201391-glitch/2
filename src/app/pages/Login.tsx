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
  const { login, register, loginWithGoogle } = useAuth();
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

          {/* Google Login and Toggle Login/Register */}
          <div className="mt-6 text-center">
            {/* Google Login Button */}
            <button
              onClick={loginWithGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-4 mb-4 rounded-full border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-semibold"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {language === 'ar' ? 'المتابعة باستخدام جوجل' : 'Continue with Google'}
            </button>
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
