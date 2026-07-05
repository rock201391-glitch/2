import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Category } from "./CategoriesManager";

interface Product {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  category_id: number | null;
  colors: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  quantity: string;
  category_id: string;
  colors: string; // comma-separated in UI
  is_active: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "0",
  image_url: "",
  quantity: "0",
  category_id: "",
  colors: "",
  is_active: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  // delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error) setError(productsRes.error.message);
    else setProducts(productsRes.data || []);

    if (!categoriesRes.error) setCategories(categoriesRes.data || []);

    setLoading(false);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug || "",
      description: product.description || "",
      price: String(product.price),
      image_url: product.image_url || "",
      quantity: String(product.quantity),
      category_id: product.category_id !== null ? String(product.category_id) : "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      is_active: product.is_active,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: f.slug || slugify(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const colorsArray = form.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || null,
      description: form.description.trim() || null,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url.trim() || null,
      quantity: parseInt(form.quantity) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      colors: colorsArray,
      is_active: form.is_active,
    };

    let err;
    if (editingId !== null) {
      ({ error: err } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error: err } = await supabase.from("products").insert(payload));
    }

    if (err) {
      setError(err.message);
    } else {
      await fetchAll();
      closeForm();
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase.from("products").delete().eq("id", id);
    if (err) setError(err.message);
    else setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(false);
    setConfirmDeleteId(null);
  }

  const getCategoryName = (catId: number | null) => {
    if (!catId) return "-";
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : String(catId);
  };

  return (
    <div>
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between flex-row-reverse">
        <h2 className="text-2xl font-bold">المنتجات</h2>
        <button
          onClick={openCreateForm}
          className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white font-semibold shadow hover:opacity-90 transition-all text-sm"
        >
          + إضافة منتج
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm text-right">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md border border-[#D8D2C5] text-lg font-medium">
          جاري التحميل...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md border border-[#D8D2C5] text-lg font-medium">
          لا توجد منتجات بعد. أضف منتجاً أولاً.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-xl border border-[#D8D2C5]">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-4 font-bold text-sm">ID</th>
                <th className="p-4 font-bold text-sm">الصورة</th>
                <th className="p-4 font-bold text-sm">الاسم</th>
                <th className="p-4 font-bold text-sm">السعر</th>
                <th className="p-4 font-bold text-sm">الكمية</th>
                <th className="p-4 font-bold text-sm">التصنيف</th>
                <th className="p-4 font-bold text-sm">الحالة</th>
                <th className="p-4 font-bold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#E8E3D9] hover:bg-[#F8F7F2]/60 transition-colors"
                >
                  <td className="p-4 font-bold text-sm">{product.id}</td>
                  <td className="p-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-[#D8D2C5]"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 font-bold text-[#0F3A2B]">{product.price} ر.ع</td>
                  <td className="p-4 text-sm">{product.quantity}</td>
                  <td className="p-4 text-sm">{getCategoryName(product.category_id)}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                        product.is_active
                          ? "bg-[#EAF3EE] text-[#0F3A2B] border-[#cbe2d5]"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {product.is_active ? "نشط" : "مخفي"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditForm(product)}
                        className="rounded-full bg-[#0F3A2B] px-4 py-1.5 text-white text-xs font-semibold hover:opacity-90 shadow transition-all"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(product.id)}
                        className="rounded-full bg-red-600 px-4 py-1.5 text-white text-xs font-semibold hover:opacity-90 shadow transition-all"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نموذج الإضافة / التعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-xl w-full text-[#0F3A2B] shadow-2xl relative border border-[#D8D2C5] max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeForm}
              className="absolute top-6 left-6 text-2xl font-light hover:opacity-60 transition-opacity"
            >
              ×
            </button>

            <h3 className="text-xl font-bold text-right mb-6">
              {editingId !== null ? "تعديل المنتج" : "إضافة منتج جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
              {/* الاسم */}
              <div>
                <label className="block text-sm font-semibold mb-1">الاسم *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                  placeholder="اسم المنتج"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold mb-1">الرابط المختصر (slug)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  dir="ltr"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm font-mono text-left"
                  placeholder="product-slug"
                />
              </div>

              {/* السعر والكمية */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">السعر (ر.ع) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">الكمية *</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    required
                    min="0"
                    className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                  />
                </div>
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-semibold mb-1">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm resize-none"
                  placeholder="وصف المنتج..."
                />
              </div>

              {/* رابط الصورة */}
              <div>
                <label className="block text-sm font-semibold mb-1">رابط الصورة</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  dir="ltr"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm font-mono text-left"
                  placeholder="https://..."
                />
              </div>

              {/* التصنيف */}
              <div>
                <label className="block text-sm font-semibold mb-1">التصنيف</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                >
                  <option value="">— بدون تصنيف —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* الألوان */}
              <div>
                <label className="block text-sm font-semibold mb-1">الألوان (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                  placeholder="أحمر, أزرق, أخضر"
                  dir="rtl"
                />
                <p className="text-xs text-gray-400 mt-1">أدخل الألوان مفصولة بفاصلة</p>
              </div>

              {/* الحالة */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod-is-active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0F3A2B]"
                />
                <label htmlFor="prod-is-active" className="text-sm font-semibold">
                  نشط (ظاهر في المتجر)
                </label>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-xl border border-red-100 px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-[#0F3A2B] py-2.5 text-white font-bold hover:opacity-90 shadow transition-all disabled:opacity-60"
                >
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-2xl border border-[#D8D2C5] py-2.5 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* تأكيد الحذف */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-[#0F3A2B] shadow-2xl border border-[#D8D2C5] text-right"
            dir="rtl"
          >
            <h3 className="text-xl font-bold mb-3">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذه العملية.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 text-white font-bold hover:opacity-90 shadow transition-all disabled:opacity-60"
              >
                {deleting ? "جاري الحذف..." : "حذف"}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-2xl border border-[#D8D2C5] py-2.5 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
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
