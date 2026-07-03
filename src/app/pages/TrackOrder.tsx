import { useState } from 'react';
import { Search } from 'lucide-react';

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    // Simulate tracking data
    if (trackingNumber) {
      setOrderStatus({
        orderNumber: trackingNumber,
        status: 'قيد التوصيل',
        date: new Date().toLocaleDateString('ar-SA'),
        items: 1,
        total: 95,
        steps: [
          { label: 'تم تأكيد الطلب', completed: true },
          { label: 'جاري التحضير', completed: true },
          { label: 'قيد التوصيل', completed: true },
          { label: 'تم الاستلام', completed: false },
        ],
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="rounded-3xl p-12 mb-12 text-center text-white" style={{ backgroundColor: '#0F3A2B' }}>
          <h1 className="text-4xl font-bold mb-4">تتبع طلبك</h1>
          <p className="text-lg opacity-90">أدخل رقم التتبع لمعرفة حالة طلبك</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-3xl p-8 mb-8">
          <div className="flex gap-3 mb-6">
            placeholder:text-[#0F3A2B]
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-4 border border-gray-200 rounded-full focus:outline-none focus:border-[#0F3A2B]"
              placeholder="أدخل رقم التتبع"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 rounded-full text-white font-bold transition-all hover:shadow-lg flex items-center gap-2"
              style={{ backgroundColor: '#0F3A2B' }}
            >
              <Search className="w-5 h-5" />
              بحث
            </button>
          </div>

          {searched && !orderStatus && (
            <p className="text-center text-gray-600">لم يتم العثور على طلب بهذا الرقم</p>
          )}
        </div>

        {/* Order Status */}
        {orderStatus && (
          <div className="bg-white rounded-3xl p-8 space-y-8">
            {/* Order Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">رقم الطلب</p>
                <p className="font-bold" style={{ color: '#0F3A2B' }}>
                  {orderStatus.orderNumber}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">الحالة</p>
                <p className="font-bold" style={{ color: '#0F3A2B' }}>
                  {orderStatus.status}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">التاريخ</p>
                <p className="font-bold" style={{ color: '#0F3A2B' }}>
                  {orderStatus.date}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">الإجمالي</p>
                <p className="font-bold" style={{ color: '#0F3A2B' }}>
                  {orderStatus.total} ر.ع
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="py-8 border-t border-gray-200">
              <h3 className="font-bold mb-6" style={{ color: '#0F3A2B' }}>
                مراحل الطلب
              </h3>
              <div className="space-y-6">
                {orderStatus.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${
                        step.completed ? '' : 'opacity-50'
                      }`}
                      style={{ backgroundColor: step.completed ? '#0F3A2B' : '#E8E3D9' }}
                    >
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <div className="pt-2">
                      <p className="font-semibold" style={{ color: '#0F3A2B' }}>
                        {step.label}
                      </p>
                      {step.completed && (
                        <p className="text-sm text-gray-600 mt-1">تم استكمال هذه المرحلة</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
