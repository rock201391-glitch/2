import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Package, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useProducts } from '../contexts/ProductsContext';
import AddProduct from './AddProduct';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { products, deleteProduct } = useProducts();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const stats = [
    {
      icon: Package,
      label: language === 'ar' ? 'إجمالي المنتجات' : 'Total Products',
      value: products.length,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: DollarSign,
      label: language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales',
      value: '$45,230',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: ShoppingCart,
      label: language === 'ar' ? 'الطلبات' : 'Orders',
      value: '124',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Users,
      label: language === 'ar' ? 'العملاء' : 'Customers',
      value: '456',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const handleDelete = (id: number) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  if (showAddProduct) {
    return (
      <AddProduct
        onClose={() => {
          setShowAddProduct(false);
          setEditingProduct(null);
        }}
        editProduct={editingProduct}
      />
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'إدارة المنتجات والطلبات' : 'Manage products and orders'}
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold"
          >
            <Plus className="w-5 h-5" />
            {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-black/10 dark:border-white/10">
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'الصورة' : 'Image'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'سعر القطاعي' : 'Retail Price'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'سعر الجملة' : 'Wholesale Price'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'المخزون' : 'Stock'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={product.image}
                        alt={language === 'ar' ? product.nameAr : product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {language === 'ar' ? product.nameAr : product.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs">
                        {language === 'ar' ? product.categoryAr : product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">${product.retailPrice}</td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      ${product.wholesalePrice}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        (product.stock || 0) > 30
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : (product.stock || 0) > 10
                          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                          : 'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-full hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-full hover:bg-red-500/10 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
