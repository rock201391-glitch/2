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
    notes: '',
    shippingMethod: 'office',
  });
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      setReceiptFileName(file.name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setReceiptImage(file);
      setReceiptFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receiptImage) {
      alert('يرجى رفع صورة الإيصال');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      onSuccess();
    }, 1500);
  };

  const subtotal = getTotal();
  const shippingCost = formData.shippingMethod === 'home' ? 2 : 1;
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
                   className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] text-[#0F3A2B] placeholder:text-[#0F3A2B] placeholder:opacity-100"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] text-[#0F3A2B]"
                    >
                      <option>عمان</option>
                      <option>الإمارات</option>
                      <option>السعودية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                      المحافظة / المنطقة
                    </label>
                    <input
                      type="text"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] text-[#0F3A2B] placeholder:text-[#0F3A2B] placeholder:opacity-100"
                      placeholder="المنطقة"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F3A2B' }}>
                    الولاية / المدينة
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] text-[#0F3A2B] placeholder:text-[#0F3A2B] placeholder:opacity-100"
                    placeholder="المدينة"
                    required
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0F3A2B] resize-none text-[#0F3A2B] placeholder:text-[#0F3A2B] placeholder:opacity-100"
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
                <label 
                  className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all"
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
                  <div className="mr-3">
                    <p className="font-semibold" style={{ color: '#0F3A2B' }}>
                      توصيل للمكتب
                    </p>
                    <p className="text-sm text-gray-600">
                      1 ر.ع • 2–4 أيام عمل
                    </p>
                  </div>
                </label>

                <label 
                  className="flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all"
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
                  <div className="mr-3">
                    <p className="font-semibold" style={{ color: '#0F3A2B' }}>
                      توصيل للمنزل
                    </p>
                    <p className="text-sm text-gray-600">
                      2 ر.ع • 2–4 أيام عمل
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Bank Transfer Payment */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#0F3A2B' }}>
                طريقة الدفع
              </h2>
              <div className="bg-[#FBF7EF] rounded-2xl p-6 mb-6">
                <p className="text-sm mb-6 font-semibold" style={{ color: '#0F3A2B' }}>يرجى تحويل المبلغ الإجمالي إلى الحساب التالي:</p>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-[#E8E3D9] pb-4">
                    <span className="font-semibold" style={{ color: '#0F3A2B' }}>اسم الحساب:</span>
                    <span className="font-bold text-base" style={{ color: '#122D22' }}>HAMAD################BAL</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#E8E3D9] pb-4">
                    <span className="font-semibold" style={{ color: '#0F3A2B' }}>رقم الحساب:</span>
                    <span className="font-bold text-base" style={{ color: '#122D22' }}>0401063526560013</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#E8E3D9] pb-4">
                    <span className="font-semibold" style={{ color: '#0F3A2B' }}>رقم التحويل:</span>
                    <span className="font-bold text-base" style={{ color: '#122D22' }}>90977867</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold" style={{ color: '#0F3A2B' }}>المبلغ المطلوب:</span>
                    <span className="text-lg font-bold" style={{ color: '#122D22' }}>{total} ر.ع</span>
                  </div>
                </div>
              </div>

              {/* Upload Receipt */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-4" style={{ color: '#0F3A2B' }}>
                  ارفع صورة إيصال التحويل
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive ? 'bg-[#FBF7EF] border-[#0F3A2B]' : 'bg-white border-[#E8E3D9] hover:bg-[#FBF7EF]'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="receipt-upload"
                    required
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 mb-3" style={{ color: '#0F3A2B' }} />
                    <span className="text-sm font-semibold mb-1" style={{ color: '#0F3A2B' }}>
                      {receiptFileName ? 'تم الرفع: ' + receiptFileName : 'اضغط هنا أو اسحب الصورة للإرفاق'}
                    </span>
                    {!receiptFileName && (
                      <span className="text-xs text-gray-500">
                        صيغ مدعومة: JPG, PNG, PDF
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {receiptImage && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0F3A2B' }}>
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0F3A2B' }}>
                      تم رفع الإيصال بنجاح
                    </p>
                    <p className="text-xs text-gray-600">
                      {receiptFileName}
                    </p>
                  </div>
                </div>
              )}
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
                disabled={isSubmitting || !receiptImage || !formData.fullName || !formData.phone}
                className="w-full py-4 rounded-full text-white font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
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
