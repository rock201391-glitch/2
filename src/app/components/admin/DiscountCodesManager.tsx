import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface DiscountCode {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order: string;
  max_uses: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const emptyForm: FormData = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  min_order: "",
  max_uses: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

export default function DiscountCodesManager() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCodes(); }, []);

  async function fetchCodes() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setCodes(data || []);
    setLoading(false);
  }

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(c: DiscountCode) {
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order: c.min_order != null ? String(c.min_order) : "",
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
      is_active: c.is_active,
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { setError("الكود مطلوب"); return; }
    setSaving(true);
    setError(null);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order: form.min_order ? parseFloat(form.min_order) : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("discount_codes")
        .update(payload)
        .eq("id", editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from("discount_codes")
        .insert([payload]);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
    fetchCodes();
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const { error: err } = await supabase.from("discount_codes").delete().eq("id", id);
    if (err) setError(err.message);
    else setCodes(prev => prev.filter(c => c.id !== id));
    setConfirmDeleteId(null);
    setDeleting(false);
  }

  async function toggleActive(c: DiscountCode) {
    const { error: err } = await supabase
      .from("discount_codes")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (!err) setCodes(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
    else setError(err.message);
  }

  const inputClass = "w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all";
  const labelClass = "block text-sm font-semibold mb-1 text-[#0F3A2B]";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0F3A2B]">كوبونات الخصم</h2>
        <button
          onClick={openNew}
          className="rounded-2xl bg-[#0F3A2B] text-white px-5 py-2 font-semibold hover:opacity-90 transition-all"
        >
          + إضافة كوبون
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-5 text-[#0F3A2B]">
            {editingId ? "تعديل كوبون" : "إضافة كوبون جديد"}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>كود الخصم *</label>
              <input name="code" value={form.code} onChange={handleChange} className={inputClass} placeholder="مثال: SAVE20" required />
            </div>

            <div>
              <label className={labelClass}>نوع الخصم *</label>
              <select name="discount_type" value={form.discount_type} onChange={handleChange} className={inputClass}>
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ر.ع)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>قيمة الخصم *</label>
              <input type="number" name="discount_value" value={form.discount_value} onChange={handleChange} className={inputClass} min="0" step="0.01" required placeholder={form.discount_type === "percentage" ? "مثال: 10" : "مثال: 2.5"} />
            </div>

            <div>
              <label className={labelClass}>الحد الأدنى للطلب (اختياري)</label>
              <input type="number" name="min_order" value={form.min_order} onChange={handleChange} className={inputClass} min="0" step="0.01" placeholder="0.00" />
            </div>

            <div>
              <label className={labelClass}>عدد مرات الاستخدام (اختياري)</label>
              <input type="number" name="max_uses" value={form.max_uses} onChange={handleChange} className={inputClass} min="1" step="1" placeholder="غير محدود" />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleChange} className="w-5 h-5 accent-[#0F3A2B]" />
              <label htmlFor="is_active" className="font-semibold text-[#0F3A2B]">تفعيل الكوبون</label>
            </div>

            <div>
              <label className={labelClass}>تاريخ البداية (اختياري)</label>
              <input type="datetime-local" name="starts_at" value={form.starts_at} onChange={handleChange} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>تاريخ الانتهاء (اختياري)</label>
              <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleChange} className={inputClass} />
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

      {/* Table */}
      {loading ? (
        <p className="text-center py-10 text-[#0F3A2B] opacity-60">جاري التحميل...</p>
      ) : codes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-10 text-center text-[#0F3A2B] opacity-60">
          لا توجد كوبونات بعد
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] overflow-hidden shadow-sm">
          <table className="w-full text-sm text-[#0F3A2B]">
            <thead className="bg-[#F0EDE6] text-xs font-bold uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-right">الكود</th>
                <th className="px-4 py-3 text-right">النوع</th>
                <th className="px-4 py-3 text-right">القيمة</th>
                <th className="px-4 py-3 text-right">الاستخدام</th>
                <th className="px-4 py-3 text-right">الانتهاء</th>
                <th className="px-4 py-3 text-center">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAF7]"}>
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type === "percentage" ? "نسبة %" : "مبلغ ثابت"}</td>
                  <td className="px-4 py-3 font-semibold">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `${c.discount_value} ر.ع`}
                  </td>
                  <td className="px-4 py-3">
                    {c.used_count}/{c.max_uses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-EG") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {c.is_active ? "مفعّل" : "موقوف"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-xl bg-[#EAF3EE] text-[#0F3A2B] px-3 py-1 text-xs font-semibold hover:bg-[#D4E8DC] transition">تعديل</button>
                      {confirmDeleteId === c.id ? (
                        <>
                          <button onClick={() => handleDelete(c.id)} disabled={deleting} className="rounded-xl bg-red-500 text-white px-3 py-1 text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60">
                            {deleting ? "..." : "تأكيد"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="rounded-xl bg-gray-200 text-gray-600 px-3 py-1 text-xs font-semibold transition">إلغاء</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(c.id)} className="rounded-xl bg-red-50 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-100 transition">حذف</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
