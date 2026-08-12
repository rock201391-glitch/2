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
      <section className="relative w-full overflow-hidden px-4 pb-12 pt-10 md:pb-16 md:pt-16 bg-[#F5F2EA]">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* الفيديو */}
          <div className="order-1 flex justify-center lg:order-2">
            <div
              className="relative h-[300px] w-full max-w-xl overflow-hidden rounded-[34px] border sm:h-[420px] lg:h-[460px]"
              style={{
                background:
                  "linear-gradient(135deg,#FFFDF9 0%,#F5F2EA 50%,#ECE6DA 100%)",
                borderColor: "#D9D0BE",
                boxShadow: "0 20px 50px rgba(15,58,43,0.08)",
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

          {/* النص + نور */}
          <div
            className={`order-2 text-center lg:order-1 ${
              isArabic ? "lg:text-right" : "lg:text-left"
            }`}
          >
            <h1 className="hidden lg:block mb-7 text-4xl font-black leading-tight text-[#0F3A2B] md:text-6xl">
              {t("نظرتكم من فوق", "Your View From Above")}
            </h1>

            <div className="mx-auto max-w-xl lg:mx-0">
              <div
                className={`mb-2.5 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </span>

                  <h2 className="text-xl font-black text-[#0F3A2B] md:text-2xl">
                    {t("اسأل نور", "Ask Nour")}
                  </h2>
                </div>
              </div>

              <p
                className={`mb-3.5 text-sm font-medium text-[#4E5A54] ${
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
                className="flex items-center gap-3 rounded-[24px] border border-[#CCD6D0] bg-[#FFFDF9] p-2.5 shadow-[0_10px_30px_rgba(15,58,43,0.05)] transition focus-within:border-[#0F3A2B]"
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
                  className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white shadow-sm transition hover:bg-[#174B39] active:scale-95 disabled:opacity-40"
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
      <section className="bg-[#F5F2EA] px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-[#0F3A2B] md:text-4xl">
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
                  className={`group relative min-h-[170px] overflow-hidden rounded-[24px] border border-[#E2DAC8] bg-[#FAF7F0] p-5 shadow-[0_6px_20px_rgba(15,58,43,0.03)] transition duration-300 hover:-translate-y-1.5 hover:border-[#0F3A2B]/30 hover:shadow-[0_10px_25px_rgba(15,58,43,0.06)] sm:min-h-[190px] sm:p-6 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <div className="relative flex h-full flex-col justify-between">
                    <div>
                      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#E7EFEB] text-[#0F3A2B] transition group-hover:bg-[#0F3A2B] group-hover:text-white sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </span>

                      <h3 className="text-base font-black text-[#0F3A2B] sm:text-xl">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-[#EFE9DD] px-3.5 py-2.5 text-xs font-bold text-[#0F3A2B] transition group-hover:bg-[#0F3A2B] group-hover:text-white sm:text-sm">
                      <span>{t("اضغط للدخول", "Tap to open")}</span>
                      <Arrow className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="bg-[#F5F2EA] px-4 py-12 md:py-20 border-t border-[#EAE3D4]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E2DAC8] bg-[#FAF7F0] px-3.5 py-1.5 text-xs font-bold text-[#0F3A2B] shadow-sm">
              <CircleCheck className="h-3.5 w-3.5 text-[#0F3A2B]" />
              {t("تجربة طلب سهلة", "Easy Ordering")}
            </span>

            <h2 className="text-2xl font-black text-[#0F3A2B] md:text-4xl">
              {t("ثلاث خطوات بسيطة", "Three Simple Steps")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {orderSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative overflow-hidden rounded-[24px] border border-[#E2DAC8] bg-[#FAF7F0] p-6 text-center shadow-[0_6px_20px_rgba(15,58,43,0.03)] sm:p-8"
                >
                  <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E7EFEB] text-[#0F3A2B] shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="mb-2 inline-block text-[11px] font-black tracking-[0.15em] text-[#346650]">
                    {t("الخطوة", "STEP")} {step.number}
                  </span>

                  <h3 className="text-lg font-black text-[#0F3A2B] sm:text-xl">
                    {step.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
