import { useState, useEffect } from 'react';
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
interface ShippingOption {
  key: string;
  label: string;
  price: number;
  duration: string;
}

interface DiscountCodeRow {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

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

const FALLBACK_SHIPPING: ShippingOption[] = [
  { key: 'office', label: 'توصيل للمكتب', price: 1, duration: '2-4 أيام عمل' },
  { key: 'home',   label: 'توصيل للمنزل', price: 2, duration: '2-4 أيام عمل' },
];

const FALLBACK_BANK = {
  bank_account_name:         'HAMAD################BAL',
  bank_account_number:       '0401063526560013',
  bank_transfer_number:      '90977867',
  bank_payment_instructions: '',
};

const formatPrice = (amount: number) => `${amount.toFixed(2)} ر.ع`;

export default function Checkout({ onBack, onSuccess }: CheckoutProps) {
  const { items, getTotal, clearCart } = useCart();
  const checkoutItems = items;

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(FALLBACK_SHIPPING);
  const [bankInfo, setBankInfo] = useState(FALLBACK_BANK);
  
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash_on_delivery'>('bank_transfer');

  useEffect(() => {
    supabase
      .from('shipping_methods')
      .select('key, label, price, duration')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setShippingOptions(
            data.map(m => ({
              key: m.key,
              label: m.label,
              price: Number(m.price),
              duration: m.duration ?? '',
            }))
          );
        }
      })
      .catch(() => {});

    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['bank_account_name', 'bank_account_number', 'bank_transfer_number', 'bank_payment_instructions'])
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
          setBankInfo(prev => ({ ...prev, ...map }));
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'سلطنة عمان',
    governorate: '',
    city: '',
    addressDetails: '',
    notes: '',
    shippingMethod: 'office',
  });

  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponStatus, setCouponStatus] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; label: string; codeId?: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getTotal();
  const selectedShipping = shippingOptions.find(s => s.key === formData.shippingMethod) ?? shippingOptions[0];
  const shippingCost = selectedShipping?.price ?? 0;
  const discountAmount = appliedDiscount?.amount ?? 0;
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
      setFormData(prev => ({ ...prev, shippingMethod: value }));
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

  const applyCoupon = async () => {
    const trimmedCode = couponCode.trim();
    if (!trimmedCode) return;

    setIsApplyingCoupon(true);
    setCouponStatus('');

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', trimmedCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        setIsCouponApplied(false);
        setAppliedDiscount(null);
        setCouponStatus('كود الخصم غير صالح');
        setIsApplyingCoupon(false);
        return;
      }

      const coupon = data as DiscountCodeRow;
      const now = new Date();

      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        setIsCouponApplied(false);
        setAppliedDiscount(null);
        setCouponStatus('كود الخصم لم يبدأ بعد');
        setIsApplyingCoupon(false);
        return;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        setIsCouponApplied(false);
        setAppliedDiscount(null);
        setCouponStatus('انتهت صلاحية كود الخصم');
        setIsApplyingCoupon(false);
        return;
      }

      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        setIsCouponApplied(false);
        setAppliedDiscount(null);
        setCouponStatus('تم استخدام هذا الكود بالحد الأقصى');
        setIsApplyingCoupon(false);
        return;
      }

      if (coupon.min_order !== null && subtotal < coupon.min_order) {
        setIsCouponApplied(false);
        setAppliedDiscount(null);
        setCouponStatus(`الحد الأدنى للطلب هو ${formatPrice(coupon.min_order)}`);
        setIsApplyingCoupon(false);
        return;
      }

      const discountAmt =
        coupon.discount_type === 'percentage'
          ? (subtotal * coupon.discount_value) / 100
          : coupon.discount_value;

      const label =
        coupon.discount_type === 'percentage'
          ? `${coupon.code} (${coupon.discount_value}%)`
          : `${coupon.code} (${formatPrice(coupon.discount_value)})`;

      setAppliedDiscount({ amount: discountAmt, label, codeId: coupon.id });
      setIsCouponApplied(true);
      setCouponStatus('تم تطبيق كود الخصم بنجاح');
    } catch {
      setIsCouponApplied(false);
      setAppliedDiscount(null);
      setCouponStatus('كود الخصم غير صالح');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    setIsCouponApplied(false);
    setAppliedDiscount(null);
    setCouponStatus('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (checkoutItems.length === 0) {
      alert('لا يوجد منتج لإتمام الطلب');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.governorate || !formData.city) {
      alert('يرجى تعبئة جميع البيانات المطلوبة');
      return;
    }

    if (!receiptImage) {
      alert(paymentMethod === 'bank_transfer' ? 'يرجى رفع صورة الإيصال للتحويل الكامل' : 'يرجى رفع صورة إيصال تحويل العربون لتأكيد الطلب');
      return;
    }

    setIsSubmitting(true);

    try {
      const productNames = checkoutItems
        .map(item => `${item.name} × ${item.quantity || 1}`)
        .join('، ');
      
      const paymentMethodNote = paymentMethod === 'cash_on_delivery' 
        ? 'العربون 5 ر.ع والباقي عند الاستلام' 
        : 'تحويل بنكي كامل';

      const noteLines = [
        `طريقة الدفع: ${paymentMethodNote}`,
        formData.addressDetails ? `تفاصيل العنوان: ${formData.addressDetails}` : '',
        formData.notes ? `ملاحظات الطلب: ${formData.notes}` : '',
        isCouponApplied && appliedDiscount
          ? `كوبون الخصم: ${appliedDiscount.label}`
          : '',

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

      const { data: insertedOrder, error } = await supabase.from('orders').insert([
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
          payment_method: paymentMethod, 
        },
      ]).select('id').single();

      if (error) {
        alert('فشل الطلب: ' + error.message);
        console.error('Supabase error:', error);
        setIsSubmitting(false);
        return;
      }

      try {
        for (const item of checkoutItems as any[]) {
          if (item.is_auction_buy_now && item.auction_id) {
            await supabase.from('auctions').update({
              status:'ended',
              is_active:false,
              buy_now_enabled:false,
              sold_via_buy_now:true
            }).eq('id', item.auction_id);
          }
        }

        if (isCouponApplied && appliedDiscount?.codeId) {
          await supabase.rpc('increment_coupon_used_count', {
            coupon_id: appliedDiscount.codeId,
          });
        }
      } catch (couponError) {
        console.warn('Coupon usage update failed, but order was created:', couponError);
      }

      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');

      savedOrders.push({
        id: insertedOrder.id
      });

      localStorage.setItem('orders', JSON.stringify(savedOrders));

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
          <span className="font-semibold text-[#0F3A2B]">
            العودة للسلة
          </span>
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
                  className="w-full px-4 py-3 border border-[#E5DDCE] rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  placeholder="الاسم الكامل"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#E5DDCE] rounded-2xl text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
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
                  className="w-full px-4 py-3 border border-[#E5DDCE] rounded-2xl text-[#0F3A2B] bg-[#F6F4EE] outline-none"
                />

                <Select
                  name="governorate"
                  required
                  value={formData.governorate}
                  onValueChange={value => setFormData(prev => ({ ...prev, governorate: value, city: '' }))}
                >
                  <SelectTrigger 
                    className="!w-full !h-[50px] !px-4 !py-3 !border !border-[#E5DDCE] !rounded-2xl !bg-[#F6F4EE] !text-[#0F3A2B] !shadow-none !outline-none !ring-0 focus:!border-[#0F3A2B] focus:!ring-0 flex items-center justify-between text-right [&_svg]:size-[18px] [&_svg]:text-[#6E7B74]"
                  >
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
                        className="mb-1 min-h-[46px] rounded-2xl px-4 py-3 text-[15px] font-medium text-[#0F3A2B] outline-none transition data-[highlighted]:bg-[#0F3A2B] data-[highlighted]:text-[#FFFEF8] data-[state=checked]:bg-[#0F3A2B] data-[state=checked]:text-[#FFFEF8] last:mb-0"
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
                  <SelectTrigger 
                    className="!w-full !h-[50px] !px-4 !py-3 !border !border-[#E5DDCE] !rounded-2xl !bg-[#F6F4EE] !text-[#0F3A2B] !shadow-none !outline-none !ring-0 focus:!border-[#0F3A2B] focus:!ring-0 flex items-center justify-between text-right [&_svg]:size-[18px] [&_svg]:text-[#6E7B74]"
                  >
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
                        className="mb-1 min-h-[46px] rounded-2xl px-4 py-3 text-[15px] font-medium text-[#0F3A2B] outline-none transition data-[highlighted]:bg-[#0F3A2B] data-[highlighted]:text-[#FFFEF8] data-[state=checked]:bg-[#0F3A2B] data-[state=checked]:text-[#FFFEF8] last:mb-0"
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
                  className="md:col-span-2 w-full px-4 py-3 border border-[#E5DDCE] rounded-2xl resize-none text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  rows={2}
                  placeholder="تفاصيل العنوان (اختياري)"
                />

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="md:col-span-2 w-full px-4 py-3 border border-[#E5DDCE] rounded-2xl resize-none text-[#0F3A2B] bg-[#FFFEFC] placeholder:text-gray-400 outline-none focus:border-[#0F3A2B]"
                  rows={3}
                  placeholder="ملاحظات الطلب (اختياري)"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">طرق الشحن</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingOptions.map(option => {
                  const isSelected = formData.shippingMethod === option.key;
                  return (
                    <label
                      key={option.key}
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
                            {option.key === 'office' ? <Building2 className="w-5 h-5" /> : <House className="w-5 h-5" />}
                          </span>
                          <span className="font-bold text-[15px] text-[#0F3A2B]">{option.label}</span>
                        </div>

                        <input
                          type="radio"
                          name="shippingMethod"
                          value={option.key}
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

                      {option.duration && (
                        <p className="text-sm text-[#2F4D42]">مدة التوصيل: {option.duration}</p>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ECE7DC]">
              <h2 className="text-2xl font-bold mb-6 text-[#0F3A2B]">طريقة الدفع</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`rounded-2xl border-2 px-5 py-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#0F3A2B] bg-[#F6F1E6] shadow-[0_8px_20px_rgba(15,58,43,0.08)]'
                      : 'border-[#E5DDCE] bg-[#FEFCF7] hover:border-[#CFC5B3]'
                  }`}
                >
                  <span className="font-bold text-[15px]">تحويل بنكي</span>
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'bank_transfer' ? 'border-[#0F3A2B] bg-[#0F3A2B]' : 'border-[#B0A99A]'
                    }`}
                  >
                    {paymentMethod === 'bank_transfer' && <span className="w-2 h-2 rounded-full bg-white block" />}
                  </span>
                </div>

                <div
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`rounded-2xl border-2 px-5 py-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-[#0F3A2B] bg-[#F6F1E6] shadow-[0_8px_20px_rgba(15,58,43,0.08)]'
                      : 'border-[#E5DDCE] bg-[#FEFCF7] hover:border-[#CFC5B3]'
                  }`}
                >
                  <span className="font-bold text-[15px]">الدفع عند الاستلام</span>
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cash_on_delivery' ? 'border-[#0F3A2B] bg-[#0F3A2B]' : 'border-[#B0A99A]'
                    }`}
                  >
                    {paymentMethod === 'cash_on_delivery' && <span className="w-2 h-2 rounded-full bg-white block" />}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8E3D9] bg-[#FBF7EF] p-5 mb-6 text-[#0F3A2B]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-lg">
                    {paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'الدفع عند الاستلام'}
                  </span>
                  <span aria-label="طريقة دفع يدوية عبر التحويل البنكي" className="text-sm bg-[#0F3A2B] text-white px-3 py-1 rounded-full">يدوي</span>
                </div>

                {paymentMethod === 'cash_on_delivery' && (
                  <p className="text-sm text-[#0F3A2B] font-medium mb-4 p-3 bg-[#F0EAE1] rounded-xl border border-[#E3DAC9]">
                    يرجى تحويل عربون لا يقل عن 5 ر.ع لتأكيد الطلب، ويتم دفع باقي المبلغ عند الاستلام.
                  </p>
                )}

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>اسم الحساب:</span>
                    <b>{bankInfo.bank_account_name}</b>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>رقم الحساب:</span>
                    <b>{bankInfo.bank_account_number}</b>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>رقم التحويل:</span>
                    <b>{bankInfo.bank_transfer_number}</b>
                  </div>

                  <div className="flex justify-between gap-4 text-lg border-t border-[#E8E3D9] pt-2 mt-2">
                    <span>{paymentMethod === 'bank_transfer' ? 'المبلغ المطلوب:' : 'العربون المطلوب:'}</span>
                    <b className="text-xl text-[#0F3A2B]">
                      {paymentMethod === 'bank_transfer' ? formatPrice(total) : formatPrice(5)}
                    </b>
                  </div>

                  {bankInfo.bank_payment_instructions && (
                    <p className="text-sm text-[#4F665D] pt-2 border-t border-[#E8E3D9] mt-2">
                      {bankInfo.bank_payment_instructions}
                    </p>
                  )}
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
                    {receiptFileName 
                      ? `تم الرفع: ${receiptFileName}` 
                      : paymentMethod === 'bank_transfer' 
                        ? 'رفع صورة التحويل / إرفاق إثبات الدفع' 
                        : 'إرفاق إيصال تحويل العربون (5 ر.ع)'}
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
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={`صورة المنتج ${item.name}`}
                          className="w-14 h-14 rounded-xl object-cover border border-[#E8E3D9] bg-[#F7F3EA]"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E8E3D9] bg-[#F7F3EA] text-xs font-bold">
                          مزاد
                        </div>
                      )}
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
      disabled={isApplyingCoupon}
      className="px-4 py-2 rounded-xl bg-[#0F3A2B] text-white font-semibold disabled:opacity-60"
    >
      {isApplyingCoupon ? '...' : 'تطبيق'}
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
  <span>الخصم:</span>
  <span>-{formatPrice(discountAmount)}</span>
</div>

              <div className="flex justify-between mb-6 text-[#0F3A2B]">
                <span>رسوم التوصيل:</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold mb-6 text-[#0F3A2B]">
                <span>الإجمالي الكامل:</span>
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
                تأكيد الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
