import { useState } from 'react';
import { Wrench, ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface WorkshopProps {
  onNavigate: (page: string) => void;
}

export default function Workshop({ onNavigate }: WorkshopProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    droneModel: '',
    issueDescription: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة إرسال الطلب بنجاح
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section className="min-h-screen bg-[#F8F7F2] px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        
        {/* رأس الصفحة التعريفي */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0F3A2B] text-white shadow-lg">
            <Wrench className="h-9 w-9" />
          </div>
          <span className="inline-block rounded-full bg-[#0F3A2B]/10 px-4 py-1.5 text-xs font-bold text-[#0F3A2B] tracking-wider mb-3">
            ورشة مرقاب الاحترافية
          </span>
          <h1 className="mb-4 text-3xl font-black text-[#0F3A2B] md:text-5xl">
            صيانة وإصلاح الدرونات
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#6E7F76] md:text-lg">
            نقدم خدمات فحص وصيانة وإصلاح الدرونات وملحقاتها بأيدي مختصين في سلطنة عمان، مع تشخيص دقيق للحالة قبل بدء الإصلاح.
          </p>
        </div>

        {/* نموذج طلب الصيانة الفاخر */}
        <div className="overflow-hidden rounded-[32px] border border-[#E5E1D8] bg-white shadow-xl">
          
          <div className="bg-[#0F3A2B] px-8 py-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#D8C99B]" />
              نموذج طلب صيانة أو فحص درون
            </h2>
            <p className="text-sm text-[#B8C0BA] mt-1">
              املأ البيانات التالية وسيقوم فريق الصيانة بالتواصل معك في أقرب وقت.
            </p>
          </div>

          <div className="p-6 md:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0F3A2B]/10 text-[#0F3A2B]">
                  <CheckCircle2 className="h-10 w-10 text-[#0F3A2B]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F3A2B] mb-2">
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-[#6E7F76] max-w-md mx-auto mb-8">
                  شكراً لك {formData.name}، تم تسجيل تفاصيل مشكلة الدرون وسيتواصل معك فني الصيانة عبر رقم الهاتف المدرج قريباً جداً.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', droneModel: '', issueDescription: '', image: null });
                    setImagePreview(null);
                  }}
                  className="rounded-full bg-[#0F3A2B] px-8 py-3.5 font-bold text-white transition-all hover:scale-105 shadow-md"
                >
                  تقديم طلب صيانة آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الاسم الكامل */}
                  <div>
                    <label className="block text-sm font-bold text-[#0F3A2B] mb-2 text-right">
                      الاسم الكريم <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 py-3.5 text-right text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:bg-white focus:ring-2 focus:ring-[#0F3A2B]/10"
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label className="block text-sm font-bold text-[#0F3A2B] mb-2 text-right">
                      رقم الهاتف / واتساب <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 968XXXXXXXX+"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 py-3.5 text-right text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:bg-white focus:ring-2 focus:ring-[#0F3A2B]/10"
                    />
                  </div>
                </div>

                {/* نوع الدرون */}
                <div>
                  <label className="block text-sm font-bold text-[#0F3A2B] mb-2 text-right">
                    نوع وموديل الدرون <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: DJI Mavic 3 Pro / DJI Mini 4 Pro"
                    value={formData.droneModel}
                    onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                    className="w-full rounded-2xl border border-[#E5E1D8] bg-[#F9F8F5] px-4 py-3.5 text-right text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:bg-white focus:ring-2 focus:ring-[#0F3A2B]/10"
                  />
                </div>

                {/* وصف المشكلة أو الكسر */}
                <div>
                  <label className="block text-sm font-bold text-[#0F3A2B] mb-2 text-right">
                    تفاصيل المشكلة أو الكسر <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="اشرح المشكلة بالتفصيل (مثل: مشكلة في المحركات، كسر في الذراع، لا تقلع، خطأ في الكاميرا...)"
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    className="w-full rounded-2xl border border-[#E5E1D8] bg-[#F9F8F5] p-4 text-right text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:bg-white focus:ring-2 focus:ring-[#0F3A2B]/10 resize-none"
                  />
                </div>

                {/* رفع صورة الدرون أو مكان الكسر */}
                <div>
                  <label className="block text-sm font-bold text-[#0F3A2B] mb-2 text-right">
                    إرفاق صورة للدرون أو مكان الإصابة / الكسر <span className="text-gray-400 font-normal">(اختياري)</span>
                  </label>
                  
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8CFB8] bg-[#F9F8F5] p-6 text-center hover:bg-[#F3F0E6] transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={imagePreview}
                          alt="معاينة الصورة"
                          className="h-32 w-auto object-cover rounded-xl shadow-md mb-2 border border-[#E5E1D8]"
                        />
                        <span className="text-xs font-semibold text-[#0F3A2B]">اضغط لتغيير الصورة المرفقة</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-2 rounded-full bg-[#0F3A2B]/10 p-3 text-[#0F3A2B]">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-[#0F3A2B]">اضغط هنا لرفع الصورة أو اسحبها وأفلتها هنا</p>
                        <p className="text-xs text-[#6E7F76] mt-1">PNG, JPG, JPEG حتى 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ملاحظة توجيهية */}
                <div className="flex items-center gap-3 rounded-2xl bg-[#FFFDF7] p-4 border border-[#E5E1D8]">
                  <AlertCircle className="h-5 w-5 text-[#D8C99B] shrink-0" />
                  <p className="text-xs text-[#6E7F76] leading-relaxed text-right">
                    سيتم مراجعة الطلب وفحص التفاصيل المرفقة، وسيتواصل معك الفني المختص لتأكيد موعد استلام الدرون أو إرساله للورشة.
                  </p>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E1D8]">
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#0F3A2B] px-7 py-3.5 font-bold text-[#0F3A2B] transition hover:bg-[#0F3A2B]/5"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    العودة للرئيسية
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0F3A2B] px-10 py-3.5 font-bold text-white transition hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <span>جاري إرسال الطلب...</span>
                    ) : (
                      <>
                        <Wrench className="h-5 w-5 text-[#D8C99B]" />
                        <span>إرسال طلب الصيانة</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
