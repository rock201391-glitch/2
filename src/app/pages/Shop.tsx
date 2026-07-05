import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import { supabase } from '../../lib/supabase';

interface ShopProps {
  onProductClick: (product: any) => void;
}

interface Category {
  id: number;
  name: string;
}

type SortOption = 'newest' | 'price-desc' | 'price-asc';
type CategoryFilterKey = 'all' | 'drones' | 'cameras' | 'microphones' | 'accessories';

interface CategoryFilterOption {
  key: Exclude<CategoryFilterKey, 'all'>;
  label: string;
  aliases: string[];
}

const FILTER_BAR_ACTIVE_COLOR = '#0F3A2B';
const FILTER_BAR_INACTIVE_BG = '#FBF7EF';
const FILTER_BAR_INACTIVE_BORDER = '#D8D2C5';

const categoryFilterOptions: CategoryFilterOption[] = [
  { key: 'drones', label: 'الدرون', aliases: ['الدرون', 'الدرونات', 'drone', 'drones'] },
  { key: 'cameras', label: 'الكاميرات', aliases: ['الكاميرات', 'الكاميرا', 'camera', 'cameras'] },
  { key: 'microphones', label: 'المايكات', aliases: ['المايكات', 'المايك', 'الميكروفونات', 'الميكروفون', 'mic', 'mics', 'microphone', 'microphones'] },
  { key: 'accessories', label: 'إكسسوارات', aliases: ['إكسسوارات', 'اكسسوارات', 'الإكسسوارات', 'الاكسسوارات', 'الملحقات', 'ملحقات', 'accessory', 'accessories'] },
];

function normalizeCategoryName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

const normalizedCategoryFilterOptions = categoryFilterOptions.map((filter) => ({
  ...filter,
  normalizedAliases: filter.aliases.map(normalizeCategoryName),
}));

export default function Shop({ onProductClick }: ShopProps) {
  const { addItem } = useCart();
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterKey>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      if (categoryError) {
        console.error('Failed to fetch categories:', categoryError.message);
      } else if (data) {
        setCategories(data as Category[]);
      }
    }
    fetchCategories();
  }, []);

  const getCategoryName = (category_id: number | null) => {
    if (!category_id) return '';
    const cat = categories.find(c => c.id === category_id);
    return cat?.name || '';
  };

  const resolvedCategoryFilters = useMemo(() => {
    return normalizedCategoryFilterOptions.map((filter) => {
      const ids = categories
        .filter((category) => {
          const normalizedName = normalizeCategoryName(category.name);
          return filter.normalizedAliases.some((normalizedAlias) => {
            return (
              normalizedName === normalizedAlias ||
              normalizedName.includes(normalizedAlias) ||
              normalizedAlias.includes(normalizedName)
            );
          });
        })
        .map((category) => category.id);

      return { ...filter, ids };
    });
  }, [categories]);

  const selectedCategoryIds = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return resolvedCategoryFilters.find((filter) => filter.key === selectedCategory)?.ids ?? [];
  }, [resolvedCategoryFilters, selectedCategory]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'الكل';
    return resolvedCategoryFilters.find((filter) => filter.key === selectedCategory)?.label ?? 'هذا التصنيف';
  }, [resolvedCategoryFilters, selectedCategory]);

  const sortedFilteredProducts = useMemo(() => {
    let list = selectedCategoryIds
      ? products.filter((product) => product.category_id !== null && selectedCategoryIds.includes(product.category_id))
      : products;

    if (sortOption === 'newest') {
      list = [...list].sort((a, b) => {
        // Fall back to product id so items without created_at appear after dated items
        const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;
        return dateB - dateA;
      });
    } else if (sortOption === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    return list;
  }, [products, selectedCategoryIds, sortOption]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url || '',
    });
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handleProductClick = (product: any) => {
    onProductClick({
      ...product,
      image: product.image_url || '',
      category: getCategoryName(product.category_id),
    });
  };

  const sortButtons: { key: SortOption; label: string }[] = [
    { key: 'newest', label: 'الأحدث' },
    { key: 'price-desc', label: 'الأعلى سعراً' },
    { key: 'price-asc', label: 'الأقل سعراً' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* ── Hero / Banner ── */}
      <div
        className="relative w-full py-16 px-6 flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ backgroundColor: '#0F3A2B' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 40%)',
          }}
        />
        <p className="text-[#F8F7F2]/60 text-sm tracking-[0.3em] uppercase font-medium mb-3">
          MARQAB STORE
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-[#F8F7F2] mb-4 tracking-wide">
          متجر مرقاب
        </h1>
        <div className="w-16 h-[2px] bg-[#F8F7F2]/30 rounded-full mb-4" />
        <p className="text-[#F8F7F2]/70 text-base max-w-lg leading-relaxed">
          أجهزة الدرون والكاميرات والإكسسوارات الاحترافية
        </p>
      </div>

      {/* ── Filters Row ── */}
      <div className="sticky top-0 z-10 bg-[#F8F7F2]/95 backdrop-blur-sm border-b border-[#E8E4DC] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap justify-center gap-2.5 lg:flex-1 lg:justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full border px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'text-white border-transparent shadow-md'
                    : 'text-[#4E6159] hover:border-[#0F3A2B] hover:text-[#0F3A2B]'
                }`}
                style={selectedCategory === 'all'
                  ? { backgroundColor: FILTER_BAR_ACTIVE_COLOR }
                  : { backgroundColor: FILTER_BAR_INACTIVE_BG, borderColor: FILTER_BAR_INACTIVE_BORDER }}
              >
                الكل
              </button>
              {resolvedCategoryFilters.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.key
                      ? 'text-white border-transparent shadow-md'
                      : 'text-[#4E6159] hover:border-[#0F3A2B] hover:text-[#0F3A2B]'
                  }`}
                  style={selectedCategory === category.key
                    ? { backgroundColor: FILTER_BAR_ACTIVE_COLOR }
                    : { backgroundColor: FILTER_BAR_INACTIVE_BG, borderColor: FILTER_BAR_INACTIVE_BORDER }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 lg:ml-auto">
              {sortButtons.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortOption(key)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    sortOption === key
                      ? 'text-white border-transparent shadow-md'
                      : 'text-[#4E6159] hover:border-[#0F3A2B] hover:text-[#0F3A2B]'
                  }`}
                  style={sortOption === key
                    ? { backgroundColor: FILTER_BAR_ACTIVE_COLOR }
                    : { backgroundColor: FILTER_BAR_INACTIVE_BG, borderColor: FILTER_BAR_INACTIVE_BORDER }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#0F3A2B', borderTopColor: 'transparent' }}
              />
              <p className="text-base font-medium" style={{ color: '#0F3A2B' }}>
                جاري تحميل المنتجات...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-center py-24">
            <p className="text-base font-medium text-red-500">
              حدث خطأ أثناء تحميل المنتجات
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sortedFilteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: '#FBF7EF' }}
            >
              📦
            </div>
            <p className="text-base font-medium text-gray-500">
              {selectedCategory === 'all'
                ? 'لا توجد منتجات حالياً'
                : `لا توجد منتجات ضمن ${selectedCategoryLabel} حالياً`}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && sortedFilteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sortedFilteredProducts.map((product) => {
              const categoryName = getCategoryName(product.category_id);
              const isAdded = addedProducts.has(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  style={{ border: '1px solid #EDE9E1' }}
                  onClick={() => handleProductClick(product)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1', backgroundColor: '#FBF7EF' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}
                    {/* Category badge */}
                    {categoryName && (
                      <span
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: '#0F3A2B', color: '#F8F7F2' }}
                      >
                        {categoryName}
                      </span>
                    )}
                    {/* Out of stock badge */}
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          نفذت الكمية
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="p-4 flex flex-col flex-1"
                    style={{ backgroundColor: '#0F3A2B' }}
                  >
                    <h3
                      className="text-sm font-bold mb-1 leading-snug line-clamp-2"
                      style={{ color: '#F8F7F2' }}
                    >
                      {product.name}
                    </h3>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span
                        className="text-lg font-bold"
                        style={{ color: '#F8F7F2' }}
                      >
                        {product.price} <span className="text-xs font-medium">ر.ع</span>
                      </span>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.quantity === 0}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: isAdded ? '#F8F7F2' : 'transparent',
                          color: isAdded ? '#0F3A2B' : '#F8F7F2',
                          border: '1px solid #F8F7F2',
                        }}
                      >
                        {isAdded ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
