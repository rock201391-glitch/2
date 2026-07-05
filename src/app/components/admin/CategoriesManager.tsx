import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { slugify } from "../../../utils/slugify";

export interface Category {
  id: number;
  name: string;
  slug: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm: CategoryFormData = {
  name: "",
  slug: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);

  // delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (err) setError(err.message);
    else setCategories(data || []);
    setLoading(false);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug || "",
      image_url: cat.image_url || "",
      sort_order: cat.sort_order,
      is_active: cat.is_active,
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

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || null,
      image_url: form.image_url.trim() || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };

    let err;
    if (editingId !== null) {
      ({ error: err } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingId));
    } else {
      ({ error: err } = await supabase.from("categories").insert(payload));
    }

    if (err) {
      setError(err.message);
    } else {
      await fetchCategories();
      closeForm();
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    setError(null);
    const { error: err } = await supabase.from("categories").delete().eq("id", id);
    if (err) setError(err.message);
    else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleting(false);
    setConfirmDeleteId(null);
  }

  return (
    <div>
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between flex-row-reverse">
        <h2 className="text-2xl font-bold">الأقسام</h2>
        <button
          onClick={openCreateForm}
          className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white font-semibold shadow hover:opacity-90 transition-all text-sm"
        >
          + إضافة قسم
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
      ) : categories.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-md border border-[#D8D2C5] text-lg font-medium">
          لا توجد أقسام بعد. أضف قسماً أولاً.
        </div>
      ) : (
        <div className="rounded-3xl bg-white shadow-xl border border-[#D8D2C5] overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-4 font-bold text-sm">ID</th>
                <th className="p-4 font-bold text-sm">الاسم</th>
                <th className="p-4 font-bold text-sm">الصورة</th>
                <th className="p-4 font-bold text-sm">الترتيب</th>
                <th className="p-4 font-bold text-sm">الحالة</th>
                <th className="p-4 font-bold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#E8E3D9] hover:bg-[#F8F7F2]/60 transition-colors">
                  <td className="p-4 font-bold text-sm">{cat.id}</td>
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-10 h-10 object-cover rounded-lg border border-[#D8D2C5]"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">{cat.sort_order}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                        cat.is_active
                          ? "bg-[#EAF3EE] text-[#0F3A2B] border-[#cbe2d5]"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {cat.is_active ? "نشط" : "مخفي"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEditForm(cat)}
                        className="rounded-full bg-[#0F3A2B] px-4 py-1.5 text-white text-xs font-semibold hover:opacity-90 shadow transition-all"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
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
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full text-[#0F3A2B] shadow-2xl relative border border-[#D8D2C5]">
            <button
              onClick={closeForm}
              className="absolute top-6 left-6 text-2xl font-light hover:opacity-60 transition-opacity"
            >
              ×
            </button>

            <h3 className="text-xl font-bold text-right mb-6">
              {editingId !== null ? "تعديل القسم" : "إضافة قسم جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
              <div>
                <label className="block text-sm font-semibold mb-1">اسم القسم *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                  placeholder="مثال: عطور رجالية"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">الرابط المختصر (slug)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  dir="ltr"
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm font-mono text-left"
                  placeholder="men-perfumes"
                />
              </div>

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

              <div>
                <label className="block text-sm font-semibold mb-1">الترتيب</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  min={0}
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cat-is-active"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0F3A2B]"
                />
                <label htmlFor="cat-is-active" className="text-sm font-semibold">
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
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-[#0F3A2B] shadow-2xl border border-[#D8D2C5] text-right" dir="rtl">
            <h3 className="text-xl font-bold mb-3">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا القسم؟ سيتم إلغاء ربط المنتجات المرتبطة به تلقائياً ولن تُحذف.
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
