import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Wrench, Phone, User, Calendar, Trash2, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

interface WorkshopRequest {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  drone_model: string;
  issue_description: string;
  image_url: string | null;
  status: string;
}

export default function WorkshopRequestsManager() {
  const [requests, setRequests] = useState<WorkshopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workshop_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء جلب طلبات الورشة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('workshop_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRequests(
        requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err: any) {
      console.error(err);
      alert('فشل في تحديث حالة الطلب');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف طلب الصيانة هذا؟')) return;

    try {
      const { error } = await supabase
        .from('workshop_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRequests(requests.filter((req) => req.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('فشل في حذف الطلب');
    }
  };

  return (
    <div className="space-y-6 text-[#0F3A2B]" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E1D8] shadow-sm">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F3A2B] text-[#D8C99B]">
              <Wrench className="h-5 w-5" />
            </span>
            إدارة طلبات الورشة والصيانة
          </h2>
          <p className="text-sm text-[#6E7F76] mt-1">
            متابعة طلبات صيانة وفحص الدرونات المقدمة من العملاء وإدارة حالتها.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="rounded-2xl bg-[#0F3A2B]/10 px-5 py-2.5 font-bold text-[#0F3A2B] hover:bg-[#0F3A2B]/20 transition"
        >
          تحديث القائمة
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-sm font-semibold text-right">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#6E7F76]">جاري تحميل الطلبات...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#D8CFB8] bg-white p-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-[#9CA3AF] mb-3" />
          <p className="text-lg font-bold text-[#0F3A2B]">لا توجد طلبات صيانة حتى الآن</p>
          <p className="text-sm text-[#6E7F76] mt-1">ستظهر طلبات العملاء هنا فور إرسالها من موقع الويب.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-[#E5E1D8] p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition hover:shadow-md"
            >
              <div className="space-y-3 flex-1 text-right">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-[#0F3A2B] flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6E7F76]" />
                    {req.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-sm font-mono text-[#6E7F76] bg-[#F9F8F5] px-3 py-1 rounded-full border border-[#E5E1D8]">
                    <Phone className="h-3.5 w-3.5" />
                    {req.phone}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status === 'completed'
                      ? 'مكتمل'
                      : req.status === 'in_progress'
                      ? 'قيد الصيانة'
                      : 'قيد الانتظار'}
                  </span>
                </div>

                <div className="text-sm text-[#0F3A2B] font-semibold bg-[#F8F7F2] p-3 rounded-2xl border border-[#E5E1D8] inline-block">
                  <span className="text-[#6E7F76] font-normal ml-2">موديل الدرون:</span>
                  {req.drone_model}
                </div>

                <p className="text-sm text-[#4A5D54] leading-relaxed bg-[#FFFDF7] p-4 rounded-2xl border border-[#E5E1D8]">
                  <strong className="block text-[#0F3A2B] mb-1">وصف المشكلة:</strong>
                  {req.issue_description}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#6E7F76]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>تاريخ الطلب: {new Date(req.created_at).toLocaleString('ar-OM')}</span>
                </div>
              </div>

              {req.image_url && (
                <div className="shrink-0">
                  <a
                    href={req.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group relative overflow-hidden rounded-2xl border border-[#E5E1D8]"
                  >
                    <img
                      src={req.image_url}
                      alt="صورة المشكلة"
                      className="h-28 w-28 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                  </a>
                </div>
              )}

              <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#E5E1D8]">
                <select
                  value={req.status}
                  onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                  className="w-full md:w-auto rounded-xl border border-[#E5E1D8] bg-[#F9F8F5] px-3 py-2 text-xs font-bold text-[#0F3A2B] outline-none"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="in_progress">قيد الصيانة</option>
                  <option value="completed">مكتمل</option>
                </select>

                <button
                  onClick={() => handleDelete(req.id)}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
