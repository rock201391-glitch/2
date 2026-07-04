import { useState } from 'react';
import { ChevronRight, Upload } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../lib/supabase';

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

  const subtotal = getTotal();
  const shippingCost = formData.shippingMethod === 'home' ? 2 : 1;
  const total = subtotal + shippingCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (items.length === 0) {
      alert('السلة فارغة');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.governorate || !formData.city) {
      alert('يرجى تعبئة جميع البيانات المطلوبة');
      return;
    }

    if (!receiptImage) {
      alert('يرجى رفع صورة الإيصال');
      return;
    }

    setIsSubmitting(true);

    try {
      const productNames = items
        .map(item => `${item.name} × ${item.quantity || 1}`)
        .join('، ');

      const fileName = `${Date.now()}-${receiptImage.name}`;

const { error: uploadError } = await supabase.storage
  .from('receipts')
  .upload(fileName, receiptImage);

if (uploadError) {
  alert('فشل رفع صورة الإيصال');
  console.log(uploadError);
  setIsSubmitting(false);
  return;
}

const { data: publicUrl } = supabase.storage
  .from('receipts')
  .getPublicUrl(fileName);

const { error } = await supabase
  .from('orders')
  .insert([
    {
      customer_name: formData.fullName,

      phone: formData.phone,

      product_name: productNames,

      total,

      payment_status: 'pending',

      receipt_url: publicUrl.publicUrl,

      governorate: formData.governorate,

      city: formData.city,

      notes: formData.notes,

      shipping_method: formData.shippingMethod,
    },
  ]);
       

      if (error) {
        alert('فشل الطلب: ' + error.message);
        console.error('Supabase error:', error);
        return;
      }

      const newOrder = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'قيد المراجعة',
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price,
        })),
        total,
      };

      const oldOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([newOrder, ...oldOrders]));

      clearCart();
      alert('تم إرسال الطلب بنجاح');
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('فشل الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#F8F7F2] py-8 px-4 text-[#0F3A2B]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <ChevronRight className="text-[#0F3A2B]" />
          <span className="font-semibold text-[#0F3A2B]">العودة للسلة</span>
        </div>

        <h1 className="text-4xl font-bold mb-12 text-center text-[#0F3A2B]">
          إتمام الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">
                معلومات العميل
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-white placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="الاسم الكامل"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-white placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="+968 XXXX XXXX"
                  required
                />

                <input
                  type="text"
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-white placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="المحافظة / المنطقة"
                  required
                />

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-white placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="الولاية / المدينة"
                  required
                />

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none text-[#0F3A2B] bg-white placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  rows={3}
                  placeholder="ملاحظات الطلب"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">
                طريقة التوصيل
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] px-5 py-4 cursor-pointer text-[#0F3A2B]">
                  <span className="font-semibold">استلام من المكتب</span>
                  <span className="flex items-center gap-2">
                    <span>1 ر.ع</span>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="office"
                      checked={formData.shippingMethod === 'office'}
                      onChange={handleInputChange}
                      className="accent-[#0F3A2B]"
                    />
                  </span>
                </label>

                <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] px-5 py-4 cursor-pointer text-[#0F3A2B]">
                  <span className="font-semibold">توصيل للمنزل</span>
                  <span className="flex items-center gap-2">
                    <span>2 ر.ع</span>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="home"
                      checked={formData.shippingMethod === 'home'}
                      onChange={handleInputChange}
                      className="accent-[#0F3A2B]"
                    />
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">
                طريقة الدفع
              </h2>

              <div className="bg-[#FBF7EF] rounded-2xl p-6 mb-6 text-[#0F3A2B]">
                <p className="mb-4 font-semibold">
                  يرجى تحويل المبلغ إلى الحساب التالي:
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>اسم الحساب:</span>
                    <b>HAMAD################BAL</b>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>رقم الحساب:</span>
                    <b>0401063526560013</b>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>رقم التحويل:</span>
                    <b>90977867</b>
                  </div>

                  <div className="flex justify-between gap-4 text-lg">
                    <span>المبلغ المطلوب:</span>
                    <b>{total.toFixed(2)} ر.ع</b>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  dragActive ? 'bg-[#FBF7EF] border-[#0F3A2B]' : 'bg-white border-[#E8E3D9]'
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
                />

                <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center text-[#0F3A2B]">
                  <Upload className="w-10 h-10 mb-3 text-[#0F3A2B]" />
                  <span className="font-semibold text-[#0F3A2B]">
                    {receiptFileName ? `تم الرفع: ${receiptFileName}` : 'اضغط هنا لرفع صورة الإيصال'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 sticky top-24 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">
                ملخص الطلب
              </h2>

              <div className="space-y-4 mb-6 text-[#0F3A2B]">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between border-b border-gray-200 pb-3 gap-4">
                    <span>{item.name} × {item.quantity || 1}</span>
                    <b>{(item.price * (item.quantity || 1)).toFixed(2)} ر.ع</b>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-3 text-[#0F3A2B]">
                <span>المنتجات:</span>
                <span>{subtotal.toFixed(2)} ر.ع</span>
              </div>

              <div className="flex justify-between mb-6 text-[#0F3A2B]">
                <span>الشحن:</span>
                <span>{shippingCost.toFixed(2)} ر.ع</span>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6 text-[#0F3A2B]">
                <span>الإجمالي:</span>
                <span>{total.toFixed(2)} ر.ع</span>
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !receiptImage ||
                  !formData.fullName ||
                  !formData.phone ||
                  !formData.governorate ||
                  !formData.city
                }
                className="w-full py-4 rounded-full font-bold text-lg transition hover:scale-105 disabled:hover:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0F3A2B', color: '#FFFFFF' }}
              >
                {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
