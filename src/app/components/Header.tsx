import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingBag, Menu, X, Sun, Moon, Globe, User, LogOut, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
}

export default function Header({ onNavigate, onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { key: 'nav.home', page: 'home' },
    { key: 'nav.shop', page: 'shop' },
    { key: 'nav.about', page: 'about' },
    { key: 'nav.contact', page: 'contact' },
  ];

  // Close user menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      setShowUserMenu(false);
    }
  };

  useState(() => {
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/10 dark:border-white/10" />

      <div className="relative max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            type="button"
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="text-2xl font-bold tracking-wider cursor-pointer"
          >
            <span className="bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              LUXURY
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.page)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative text-sm tracking-wide hover:text-black dark:hover:text-white transition-colors group"
              >
                {t(item.key)}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black dark:bg-white group-hover:w-full transition-all duration-300"
                />
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-semibold">{language === 'ar' ? 'EN' : 'AR'}</span>
            </motion.button>

            {/* Cart */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </motion.button>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu-container">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <User className="w-5 h-5" />
                </motion.button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg z-50"
                  >
                    <div className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                      {user.role === 'wholesale' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs">
                          {language === 'ar' ? 'جملة' : 'Wholesale'}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </button>
                    )}

                    {user.role === 'wholesale' && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('wholesale-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {language === 'ar' ? 'لوحة الجملة' : 'Wholesale Dashboard'}
                      </button>
                    )}

                    {user.role === 'user' && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('customer-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {language === 'ar' ? 'حسابي' : 'My Account'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        onNavigate('home');
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('login')}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <User className="w-5 h-5" />
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            {navItems.map((item, index) => (
              <motion.button
                key={item.key}
                type="button"
                onClick={() => {
                  onNavigate(item.page);
                  setIsMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="block py-3 text-sm hover:text-black dark:hover:text-white transition-colors w-full text-left"
              >
                {t(item.key)}
              </motion.button>
            ))}
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
