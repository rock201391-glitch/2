import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const BANK_KEYS = [
  { key: "bank_account_name",         label: "اسم الحساب" },
  { key: "bank_account_number",       label: "رقم الحساب" },
  { key: "bank_transfer_number",      label: "رقم التحويل" },
  { key: "bank_payment_instructions", label: "تعليمات الدفع" },
];

export default function SettingsManager() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", BANK_KEYS.map(k => k.key));
    if (err) { setError(err.message); setLoading(false); return; }
    const map: Record<string, string> = {};
    (data || []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value ?? ""; });
    setValues(map);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const upserts = BANK_KEYS.map(({ key }) => ({
      key,
      value: values[key] ?? "",
    }));

    const { error: err } = await supabase
      .from("site_settings")
      .upsert(upserts, { onConflict: "key" });

    if (err) { setError(err.message); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  const inputClass = "w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all";
  const labelClass = "block text-sm font-semibold mb-1 text-[#0F3A2B]";

  if (loading) return <p className="text-center py-10 text-[#0F3A2B] opacity-60">جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0F3A2B]">إعدادات الموقع</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">
          ✓ تم الحفظ بنجاح
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-[#0F3A2B] border-b border-[#E8E3D9] pb-3">
          معلومات التحويل البنكي
        </h3>

        {BANK_KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            {key === "bank_payment_instructions" ? (
              <textarea
                value={values[key] ?? ""}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder={label}
              />
            ) : (
              <input
                type="text"
                value={values[key] ?? ""}
                onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                className={inputClass}
                placeholder={label}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[#0F3A2B] text-white px-8 py-2.5 font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
