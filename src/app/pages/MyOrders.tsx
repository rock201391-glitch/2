import { ShoppingBag } from 'lucide-react';

interface MyOrdersProps {
  onNavigate: (page: string) => void;
}

export default function MyOrders({ onNavigate }: MyOrdersProps) {
  const orders = JSON.parse(localStorage.getItem('myOrders') || '[]');

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center text-[#0F3A2B]">
          مشترياتي
        </h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-6 text-[#0F3A2B]" />
              <h2 className="text-2xl font-bold mb-4 text-[#0F3A2B]">
                لا توجد طلبات محفوظة
              </h2>
              <button
                onClick={() => onNavigate('shop')}
                className="w-full py-4 rounded-full text-white font-bold bg-[#0F3A2B]"
              >
                تصفح المتجر
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600">رقم الطلب</p>
                    <p className="font-bold text-[#0F3A2B]">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">التاريخ</p>
                    <p className="font-bold text-[#0F3A2B]">
                      {new Date(order.date).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الحالة</p>
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-[#FFF3E0] text-[#E65100]">
                      {order.status || 'قيد المراجعة'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الإجمالي</p>
                    <p className="text-xl font-bold text-[#0F3A2B]">
                      {order.total} ر.ع
                    </p>
                  </div>
                </div>

                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{item.price * item.quantity} ر.ع</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
