import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductsContext';

interface AddProductProps {
  onClose: () => void;
  editProduct?: any;
}

export default function AddProduct({ onClose, editProduct }: AddProductProps) {
  const { language } = useLanguage();
  const { addProduct, updateProduct } = useProducts();
  const [imagePreview, setImagePreview] = useState<string>(editProduct?.image || '');
  const [formData, setFormData] = useState({
    name: editProduct?.name || '',
    nameAr: editProduct?.nameAr || '',
    category: editProduct?.category || 'Classic',
    categoryAr: editProduct?.categoryAr || 'كلاسيكي',
    retailPrice: editProduct?.retailPrice || '',
    wholesalePrice: editProduct?.wholesalePrice || '',
    stock: editProduct?.stock || '',
    description: editProduct?.description || '',
    descriptionAr: editProduct?.descriptionAr || '',
  });

  const categories = [
    { en: 'Classic', ar: 'كلاسيكي' },
    { en: 'Modern', ar: 'عصري' },
    { en: 'Elegant', ar: 'أنيق' },
    { en: 'Casual', ar: 'يومي' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      nameAr: formData.nameAr,
      category: formData.category,
      categoryAr: formData.categoryAr,
      retailPrice: Number(formData.retailPrice),
      wholesalePrice: Number(formData.wholesalePrice),
      stock: Number(formData.stock),
      description: formData.description,
      descriptionAr: formData.descriptionAr,
      image: imagePreview || 'https://images.unsplash.com/photo-1583391265574-e7af45a9f9c6?w=800&q=80',
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onClose}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
        </motion.button>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
        >
          <h1 className="text-3xl font-bold mb-8">
            {editProduct
              ? language === 'ar'
                ? 'تعديل المنتج'
                : 'Edit Product'
              : language === 'ar'
              ? 'إضافة منتج جديد'
              : 'Add New Product'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                {language === 'ar' ? 'صورة المنتج' : 'Product Image'}
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative aspect-[3/4] max-w-xs rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-[3/4] border-2 border-dashed border-black/20 dark:border-white/20 rounded-2xl cursor-pointer hover:border-black dark:hover:border-white transition-colors">
                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'ar' ? 'انقر لرفع الصورة' : 'Click to upload image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selected = categories.find(c => c.en === e.target.value);
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    categoryAr: selected?.ar || '',
                  });
                }}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {language === 'ar' ? cat.ar : cat.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Prices and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'سعر القطاعي' : 'Retail Price'}
                </label>
                <input
                  type="number"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}
                </label>
                <input
                  type="number"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'المخزون' : 'Stock'}
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 focus:border-black dark:focus:border-white outline-none transition-colors resize-none"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold"
              >
                {editProduct
                  ? language === 'ar'
                    ? 'حفظ التعديلات'
                    : 'Save Changes'
                  : language === 'ar'
                  ? 'إضافة المنتج'
                  : 'Add Product'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-8 py-4 rounded-full border-2 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
