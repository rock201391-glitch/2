import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TrackOrder() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone) {
      setMessage('اكتب رقم الهاتف');
      setOrders([]);
      return;
    }

    if (cleanPhone.length < 8) {
      setMessage('رقم الهاتف يجب أن يكون 8 أرقام على الأقل');
      setOrders([]);
      return;
    }

    setLoading(true);
    setSearched(true);
    setMessage('');

    const phoneVariants = [
      cleanPhone,
      `968${cleanPhone}`,
      `+968${cleanPhone}`,
    ];

    if (cleanPhone.startsWith('968')) {
      phoneVariants.push(cleanPhone.slice(3));
      phoneVariants.push(`+${cleanPhone}`);
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('phone', [...new Set(phoneVariants)])
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setMessage('حدث خطأ أثناء البحث');
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="rounded-3xl p-12 mb-12 text-center text-white" style={{ backgroundColor: '#0F3A2B' }}>
          <h1 className="text-4xl font-bold mb-4">تتبع طلبك</h1>
          <p className="text-lg opacity-90">
            أدخل رقم الهاتف المستخدم عند الطلب
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex gap-3 mb-6">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setMessage('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-4 border border-gray-200 rounded-full text-[#0F3A2B] placeholder:text-[#0F3A2B] placeholder:opacity-100 focus:outline-none focus:border-[#0F3A2B]"
              placeholder="أدخل رقم الهاتف"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 rounded-full text-white font-bold transition-all hover:shadow-lg flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: '#0F3A2B' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  بحث
                </>
              )}
            </button>
          </div>

          {message && (
            <p className="text-center text-red-600 font-bold">{message}</p>
          )}

          {searched && !loading && orders.length === 0 && !message && (
            <p className="text-center text-gray-600">
              لا توجد طلبات مرتبطة بهذا الرقم
            </p>
          )}
        </div>

        {/* Order Status */}
        {orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order: any) => {
              const statusOrder = [
                'قيد المراجعة',
                'تم تأكيد الطلب',
                'جاري التحضير',
                'قيد التوصيل',
                'تم الاستلام',
              ];

              const currentStatus = order.status || 'قيد المراجعة';
              const currentIndex = statusOrder.indexOf(currentStatus);

              const steps = [
                'تم تأكيد الطلب',
                'جاري التحضير',
                'قيد التوصيل',
                'تم الاستلام',
              ];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-8 space-y-8 shadow-sm"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">رقم الطلب</p>
                      <p className="font-bold text-[#0F3A2B]">
                        #{order.id}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">الحالة</p>
                      <p className="font-bold text-[#0F3A2B]">
                        {currentStatus}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">التاريخ</p>
                      <p className="font-bold text-[#0F3A2B]">
                        {new Date(order.created_at).toLocaleDateString('ar-OM')}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">الإجمالي</p>
                      <p className="font-bold text-[#0F3A2B]">
                        {Number(order.total || 0).toFixed(3)} ر.ع
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <p className="font-bold mb-2 text-[#0F3A2B]">
                      تفاصيل الطلب والعميل
                    </p>
                    <p className="text-gray-700">
                      اسم العميل: <span className="font-semibold">{order.customer_name || 'غير متوفر'}</span>
                    </p>
                    <p className="text-gray-700 mt-1">
                      المنتج: {order.product_name || 'لا توجد تفاصيل للمنتجات'}
                    </p>
                  </div>

                  <div className="py-8 border-t border-gray-200">
                    <h3 className="font-bold mb-6 text-[#0F3A2B]">
                      مراحل الطلب
                    </h3>

                    <div className="space-y-6">
                      {steps.map((label, index) => {
                        const stepStatusIndex = statusOrder.indexOf(label);
                        const completed =
                          currentIndex >= stepStatusIndex &&
                          currentIndex !== -1;

                        return (
                          <div key={label} className="flex items-start gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${
                                completed ? '' : 'opacity-50'
                              }`}
                              style={{
                                backgroundColor: completed
                                  ? '#0F3A2B'
                                  : '#E8E3D9',
                              }}
                            >
                              {completed ? '✓' : index + 1}
                            </div>

                            <div className="pt-2">
                              <p className="font-semibold text-[#0F3A2B]">
                                {label}
                              </p>

                              {completed && (
                                <p className="text-sm text-gray-600 mt-1">
                                  تم استكمال هذه المرحلة
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {currentStatus === "ملغي" && (
                        <div className="flex items-start gap-4 mt-6">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white bg-red-600">
                            ✕
                          </div>

                          <div className="pt-2">
                            <p className="font-semibold text-red-600">
                              تم إلغاء الطلب
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                              تم إلغاء هذا الطلب ولن يتم إكمال المراحل التالية.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
