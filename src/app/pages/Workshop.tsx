import { useState } from 'react';
import { Wrench, ArrowLeft, Upload, CheckCircle2, AlertCircle, Cpu, Settings, ShieldCheck, Sparkles } from 'lucide-react';

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
    <section className="relative min-h-screen overflow-hidden bg-[#03140E] px-4 py-16 md:py-24 text-white">
      
      {/* خلفية فخمة توحي بالفضاء العميق والأخضر الميكانيكي */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* سدم ضوئية خضراء وذهبية تماثل الفضاء */}
        <div className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#0D3828] via-[#0F3A2B]/40 to-transparent blur-[120px] opacity-70 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 -left-48 h-[700px] w-[700px] rounded-full bg-gradient-to-tr from-[#020D09] via-[#082B1F]/60 to-transparent blur-[140px] opacity-80" />
        <div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-t from-[#0F3A2B]/40 via-[#134D38]/20 to-transparent blur-[100px] opacity-60" />
        
        {/* نجوم وشبكة ميكانيكية دقيقة متداخلة */}
        <div className="absolute inset-0 bg-[radial-gradient(#D8C99B_1px,transparent_1px)] [background-size:3rem_3rem] opacity-[0.08]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F3A2B18_1px,transparent_1px),linear-gradient(to_bottom,#0F3A2B18_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-40" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        
        {/* رأس الصفحة الفخم */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D8C99B]/40 bg-[#0A2E21]/80 px-6 py-2.5 text-xs font-bold text-[#E5D8AA] backdrop-blur-xl shadow-[0_0_20px_rgba(216,201,155,0.15)] mb-6 tracking-widest">
            <Sparkles className="h-4 w-4 text-[#D8C99B]" />
            <span>نظام ورشة مرقاب الفضائية والميكانيكية</span>
            <Cpu className="h-4 w-4 text-[#D8C99B]" />
          </div>

          <h1 className="mb-5 text-4xl font-black tracking-tight md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F7F2DF] to-[#D8C99B] drop-shadow-sm">
            صيانة وإصلاح الدرونات الاحترافية
          </h1>
          
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#A4B5AC] md:text-lg">
            نستقبل درونك ونعيد تشغيله بأحدث تقنيات الفحص الميكانيكي والبرمجي، مع تشخيص دقيق للأعطال والكسور بأيدي نخبة من المهندسين المعتمدين.
          </p>

          {/* مميزات سريعة بإطار ذهبي وأخضر فاخر */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-bold text-[#D8C99B]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#082B1F]/90 border border-[#D8C99B]/30 px-5 py-2 shadow-lg backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-[#D8C99B]" /> ضمان الفحص والتشخيص الدقيق
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#082B1F]/90 border border-[#D8C99B]/30 px-5 py-2 shadow-lg backdrop-blur-md">
              <Settings className="h-4 w-4 text-[#D8C99B] animate-spin" style={{ animationDuration: '10s' }} /> قطع غيار أصلية 100%
            </span>
          </div>
        </div>

        {/* نموذج الطلب الميكانيكي الفاخر */}
        <div className="relative overflow-hidden rounded-[38px] border border-[#D8C99B]/35 bg-[#062017]/85 backdrop-blur-2xl shadow-[0_30px_80px_rgba(2,15,10,0.85)]">
          
          {/* شريط ضوء ذهبي علوي متوهج */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D8C99B] to-transparent opacity-90 shadow-[0_0_15px_#D8C99B]" />

          <div className="bg-gradient-to-r from-[#0D3627] via-[#092B1F] to-[#051C14] px-8 py-6 border-b border-[#0F3A2B]">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D8C99B]/15 border border-[#D8C99B]/40 text-[#D8C99B] shadow-inner">
                <Wrench className="h-5 w-5" />
              </span>
              بوابة تقديم طلب صيانة أو كشف أعطال
            </h2>
            <p className="text-sm text-[#92A69B] mt-1 mr-14">
              املأ الحقول التالية بالأسفل وسيتواصل معك مهندس الورشة المختص فوراً.
            </p>
          </div>

          <div className="p-6 md:p-10">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#D8C99B]/20 border border-[#D8C99B]/50 text-[#D8C99B] shadow-[0_0_25px_rgba(216,201,155,0.3)]">
                  <CheckCircle2 className="h-10 w-10 text-[#D8C99B]" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  تم استلام طلبك بنجاح في الورشة!
                </h3>
                <p className="text-[#A4B5AC] max-w-md mx-auto mb-8 text-base leading-relaxed">
                  أهلاً بك <span className="text-[#E5D8AA] font-bold">{formData.name}</span>، تم تسجيل تفاصيل الدرون والمشكلة بنجاح، وسيتصل بك فريق الصيانة على رقم هاتفك قريباً جداً.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', droneModel: '', issueDescription: '', image: null });
                    setImagePreview(null);
                  }}
                  className="rounded-full bg-gradient-to-r from-[#D8C99B] via-[#C9B98A] to-[#B8A775] px-10 py-4 font-bold text-[#03140E] transition-all hover:scale-105 shadow-xl shadow-[#D8C99B]/20"
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
                      className="w-full rounded-2xl border border-[#0F3A2B] bg-[#03140E]/90 px-4 py-3.5 text-right text-white placeholder-[#4E665A] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20 shadow-inner"
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
                      className="w-full rounded-2xl border border-[#0F3A2B] bg-[#03140E]/90 px-4 py-3.5 text-right text-white placeholder-[#4E665A] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20 shadow-inner"
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
                    className="w-full rounded-2xl border border-[#0F3A2B] bg-[#03140E]/90 px-4 py-3.5 text-right text-white placeholder-[#4E665A] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20 shadow-inner"
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
                    className="w-full rounded-2xl border border-[#0F3A2B] bg-[#03140E]/90 p-4 text-right text-white placeholder-[#4E665A] outline-none transition focus:border-[#D8C99B] focus:ring-2 focus:ring-[#D8C99B]/20 resize-none shadow-inner"
                  />
                </div>

                {/* رفع صورة الدرون أو مكان الكسر */}
                <div>
                  <label className="block text-sm font-bold text-[#E5D8AA] mb-2 text-right">
                    إرفاق صورة للدرون أو مكان الإصابة / الكسر <span className="text-[#6E8276] font-normal">(اختياري)</span>
                  </label>
                  
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0F3A2B] bg-[#03140E]/70 p-6 text-center hover:border-[#D8C99B]/60 hover:bg-[#03140E] transition cursor-pointer group shadow-inner">
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
                          className="h-32 w-auto object-cover rounded-xl shadow-xl mb-2 border border-[#D8C99B]/40"
                        />
                        <span className="text-xs font-semibold text-[#D8C99B]">اضغط لتغيير الصورة المرفقة</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-2 rounded-full bg-[#0B3324] p-3.5 text-[#D8C99B] group-hover:scale-110 transition-transform border border-[#D8C99B]/20">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-white">اضغط هنا لرفع الصورة أو اسحبها وأفلتها هنا</p>
                        <p className="text-xs text-[#7B9487] mt-1">PNG, JPG, JPEG حتى 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ملاحظة توجيهية */}
                <div className="flex items-center gap-3 rounded-2xl bg-[#03140E] p-4 border border-[#0F3A2B] shadow-inner">
                  <AlertCircle className="h-5 w-5 text-[#D8C99B] shrink-0" />
                  <p className="text-xs text-[#92A69B] leading-relaxed text-right">
                    يتم فحص وتدقيق كل طلبات الورشة بسرية تامة، وسيقوم فني الصيانة بإرسال تقرير التشخيص المبدئي والتكلفة التقديرية قبل البدء بالتصليح.
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D8C99B] via-[#C9B98A] to-[#B8A775] px-10 py-3.5 font-extrabold text-[#03140E] transition hover:scale-105 shadow-xl shadow-[#D8C99B]/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>جاري إرسال الطلب للورشة...</span>
                    ) : (
                      <>
                        <Wrench className="h-5 w-5 text-[#03140E]" />
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
