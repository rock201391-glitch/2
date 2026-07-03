import { useState } from 'react';
import { ChevronRight, Upload } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { items, getTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'عمان',
    governorate: '',
    city: '',
    address: '',
    notes: '',
    discountCode: '',
    shippingMethod: 'office',
  });
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReceiptImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate order submission
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      onSuccess();
    }, 1500);
  };

  const subtotal = getTotal();
  const shippingCost = formData.shippingMethod === 'home' ? 5 : 3;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <ChevronRight style={{ color: '#0F3A2B' }} />
          <span style={{ color: '#0F3A2B' }} className="font-semibold">
            العودة للسلة
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-12 text-center" style={{ color: '#0F3A2B' }}>
          إتمام الطلب
        </h1>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Customer Info & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
                معلومات العميل
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B]"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    رقم الجوال
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B]"
                    placeholder="+968 XXXX XXXX"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                      الدولة
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B]"
                    >
                      <option>عمان</option>
                      <option>الإمارات</option>
                      <option>السعودية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                      المحافظة
                    </label>
                    <input
                      type="text"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B]"
                      placeholder="المنطقة"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    المدينة
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B]"
                    placeholder="أخرى"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    تفاصيل العنوان
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] resize-none"
                    rows={3}
                    placeholder="رقم المنزل - الشارع - الحي..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    ملاحظات الطلب
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] resize-none"
                    rows={3}
                    placeholder="أي تعليقات خاصة للطلب..."
                  />
                </div>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
                وسائل الشحن
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all" 
                  style={{
                    borderColor: formData.shippingMethod === 'office' ? '#0F3A2B' : '#E8E3D9',
                    backgroundColor: formData.shippingMethod === 'office' ? '#FBF7EF' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="office"
                    checked={formData.shippingMethod === 'office'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="mr-3 font-semibold" style={{ color: '#0F3A2B' }}>
                    توصيل للمكتب - 4-6 أيام عمل (3 ر.ع)
                  </span>
                </label>
                <label className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all"
                  style={{
                    borderColor: formData.shippingMethod === 'home' ? '#0F3A2B' : '#E8E3D9',
                    backgroundColor: formData.shippingMethod === 'home' ? '#FBF7EF' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="home"
                    checked={formData.shippingMethod === 'home'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="mr-3 font-semibold" style={{ color: '#0F3A2B' }}>
                    توصيل للمنزل - 5-8 أيام عمل (5 ر.ع)
                  </span>
                </label>
              </div>
            </div>

            {/* Bank Transfer Payment */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
                طريقة الدفع
              </h2>
              <div className="bg-[#FBF7EF] rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-4">تحويل بنكي فقط - Please transfer to the following account:</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اسم الحساب:</span>
                    <span className="font-semibold">MERGAB LLC</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">رقم الحساب:</span>
                    <span className="font-semibold">12345678901</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">رقم التحويل:</span>
                    <span className="font-semibold">SWIFT123456</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600" style={{ color: '#0F3A2B' }}>المبلغ المطلوب:</span>
                    <span className="font-bold text-lg" style={{ color: '#0F3A2B' }}>{total} ر.ع</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: '#0F3A2B' }}>
                  رفع صورة إيصال التحويل
                </label>
                <div className="border-2 border-dashed border-[#E8E3D9] rounded-2xl p-6 text-center cursor-pointer hover:bg-[#FBF7EF] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 mb-2" style={{ color: '#0F3A2B' }} />
                    <span className="text-sm text-gray-600">
                      {receiptImage ? receiptImage.name : 'اضغط لرفع صورة الإيصال أو اسحبها هنا'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
                ملخص الطلب
              </h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl text-xl" style={{ backgroundColor: '#FBF7EF' }}>
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: '#0F3A2B' }}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        x {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#0F3A2B' }}>
                      {(item.price * (item.quantity || 1)).toFixed(2)} ر.ع
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>المنتجات:</span>
                  <span>{subtotal.toFixed(2)} ر.ع</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>الشحن:</span>
                  <span>{shippingCost.toFixed(2)} ر.ع</span>
                </div>
              </div>

              <div className="py-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold" style={{ color: '#0F3A2B' }}>الإجمالي:</span>
                  <span className="text-2xl font-bold" style={{ color: '#0F3A2B' }}>
                    {total.toFixed(2)} ر.ع
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !receiptImage}
                className="w-full py-4 rounded-full text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0F3A2B' }}
              >
                {isSubmitting ? 'جاري المعالجة...' : 'تأكيد الطلب'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}