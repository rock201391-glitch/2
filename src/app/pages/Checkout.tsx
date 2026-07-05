import { useState } from 'react';
import { ChevronRight, Upload, Building2, House, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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
  { label: string; price: number; duration: string }
> = {
  office: {
    label: 'توصيل للمكتب',
    price: 1,
    duration: '2-4 أيام عمل',
  },
  home: {
    label: 'توصيل للمنزل',
    price: 2,
    duration: '2-4 أيام عمل',
  },
};

const DISCOUNT_CODE = 'مرقاب';
// 1.30% discount represented as a decimal ratio.
const DISCOUNT_RATE = 0.013;
const DISCOUNT_PERCENTAGE_LABEL = `${(DISCOUNT_RATE * 100).toFixed(2)}%`;

const formatPrice = (amount: number) => `${amount.toFixed(2)} ر.ع`;

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
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
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
      setCouponStatus('تم تطبيق كود الخصم بنجاح');
      return;
    }

    setIsCouponApplied(false);
    setCouponStatus('كود الخصم غير صالح');
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    setIsCouponApplied(false);
    setCouponStatus('');
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
        isCouponApplied ? `كوبون الخصم: ${DISCOUNT_CODE} (${DISCOUNT_PERCENTAGE_LABEL})` : '',
      ].filter(Boolean);

      const fileName = `${Date.now()}-${receiptImage.name}`;

      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptImage);

      if (uploadError) {
        alert('فشل رفع صورة الإيصال');
        console.error(uploadError);
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
    <form onSubmit={handleSubmit} dir="rtl" lang="ar" className="min-h-screen bg-[#F8F7F2] py-8 px-4 text-[#0F3A2B]">
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
                  aria-label="الدولة ثابتة: سلطنة عمان"
                  title="الدولة ثابتة: سلطنة عمان"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-[#0F3A2B] bg-[#F6F4EE] outline-none"
                />

                <Select
                  name="governorate"
                  required
                  value={formData.governorate}
                  onValueChange={value => setFormData(prev => ({ ...prev, governorate: value, city: '' }))}
                >
                  <SelectTrigger className="h-auto w-full rounded-[22px] border border-[#DDD6C8] bg-[#FFFEFC] px-5 py-3.5 text-[15px] font-medium text-[#0F3A2B] shadow-sm outline-none transition-all duration-200 hover:border-[#BFB6A5] focus:border-[#0F3A2B] focus:shadow-[0_0_0_3px_rgba(15,58,43,0.08)] data-[placeholder]:text-[#7B867F] [&_svg]:size-[18px] [&_svg]:text-[#6E7B74]">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="rounded-[28px] border border-[#E8E1D4] bg-[#FFFEFC] p-2 shadow-[0_16px_34px_rgba(15,58,43,0.10)]"
                  >
                    {Object.keys(governorateToWilayah).map(governorate => (
                      <SelectItem
                        key={governorate}
                        value={governorate}
                        className="mb-1 min-h-[46px] rounded-2xl px-4 py-3 text-[15px] font-medium text-[#0F3A2B] outline-none transition data-[highlighted]:bg-[#F6F1E6] data-[state=checked]:bg-[#F6F1E6] last:mb-0"
                      >
                        {governorate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  name="city"
                  required
                  value={formData.city}
                  onValueChange={value => setFormData(prev => ({ ...prev, city: value }))}
                  disabled={!formData.governorate}
                >
                  <SelectTrigger className="h-auto w-full rounded-[22px] border border-[#DDD6C8] bg-[#FFFEFC] px-5 py-3.5 text-[15px] font-medium text-[#0F3A2B] shadow-sm outline-none transition-all duration-200 hover:border-[#BFB6A5] focus:border-[#0F3A2B] focus:shadow-[0_0_0_3px_rgba(15,58,43,0.08)] data-[placeholder]:text-[#7B867F] disabled:cursor-not-allowed disabled:border-[#E4DED1] disabled:bg-[#F6F4EE] disabled:text-[#7A8A83] [&_svg]:size-[18px] [&_svg]:text-[#6E7B74]">
                    <SelectValue placeholder="اختر الولاية / المدينة" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="rounded-[28px] border border-[#E8E1D4] bg-[#FFFEFC] p-2 shadow-[0_16px_34px_rgba(15,58,43,0.10)]"
                  >
                    {wilayahOptions.map(wilayah => (
                      <SelectItem
                        key={wilayah}
                        value={wilayah}
                        className="mb-1 min-h-[46px] rounded-2xl px-4 py-3 text-[15px] font-medium text-[#0F3A2B] outline-none transition data-[highlighted]:bg-[#F6F1E6] data-[state=checked]:bg-[#F6F1E6] last:mb-0"
                      >
                        {wilayah}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                  ([key, option]) => {
                    const isSelected = formData.shippingMethod === key;
                    return (
                      <label
                        key={key}
                        className={`rounded-2xl border-2 px-5 py-5 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-[#0F3A2B] bg-[#F6F1E6] shadow-[0_8px_20px_rgba(15,58,43,0.08)]'
                            : 'border-[#E5DDCE] bg-[#FEFCF7] hover:border-[#CFC5B3] hover:shadow-[0_4px_12px_rgba(15,58,43,0.06)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${
                                isSelected
                                  ? 'border-[#0F3A2B] bg-[#0F3A2B] text-white'
                                  : 'border-[#D9D0BE] bg-white text-[#0F3A2B]'
                              }`}
                            >
                              {key === 'office' ? <Building2 className="w-5 h-5" /> : <House className="w-5 h-5" />}
                            </span>
                            <span className="font-bold text-[15px] text-[#0F3A2B]">{option.label}</span>
                          </div>

                          <input
                            type="radio"
                            name="shippingMethod"
                            value={key}
                            checked={isSelected}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <span
                            className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                              isSelected
                                ? 'border-[#0F3A2B] bg-[#0F3A2B]'
                                : 'border-[#B0A99A] bg-white'
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white block" />}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 mb-2 text-[#0F3A2B]">
                          <span className="text-sm font-medium">رسوم الشحن</span>
                          <span className="font-semibold">{formatPrice(option.price)}</span>
                        </div>

                        <p className="text-sm text-[#2F4D42]">مدة التوصيل: {option.duration}</p>
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">طريقة الدفع</h2>

              <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] p-5 mb-6 text-[#0F3A2B]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-lg">تحويل بنكي</span>
                  <span aria-label="طريقة دفع يدوية عبر التحويل البنكي" className="text-sm bg-[#0F3A2B] text-white px-3 py-1 rounded-full">يدوي</span>
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
                    <b>{formatPrice(total)}</b>
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
                        alt={`صورة المنتج ${item.name}`}
                        className="w-14 h-14 rounded-xl object-cover border border-[#E8E3D9] bg-[#F7F3EA]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-sm text-[#4F665D]">الكمية: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <b className="whitespace-nowrap">{formatPrice(item.price * (item.quantity || 1))}</b>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] p-4 mb-5">
                <label className="block font-semibold mb-2">كوبون الخصم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={handleCouponChange}
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
                  isCouponApplied ? (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
                      <span>{couponStatus}</span>
                    </div>
                  ) : (
                    <p className="text-sm mt-2 text-red-600">{couponStatus}</p>
                  )
                )}
              </div>

              <div className="flex justify-between mb-3 text-[#0F3A2B]">
                <span>المنتجات:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between mb-3 text-[#0F3A2B]">
                <span>ا��خصم:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>

              <div className="flex justify-between mb-6 text-[#0F3A2B]">
                <span>رسوم التوصيل:</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6 text-[#0F3A2B]">
                <span>الإجمالي:</span>
                <span>{formatPrice(total)}</span>
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
