import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useThemeSettings } from "../../contexts/ThemeSettingsContext";

interface ThemeField {
  key: string;
  label: string;
  type: "color" | "text" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const FIELDS: ThemeField[] = [
  { key: "color-primary",    label: "اللون الأساسي",       type: "color" },
  { key: "color-secondary",  label: "اللون الثانوي",       type: "color" },
  { key: "color-background", label: "لون الخلفية",         type: "color" },
  { key: "color-button",     label: "لون الأزرار",         type: "color" },
  { key: "color-text",       label: "لون النصوص",          type: "color" },
  { key: "color-border",     label: "لون الحدود",          type: "color" },
  { key: "color-card",       label: "لون الكروت",          type: "color" },
  { key: "border-radius",    label: "شكل الحواف",          type: "select",
    options: [
      { value: "0",      label: "حاد تماماً" },
      { value: "0.25rem", label: "حاد قليلاً" },
      { value: "0.5rem",  label: "متوسط" },
      { value: "1rem",    label: "دائري (افتراضي)" },
      { value: "1.5rem",  label: "دائري جداً" },
      { value: "9999px",  label: "كامل الاستدارة" },
    ]
  },
  { key: "shadow-style",     label: "الظلال",              type: "select",
    options: [
      { value: "none",   label: "بدون ظل" },
      { value: "soft",   label: "ناعم (افتراضي)" },
      { value: "medium", label: "متوسط" },
      { value: "strong", label: "قوي" },
    ]
  },
  { key: "font-family",      label: "الخط الأساسي",        type: "select",
    options: [
      { value: "inherit",             label: "افتراضي" },
      { value: "'Tajawal', sans-serif", label: "Tajawal" },
      { value: "'Cairo', sans-serif",   label: "Cairo" },
      { value: "'Noto Kufi Arabic', sans-serif", label: "Noto Kufi" },
    ]
  },
  { key: "font-size-base",   label: "حجم الخط الأساسي",   type: "select",
    options: [
      { value: "14px", label: "صغير (14px)" },
      { value: "15px", label: "متوسط صغير (15px)" },
      { value: "16px", label: "متوسط (16px) - افتراضي" },
      { value: "17px", label: "متوسط كبير (17px)" },
      { value: "18px", label: "كبير (18px)" },
    ]
  },
];

const DEFAULTS: Record<string, string> = {
  "color-primary":    "#0F3A2B",
  "color-secondary":  "#2F6B4E",
  "color-background": "#F8F7F2",
  "color-button":     "#0F3A2B",
  "color-text":       "#0F3A2B",
  "color-border":     "#D8D2C5",
  "color-card":       "#FFFFFF",
  "border-radius":    "1rem",
  "shadow-style":     "soft",
  "font-family":      "inherit",
  "font-size-base":   "16px",
};

export default function ThemeManager() {
  const { reload } = useThemeSettings();
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchTheme(); }, []);

  async function fetchTheme() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("theme_settings")
      .select("key, value");
    if (err) { setError(err.message); setLoading(false); return; }
    const map = { ...DEFAULTS };
    (data || []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
    setValues(map);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const upserts = Object.entries(values).map(([key, value]) => ({ key, value }));
    const { error: err } = await supabase
      .from("theme_settings")
      .upsert(upserts, { onConflict: "key" });

    if (err) { setError(err.message); }
    else {
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function handleReset() {
    setValues({ ...DEFAULTS });
  }

  const inputClass = "w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] transition-all";
  const labelClass = "block text-sm font-semibold mb-1 text-[#0F3A2B]";

  if (loading) return <p className="text-center py-10 text-[#0F3A2B] opacity-60">جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0F3A2B]">إعدادات الثيم</h2>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-[#D8D2C5] px-5 py-2 font-semibold text-[#0F3A2B] hover:bg-[#F8F7F2] transition-all text-sm"
        >
          ↺ إعادة الضبط الافتراضي
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 text-sm font-semibold">
          ✓ تم حفظ الثيم وتطبيقه بنجاح
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Colors section */}
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3A2B] border-b border-[#E8E3D9] pb-3 mb-5">الألوان</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FIELDS.filter(f => f.type === "color").map(field => (
              <div key={field.key}>
                <label className={labelClass}>{field.label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={values[field.key] ?? DEFAULTS[field.key]}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-12 h-11 rounded-xl border border-[#D8D2C5] cursor-pointer p-1 bg-white"
                  />
                  <input
                    type="text"
                    value={values[field.key] ?? DEFAULTS[field.key]}
                    onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="flex-1 rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-3 py-2.5 text-[#0F3A2B] outline-none focus:border-[#0F3A2B] font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & layout section */}
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3A2B] border-b border-[#E8E3D9] pb-3 mb-5">الشكل والخطوط</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FIELDS.filter(f => f.type === "select").map(field => (
              <div key={field.key}>
                <label className={labelClass}>{field.label}</label>
                <select
                  value={values[field.key] ?? DEFAULTS[field.key]}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={inputClass}
                >
                  {field.options!.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3A2B] border-b border-[#E8E3D9] pb-3 mb-5">معاينة سريعة</h3>
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: values["color-background"] ?? DEFAULTS["color-background"], fontFamily: values["font-family"] ?? DEFAULTS["font-family"] }}
          >
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: values["color-card"] ?? DEFAULTS["color-card"],
                borderColor: values["color-border"] ?? DEFAULTS["color-border"],
                borderRadius: values["border-radius"] ?? DEFAULTS["border-radius"],
                color: values["color-text"] ?? DEFAULTS["color-text"],
                fontSize: values["font-size-base"] ?? DEFAULTS["font-size-base"],
              }}
            >
              <p className="font-bold text-base mb-1">بطاقة منتج</p>
              <p className="text-sm opacity-70">وصف قصير للمنتج</p>
            </div>
            <button
              style={{
                backgroundColor: values["color-button"] ?? DEFAULTS["color-button"],
                color: "#FFFFFF",
                borderRadius: values["border-radius"] ?? DEFAULTS["border-radius"],
                fontSize: values["font-size-base"] ?? DEFAULTS["font-size-base"],
              }}
              className="px-6 py-3 font-bold w-fit"
            >
              زر مثال
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#0F3A2B] text-white px-8 py-2.5 font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {saving ? "جاري الحفظ..." : "حفظ الثيم وتطبيقه"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-2xl border border-[#D8D2C5] px-6 py-2.5 font-semibold text-[#0F3A2B] hover:bg-[#F8F7F2] transition-all"
          >
            إعادة الضبط
          </button>
        </div>
      </form>
    </div>
  );
}
