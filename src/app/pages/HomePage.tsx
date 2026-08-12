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
      icon: ShoppingBag,
    },
    {
      number: "02",
      title: t("نجهز طلبك", "We Prepare It"),
      icon: PackageCheck,
    },
    {
      number: "03",
      title: t("يوصلك بأمان", "Delivered Safely"),
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
    <div
      dir={direction}
      className="min-h-screen bg-[#F5F2EA] text-[#0F3A2B]"
    >
      {/* HERO */}
      <section
        className="relative w-full overflow-hidden px-4 pb-14 pt-10 md:pb-20 md:pt-16"
        style={{
          background:
            "linear-gradient(180deg, #F8F5EE 0%, #F4F0E6 56%, #ECE8DD 100%)",
        }}
      >
        {/* خلفية ناعمة */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-[#D4E4DA]/55 blur-3xl" />
          <div className="absolute -left-28 bottom-0 h-80 w-80 rounded-full bg-[#E3DED2]/65 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* الفيديو */}
          <div className="order-1 flex justify-center lg:order-2">
            <div
              className="relative h-[300px] w-full max-w-xl overflow-hidden rounded-[34px] border sm:h-[420px] lg:h-[460px]"
              style={{
                background:
                  "linear-gradient(135deg,#FFFDF9 0%,#F6F2E8 50%,#E9E2D2 100%)",
                borderColor: "#D2C9B4",
                boxShadow: "0 28px 70px rgba(15,58,43,0.12)",
              }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[34px] ring-1 ring-white/50" />

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

          {/* النص + نور */}
          <div
            className={`order-2 text-center lg:order-1 ${
              isArabic ? "lg:text-right" : "lg:text-left"
            }`}
          >
            <h1 className="mb-7 text-4xl font-black leading-tight text-[#0F3A2B] md:text-6xl">
              {t("نظرتكم من فوق", "Your View From Above")}
            </h1>

            <div className="mx-auto max-w-xl lg:mx-0">
              <div
                className={`mb-3 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-[0_10px_24px_rgba(15,58,43,0.18)]">
                    <Bot className="h-5 w-5" />
                  </span>

                  <h2 className="text-2xl font-black text-[#0F3A2B] md:text-3xl">
                    {t("اسأل نور", "Ask Nour")}
                  </h2>
                </div>
              </div>

              <p
                className={`mb-4 text-sm font-medium leading-7 text-[#4E5A54] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t(
                  "اكتب أي سؤال أو اذكر ميزانيتك، ونور بترشح لك أفضل منتج.",
                  "Ask anything or tell Nour your budget, and she'll recommend the best product.",
                )}
              </p>

              <form
                onSubmit={submitAIQuestion}
                className="flex items-center gap-3 rounded-[26px] border border-[#C9D5CE] bg-[#FFFDF9]/95 p-2.5 shadow-[0_16px_40px_rgba(15,58,43,0.08)] backdrop-blur transition focus-within:border-[#0F3A2B]/55 focus-within:shadow-[0_18px_45px_rgba(15,58,43,0.12)]"
              >
                <input
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  type="text"
                  placeholder={t(
                    "اكتب سؤالك لنور... مثال: ايش الدرون اللي تنصحني فيه؟",
                    "Ask Nour... Example: Which drone do you recommend for me?",
                  )}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-[15px] font-medium text-[#0F3A2B] outline-none placeholder:text-[#8D9893]"
                />

                <button
                  type="submit"
                  disabled={!aiQuestion.trim()}
                  className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-[18px] bg-[#0F3A2B] text-white shadow-[0_10px_26px_rgba(15,58,43,0.20)] transition hover:-translate-y-0.5 hover:bg-[#174B39] active:scale-95 disabled:opacity-40"
                  aria-label={t(
                    "إرسال السؤال إلى نور",
                    "Send question to Nour",
                  )}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        className="relative overflow-hidden px-4 py-14 md:py-20"
        style={{
          background:
            "linear-gradient(180deg, #F7F4EC 0%, #F3EFE5 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-[#DDE8E1]/40 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-56 w-56 rounded-full bg-[#E8E2D6]/55 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex items-center rounded-full border border-[#C8D4CC] bg-[#EDF3EF] px-4 py-1.5 text-xs font-black text-[#0F3A2B]">
              {t("كل خدماتك بمكان واحد", "Everything in one place")}
            </span>

            <h2 className="text-3xl font-black text-[#0F3A2B] md:text-5xl">
              {t("خدمات مرقاب", "Mergab Services")}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {serviceCards.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className={`group relative min-h-[190px] overflow-hidden rounded-[28px] border border-[#CAD6CF] bg-[#FFFEFA] p-5 shadow-[0_14px_34px_rgba(15,58,43,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#0F3A2B]/35 hover:shadow-[0_22px_50px_rgba(15,58,43,0.12)] sm:min-h-[220px] sm:p-6 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {/* لمسة خضراء */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0F3A2B] via-[#2F7358] to-[#0F3A2B] opacity-80" />
                  <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#DCE9E1]/60 blur-2xl" />

                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#0F3A2B] text-white shadow-[0_10px_24px_rgba(15,58,43,0.18)] transition duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>

                      <h3 className="text-base font-black leading-7 text-[#0F3A2B] sm:text-xl">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#EAF1ED] px-3.5 py-3 text-xs font-black text-[#0F3A2B] transition duration-300 group-hover:bg-[#0F3A2B] group-hover:text-white sm:text-sm">
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

      {/* THREE STEPS */}
      <section
        className="relative overflow-hidden px-4 py-16 md:py-24"
        style={{
          background:
            "linear-gradient(180deg, #EEF2EE 0%, #F6F3EB 55%, #ECE8DD 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#DCE9E1]/55 blur-3xl" />
          <div className="absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-[#D3E2D9]/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9D4CD] bg-white/80 px-4 py-2 text-xs font-black text-[#0F3A2B] shadow-sm backdrop-blur">
              <CircleCheck className="h-4 w-4" />
              {t("تجربة طلب سهلة", "Easy Ordering")}
            </span>

            <h2 className="text-3xl font-black text-[#0F3A2B] md:text-5xl">
              {t("ثلاث خطوات بسيطة", "Three Simple Steps")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {orderSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative overflow-hidden rounded-[32px] border border-[#C8D5CD] bg-[#FFFEFA] p-7 text-center shadow-[0_18px_45px_rgba(15,58,43,0.07)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(15,58,43,0.12)] sm:p-9"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0F3A2B] via-[#34775C] to-[#0F3A2B]" />
                  <div className="pointer-events-none absolute left-1/2 top-7 h-24 w-24 -translate-x-1/2 rounded-full bg-[#DCE9E1]/55 blur-2xl" />

                  <div className="relative">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#0F3A2B] text-white shadow-[0_14px_30px_rgba(15,58,43,0.20)] transition duration-300 group-hover:scale-105">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="mb-3 inline-flex rounded-full bg-[#E8F0EB] px-3 py-1 text-[11px] font-black tracking-[0.15em] text-[#2E6F54]">
                      {t("الخطوة", "STEP")} {step.number}
                    </span>

                    <h3 className="text-2xl font-black text-[#0F3A2B] sm:text-3xl">
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
