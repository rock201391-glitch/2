import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface MyOrdersProps {
  onNavigate: (page: string) => void;
}

export default function MyOrders({ onNavigate }: MyOrdersProps) {
const [orders, setOrders] = useState<any[]>([]);

useEffect(() => {
  const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  setOrders(savedOrders);
}, []);

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center" style={{ color: '#0F3A2B' }}>
          مشترياتي
        </h1>

        {orders.length === 0 ? (
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
              <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8">
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
                      {new Date(order.date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الحالة</p>
                    <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold" 
                      style={{
                        backgroundColor: order.status === 'تم التسليم' ? '#e8f5e9' : '#fff3e0',
                        color: order.status === 'تم التسليم' ? '#2e7d32' : '#e65100'
                      }}
                    >
                      {order.status}
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
                  {order.items.map((item, idx) => (
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
