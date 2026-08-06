import {
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Gavel,
  PackageCheck,
  Send,
  ShoppingBag,
  Truck,
  Wrench,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAIChat } from "../contexts/AIChatContext";
import { useLanguage } from "../contexts/LanguageContext";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onProductClick?: (product: any) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { openChat, sendMessage } = useAIChat();
  const { isArabic, direction, t } = useLanguage();
  const [aiQuestion, setAiQuestion] = useState("");

  const serviceCards = [
    {
      title: t("تصفح المتجر", "Browse Shop"),
      icon: ShoppingBag,
      page: "shop",
    },
    {
      title: t("تأجير الدرونات", "Drone Rentals"),
      icon: CalendarDays,
      page: "rentals",
    },
    {
      title: t("الدخول إلى المزادات", "Enter Auctions"),
      icon: Gavel,
      page: "auctions",
    },
    {
      title: t("الدخول إلى الورشة", "Open Workshop"),
      icon: Wrench,
      page: "workshop",
    },
  ];

  const orderSteps = [
    {
      number: "01",
      title: t("اختر واطلب", "Choose & Order"),
      description: t(
        "تصفح المنتجات أو اسأل نور حتى تساعدك تختار المنتج المناسب.",
        "Browse the products or ask Nour to help you choose the right product.",
      ),
      icon: ShoppingBag,
    },
    {
      number: "02",
      title: t("نجهز طلبك", "We Prepare It"),
      description: t(
        "نراجع الطلب ونتأكد من المنتج والملحقات ونجهزه بعناية قبل الشحن.",
        "We review your order, verify the product and accessories, and prepare it carefully.",
      ),
      icon: PackageCheck,
    },
    {
      number: "03",
      title: t("يوصلك بأمان", "Delivered Safely"),
      description: t(
        "نشحن طلبك إلى مختلف ولايات سلطنة عمان وتقدر تتابع حالته من الموقع.",
        "We deliver across Oman and you can track your order directly from the website.",
      ),
      icon: Truck,
    },
  ];

  function submitAIQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = aiQuestion.trim();
    if (!question) return;

    openChat();
    void sendMessage(question);
    setAiQuestion("");
  }

  const Arrow = isArabic ? ChevronLeft : ChevronRight;

  return (
    <div dir={direction} className="min-h-screen bg-[#F8F5ED] text-[#0F3A2B]">
      <section
        className="relative w-full overflow-hidden px-4 pb-14 pt-12 md:pb-20 md:pt-20"
        style={{
          background:
            "linear-gradient(180deg, #FAF7F0 0%, #F5F1E8 68%, #F0EEE5 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#DCE7DF]/60 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#E8E3D5]/70 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="order-1 flex justify-center lg:order-2">
            <div
              className="relative h-[330px] w-full max-w-2xl overflow-hidden rounded-[34px] border sm:h-[450px] lg:h-[490px]"
              style={{
                background:
                  "linear-gradient(135deg,#FFFDF7 0%,#F8F5EA 50%,#EDE7D8 100%)",
                borderColor: "#D8CFB8",
                boxShadow: "0 28px 70px rgba(15,58,43,0.14)",
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
            </div>
          </div>

          <div
            className={`order-2 text-center lg:order-1 ${
              isArabic ? "lg:text-right" : "lg:text-left"
            }`}
          >
            <h1 className="mb-8 text-4xl font-black leading-tight text-[#0F3A2B] md:text-6xl">
              {t("نظرتكم من فوق", "Your View From Above")}
            </h1>

            <div className="mx-auto max-w-2xl lg:mx-0">
              <div className={`mb-3 ${isArabic ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-lg">
                    <Bot className="h-5 w-5" />
                  </span>

                  <h2 className="text-2xl font-black text-[#0F3A2B] md:text-3xl">
                    {t("اسأل نور", "Ask Nour")}
                  </h2>
                </div>
              </div>

              <p className={`mb-3 text-sm font-medium text-[#6B746F] ${isArabic ? "text-right" : "text-left"}`}>
                {t(
                  "اكتب أي سؤال أو اذكر ميزانيتك، ونور بترشح لك أفضل منتج.",
                  "Ask anything or tell Nour your budget, and she'll recommend the best product."
                )}
              </p>

              <form
                onSubmit={submitAIQuestion}
                className="flex min-h-[82px] items-center gap-3 rounded-[28px] border border-[#C9D4CC] bg-white p-3 shadow-[0_18px_45px_rgba(15,58,43,0.09)] transition focus-within:border-[#0F3A2B]/50"
              >
                <input
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  type="text"
                  placeholder={t(
                    "اكتب سؤالك لنور... مثال: ميزانيتي ٣٠٠ ريال وأريد أفضل درون للتصوير",
                    "Ask Nour... Example: My budget is 300 OMR and I want the best drone for filming",
                  )}
                  className="min-w-0 flex-1 bg-transparent px-4 text-[16px] font-medium text-[#0F3A2B] outline-none placeholder:text-[#9AA39E]"
                />

                <button
                  type="submit"
                  disabled={!aiQuestion.trim()}
                  className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#174B39] active:scale-95 disabled:opacity-40"
                  aria-label={t("إرسال السؤال إلى نور", "Send question to Nour")}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5ED] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[#0F3A2B] md:text-5xl">
              {t("خدمات مرقاب", "Mergab Services")}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {serviceCards.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className={`group relative min-h-[190px] overflow-hidden rounded-[28px] border border-[#D7D0C1] bg-[#FFFDF8] p-5 shadow-[0_14px_36px_rgba(15,58,43,0.08)] transition duration-300 hover:-translate-y-2 sm:min-h-[210px] sm:p-6 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#0F3A2B] text-white shadow-md sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>

                      <h3 className="text-lg font-black text-[#0F3A2B] sm:text-2xl">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#E8EFEA] px-4 py-3 text-sm font-black text-[#0F3A2B] transition group-hover:bg-[#0F3A2B] group-hover:text-white">
                      <span>{t("اضغط للدخول", "Tap to open")}</span>
                      <Arrow className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F1EDE3] px-4 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <div className="rounded-[24px] border border-[#D8D0C1] bg-[#FFFDF8] px-4 py-6 text-center shadow-sm">
              <div className="text-3xl font-black text-[#0F3A2B] sm:text-5xl">
                300+
              </div>
              <div className="mt-2 text-sm font-black text-[#0F3A2B] sm:text-base">
                {t("عميل راضي", "Happy Customers")}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#D8D0C1] bg-[#FFFDF8] px-4 py-6 text-center shadow-sm">
              <div className="text-3xl font-black text-[#0F3A2B] sm:text-5xl">
                300+
              </div>
              <div className="mt-2 text-sm font-black text-[#0F3A2B] sm:text-base">
                {t("درون تم بيعه", "Drones Sold")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F5ED] px-4 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-11 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D7D0C1] bg-[#FFFDF8] px-4 py-2 text-xs font-black text-[#0F3A2B]">
              <CircleCheck className="h-4 w-4" />
              {t("تجربة طلب سهلة", "Easy Ordering")}
            </span>

            <h2 className="text-3xl font-black text-[#0F3A2B] md:text-5xl">
              {t("ثلاث خطوات بسيطة", "Three Simple Steps")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {orderSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative overflow-hidden rounded-[28px] border border-[#D8D0C1] bg-[#FFFDF8] px-6 py-8 text-center shadow-sm"
                >
                  <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0F3A2B] text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>

                  <span className="mb-3 inline-block text-xs font-black tracking-[0.15em] text-[#4A826A]">
                    {t("الخطوة", "STEP")} {step.number}
                  </span>

                  <h3 className="text-xl font-black text-[#0F3A2B] sm:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-4 max-w-sm text-sm leading-8 text-[#6D7771]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
