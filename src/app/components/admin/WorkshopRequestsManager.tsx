import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Wrench,
  X,
  Sparkles,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

type WorkshopStatus =
  | "new"
  | "contacting"
  | "inspection"
  | "repairing"
  | "completed"
  | "rejected";

interface WorkshopRequest {
  id: number;
  customer_name: string;
  phone: string;
  drone_model: string;
  issue_description: string;
  image_url: string | null;
  status: WorkshopStatus;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS: {
  value: WorkshopStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "new",
    label: "جديد",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/5",
  },
  {
    value: "contacting",
    label: "جاري التواصل",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/5",
  },
  {
    value: "inspection",
    label: "تحت الفحص",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-lg shadow-purple-500/5",
  },
  {
    value: "repairing",
    label: "جاري الإصلاح",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-lg shadow-orange-500/5",
  },
  {
    value: "completed",
    label: "مكتمل",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/5",
  },
  {
    value: "rejected",
    label: "مرفوض",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-lg shadow-rose-500/5",
  },
];

function getStatusDetails(status: WorkshopStatus) {
  return (
    STATUS_OPTIONS.find((item) => item.value === status) ??
    STATUS_OPTIONS[0]
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-OM", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[^\d+]/g, "");

  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith("0") && normalized.length === 8) {
    normalized = `968${normalized}`;
  }

  if (normalized.length === 8) {
    normalized = `968${normalized}`;
  }

  return normalized;
}

export default function WorkshopRequestsManager() {
  const [requests, setRequests] = useState<WorkshopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | WorkshopStatus
  >("all");

  const [selectedRequest, setSelectedRequest] =
    useState<WorkshopRequest | null>(null);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessMessage = (text: string) => {
    setMessage(text);
    setErrorMessage("");

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const showErrorMessage = (text: string) => {
    setErrorMessage(text);
    setMessage("");

    window.setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  const loadRequests = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("workshop_requests")
        .select(
          `
            id,
            customer_name,
            phone,
            drone_model,
            issue_description,
            image_url,
            status,
            admin_notes,
            created_at
          `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests((data ?? []) as WorkshopRequest[]);
    } catch (error) {
      console.error("Failed to load workshop requests:", error);
      showErrorMessage("تعذر تحميل طلبات الورشة");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!selectedRequest) {
      setNotes("");
      return;
    }

    setNotes(selectedRequest.admin_notes ?? "");
  }, [selectedRequest]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        request.customer_name.toLowerCase().includes(query) ||
        request.phone.toLowerCase().includes(query) ||
        request.drone_model.toLowerCase().includes(query) ||
        request.issue_description.toLowerCase().includes(query) ||
        String(request.id).includes(query)
      );
    });
  }, [requests, searchQuery, statusFilter]);

  const newRequestsCount = requests.filter(
    (request) => request.status === "new"
  ).length;

  const completedRequestsCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  const handleStatusChange = async (
    request: WorkshopRequest,
    status: WorkshopStatus
  ) => {
    if (request.status === status) {
      return;
    }

    try {
      setUpdatingStatusId(request.id);

      const { error } = await supabase
        .from("workshop_requests")
        .update({ status })
        .eq("id", request.id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.map((item) =>
          item.id === request.id ? { ...item, status } : item
        )
      );

      setSelectedRequest((current) =>
        current?.id === request.id ? { ...current, status } : current
      );

      showSuccessMessage("تم تحديث حالة طلب الورشة");
    } catch (error) {
      console.error("Failed to update workshop status:", error);
      showErrorMessage("تعذر تحديث حالة الطلب");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setSavingNotes(true);

      const normalizedNotes = notes.trim() || null;

      const { error } = await supabase
        .from("workshop_requests")
        .update({ admin_notes: normalizedNotes })
        .eq("id", selectedRequest.id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.map((item) =>
          item.id === selectedRequest.id
            ? { ...item, admin_notes: normalizedNotes }
            : item
        )
      );

      setSelectedRequest((current) =>
        current
          ? { ...current, admin_notes: normalizedNotes }
          : current
      );

      showSuccessMessage("تم حفظ ملاحظات الورشة");
    } catch (error) {
      console.error("Failed to save workshop notes:", error);
      showErrorMessage("تعذر حفظ الملاحظات");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (request: WorkshopRequest) => {
    const confirmed = window.confirm(
      `هل تريد حذف طلب الورشة رقم ${request.id} نهائيًا؟`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(request.id);

      const { error } = await supabase
        .from("workshop_requests")
        .delete()
        .eq("id", request.id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );

      if (selectedRequest?.id === request.id) {
        setSelectedRequest(null);
      }

      showSuccessMessage("تم حذف طلب الورشة");
    } catch (error) {
      console.error("Failed to delete workshop request:", error);
      showErrorMessage("تعذر حذف الطلب");
    } finally {
      setDeletingId(null);
    }
  };

  const openWhatsApp = (request: WorkshopRequest) => {
    const phone = normalizePhone(request.phone);

    const text = encodeURIComponent(
      `مرحبًا ${request.customer_name}، معك فريق ورشة مرقاب بخصوص طلب صيانة ${request.drone_model} رقم ${request.id}.`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center relative overflow-hidden rounded-[32px] bg-[#061C14] border border-[#0F3A2B]/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>
        <div className="text-center relative z-10">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/20 animate-pulse"></div>
            <Loader2 className="relative mx-auto h-12 w-12 animate-spin text-emerald-400" />
          </div>
          <p className="mt-4 font-bold text-emerald-100 tracking-wider text-sm">
            جاري تحميل طلبات الورشة الفضائية...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 relative min-h-screen text-slate-100 p-2 sm:p-4" dir="rtl">
      {/* خلفية فضائية متطورة نفس هوية مرقاب (نجوم ونقاط لامعة) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-[36px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04120D] via-[#08241B] to-[#020D09]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-teal-600/10 rounded-full blur-3xl"></div>
      </div>

      {(message || errorMessage) && (
        <div className="fixed inset-x-0 top-6 z-[99999] flex justify-center px-4 pointer-events-none">
          <div
            className={`rounded-2xl px-6 py-3.5 font-bold text-white shadow-2xl backdrop-blur-md border animate-bounce ${
              errorMessage 
                ? "bg-rose-900/90 border-rose-500/50 text-rose-100" 
                : "bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>{errorMessage || message}</span>
            </div>
          </div>
        </div>
      )}

      {/* الهيدر الرئيسي */}
      <div className="relative rounded-[32px] border border-emerald-500/20 bg-[#0A281F]/60 backdrop-blur-xl p-6 shadow-2xl shadow-black/40 overflow-hidden sm:p-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
        
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur"></div>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F3A2B] to-[#072118] text-emerald-400 border border-emerald-500/30 shadow-inner">
                <Wrench className="h-7 w-7" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  طلبات الورشة الفضائية
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> نظام المرقاب
                </span>
              </div>
              <p className="mt-1 text-sm text-emerald-100/60 font-medium">
                إدارة طلبات فحص وصيانة وإصلاح الدرونات بكفاءة عالية وأسلوب فخم
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadRequests(true)}
            disabled={refreshing}
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-6 py-3 font-bold text-emerald-300 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-500 group-hover:rotate-180 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>تحديث البيانات</span>
          </button>
        </div>

        {/* إحصائيات سريعة فاخرة */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative rounded-2xl border border-emerald-500/10 bg-[#061C14]/60 p-4 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#061C14]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold text-emerald-400/80 tracking-wider">
              إجمالي الطلبات
            </p>
            <p className="mt-2 text-3xl font-black text-white tracking-tight">
              {requests.length}
            </p>
          </div>

          <div className="relative rounded-2xl border border-blue-500/10 bg-blue-950/20 p-4 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-950/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold text-blue-400 tracking-wider">
              الطلبات الجديدة
            </p>
            <p className="mt-2 text-3xl font-black text-blue-300 tracking-tight">
              {newRequestsCount}
            </p>
          </div>

          <div className="relative rounded-2xl border border-emerald-500/10 bg-emerald-950/20 p-4 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-950/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-bold text-emerald-400 tracking-wider">
              الطلبات المكتملة
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-300 tracking-tight">
              {completedRequestsCount}
            </p>
          </div>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="rounded-[28px] border border-emerald-500/20 bg-[#0A281F]/40 backdrop-blur-xl p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400/60" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث بالاسم، الهاتف، الموديل، أو رقم الطلب..."
              className="w-full rounded-2xl border border-emerald-500/20 bg-[#061C14]/80 py-3.5 pr-12 pl-4 text-emerald-100 placeholder-emerald-400/40 outline-none transition-all focus:border-emerald-500 focus:bg-[#061C14] focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "all" | WorkshopStatus
              )
            }
            className="w-full rounded-2xl border border-emerald-500/20 bg-[#061C14]/80 px-4 py-3.5 font-bold text-emerald-200 outline-none transition-all focus:border-emerald-500 focus:bg-[#061C14] focus:ring-2 focus:ring-emerald-500/20 text-sm cursor-pointer"
          >
            <option value="all" className="bg-[#061C14] text-white">جميع الحالات</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value} className="bg-[#061C14] text-white">
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-emerald-500/20 bg-[#0A281F]/30 backdrop-blur-md px-6 py-20 text-center shadow-xl">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
            <AlertCircle className="h-10 w-10 animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-white">
            لا توجد طلبات مطابقة
          </h3>

          <p className="mt-2 text-sm text-emerald-100/50 max-w-sm mx-auto">
            لا توجد طلبات ورشة مطابقة لخيارات البحث أو الفلترة الحالية. جرب البحث بكلمات أخرى.
          </p>
        </div>
      ) : (
        <>
          {/* جدول سطح المكتب الفاخر */}
          <div className="hidden overflow-hidden rounded-[32px] border border-emerald-500/20 bg-[#0A281F]/50 backdrop-blur-xl shadow-2xl lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-right border-collapse">
                <thead className="bg-[#061C14]/90 text-emerald-300 border-b border-emerald-500/20">
                  <tr>
                    <th className="px-5 py-4 text-xs font-black tracking-wider"># ID</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">اسم العميل</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">الهاتف</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">موديل الدرون</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">المشكلة</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">التاريخ</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider">الحالة</th>
                    <th className="px-5 py-4 text-xs font-black tracking-wider text-center">الإجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-500/10">
                  {filteredRequests.map((request) => {
                    const status = getStatusDetails(request.status);

                    return (
                      <tr
                        key={request.id}
                        className="transition-all hover:bg-emerald-500/[0.03] group"
                      >
                        <td className="px-5 py-4 font-black text-emerald-400">
                          #{request.id}
                        </td>

                        <td className="px-5 py-4 font-bold text-white">
                          {request.customer_name}
                        </td>

                        <td className="px-5 py-4 font-medium text-emerald-100/80" dir="ltr">
                          {request.phone}
                        </td>

                        <td className="px-5 py-4 font-semibold text-emerald-200">
                          {request.drone_model}
                        </td>

                        <td className="max-w-[280px] px-5 py-4">
                          <p className="line-clamp-2 text-xs leading-relaxed text-emerald-100/60">
                            {request.issue_description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs font-medium text-emerald-100/50">
                          {formatDate(request.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={request.status}
                            disabled={updatingStatusId === request.id}
                            onChange={(event) =>
                              handleStatusChange(
                                request,
                                event.target.value as WorkshopStatus
                              )
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${status.className} bg-[#061C14]`}
                          >
                            {STATUS_OPTIONS.map((item) => (
                              <option
                                key={item.value}
                                value={item.value}
                                className="bg-[#061C14] text-white py-1"
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(request)}
                              className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openWhatsApp(request)}
                              className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-400 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/20"
                              title="واتساب"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(request)}
                              disabled={deletingId === request.id}
                              className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-rose-400 transition-all hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-600/20 disabled:opacity-50"
                              title="حذف"
                            >
                              {deletingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* بطاقات الموبايل الفاخرة */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredRequests.map((request) => {
              const status = getStatusDetails(request.status);

              return (
                <article
                  key={request.id}
                  className="rounded-[28px] border border-emerald-500/20 bg-[#0A281F]/60 backdrop-blur-xl p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400/70 tracking-wider">
                        طلب ورشة #{request.id}
                      </span>
                      <h3 className="mt-0.5 text-lg font-black text-white">
                        {request.customer_name}
                      </h3>
                      <p className="mt-0.5 text-xs text-emerald-100/40 font-medium">
                        {formatDate(request.created_at)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2.5 rounded-2xl bg-[#061C14]/70 p-4 border border-emerald-500/10">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-400/60 tracking-wider">رقم الهاتف</p>
                      <p className="mt-0.5 font-bold text-sm text-emerald-100" dir="ltr">
                        {request.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-400/60 tracking-wider">موديل الدرون</p>
                      <p className="mt-0.5 font-bold text-sm text-white">
                        {request.drone_model}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-400/60 tracking-wider">وصف المشكلة</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/70">
                        {request.issue_description}
                      </p>
                    </div>
                  </div>

                  <select
                    value={request.status}
                    disabled={updatingStatusId === request.id}
                    onChange={(event) =>
                      handleStatusChange(
                        request,
                        event.target.value as WorkshopStatus
                      )
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-xs font-bold outline-none cursor-pointer ${status.className} bg-[#061C14]`}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value} className="bg-[#061C14] text-white">
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      عرض
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsApp(request)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      واتساب
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(request)}
                      disabled={deletingId === request.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* مودال تفاصيل الطلب الفاخر */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="إغلاق التفاصيل"
            onClick={() => setSelectedRequest(null)}
            className="absolute inset-0 h-full w-full bg-black/80 backdrop-blur-md transition-opacity"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-emerald-500/30 bg-[#061C14] shadow-2xl shadow-emerald-950/50 text-slate-100">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-500/20 bg-[#0A281F]/90 backdrop-blur-xl px-6 py-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400">تفاصيل طلب الورشة</span>
                <h3 className="text-xl font-black text-white">
                  طلب رقم #{selectedRequest.id}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/10 bg-[#0A281F]/40 p-4">
                  <p className="text-xs font-semibold text-emerald-400/60">اسم العميل</p>
                  <p className="mt-1 font-black text-white text-base">
                    {selectedRequest.customer_name}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/10 bg-[#0A281F]/40 p-4">
                  <p className="text-xs font-semibold text-emerald-400/60">رقم الهاتف</p>
                  <p className="mt-1 font-black text-emerald-200 text-base" dir="ltr">
                    {selectedRequest.phone}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/10 bg-[#0A281F]/40 p-4">
                  <p className="text-xs font-semibold text-emerald-400/60">موديل الدرون</p>
                  <p className="mt-1 font-black text-white text-base">
                    {selectedRequest.drone_model}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/10 bg-[#0A281F]/40 p-4">
                  <p className="text-xs font-semibold text-emerald-400/60">تاريخ الإرسال</p>
                  <p className="mt-1 font-bold text-emerald-200 text-sm">
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/10 bg-[#0A281F]/40 p-5">
                <p className="text-xs font-semibold text-emerald-400/60 mb-2">وصف المشكلة</p>
                <p className="whitespace-pre-wrap leading-relaxed text-emerald-100 text-sm">
                  {selectedRequest.issue_description}
                </p>
              </div>

              {selectedRequest.image_url && (
                <div className="rounded-2xl border border-emerald-500/20 bg-[#0A281F]/40 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-bold text-emerald-200 text-sm">
                      الصورة المرفقة
                    </p>

                    <a
                      href={selectedRequest.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                    >
                      فتح الصورة بحجم كامل
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <img
                    src={selectedRequest.image_url}
                    alt={`صورة طلب الورشة ${selectedRequest.id}`}
                    className="max-h-[380px] w-full rounded-xl object-contain bg-black/40 border border-emerald-500/10"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold text-emerald-400 tracking-wider">
                  حالة الطلب
                </label>

                <select
                  value={selectedRequest.status}
                  disabled={updatingStatusId === selectedRequest.id}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedRequest,
                      event.target.value as WorkshopStatus
                    )
                  }
                  className="w-full rounded-2xl border border-emerald-500/20 bg-[#0A281F]/60 px-4 py-3.5 font-bold text-white outline-none focus:border-emerald-500 text-sm cursor-pointer"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value} className="bg-[#061C14] text-white">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-emerald-400 tracking-wider">
                  ملاحظات الإدارة الداخلية
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="اكتب نتيجة الفحص أو تكلفة الإصلاح أو أي ملاحظات داخلية..."
                  className="w-full resize-none rounded-2xl border border-emerald-500/20 bg-[#0A281F]/60 p-4 text-emerald-100 placeholder-emerald-400/30 outline-none focus:border-emerald-500 text-sm leading-relaxed"
                />

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 sm:w-auto"
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>حفظ الملاحظات</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-emerald-500/20 pt-6 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openWhatsApp(selectedRequest)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>التواصل عبر واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedRequest)}
                  disabled={deletingId === selectedRequest.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 px-6 py-3.5 font-bold text-rose-400 transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50"
                >
                  {deletingId === selectedRequest.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                  <span>حذف الطلب نهائياً</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
