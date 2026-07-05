import { useState } from 'react';
import { ChevronRight, Upload } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
}

type ShippingMethod = 'office' | 'home';

const governorateToWilayah: Record<string, string[]> = {
  مسقط: ['مسقط', 'مطرح', 'بوشر', 'السيب', 'العامرات', 'قريات'],
  ظفار: ['صلالة', 'طاقة', 'مرباط', 'رخيوت', 'ثمريت', 'ضلكوت', 'المزيونة', 'مقشن', 'شليم وجزر الحلانيات', 'سدح'],
  مسندم: ['خصب', 'دبا', 'بخاء', 'مدحاء'],
  البريمي: ['البريمي', 'محضة', 'السنينة'],
  الداخلية: ['نزوى', 'بهلا', 'منح', 'الحمراء', 'آدم', 'إزكي', 'سمائل', 'بدبد', 'الجبل الأخضر'],
  'شمال الباطنة': ['صحار', 'شناص', 'لوى', 'صحم', 'الخابورة', 'السويق'],
  'جنوب الباطنة': ['الرستاق', 'العوابي', 'نخل', 'وادي المعاول', 'بركاء', 'المصنعة'],
  'جنوب الشرقية': ['صور', 'الكامل والوافي', 'جعلان بني بوحسن', 'جعلان بني بو علي', 'مصيرة'],
  'شمال الشرقية': ['إبراء', 'المضيبي', 'بدية', 'القابل', 'وادي بني خالد', 'دماء والطائيين', 'سناو'],
  الظاهرة: ['عبري', 'ينقل', 'ضنك'],
  الوسطى: ['هيما', 'محوت', 'الدقم', 'الجازر'],
};

const shippingOptions: Record<
  ShippingMethod,
  { label: string; price: number; duration: string; payment: string }
> = {
  office: {
    label: 'توصيل للمكتب',
    price: 1,
    duration: '1-2 يوم عمل',
    payment: 'تحويل بنكي',
  },
  home: {
    label: 'توصيل للمنزل',
    price: 2,
    duration: '2-4 أيام عمل',
    payment: 'تحويل بنكي',
  },
};

const DISCOUNT_CODE = 'مرقاب';
const DISCOUNT_RATE = 0.013;

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { items, getTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'سلطنة عمان',
    governorate: '',
    city: '',
    addressDetails: '',
    notes: '',
    shippingMethod: 'office' as ShippingMethod,
  });

  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [couponCode, setCouponCode] = useState(DISCOUNT_CODE);
  const [isCouponApplied, setIsCouponApplied] = useState(true);
  const [couponStatus, setCouponStatus] = useState('');

  const subtotal = getTotal();
  const shippingCost = shippingOptions[formData.shippingMethod].price;
  const discountAmount = isCouponApplied ? subtotal * DISCOUNT_RATE : 0;
  const total = subtotal - discountAmount + shippingCost;
  const wilayahOptions = governorateToWilayah[formData.governorate] || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'governorate') {
      setFormData(prev => ({ ...prev, governorate: value, city: '' }));
      return;
    }

    if (name === 'shippingMethod') {
      setFormData(prev => ({ ...prev, shippingMethod: value as ShippingMethod }));
      return;
    }

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

  const applyCoupon = () => {
    if (couponCode.trim() === DISCOUNT_CODE) {
      setIsCouponApplied(true);
      setCouponStatus(`تم تطبيق خصم ${(DISCOUNT_RATE * 100).toFixed(2)}% بنجاح`);
      return;
    }

    setIsCouponApplied(false);
    setCouponStatus('كود الخصم غير صالح');
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
      const productNames = items.map(item => `${item.name} × ${item.quantity || 1}`).join('، ');
      const noteLines = [
        formData.addressDetails ? `تفاصيل العنوان: ${formData.addressDetails}` : '',
        formData.notes ? `ملاحظات الطلب: ${formData.notes}` : '',
        isCouponApplied ? `كوبون الخصم: ${DISCOUNT_CODE} (${(DISCOUNT_RATE * 100).toFixed(2)}%)` : '',
      ].filter(Boolean);

      const fileName = `${Date.now()}-${receiptImage.name}`;

      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptImage);

      if (uploadError) {
        alert('فشل رفع صورة الإيصال');
        console.log(uploadError);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(fileName);

      const { error } = await supabase.from('orders').insert([
        {
          customer_name: formData.fullName,
          phone: formData.phone,
          product_name: productNames,
          total,
          payment_status: 'pending',
          receipt_url: publicUrl.publicUrl,
          governorate: formData.governorate,
          city: formData.city,
          notes: noteLines.join(' | '),
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
    <form onSubmit={handleSubmit} dir="rtl" className="min-h-screen bg-[#F8F7F2] py-8 px-4 text-[#0F3A2B]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <ChevronRight className="text-[#0F3A2B]" />
          <span className="font-semibold text-[#0F3A2B]">العودة للسلة</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-[#0F3A2B]">إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">معلومات العميل</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="الاسم الكامل"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="+968 XXXX XXXX"
                  required
                />

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#F6F4EE] outline-none"
                />

                <select
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] outline-none focus:border-[#0F3A2B]"
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {Object.keys(governorateToWilayah).map(governorate => (
                    <option key={governorate} value={governorate}>
                      {governorate}
                    </option>
                  ))}
                </select>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!formData.governorate}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] outline-none focus:border-[#0F3A2B] disabled:bg-[#F6F4EE] disabled:cursor-not-allowed"
                  required
                >
                  <option value="">اختر الولاية / المدينة</option>
                  {wilayahOptions.map(wilayah => (
                    <option key={wilayah} value={wilayah}>
                      {wilayah}
                    </option>
                  ))}
                </select>

                <textarea
                  name="addressDetails"
                  value={formData.addressDetails}
                  onChange={handleInputChange}
                  className="md:col-span-2 w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  rows={2}
                  placeholder="تفاصيل العنوان (اختياري)"
                />

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="md:col-span-2 w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  rows={3}
                  placeholder="ملاحظات الطلب (اختياري)"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">طرق الشحن</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(shippingOptions) as [ShippingMethod, (typeof shippingOptions)[ShippingMethod]][]).map(
                  ([key, option]) => (
                    <label
                      key={key}
                      className={`rounded-2xl border px-5 py-4 cursor-pointer text-[#0F3A2B] transition ${
                        formData.shippingMethod === key
                          ? 'border-[#0F3A2B] bg-[#F7F3EA]'
                          : 'border-[#E8E3D9] bg-[#FBF7EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="font-semibold">{option.label}</span>
                        <span className="flex items-center gap-2">
                          <span>{option.price.toFixed(2)} ر.ع</span>
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={key}
                            checked={formData.shippingMethod === key}
                            onChange={handleInputChange}
                            className="accent-[#0F3A2B]"
                          />
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-[#2F4D42]">
                        <p>مدة التوصيل: {option.duration}</p>
                        <p>طريقة الدفع: {option.payment}</p>
                      </div>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">طريقة الدفع</h2>

              <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] p-5 mb-6 text-[#0F3A2B]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-lg">تحويل بنكي</span>
                  <span className="text-sm bg-[#0F3A2B] text-white px-3 py-1 rounded-full">يدوي</span>
                </div>

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
                  dragActive ? 'bg-[#FBF7EF] border-[#0F3A2B]' : 'bg-[#FFFEFC] border-[#E8E3D9]'
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
                    {receiptFileName ? `تم الرفع: ${receiptFileName}` : 'رفع صورة التحويل / إرفاق إثبات الدفع'}
                  </span>
                  <span className="text-sm text-[#5D6D66] mt-2">PNG / JPG</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 sticky top-24 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">ملخص الطلب</h2>

              <div className="space-y-4 mb-6 text-[#0F3A2B]">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E8E3D9] bg-[#F7F3EA]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-[#4F665D]">الكمية: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <b className="whitespace-nowrap">{(item.price * (item.quantity || 1)).toFixed(2)} ر.ع</b>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] p-4 mb-5">
                <label className="block font-semibold mb-2">كوبون الخصم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value);
                      setIsCouponApplied(false);
                      setCouponStatus('');
                    }}
                    className="flex-1 px-3 py-2 border border-[#D9D2C3] rounded-xl bg-white outline-none focus:border-[#0F3A2B]"
                    placeholder="أدخل كود الخصم"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-4 py-2 rounded-xl bg-[#0F3A2B] text-white font-semibold"
                  >
                    تطبيق
                  </button>
                </div>
                {couponStatus && (
                  <p className={`text-sm mt-2 ${isCouponApplied ? 'text-green-700' : 'text-red-600'}`}>
                    {couponStatus}
                  </p>
                )}
              </div>

              <div className="flex justify-between mb-3 text-[#0F3A2B]">
                <span>المنتجات:</span>
                <span>{subtotal.toFixed(2)} ر.ع</span>
              </div>

              <div className="flex justify-between mb-3 text-[#0F3A2B]">
                <span>الخصم:</span>
                <span>-{discountAmount.toFixed(2)} ر.ع</span>
              </div>

              <div className="flex justify-between mb-6 text-[#0F3A2B]">
                <span>رسوم التوصيل:</span>
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
