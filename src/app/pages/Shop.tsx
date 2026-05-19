import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, ShoppingCart, Eye, Heart, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useProducts, Product } from '../contexts/ProductsContext';

interface ShopProps {
  onProductClick: (product: Product) => void;
}

const SORT_OPTIONS = {
  ar: ['الأحدث', 'السعر: الأقل أولاً', 'السعر: الأعلى أولاً', 'الاسم'],
  en: ['Newest', 'Price: Low to High', 'Price: High to Low', 'Name'],
};

export default function Shop({ onProductClick }: ShopProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortIndex, setSortIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const ar = language === 'ar';

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'all'));
    return ['all', ...Array.from(cats).filter(c => c !== 'all')];
  }, [products]);

  const categoryLabel = (cat: string) => {
    if (cat === 'all') return ar ? 'الكل' : 'All';
    const p = products.find(p => p.category === cat);
    return ar ? (p?.categoryAr ?? cat) : cat;
  };

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.retailPrice || 0), 1000), [products]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const pName = p.name || '';
      const pNameAr = p.nameAr || '';
      const pCategory = p.category || 'all';
      const pPrice = p.retailPrice || 0;

      const matchSearch =
        pName.toLowerCase().includes(search.toLowerCase()) ||
        pNameAr.includes(search);
      const matchCat = selectedCategory === 'all' || pCategory === selectedCategory;
      const matchPrice = pPrice >= priceRange[0] && pPrice <= priceRange[1];
      return matchSearch && matchCat && matchPrice;
    });

    switch (sortIndex) {
      case 1: list = [...list].sort((a, b) => (a.retailPrice || 0) - (b.retailPrice || 0)); break;
      case 2: list = [...list].sort((a, b) => (b.retailPrice || 0) - (a.retailPrice || 0)); break;
      case 3: list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      default: list = [...list].sort((a, b) => (b.id || 0) - (a.id || 0)); // newest = highest id
    }
    return list;
  }, [products, search, selectedCategory, priceRange, sortIndex]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setSortIndex(0);
  };

  const activeFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice ||
    sortIndex !== 0;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" dir={ar ? 'rtl' : 'ltr'}>
      <div className="max-w-[1400px] mx-auto">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            {ar ? 'المتجر' : 'Shop'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filtered.length} {ar ? 'منتج متاح' : 'products available'}
          </p>
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8 items-center"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${ar ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={ar ? 'ابحث عن منتج...' : 'Search products...'}
              className={`w-full py-3 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors text-sm ${ar ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className={`absolute top-1/2 -translate-y-1/2 ${ar ? 'left-4' : 'right-4'}`}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-colors text-sm font-semibold ${showFilters ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'border-black/10 dark:border-white/10 hover:border-black/30'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {ar ? 'الفلاتر' : 'Filters'}
            {activeFilters && <span className="w-2 h-2 bg-rose-500 rounded-full" />}
          </motion.button>

          {/* Sort */}
          <div className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-black/10 dark:border-white/10 hover:border-black/30 text-sm font-semibold"
            >
              {SORT_OPTIONS[ar ? 'ar' : 'en'][sortIndex]}
              <ChevronDown className="w-4 h-4" />
            </motion.button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`absolute top-full mt-2 ${ar ? 'right-0' : 'left-0'} w-52 p-2 rounded-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl z-20`}
                >
                  {SORT_OPTIONS[ar ? 'ar' : 'en'].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSortIndex(i); setShowSortMenu(false); }}
                      className={`w-full text-start px-4 py-2.5 rounded-xl text-sm transition-colors ${sortIndex === i ? 'bg-black dark:bg-white text-white dark:text-black font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeFilters && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm text-rose-500 border-2 border-rose-500/20 hover:bg-rose-500/10 transition-colors"
            >
              <X className="w-4 h-4" />
              {ar ? 'مسح الفلاتر' : 'Clear filters'}
            </motion.button>
          )}
        </motion.div>

        {/* Expanded Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-3xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/10 dark:border-white/10 space-y-6">

                {/* Categories */}
                <div>
                  <p className="text-sm font-bold mb-3">{ar ? 'التصنيف' : 'Category'}</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <motion.button
                        key={cat}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
                      >
                        {categoryLabel(cat)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold">{ar ? 'نطاق السعر' : 'Price Range'}</p>
                    <span className="text-sm text-gray-500">
                      ${priceRange[0]} — ${priceRange[1]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-8">$0</span>
                      <input
                        type="range"
                        min={0}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 50), priceRange[1]])}
                        className="flex-1 accent-black dark:accent-white"
                      />
                      <span className="text-xs text-gray-400 w-10">${priceRange[0]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-8">${priceRange[0]}</span>
                      <input
                        type="range"
                        min={0}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 50)])}
                        className="flex-1 accent-black dark:accent-white"
                      />
                      <span className="text-xs text-gray-400 w-10">${maxPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills (quick access) */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${selectedCategory === cat ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' : 'border-black/10 dark:border-white/10 hover:border-black/30'}`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">{ar ? 'لا توجد منتجات' : 'No products found'}</h3>
              <p className="text-gray-500 mb-6">{ar ? 'جرب تغيير الفلاتر أو كلمة البحث' : 'Try adjusting your filters or search'}</p>
              <button type="button" onClick={resetFilters} className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-semibold">
                {ar ? 'مسح الفلاتر' : 'Clear Filters'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onHoverStart={() => setHoveredId(product.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <motion.img
                        src={product.image}
                        alt={ar ? product.nameAr : product.name}
                        className="w-full h-full object-cover"
                        animate={{ scale: hoveredId === product.id ? 1.08 : 1 }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === product.id ? 1 : 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3"
                      >
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); onProductClick(product); }}
                          className="p-3.5 bg-white dark:bg-black rounded-full shadow-lg"
                          title={ar ? 'عرض سريع' : 'Quick view'}
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={e => e.stopPropagation()}
                          className="p-3.5 bg-white dark:bg-black rounded-full shadow-lg"
                          title={ar ? 'المفضلة' : 'Wishlist'}
                        >
                          <Heart className="w-5 h-5" />
                        </motion.button>
                      </motion.div>

                      {/* Category Badge */}
                      <div className={`absolute top-3 ${ar ? 'right-3' : 'left-3'} px-3 py-1 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-xl text-xs font-medium`}>
                        {ar ? product.categoryAr : product.category}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-base mb-1 truncate">
                        {ar ? product.nameAr : product.name}
                      </h3>
                      {product.stock !== undefined && product.stock < 10 && (
                        <p className="text-xs text-amber-500 mb-2">
                          {ar ? `فقط ${product.stock} قطعة` : `Only ${product.stock} left`}
                        </p>
                      )}

                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">{t('products.retail')}</p>
                          <p className="text-xl font-bold">${product.retailPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-0.5">{t('products.wholesale')}</p>
                          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">${product.wholesalePrice}</p>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={e => {
                          e.stopPropagation();
                          addToCart({
                            id: product.id,
                            name: product.name,
                            nameAr: product.nameAr,
                            price: product.retailPrice,
                            image: product.image,
                            type: 'retail',
                          });
                        }}
                        className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('products.addToCart')}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
