import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // استيراد اتصال قاعدة البيانات Supabase

interface MyOrdersProps {
  onNavigate: (page: string) => void;
}

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncOrdersWithSupabase() {
      // 1. جلب الطلبات المحلية المخزنة سابقاً لمعرفة أرقام الـ IDs الخاصة بها
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      if (savedOrders.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // استخراج كافة معرفات الطلبات للزبون الحالي
      const orderIds = savedOrders.map((o: any) => o.id);

      try {
        // 2. جلب الحالات المحدثة والمباشرة للطلبات من قاعدة بيانات Supabase
        const { data: liveOrders, error } = await supabase
          .from('orders')
          .select('id, payment_status')
          .in('id', orderIds);

        if (!error && liveOrders) {
          // دمج الحالة الحية القادمة من الأدمن مع تفاصيل المنتجات المخزنة محلياً
          const updatedOrders = savedOrders.map((localOrder: any) => {
            const liveMatch = liveOrders.find((live: any) => live.id === localOrder.id);
            return {
              ...localOrder,
              // إذا وُجدت حالة محدثة في السوبابيز نأخذها، وإلا نعتمد الحالة المحلية الافتراضية
              status: liveMatch ? liveMatch.payment_status : localOrder.status
            };
          });

          setOrders(updatedOrders);
        } else {
          // في حال فشل الاتصال، يتم عرض البيانات المحلية كخطة بديلة لحين عودة الاتصال
          setOrders(savedOrders);
        }
      } catch (err) {
        setOrders(savedOrders);
      }
      setLoading(false);
    }

    syncOrdersWithSupabase();
  }, []);

  // دالة لتحديد الألوان المناسبة لكل حالة تختارها من الأدمن
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'جاري التوصيل':
        return { backgroundColor: '#e3f2fd', color: '#0d47a1' }; // أزرق
      case 'تم التوصيل':
      case 'تم التسليم':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32' }; // أخضر
      case 'ملغي':
        return { backgroundColor: '#ffebee', color: '#c62828' }; // أحمر
      case 'قيد المراجعة':
      default:
        return { backgroundColor: '#fff3e0', color: '#e65100' }; // برتقالي خريفي متناسق مع مرقاب
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center" style={{ color: '#0F3A2B' }}>
          مشترياتي
        </h1>

        {loading ? (
          <div className="text-center py-16 font-medium text-gray-500">جاري تحديث حالات الطلبات...</div>
        ) : orders.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6" style={{ backgroundColor: '#FBF7EF' }}>
                <ShoppingBag className="w-10 h-10" style={{ color: '#0F3A2B' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#0F3A2B' }}>
                لا توجد طلبات محفوظة
              </h2>
              <p className="text-gray-600 mb-8">ابدأ بتصفح المتجر وأضف منتجاتك المفضلة إلى السلة</p>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full py-4 rounded-full text-white font-bold transition-all hover:shadow-lg"
                style={{ backgroundColor: '#0F3A2B' }}
              >
                تصفح المتجر
              </button>
            </div>
          </div>
        ) : (
          // Orders List
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
                    <p className="font-bold" style={{ color: '#0F3A2B' }}>
                      #{order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                    <p className="font-bold" style={{ color: '#0F3A2B' }}>
                      {order.date ? new Date(order.date).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الحالة</p>
                    <div 
                      className="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-all" 
                      style={getStatusStyle(order.status)}
                    >
                      {order.status || 'قيد المراجعة'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الإجمالي</p>
                    <p className="text-xl font-bold" style={{ color: '#0F3A2B' }}>
                      {order.total} ر.ع
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold" style={{ color: '#0F3A2B' }}>
                        {item.price * item.quantity} ر.ع
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
