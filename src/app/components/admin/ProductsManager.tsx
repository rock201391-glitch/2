import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { slugify } from "../../../utils/slugify";
import type { Category } from "./CategoriesManager";

interface Product {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;

  // السعر القديم المستخدم في المتجر
  price: number;

  // الأسعار الجديدة
  purchase_price: number | null;
  selling_price: number | null;

  image_url: string | null;
  quantity: number;
  category_id: number | null;
  colors: string[];
  is_active: boolean;
  is_pinned: boolean;
  pinned_order: number;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  purchase_price: string;
  selling_price: string;
  image_url: string;
  quantity: string;
  category_id: string;
  colors: string;
  is_active: boolean;
  is_pinned: boolean;
  pinned_order: string;
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  purchase_price: "0",
  selling_price: "0",
  image_url: "",
  quantity: "0",
  category_id: "",
  colors: "",
  is_active: true,
  is_pinned: false,
  pinned_order: "0",
};

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error) {
      setError(productsRes.error.message);
    } else {
      setProducts(productsRes.data || []);
    }

    if (!categoriesRes.error) {
      setCategories(categoriesRes.data || []);
    }

    setLoading(false);
  }

  function getPurchasePrice(product: Product) {
    return Number(product.purchase_price || 0);
  }

  function getSellingPrice(product: Product) {
    return Number(product.selling_price ?? product.price ?? 0);
  }

  function getProductProfit(product: Product) {
    return getSellingPrice(product) - getPurchasePrice(product);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setUploadSuccess(false);
    setUploadError(null);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      slug: product.slug || "",
      description: product.description || "",

      purchase_price: String(product.purchase_price || 0),

      // لو المنتج قديم وما عنده selling_price
      // نستخدم price القديم تلقائياً
      selling_price: String(product.selling_price ?? product.price ?? 0),

      image_url: product.image_url || "",
      quantity: String(product.quantity || 0),

      category_id:
        product.category_id !== null
          ? String(product.category_id)
          : "",

      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",

      is_active: product.is_active,
      is_pinned: product.is_pinned || false,
      pinned_order: String(product.pinned_order || 0),
    });

    setUploadSuccess(false);
    setUploadError(null);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setUploadSuccess(false);
    setUploadError(null);
    setError(null);
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "نوع الملف غير مدعوم. المسموح: JPG وPNG وWEBP"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        "حجم الصورة أكبر من 5 ميجابايت"
      );
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      const extMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extMap[file.type] || "jpg";

      const fileName =
        `${Date.now()}-` +
        `${Math.random().toString(36).slice(2)}.` +
        extension;

      const filePath = `products/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          upsert: false,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setForm((current) => ({
        ...current,
        image_url: publicUrlData.publicUrl,
      }));

      setUploadSuccess(true);
    } catch (err: any) {
      setUploadError(
        err?.message || "فشل رفع الصورة"
      );
    } finally {
      setUploading(false);
    }
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug || slugify(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const purchasePrice =
        parseFloat(form.purchase_price) || 0;

      const sellingPrice =
        parseFloat(form.selling_price) || 0;

      if (purchasePrice < 0 || sellingPrice < 0) {
        throw new Error(
          "سعر الشراء وسعر البيع لا يمكن أن يكونا أقل من صفر"
        );
      }

      const colorsArray = form.colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        description:
          form.description.trim() || null,

        purchase_price: purchasePrice,
        selling_price: sellingPrice,

        // مهم:
        // نخلي price مساوي لسعر البيع
        // حتى يستمر المتجر الحالي بالعمل
        price: sellingPrice,

        image_url:
          form.image_url.trim() || null,

        quantity:
          parseInt(form.quantity, 10) || 0,

        category_id: form.category_id
          ? parseInt(form.category_id, 10)
          : null,

        colors: colorsArray,
        is_active: form.is_active,
        is_pinned: form.is_pinned,

        pinned_order:
          parseInt(form.pinned_order, 10) || 0,
      };

      let databaseError = null;

      if (editingId !== null) {
        const result = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);

        databaseError = result.error;
      } else {
        const result = await supabase
          .from("products")
          .insert(payload);

        databaseError = result.error;
      }

      if (databaseError) {
        throw databaseError;
      }

      await fetchAll();
      closeForm();
    } catch (err: any) {
      setError(
        err?.message || "حدث خطأ أثناء حفظ المنتج"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    }

    setDeleting(false);
    setConfirmDeleteId(null);
  }

  const getCategoryName = (
    categoryId: number | null
  ) => {
    if (!categoryId) return "—";

    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category
      ? category.name
      : String(categoryId);
  };

  return (
    <div dir="rtl">
      {/* رأس الصفحة */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">
            المنتجات
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            إدارة الأسعار والمخزون والأرباح
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-full bg-[#0F3A2B] px-5 py-2.5 text-sm font-bold text-white shadow transition-all hover:opacity-90"
        >
          + إضافة منتج
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center text-lg font-medium shadow-md">
          جاري تحميل المنتجات...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center text-lg font-medium shadow-md">
          لا توجد منتجات حالياً
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#D8D2C5] bg-white shadow-xl">
          <table className="min-w-[1200px] w-full border-collapse text-right">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-4 text-sm font-bold">
                  ID
                </th>

                <th className="p-4 text-sm font-bold">
                  الصورة
                </th>

                <th className="p-4 text-sm font-bold">
                  الاسم
                </th>

                <th className="p-4 text-sm font-bold">
                  سعر الشراء
                </th>

                <th className="p-4 text-sm font-bold">
                  سعر البيع
                </th>

                <th className="p-4 text-sm font-bold">
                  ربح القطعة
                </th>

                <th className="p-4 text-sm font-bold">
                  المخزون
                </th>

                <th className="p-4 text-sm font-bold">
                  التصنيف
                </th>

                <th className="p-4 text-sm font-bold">
                  التثبيت
                </th>

                <th className="p-4 text-sm font-bold">
                  الحالة
                </th>

                <th className="p-4 text-sm font-bold">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const purchasePrice =
                  getPurchasePrice(product);

                const sellingPrice =
                  getSellingPrice(product);

                const profit =
                  getProductProfit(product);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#E8E3D9] transition-colors hover:bg-[#F8F7F2]/70"
                  >
                    <td className="p-4 text-sm font-bold">
                      {product.id}
                    </td>

                    <td className="p-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl border border-[#D8D2C5] object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold">
                      {product.name}
                    </td>

                    <td className="p-4 font-bold text-gray-600">
                      {purchasePrice.toFixed(3)} ر.ع
                    </td>

                    <td className="p-4 font-black text-[#0F3A2B]">
                      {sellingPrice.toFixed(3)} ر.ع
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          profit >= 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {profit.toFixed(3)} ر.ع
                      </span>
                    </td>

                    <td className="p-4 font-bold">
                      {product.quantity}
                    </td>

                    <td className="p-4 text-sm">
                      {getCategoryName(
                        product.category_id
                      )}
                    </td>

                    <td className="p-4 text-sm font-bold text-[#0F3A2B]">
                      {product.is_pinned
                        ? "📌 مثبت"
                        : "—"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          product.is_active
                            ? "border-[#cbe2d5] bg-[#EAF3EE] text-[#0F3A2B]"
                            : "border-gray-200 bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.is_active
                          ? "نشط"
                          : "مخفي"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(product)
                          }
                          className="rounded-full bg-[#0F3A2B] px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:opacity-90"
                        >
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteId(
                              product.id
                            )
                          }
                          className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:opacity-90"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* نموذج إضافة أو تعديل المنتج */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#D8D2C5] bg-white p-6 text-[#0F3A2B] shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={closeForm}
              className="absolute left-6 top-5 text-3xl font-light transition-opacity hover:opacity-60"
            >
              ×
            </button>

            <h3 className="mb-7 text-right text-2xl font-black">
              {editingId !== null
                ? "تعديل المنتج"
                : "إضافة منتج جديد"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 text-right"
            >
              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  اسم المنتج *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  required
                  placeholder="اسم المنتج"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  الرابط المختصر
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      slug: e.target.value,
                    }))
                  }
                  dir="ltr"
                  placeholder="product-slug"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-left font-mono text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />
              </div>

              {/* سعر الشراء وسعر البيع */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    سعر الشراء (ر.ع) *
                  </label>

                  <input
                    type="number"
                    value={form.purchase_price}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        purchase_price:
                          e.target.value,
                      }))
                    }
                    required
                    min="0"
                    step="0.001"
                    className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold">
                    سعر البيع (ر.ع) *
                  </label>

                  <input
                    type="number"
                    value={form.selling_price}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        selling_price:
                          e.target.value,
                      }))
                    }
                    required
                    min="0"
                    step="0.001"
                    className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                  />
                </div>
              </div>

              {/* عرض الربح أثناء الكتابة */}
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-green-800">
                    ربح القطعة المتوقع
                  </span>

                  <span className="text-xl font-black text-green-800">
                    {(
                      (parseFloat(
                        form.selling_price
                      ) || 0) -
                      (parseFloat(
                        form.purchase_price
                      ) || 0)
                    ).toFixed(3)}{" "}
                    ر.ع
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  الكمية *
                </label>

                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      quantity: e.target.value,
                    }))
                  }
                  required
                  min="0"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  الوصف
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="وصف المنتج..."
                  className="w-full resize-none rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  صورة المنتج
                </label>

                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="معاينة المنتج"
                    className="mb-3 h-28 w-28 rounded-2xl border border-[#D8D2C5] object-cover"
                  />
                )}

                <label className="inline-block cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />

                  <span className="inline-block cursor-pointer select-none rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-5 py-3 text-sm font-bold text-[#0F3A2B] transition-all hover:bg-[#EAF3EE]">
                    {uploading
                      ? "جاري رفع الصورة..."
                      : form.image_url
                      ? "تغيير الصورة"
                      : "اختر صورة"}
                  </span>
                </label>

                {uploadSuccess && (
                  <p className="mt-2 text-xs font-semibold text-green-700">
                    تم رفع الصورة بنجاح
                  </p>
                )}

                {uploadError && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {uploadError}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  التصنيف
                </label>

                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      category_id:
                        e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                >
                  <option value="">
                    — بدون تصنيف —
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  الألوان
                </label>

                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      colors: e.target.value,
                    }))
                  }
                  placeholder="أحمر, أزرق, أخضر"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />

                <p className="mt-1 text-xs text-gray-400">
                  افصل بين الألوان بفاصلة
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#F8F7F2] p-4">
                <input
                  type="checkbox"
                  id="prod-is-active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      is_active:
                        e.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[#0F3A2B]"
                />

                <label
                  htmlFor="prod-is-active"
                  className="text-sm font-bold"
                >
                  المنتج نشط وظاهر في المتجر
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#F8F7F2] p-4">
                <input
                  type="checkbox"
                  id="prod-is-pinned"
                  checked={form.is_pinned}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      is_pinned:
                        e.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-[#0F3A2B]"
                />

                <label
                  htmlFor="prod-is-pinned"
                  className="text-sm font-bold"
                >
                  تثبيت المنتج في الأعلى
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold">
                  ترتيب التثبيت
                </label>

                <input
                  type="number"
                  value={form.pinned_order}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      pinned_order:
                        e.target.value,
                    }))
                  }
                  min="0"
                  placeholder="0"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 text-[#0F3A2B] outline-none transition-all focus:border-[#0F3A2B]"
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 border-t border-[#E8E3D9] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-[#0F3A2B] py-3 font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : "حفظ المنتج"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-2xl border border-[#D8D2C5] py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-[#D8D2C5] bg-white p-8 text-right text-[#0F3A2B] shadow-2xl">
            <h3 className="mb-3 text-xl font-bold">
              تأكيد حذف المنتج
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              هل أنت متأكد من حذف هذا المنتج؟ لا
              يمكن التراجع عن هذه العملية.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDelete(confirmDeleteId)
                }
                disabled={deleting}
                className="flex-1 rounded-2xl bg-red-600 py-3 font-bold text-white shadow transition-all hover:opacity-90 disabled:opacity-60"
              >
                {deleting
                  ? "جاري الحذف..."
                  : "حذف"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfirmDeleteId(null)
                }
                className="flex-1 rounded-2xl border border-[#D8D2C5] py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
