import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface ShippingMethod {
  id: number;
  key: string;
  label: string;
  price: number;
  duration: string | null;
  sort_order: number;
  is_active: boolean;
}

interface FormData {
  key: string;
  label: string;
  price: string;
  duration: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: FormData = {
  key: "",
  label: "",
  price: "0",
  duration: "",
  sort_order: "0",
  is_active: true,
};

export default function ShippingManager() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchMethods(); }, []);

  async function fetchMethods() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("shipping_methods")
      .select("*")
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setMethods(data || []);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(m: ShippingMethod) {
    setForm({
      key: m.key,
      label: m.label,
      price: String(m.price),
      duration: m.duration ?? "",
      sort_order: String(m.sort_order),
      is_active: m.is_active,
    });
    setEditingId(m.id);
    setShowForm(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.key.trim() || !form.label.trim()) { setError("المفتاح والاسم مطلوبان"); return; }
    setSaving(true);
    setError(null);

    const payload = {
      key: form.key.trim().toLowerCase(),
      label: form.label.trim(),
      price: parseFloat(form.price) || 0,
      duration: form.duration.trim() || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("shipping_methods")
        .update(payload)
        .eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from("shipping_methods")
        .insert([payload]);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
    fetchMethods();
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const { error: err } = await supabase.from("shipping_methods").delete().eq("id", id);
    if (err) setError(err.message);
    else setMethods(prev => prev.filter(m => m.id !== id));
    setConfirmDeleteId(null);
    setDeleting(false);
  }

  async function toggleActive(m: ShippingMethod) {
    const { error: err } = await supabase
      .from("shipping_methods")
      .update({ is_active: !m.is_active })
      .eq("id", m.id);
    if (!err) setMethods(prev => prev.map(x => x.id === m.id ? { ...x, is_active: !m.is_active } : x));
    else setError(err.message);
  }

  const inputClass = "w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all";
  const labelClass = "block text-sm font-semibold mb-1 text-[#0F3A2B]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0F3A2B]">طرق الشحن</h2>
        <button
          onClick={openNew}
          className="rounded-2xl bg-[#0F3A2B] text-white px-5 py-2 font-semibold hover:opacity-90 transition-all"
        >
          + إضافة طريقة شحن
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-[#0F3A2B]">
            {editingId ? "تعديل طريقة شحن" : "إضافة طريقة شحن جديدة"}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>مفتاح الطريقة * <span className="text-xs text-gray-400">(مثال: home)</span></label>
              <input name="key" value={form.key} onChange={handleChange} className={inputClass} placeholder="home" required disabled={!!editingId} />
            </div>

            <div>
              <label className={labelClass}>اسم الطريقة *</label>
              <input name="label" value={form.label} onChange={handleChange} className={inputClass} placeholder="توصيل للمنزل" required />
            </div>

            <div>
              <label className={labelClass}>سعر الشحن (ر.ع)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className={inputClass} min="0" step="0.01" />
            </div>

            <div>
              <label className={labelClass}>مدة التوصيل</label>
              <input name="duration" value={form.duration} onChange={handleChange} className={inputClass} placeholder="2-4 أيام عمل" />
            </div>

            <div>
              <label className={labelClass}>ترتيب العرض</label>
              <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} className={inputClass} min="0" step="1" />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" name="is_active" id="sm_is_active" checked={form.is_active} onChange={handleChange} className="w-5 h-5 accent-[#0F3A2B]" />
              <label htmlFor="sm_is_active" className="font-semibold text-[#0F3A2B]">تفعيل طريقة الشحن</label>
            </div>

            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving} className="rounded-2xl bg-[#0F3A2B] text-white px-6 py-2.5 font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-2xl border border-[#D8D2C5] px-6 py-2.5 font-semibold text-[#0F3A2B] hover:bg-[#F8F7F2] transition-all">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center py-10 text-[#0F3A2B] opacity-60">جاري التحميل...</p>
      ) : methods.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-10 text-center text-[#0F3A2B] opacity-60">
          لا توجد طرق شحن بعد
        </div>
      ) : (
        <div className="grid gap-4">
          {methods.map(m => (
            <div key={m.id} className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-[#0F3A2B] text-lg">{m.label}</span>
                  <span className="font-mono text-xs bg-[#F0EDE6] px-2 py-0.5 rounded-lg text-[#5D6D66]">{m.key}</span>
                  <button
                    onClick={() => toggleActive(m)}
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${m.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {m.is_active ? "مفعّل" : "موقوف"}
                  </button>
                </div>
                <div className="flex gap-6 mt-2 text-sm text-[#5D6D66]">
                  <span>السعر: <b className="text-[#0F3A2B]">{m.price} ر.ع</b></span>
                  {m.duration && <span>المدة: <b className="text-[#0F3A2B]">{m.duration}</b></span>}
                  <span>الترتيب: {m.sort_order}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="rounded-xl bg-[#EAF3EE] text-[#0F3A2B] px-4 py-1.5 text-sm font-semibold hover:bg-[#D4E8DC] transition">تعديل</button>
                {confirmDeleteId === m.id ? (
                  <>
                    <button onClick={() => handleDelete(m.id)} disabled={deleting} className="rounded-xl bg-red-500 text-white px-4 py-1.5 text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition">
                      {deleting ? "..." : "تأكيد"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded-xl bg-gray-200 text-gray-600 px-4 py-1.5 text-sm font-semibold transition">إلغاء</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDeleteId(m.id)} className="rounded-xl bg-red-50 text-red-600 px-4 py-1.5 text-sm font-semibold hover:bg-red-100 transition">حذف</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
