import { useState } from 'react';
import { Wrench, ArrowLeft, Upload, CheckCircle2, AlertCircle, Cpu, Settings, ShieldCheck } from 'lucide-react';

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

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07241A] px-4 py-16 md:py-24 text-white">
      
      {/* خلفية فخمة تمزج الفضاء الأخضر الميكانيكي مع تأثيرات ضوئية */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#104835] via-[#0F3A2B]/40 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#051C14] via-[#0B3124]/50 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-t from-[#0F3A2B]/30 to-transparent blur-2xl opacity-50" />
        
        {/* شبكة ميكانيكية هندسية خفيفة في الخلفية */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F3A2B15_1px,transparent_1px),linear-gradient(to_bottom,#0F3A2B15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* رأس الصفحة الفخم */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C99B]/30 bg-[#0F3A2B]/60 px-5 py-2 text-xs font-bold text-[#E5D8AA] backdrop-blur-md shadow-lg mb-6 tracking-widest">
            <Cpu className="h-4 w-4 text-[#D8C99B] animate-pulse" />
            ورشة صيانة وفحص الدرونات المتقدمة
          </div>

          <h1 className="mb-5 text-4xl font-black tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F4F0DD] to-[#D8C99B]">
            مركز صيانة وإصلاح مرقاب
          </h1>
          
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#B8C0BA] md:text-lg">
            نقدم هندسة صيانة دقيقة، وفحص شامل للأعطال، وإصلاح احترافي للدرونات وملحقاتها بأحدث التقنيات وبأيدي خبراء معتمدين في سلطنة عمان.
          </p>

          {/* شارات مميزات سريعة */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-semibold text-[#D8C99B]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F3A2B]/80 border border-[#D8C99B]/20 px-4 py-2">
              <ShieldCheck className="h-4 w-4" /> فحص وتشخيص دقيق
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F3A2B]/80 border border-[#D8C99B]/20 px-4 py-2">
              <Settings className="h-4 w-4 animate-spin" style={{ animationDuration: '8s' }} /> قطع أصلية معتمدة
            </span>
          </div>
        </div>

        {/* نموذج الطلب الميكانيكي الفاخر */}
        <div className="relative overflow-hidden rounded-[36px] border border-[#D8C99B]/30 bg-[#092D21]/80 backdrop-blur-xl shadow-[0_25px_60px_rgba(4,20,15,0.7)]">
          
          {/* إطار علوي مضيء */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8C99B] to-transparent opacity-70" />

          <div className="bg-gradient-to-r from-[#0F3A2B] to-[#0A2D21] px-8 py-6 border-b border-[#0F3A2B]">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8C99B]/15 border border-[#D8C99B]/30 text-[#D8C99B]">
                <Wrench className="h-5 w-5" />
              </span>
              تسجيل طلب صيانة أو فحص درون
            </h2>
            <p className="text-sm text-[#A3B2A8] mt-1 mr-13">
              املأ البيانات التالية ليتواصل معك مهندس الصيانة المختص مباشرة.
            </p>
          </div>

          <div className="p-6 md:p-10">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#D8C99B]/15 border border-[#D8C99B]/40 text-[#D8C99B]">
                  <CheckCircle2 className="h-10 w-10 text-[#D8C99B]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-[#B8C0BA] max-w-md mx-auto mb-8 text-base">
                  شكراً لك <span className="text-white font-bold">{formData.name}</span>، تم حفظ تفاصيل المشكلة وسنتواصل معك عبر رقم الهاتف المدرج في أقرب وقت لإتمام عملية الفحص.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', droneModel: '', issueDescription: '', image: null });
                    setImagePreview(null);
                  }}
                  className="rounded-full bg-gradient-to-r from-[#D8C99B] to-[#C2B284] px-9 py-4 font-bold text-[#07241A] transition-all hover:scale-105 shadow-xl hover:shadow-[0_0_25px_rgba(216,201,155,0.4)]"
                >
                  تقديم طلب صيانة آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الاسم الكامل */}
                  <div>
                    <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                      الاسم الكريم <span className="text-[#D8C99B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-[#0F3A2B] bg-[#051C14]/90 px-4 py-3.5 text-right text-white placeholder-[#5C7368] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20"
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                      رقم الهاتف / واتساب <span className="text-[#D8C99B]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 968XXXXXXXX+"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border border-[#0F3A2B] bg-[#051C14]/90 px-4 py-3.5 text-right text-white placeholder-[#5C7368] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20"
                    />
                  </div>
                </div>

                {/* نوع الدرون */}
                <div>
                  <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                    نوع وموديل الدرون <span className="text-[#D8C99B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: DJI Mavic 3 Pro / DJI Mini 4 Pro / FPV"
                    value={formData.droneModel}
                    onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                    className="w-full rounded-2xl border border-[#0F3A2B] bg-[#051C14]/90 px-4 py-3.5 text-right text-white placeholder-[#5C7368] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20"
                  />
                </div>

                {/* وصف المشكلة أو الكسر */}
                <div>
                  <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                    تفاصيل المشكلة أو الكسر <span className="text-[#D8C99B]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="اشرح العطل بالتفصيل (مثل: مشكلة في المحركات، كسر في الذراع، لا تقلع، خطأ في نظام الملاحة أو الكاميرا...)"
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    className="w-full rounded-2xl border border-[#0F3A2B] bg-[#051C14]/90 p-4 text-right text-white placeholder-[#5C7368] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20 resize-none"
                  />
                </div>

                {/* رفع صورة الدرون أو مكان الكسر */}
                <div>
                  <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                    إرفاق صورة للدرون أو مكان الإصابة / الكسر <span className="text-[#789087] font-normal">(اختياري)</span>
                  </label>
                  
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0F3A2B] bg-[#051C14]/60 p-6 text-center hover:border-[#D8C99B]/50 hover:bg-[#051C14] transition cursor-pointer group">
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
                          className="h-32 w-auto object-cover rounded-xl shadow-lg mb-2 border border-[#D8C99B]/30"
                        />
                        <span className="text-xs font-semibold text-[#D8C99B]">اضغط لتغيير الصورة المرفقة</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-2 rounded-full bg-[#0F3A2B] p-3 text-[#D8C99B] group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-white">اضغط هنا لرفع الصورة أو اسحبها وأفلتها هنا</p>
                        <p className="text-xs text-[#8FA297] mt-1">PNG, JPG, JPEG حتى 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ملاحظة توجيهية */}
                <div className="flex items-center gap-3 rounded-2xl bg-[#051C14] p-4 border border-[#0F3A2B]">
                  <AlertCircle className="h-5 w-5 text-[#D8C99B] shrink-0" />
                  <p className="text-xs text-[#A3B2A8] leading-relaxed text-right">
                    يتم فحص الصور والبيانات بعناية تامة في ورشة مرقاب، وسنقوم بإبلاغك بتقديرات التكلفة وخيارات الإصلاح قبل البدء بأي خطوة.
                  </p>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0F3A2B]">
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#D8C99B]/30 px-7 py-3.5 font-bold text-[#E5D8AA] transition hover:bg-[#0F3A2B]/40 hover:border-[#D8C99B]"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    العودة للرئيسية
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D8C99B] to-[#C2B284] px-10 py-3.5 font-extrabold text-[#07241A] transition hover:scale-105 shadow-lg shadow-[#D8C99B]/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>جاري إرسال الطلب للورشة...</span>
                    ) : (
                      <>
                        <Wrench className="h-5 w-5 text-[#07241A]" />
                        <span>إرسال طلب الصيانة الفوري</span>
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
