import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface Drone {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  daily_price: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Booking {
  id: number;
  rental_drone_id: number;
  customer_name: string;
  phone: string;
  governorate: string | null;
  wilayat: string | null;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_price: number;
  total_amount: number;
  status: string;
  receipt_url: string | null;
  id_card_url: string | null;
  signature_url: string | null;
  terms_text: string | null;
  terms_accepted: boolean | null;
  terms_accepted_at: string | null;
  created_at: string;
  rental_drones?: { name?: string | null } | null;
}

const STATUS_OPTIONS = [
  ["pending", "قيد المراجعة"],
  ["confirmed", "مؤكد"],
  ["active", "قيد الإيجار"],
  ["completed", "مكتمل"],
  ["cancelled", "ملغي"],
] as const;

function statusLabel(value: string) {
  return STATUS_OPTIONS.find((item) => item[0] === value)?.[1] || value;
}

function statusStyle(value: string) {
  if (value === "pending") return "bg-yellow-100 text-yellow-800";
  if (value === "confirmed") return "bg-blue-100 text-blue-800";
  if (value === "active") return "bg-purple-100 text-purple-800";
  if (value === "completed") return "bg-green-100 text-green-800";
  return "bg-red-100 text-red-800";
}

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
  daily_price: "",
  deposit_amount: "0",
  is_active: true,
};

export default function RentalManager() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [section, setSection] = useState<"bookings" | "drones">("bookings");
  const [showDroneForm, setShowDroneForm] = useState(false);
  const [editingDroneId, setEditingDroneId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    void loadData();

    const channel = supabase
      .channel("rental-admin-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rental_bookings" },
        () => void loadData(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    setLoading(true);

    const [dronesResult, bookingsResult] = await Promise.all([
      supabase
        .from("rental_drones")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("rental_bookings")
        .select("*, rental_drones(name)")
        .order("created_at", { ascending: false }),
    ]);

    if (dronesResult.error || bookingsResult.error) {
      console.error(dronesResult.error || bookingsResult.error);
      setError("تعذر تحميل بيانات الإيجار. شغّل ملف SQL الجديد.");
    } else {
      setDrones((dronesResult.data as Drone[]) || []);
      setBookings((bookingsResult.data as Booking[]) || []);
      setError("");
    }

    setLoading(false);
  }

  const stats = useMemo(() => {
    const valid = bookings.filter((booking) =>
      ["confirmed", "active", "completed"].includes(booking.status),
    );

    const counts = new Map<string, number>();

    valid.forEach((booking) => {
      const name = booking.rental_drones?.name || "غير معروف";
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    return {
      revenue: valid.reduce(
        (sum, booking) => sum + Number(booking.total_amount || 0),
        0,
      ),
      days: valid.reduce(
        (sum, booking) => sum + Number(booking.total_days || 0),
        0,
      ),
      pending: bookings.filter((booking) => booking.status === "pending").length,
      active: bookings.filter((booking) => booking.status === "active").length,
      top:
        [...counts.entries()].sort(
          (first, second) => second[1] - first[1],
        )[0]?.[0] || "—",
    };
  }, [bookings]);

  function openCreate() {
    setEditingDroneId(null);
    setForm(emptyForm);
    setShowDroneForm(true);
    setError("");
  }

  function openEdit(drone: Drone) {
    setEditingDroneId(drone.id);
    setForm({
      name: drone.name,
      description: drone.description || "",
      image_url: drone.image_url || "",
      daily_price: String(drone.daily_price),
      deposit_amount: String(drone.deposit_amount),
      is_active: drone.is_active,
    });
    setShowDroneForm(true);
  }

  async function uploadDroneImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("الصورة يجب أن تكون JPG أو PNG أو WEBP وأقل من 5MB");
      return;
    }

    setUploading(true);

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    const path = `drones/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const result = await supabase.storage
      .from("rental-images")
      .upload(path, file);

    if (result.error) {
      setError("فشل رفع الصورة");
    } else {
      const url = supabase.storage
        .from("rental-images")
        .getPublicUrl(path);

      setForm((current) => ({
        ...current,
        image_url: url.data.publicUrl,
      }));
    }

    setUploading(false);
  }

  async function saveDrone(event: React.FormEvent) {
    event.preventDefault();

    const dailyPrice = Number(form.daily_price);
    const deposit = Number(form.deposit_amount || 0);

    if (!form.name.trim() || dailyPrice <= 0 || deposit < 0) {
      setError("تأكد من الاسم والسعر والتأمين");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url || null,
      daily_price: dailyPrice,
      deposit_amount: deposit,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    const result =
      editingDroneId === null
        ? await supabase.from("rental_drones").insert(payload)
        : await supabase
            .from("rental_drones")
            .update(payload)
            .eq("id", editingDroneId);

    if (result.error) {
      setError(result.error.message);
    } else {
      await loadData();
      setShowDroneForm(false);
    }

    setSaving(false);
  }

  async function updateStatus(id: number, value: string) {
    const result = await supabase
      .from("rental_bookings")
      .update({
        status: value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: value } : booking,
      ),
    );

    setSelectedBooking((current) =>
      current?.id === id ? { ...current, status: value } : current,
    );
  }

  async function deleteBooking(id: number) {
    if (!window.confirm("حذف الحجز نهائيًا؟")) return;

    const result = await supabase
      .from("rental_bookings")
      .delete()
      .eq("id", id);

    if (result.error) {
      setError(result.error.message);
    } else {
      setBookings((current) =>
        current.filter((booking) => booking.id !== id),
      );
      setSelectedBooking(null);
    }
  }

  async function deleteDrone(drone: Drone) {
    if (!window.confirm(`حذف ${drone.name}؟`)) return;

    const result = await supabase
      .from("rental_drones")
      .delete()
      .eq("id", drone.id);

    if (result.error) {
      setError("تعذر حذف الدرون بسبب وجود حجوزات مرتبطة");
    } else {
      setDrones((current) =>
        current.filter((item) => item.id !== drone.id),
      );
    }
  }

  return (
    <div className="text-[#0F3A2B]" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">إيجارات الدرون</h2>
          <p className="text-sm text-gray-500">
            الحجوزات والتعهدات والتواقيع والمرفقات
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            className="flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 font-bold"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-full bg-[#0F3A2B] px-5 py-2.5 font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            إضافة درون
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl bg-red-50 p-4 font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["إجمالي دخل الإيجار", `${stats.revenue.toFixed(3)} ر.ع`],
          ["مجموع أيام الإيجار", `${stats.days} يوم`],
          ["بانتظار التأكيد", String(stats.pending)],
          ["إيجارات جارية", String(stats.active)],
          ["الأكثر استئجارًا", stats.top],
        ].map(([title, value]) => (
          <div
            key={title}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex rounded-2xl bg-[#EAE4D8] p-1">
        <button
          type="button"
          onClick={() => setSection("bookings")}
          className={`flex-1 rounded-xl py-3 font-black ${
            section === "bookings" ? "bg-[#0F3A2B] text-white" : ""
          }`}
        >
          الحجوزات
        </button>

        <button
          type="button"
          onClick={() => setSection("drones")}
          className={`flex-1 rounded-xl py-3 font-black ${
            section === "drones" ? "bg-[#0F3A2B] text-white" : ""
          }`}
        >
          درونات الإيجار
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center gap-2 rounded-3xl bg-white py-20">
          <Loader2 className="animate-spin" />
          جاري التحميل...
        </div>
      ) : section === "bookings" ? (
        bookings.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center">
            لا توجد حجوزات
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border bg-white shadow-xl">
            <table className="w-full min-w-[1400px] text-right text-sm">
              <thead className="bg-[#0F3A2B] text-white">
                <tr>
                  {[
                    "رقم",
                    "الدرون",
                    "العميل",
                    "الهاتف",
                    "المحافظة",
                    "الولاية",
                    "من",
                    "إلى",
                    "الأيام",
                    "الإجمالي",
                    "الحالة",
                    "التفاصيل",
                  ].map((title) => (
                    <th className="p-4" key={title}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b">
                    <td className="p-4 font-black">#{booking.id}</td>
                    <td className="p-4 font-bold">
                      {booking.rental_drones?.name || "—"}
                    </td>
                    <td className="p-4">{booking.customer_name}</td>
                    <td className="p-4" dir="ltr">
                      {booking.phone}
                    </td>
                    <td className="p-4">
                      {booking.governorate || "—"}
                    </td>
                    <td className="p-4">{booking.wilayat || "—"}</td>
                    <td className="p-4">{booking.start_date}</td>
                    <td className="p-4">{booking.end_date}</td>
                    <td className="p-4">{booking.total_days}</td>
                    <td className="p-4 font-black">
                      {Number(booking.total_amount).toFixed(3)} ر.ع
                    </td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={(event) =>
                          void updateStatus(booking.id, event.target.value)
                        }
                        className={`rounded-full px-3 py-2 font-bold ${statusStyle(
                          booking.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status[0]} value={status[0]}>
                            {status[1]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="rounded-full bg-[#0F3A2B] px-5 py-2 text-white"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {drones.map((drone) => (
            <article
              key={drone.id}
              className="overflow-hidden rounded-3xl border bg-white shadow-sm"
            >
              {drone.image_url ? (
                <div className="aspect-[16/9] bg-[#F8F7F2] p-3">
                  <img
                    src={drone.image_url}
                    alt={drone.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gray-50">
                  بدون صورة
                </div>
              )}

              <div className="p-5">
                <div className="flex justify-between">
                  <h3 className="text-xl font-black">{drone.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      drone.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {drone.is_active ? "نشط" : "مخفي"}
                  </span>
                </div>

                <p className="mt-3 min-h-[44px] text-sm text-gray-600">
                  {drone.description || "—"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F8F7F2] p-3">
                    اليومي
                    <br />
                    <b>{Number(drone.daily_price).toFixed(3)} ر.ع</b>
                  </div>

                  <div className="rounded-2xl bg-[#F8F7F2] p-3">
                    التأمين
                    <br />
                    <b>{Number(drone.deposit_amount).toFixed(3)} ر.ع</b>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(drone)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0F3A2B] py-2.5 text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    تعديل
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteDrone(drone)}
                    className="rounded-full bg-red-100 p-3 text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showDroneForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/55 p-4">
          <form
            onSubmit={saveDrone}
            className="relative my-6 w-full max-w-2xl rounded-[30px] bg-white p-7"
          >
            <button
              type="button"
              onClick={() => setShowDroneForm(false)}
              className="absolute left-5 top-5 rounded-full bg-gray-100 p-2"
            >
              <X />
            </button>

            <h3 className="mb-6 text-2xl font-black">
              {editingDroneId === null
                ? "إضافة درون للإيجار"
                : "تعديل الدرون"}
            </h3>

            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="اسم الدرون"
              className="mb-3 h-12 w-full rounded-2xl border bg-[#F8F7F2] px-4"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                step=".001"
                value={form.daily_price}
                onChange={(event) =>
                  setForm({ ...form, daily_price: event.target.value })
                }
                placeholder="السعر اليومي"
                className="h-12 rounded-2xl border bg-[#F8F7F2] px-4"
              />

              <input
                type="number"
                step=".001"
                value={form.deposit_amount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    deposit_amount: event.target.value,
                  })
                }
                placeholder="التأمين"
                className="h-12 rounded-2xl border bg-[#F8F7F2] px-4"
              />
            </div>

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="التفاصيل"
              className="mt-3 min-h-28 w-full rounded-2xl border bg-[#F8F7F2] p-4"
            />

            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6">
              <ImagePlus />
              {uploading ? "جاري الرفع" : "رفع صورة"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void uploadDroneImage(event)}
                className="hidden"
              />
            </label>

            {form.image_url && (
              <div className="mt-3 h-44 rounded-2xl bg-[#F8F7F2] p-3">
                <img
                  src={form.image_url}
                  alt="معاينة"
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <label className="mt-3 flex gap-2 rounded-2xl bg-[#F8F7F2] p-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm({ ...form, is_active: event.target.checked })
                }
              />
              إظهار في الموقع
            </label>

            <button
              disabled={saving || uploading}
              className="mt-5 h-14 w-full rounded-full bg-[#0F3A2B] font-black text-white"
            >
              {saving ? "جاري الحفظ" : "حفظ"}
            </button>
          </form>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/55 p-4">
          <div className="relative my-6 max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-7">
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="absolute left-5 top-5 rounded-full bg-gray-100 p-2"
            >
              <X />
            </button>

            <h3 className="mb-5 text-2xl font-black">
              تفاصيل الحجز #{selectedBooking.id}
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["الدرون", selectedBooking.rental_drones?.name || "—"],
                ["العميل", selectedBooking.customer_name],
                ["الهاتف", selectedBooking.phone],
                ["المحافظة", selectedBooking.governorate || "—"],
                ["الولاية", selectedBooking.wilayat || "—"],
                ["الحالة", statusLabel(selectedBooking.status)],
                ["من", selectedBooking.start_date],
                ["إلى", selectedBooking.end_date],
                ["الأيام", String(selectedBooking.total_days)],
                [
                  "السعر اليومي",
                  `${Number(selectedBooking.daily_price).toFixed(3)} ر.ع`,
                ],
                [
                  "الإجمالي",
                  `${Number(selectedBooking.total_amount).toFixed(3)} ر.ع`,
                ],
                [
                  "وقت الموافقة",
                  selectedBooking.terms_accepted_at
                    ? new Date(
                        selectedBooking.terms_accepted_at,
                      ).toLocaleString("ar-OM")
                    : "—",
                ],
              ].map(([title, value]) => (
                <div
                  className="rounded-2xl bg-[#F8F7F2] p-4"
                  key={title}
                >
                  <small className="text-gray-500">{title}</small>
                  <p className="mt-1 font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border bg-[#F8F7F2] p-5">
              <h4 className="mb-3 font-black">نص التعهد الموافق عليه</h4>
              <p className="leading-8 text-gray-700">
                {selectedBooking.terms_text || "لا يوجد نص تعهد محفوظ"}
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AttachmentCard
                title="إيصال التحويل"
                url={selectedBooking.receipt_url}
              />

              <AttachmentCard
                title="البطاقة الشخصية"
                url={selectedBooking.id_card_url}
              />

              <div className="md:col-span-2">
                <AttachmentCard
                  title="توقيع المستأجر"
                  url={selectedBooking.signature_url}
                  signature
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <select
                value={selectedBooking.status}
                onChange={(event) =>
                  void updateStatus(
                    selectedBooking.id,
                    event.target.value,
                  )
                }
                className={`flex-1 rounded-2xl px-4 font-bold ${statusStyle(
                  selectedBooking.status,
                )}`}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option value={status[0]} key={status[0]}>
                    {status[1]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => void deleteBooking(selectedBooking.id)}
                className="rounded-2xl bg-red-100 px-5 py-3 font-bold text-red-700"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentCard({
  title,
  url,
  signature = false,
}: {
  title: string;
  url: string | null;
  signature?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-[#F8F7F2] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-black">{title}</h4>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-bold"
          >
            فتح
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {url ? (
        <img
          src={url}
          alt={title}
          className={`w-full rounded-2xl bg-white object-contain ${
            signature ? "h-52" : "h-72"
          }`}
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl bg-white text-gray-400">
          لا توجد صورة
        </div>
      )}
    </div>
  );
}
