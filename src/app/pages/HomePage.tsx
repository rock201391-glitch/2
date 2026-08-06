import {
  Bot,
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  Gavel,
  PackageCheck,
  Send,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAIChat } from "../../contexts/AIChatContext";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const serviceCards = [
  {
    title: "تصفح المتجر",
    description: "درونات، كاميرات، مايكات وإكسسوارات",
    icon: ShoppingBag,
    page: "shop",
    accent: "bg-[#0F3A2B] text-white",
  },
  {
    title: "الدخول إلى المزادات",
    description: "شارك في المزادات والمنتجات المميزة",
    icon: Gavel,
    page: "auctions",
    accent: "bg-[#E8EFEA] text-[#0F3A2B]",
  },
  {
    title: "تأجير الدرونات",
    description: "اختر الدرون وحدد مدة الإيجار المناسبة",
    icon: CalendarDays,
    page: "rentals",
    accent: "bg-[#DDEAE3] text-[#0F3A2B]",
  },
  {
    title: "الدخول إلى الورشة",
    description: "صيانة وإصلاح الدرونات والملحقات",
    icon: Wrench,
    page: "workshop",
    accent: "bg-[#0F3A2B] text-white",
  },
];

const orderSteps = [
  {
    number: "01",
    title: "اختر واطلب",
    description:
      "تصفح المنتجات واختر المناسب لك، أو اسأل زليخة تساعدك في الاختيار.",
    icon: ShoppingBag,
  },
  {
    number: "02",
    title: "نجهز طلبك",
    description:
      "نراجع الطلب ونتأكد من المنتج والملحقات ونجهزه بعناية قبل الشحن.",
    icon: PackageCheck,
  },
  {
    number: "03",
    title: "يوصلك بأمان",
    description:
      "نشحن طلبك إلى مختلف ولايات سلطنة عمان وتتابع حالته من موقع مرقاب.",
    icon: Truck,
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const { openChat, sendMessage } = useAIChat();
  const [aiQuestion, setAiQuestion] = useState("");

  function submitAIQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = aiQuestion.trim();

    openChat();

    if (question) {
      void sendMessage(question);
      setAiQuestion("");
    }
  }

  function openZulekha() {
    openChat();
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8F7F2] text-[#0F3A2B]">
      {/* القسم الرئيسي */}
      <section
        className="relative w-full overflow-hidden px-4 pb-14 pt-12 md:pb-20 md:pt-20"
        style={{
          background:
            "linear-gradient(180deg, #F8F7F2 0%, #F3F2EA 58%, #EEF1EB 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#DDE8E1] blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#E8ECE4] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* الفيديو */}
          <div className="order-1 flex justify-center lg:order-2">
            <div
              className="relative h-[340px] w-full max-w-2xl overflow-hidden rounded-[36px] border sm:h-[460px] lg:h-[500px]"
              style={{
                background:
                  "linear-gradient(135deg,#FFFDF7 0%,#F8F5EA 50%,#EDE7D8 100%)",
                borderColor: "#D8CFB8",
                boxShadow: "0 30px 80px rgba(15,58,43,0.17)",
              }}
            >
              <video
                src="/omani-drone.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F3A2B]/10 via-transparent to-white/5" />

              <div className="absolute bottom-4 right-4 rounded-2xl border border-white/40 bg-white/75 px-4 py-2 text-xs font-black text-[#0F3A2B] shadow-lg backdrop-blur-md">
                منتجات مرقاب
              </div>
            </div>
          </div>

          {/* النص وAI */}
          <div className="order-2 text-center lg:order-1 lg:text-right">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9D8CF] bg-white/75 px-4 py-2 text-xs font-black text-[#0F3A2B] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              متجر مرقاب للدرونات والتصوير
            </span>

            <h1 className="mb-5 text-4xl font-black leading-tight text-[#0F3A2B] md:text-6xl">
              نظرتكم من فوق
            </h1>

            <p className="mx-auto mb-7 max-w-xl text-base leading-8 text-gray-600 md:text-lg lg:mr-0">
              نوفر أحدث منتجات DJI والدرونات والكاميرات الاحترافية في سلطنة
              عمان، بجودة عالية وأسعار منافسة.
            </p>

            {/* صندوق زليخة في الصفحة الرئيسية */}
            <div className="mx-auto max-w-2xl lg:mr-0">
              <div className="mb-3 flex items-center gap-3 text-right">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-lg">
                  <Bot className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-sm font-black text-[#0F3A2B]">
                    محتار أي درون أو منتج يناسبك؟
                  </p>
                  <p className="text-xs text-gray-500">
                    اسأل زليخة، وبتساعدك تختار الأنسب حسب استخدامك وميزانيتك.
                  </p>
                </div>
              </div>

              <form
                onSubmit={submitAIQuestion}
                className="group flex min-h-[74px] items-center gap-3 rounded-[26px] border border-[#C9D8CF] bg-white p-3 shadow-[0_18px_45px_rgba(15,58,43,0.10)] transition focus-within:border-[#0F3A2B]/50 focus-within:shadow-[0_22px_55px_rgba(15,58,43,0.16)]"
              >
                <input
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  onFocus={openZulekha}
                  type="text"
                  placeholder="مثال: أنا مبتدئ وميزانيتي 300 ريال، شو تنصحيني؟"
                  className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium text-[#0F3A2B] outline-none placeholder:text-gray-400"
                />

                <button
                  type="submit"
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#164D3A] active:scale-95"
                  aria-label="اسأل زليخة"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>

              <button
                type="button"
                onClick={openZulekha}
                className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#0F3A2B] transition hover:opacity-70"
              >
                <Bot className="h-4 w-4" />
                فتح زليخة بدون كتابة سؤال
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* الخدمات الأربع */}
      <section className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.2em] text-[#39745D]">
              خدمات مرقاب
            </span>

            <h2 className="text-3xl font-black text-[#0F3A2B] md:text-4xl">
              كل اللي تحتاجه في مكان واحد
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
              اختر الخدمة التي تبحث عنها وانتقل إليها مباشرة.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className="group relative min-h-[220px] overflow-hidden rounded-[30px] border border-[#CAD7CF] bg-gradient-to-b from-[#154C39] to-[#0B3024] p-6 text-right text-white shadow-[0_20px_45px_rgba(15,58,43,0.16)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(15,58,43,0.24)] active:scale-[0.99]"
                >
                  <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#3B8C6A]/15 blur-2xl" />

                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <span
                        className={`mb-8 flex h-14 w-14 items-center justify-center rounded-[20px] ${item.accent} shadow-lg`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>

                      <h3 className="text-xl font-black">{item.title}</h3>

                      <p className="mt-3 text-sm leading-7 text-white/70">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-black text-white/90">
                      <span>الدخول الآن</span>
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* الإحصائيات */}
      <section className="overflow-hidden bg-[#08271D] px-4 py-14 text-white md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0B3024] px-6 py-10 shadow-[0_25px_70px_rgba(5,28,20,0.28)] md:px-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #FFFFFF 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="relative grid grid-cols-1 gap-8 text-center sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] px-6 py-8">
                <div className="text-5xl font-black md:text-6xl">300+</div>
                <div className="mt-3 text-base font-black text-white/90">
                  عميل راضي
                </div>
                <p className="mt-2 text-sm text-white/55">
                  ثقة عملائنا هي أهم إنجاز لنا.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] px-6 py-8">
                <div className="text-5xl font-black md:text-6xl">300+</div>
                <div className="mt-3 text-base font-black text-white/90">
                  درون تم بيعه
                </div>
                <p className="mt-2 text-sm text-white/55">
                  منتجات مختارة بعناية لمختلف الاستخدامات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ثلاث خطوات */}
      <section className="bg-[#061F17] px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/65">
              <CircleCheck className="h-4 w-4" />
              تجربة طلب سهلة
            </span>

            <h2 className="text-3xl font-black md:text-5xl">
              ثلاث خطوات بسيطة
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              من اختيار المنتج إلى وصوله عندك، نخلي التجربة واضحة وسريعة.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[16%] right-[16%] top-16 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {orderSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] px-7 py-9 text-center transition duration-300 hover:-translate-y-1 hover:bg-white/[0.055]"
                  >
                    <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-[92px] font-black leading-none text-white/[0.025]">
                      {step.number}
                    </div>

                    <div className="relative mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-[#0B3024] text-white shadow-xl">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="relative mb-3 inline-block text-xs font-black tracking-[0.2em] text-[#6EC39E]">
                      الخطوة {step.number}
                    </span>

                    <h3 className="relative text-2xl font-black">
                      {step.title}
                    </h3>

                    <p className="relative mx-auto mt-4 max-w-sm text-sm leading-8 text-white/55">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
