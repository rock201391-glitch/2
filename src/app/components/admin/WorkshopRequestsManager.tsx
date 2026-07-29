import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
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
  problem_description: string;
  image_url: string | null;
  status: WorkshopStatus | null;
  created_at: string | null;
}

const STATUS_OPTIONS: {
  value: WorkshopStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "new",
    label: "جديد",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "contacting",
    label: "جاري التواصل",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "inspection",
    label: "تحت الفحص",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "repairing",
    label: "جاري الإصلاح",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "completed",
    label: "مكتمل",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "rejected",
    label: "مرفوض",
    className: "bg-red-50 text-red-700 border-red-200",
  },
];

function normalizeStatus(status: WorkshopStatus | null): WorkshopStatus {
  return status ?? "new";
}

function getStatusDetails(status: WorkshopStatus | null) {
  const normalizedStatus = normalizeStatus(status);

  return (
    STATUS_OPTIONS.find((item) => item.value === normalizedStatus) ??
    STATUS_OPTIONS[0]
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat("ar-OM", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizePhone(phone: string) {
  let normalized = phone.replace(/[^\d+]/g, "");

  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
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

  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(
    null
  );

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccess = (text: string) => {
    setSuccessMessage(text);
    setErrorMessage("");

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showError = (text: string) => {
    setErrorMessage(text);
    setSuccessMessage("");

    window.setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const loadRequests = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data, error } = await supabase
        .from("workshop_requests")
        .select(`
          id,
          customer_name,
          phone,
          drone_model,
          problem_description,
          image_url,
          status,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const normalizedData = (data ?? []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status as WorkshopStatus | null),
      })) as WorkshopRequest[];

      setRequests(normalizedData);
    } catch (error: any) {
      console.error("Failed to load workshop requests:", error);

      showError(
        error?.message
          ? `تعذر تحميل طلبات الورشة: ${error.message}`
          : "تعذر تحميل طلبات الورشة"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return requests.filter((request) => {
      const requestStatus = normalizeStatus(request.status);

      const matchesStatus =
        statusFilter === "all" || requestStatus === statusFilter;

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
        request.problem_description.toLowerCase().includes(query) ||
        String(request.id).includes(query)
      );
    });
  }, [requests, searchQuery, statusFilter]);

  const newRequestsCount = requests.filter(
    (request) => normalizeStatus(request.status) === "new"
  ).length;

  const completedRequestsCount = requests.filter(
    (request) => normalizeStatus(request.status) === "completed"
  ).length;

  const handleStatusChange = async (
    request: WorkshopRequest,
    newStatus: WorkshopStatus
  ) => {
    if (normalizeStatus(request.status) === newStatus) {
      return;
    }

    try {
      setUpdatingStatusId(request.id);

      const { error } = await supabase
        .from("workshop_requests")
        .update({ status: newStatus })
        .eq("id", request.id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelectedRequest((current) =>
        current?.id === request.id
          ? { ...current, status: newStatus }
          : current
      );

      showSuccess("تم تحديث حالة طلب الورشة");
    } catch (error: any) {
      console.error("Failed to update status:", error);

      showError(
        error?.message
          ? `تعذر تحديث الحالة: ${error.message}`
          : "تعذر تحديث حالة الطلب"
      );
    } finally {
      setUpdatingStatusId(null);
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

      showSuccess("تم حذف طلب الورشة");
    } catch (error: any) {
      console.error("Failed to delete request:", error);

      showError(
        error?.message
          ? `تعذر حذف الطلب: ${error.message}`
          : "تعذر حذف الطلب"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openWhatsApp = (request: WorkshopRequest) => {
    const phone = normalizePhone(request.phone);

    const text = encodeURIComponent(
      `مرحبًا ${request.customer_name}، معك فريق ورشة مرقاب بخصوص طلب صيانة ${request.drone_model} رقم ${request.id}.`
    );

    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center rounded-[30px] border border-[#D8C99B]/30 bg-[#08271D]">
        <div className="text-center">
          <Loader2 className="mx-auto h-11 w-11 animate-spin text-[#D8C99B]" />

          <p className="mt-4 font-bold text-white">
            جاري تحميل طلبات الورشة...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full space-y-6 text-[#0F3A2B]"
      dir="rtl"
    >
      {(successMessage || errorMessage) && (
        <div className="fixed inset-x-0 top-6 z-[99999] flex justify-center px-4 pointer-events-none">
          <div
            className={`rounded-2xl border px-6 py-3 font-bold text-white shadow-2xl ${
              errorMessage
                ? "border-red-400 bg-red-700"
                : "border-emerald-400 bg-[#0F3A2B]"
            }`}
          >
            {errorMessage || successMessage}
          </div>
        </div>
      )}

      <div className="rounded-[30px] border border-[#D8C99B]/40 bg-white p-5 shadow-xl sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3A2B] text-[#D8C99B] shadow-md">
              <Wrench className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                طلبات الورشة
              </h2>

              <p className="mt-1 text-sm text-[#6E7F76]">
                متابعة طلبات فحص وصيانة وإصلاح الدرونات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadRequests(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F3A2B] px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            تحديث البيانات
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F8F7F2] p-5">
            <p className="text-xs font-bold text-[#6E7F76]">
              إجمالي الطلبات
            </p>

            <p className="mt-2 text-3xl font-black">
              {requests.length}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-xs font-bold text-blue-700">
              الطلبات الجديدة
            </p>

            <p className="mt-2 text-3xl font-black text-blue-800">
              {newRequestsCount}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-5">
            <p className="text-xs font-bold text-emerald-700">
              الطلبات المكتملة
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-800">
              {completedRequestsCount}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-[#D8C99B]/40 bg-white p-4 shadow-md">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_230px]">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6E7F76]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث بالاسم أو الهاتف أو الموديل أو رقم الطلب..."
              className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] py-3.5 pr-12 pl-4 outline-none transition focus:border-[#0F3A2B]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "all" | WorkshopStatus
              )
            }
            className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3.5 font-bold outline-none"
          >
            <option value="all">جميع الحالات</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-[30px] border border-dashed border-[#D8C99B] bg-white px-6 py-20 text-center shadow-md">
          <AlertCircle className="mx-auto h-11 w-11 text-[#6E7F76]" />

          <h3 className="mt-4 text-xl font-black">
            لا توجد طلبات مطابقة
          </h3>

          <p className="mt-2 text-sm text-[#6E7F76]">
            لا توجد طلبات ورشة حاليًا أو لا توجد نتائج مطابقة للبحث.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[30px] border border-[#D8C99B]/40 bg-white shadow-xl lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-right">
                <thead className="bg-[#0F3A2B] text-white">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">العميل</th>
                    <th className="px-5 py-4">الهاتف</th>
                    <th className="px-5 py-4">موديل الدرون</th>
                    <th className="px-5 py-4">المشكلة</th>
                    <th className="px-5 py-4">التاريخ</th>
                    <th className="px-5 py-4">الحالة</th>
                    <th className="px-5 py-4 text-center">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8E3D9]">
                  {filteredRequests.map((request) => {
                    const status = getStatusDetails(request.status);

                    return (
                      <tr
                        key={request.id}
                        className="transition hover:bg-[#F8F7F2]"
                      >
                        <td className="px-5 py-4 font-black">
                          #{request.id}
                        </td>

                        <td className="px-5 py-4 font-bold">
                          {request.customer_name}
                        </td>

                        <td className="px-5 py-4" dir="ltr">
                          {request.phone}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {request.drone_model}
                        </td>

                        <td className="max-w-[270px] px-5 py-4">
                          <p className="line-clamp-2 text-sm text-[#6E7F76]">
                            {request.problem_description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#6E7F76]">
                          {formatDate(request.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={normalizeStatus(request.status)}
                            disabled={
                              updatingStatusId === request.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                request,
                                event.target.value as WorkshopStatus
                              )
                            }
                            className={`rounded-full border px-3 py-2 text-xs font-bold outline-none ${status.className}`}
                          >
                            {STATUS_OPTIONS.map((item) => (
                              <option
                                key={item.value}
                                value={item.value}
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
                              onClick={() =>
                                setSelectedRequest(request)
                              }
                              className="rounded-xl bg-[#0F3A2B]/10 p-2.5 text-[#0F3A2B] hover:bg-[#0F3A2B] hover:text-white"
                              title="عرض التفاصيل"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openWhatsApp(request)}
                              className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                              title="واتساب"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(request)}
                              disabled={deletingId === request.id}
                              className="rounded-xl bg-red-100 p-2.5 text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-50"
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

          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredRequests.map((request) => {
              const status = getStatusDetails(request.status);

              return (
                <article
                  key={request.id}
                  className="rounded-[26px] border border-[#D8C99B]/40 bg-white p-5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#6E7F76]">
                        طلب ورشة #{request.id}
                      </span>

                      <h3 className="mt-1 text-lg font-black">
                        {request.customer_name}
                      </h3>

                      <p className="mt-1 text-xs text-[#6E7F76]">
                        {formatDate(request.created_at)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 rounded-2xl bg-[#F8F7F2] p-4">
                    <div>
                      <p className="text-xs font-bold text-[#6E7F76]">
                        رقم الهاتف
                      </p>

                      <p className="font-bold" dir="ltr">
                        {request.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#6E7F76]">
                        موديل الدرون
                      </p>

                      <p className="font-bold">
                        {request.drone_model}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#6E7F76]">
                        وصف المشكلة
                      </p>

                      <p className="text-sm leading-relaxed">
                        {request.problem_description}
                      </p>
                    </div>
                  </div>

                  <select
                    value={normalizeStatus(request.status)}
                    disabled={updatingStatusId === request.id}
                    onChange={(event) =>
                      handleStatusChange(
                        request,
                        event.target.value as WorkshopStatus
                      )
                    }
                    className={`mt-4 w-full rounded-2xl border px-4 py-3 font-bold ${status.className}`}
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="rounded-xl bg-[#0F3A2B] px-3 py-3 text-sm font-bold text-white"
                    >
                      عرض
                    </button>

                    <button
                      type="button"
                      onClick={() => openWhatsApp(request)}
                      className="rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white"
                    >
                      واتساب
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(request)}
                      disabled={deletingId === request.id}
                      className="rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
                    >
                      حذف
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setSelectedRequest(null)}
            className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-sm"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E8E3D9] bg-white px-6 py-4">
              <div>
                <p className="text-xs font-bold text-[#6E7F76]">
                  تفاصيل طلب الورشة
                </p>

                <h3 className="text-xl font-black">
                  طلب رقم #{selectedRequest.id}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F7F2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F8F7F2] p-4">
                  <p className="text-xs text-[#6E7F76]">
                    اسم العميل
                  </p>

                  <p className="mt-1 font-black">
                    {selectedRequest.customer_name}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F7F2] p-4">
                  <p className="text-xs text-[#6E7F76]">
                    رقم الهاتف
                  </p>

                  <p className="mt-1 font-black" dir="ltr">
                    {selectedRequest.phone}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F7F2] p-4">
                  <p className="text-xs text-[#6E7F76]">
                    موديل الدرون
                  </p>

                  <p className="mt-1 font-black">
                    {selectedRequest.drone_model}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F7F2] p-4">
                  <p className="text-xs text-[#6E7F76]">
                    تاريخ الإرسال
                  </p>

                  <p className="mt-1 font-bold">
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F8F7F2] p-5">
                <p className="mb-2 text-xs font-bold text-[#6E7F76]">
                  وصف المشكلة
                </p>

                <p className="whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.problem_description}
                </p>
              </div>

              {selectedRequest.image_url && (
                <div className="rounded-2xl border border-[#D8D2C5] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-bold">الصورة المرفقة</p>

                    <a
                      href={selectedRequest.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#0F3A2B]"
                    >
                      فتح الصورة

                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <img
                    src={selectedRequest.image_url}
                    alt={`صورة طلب ${selectedRequest.id}`}
                    className="max-h-[400px] w-full rounded-xl object-contain"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  حالة الطلب
                </label>

                <select
                  value={normalizeStatus(selectedRequest.status)}
                  disabled={
                    updatingStatusId === selectedRequest.id
                  }
                  onChange={(event) =>
                    handleStatusChange(
                      selectedRequest,
                      event.target.value as WorkshopStatus
                    )
                  }
                  className="w-full rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3.5 font-bold"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openWhatsApp(selectedRequest)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-bold text-white"
                >
                  <MessageCircle className="h-5 w-5" />

                  التواصل عبر واتساب
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedRequest)}
                  disabled={deletingId === selectedRequest.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 font-bold text-white disabled:opacity-50"
                >
                  {deletingId === selectedRequest.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}

                  حذف الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
