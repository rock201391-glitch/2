import {
  Bot,
  ChevronDown,
  Eraser,
  Loader2,
  MessageCircleMore,
  Navigation,
  PackageSearch,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAIChat, type AIAction } from "../../contexts/AIChatContext";

const QUICK_PROMPTS = [
  "أنا مبتدئ وأريد درون مناسب",
  "أريد كاميرا للسفر والفلوقات",
  "أريد إكسسوار لجهازي",
  "قارن بين منتجين",
  "أريد أتابع طلبي",
];

function normalizePhone(value: string) {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit)))
    .replace(/\D/g, "")
    .slice(-8);
}

export default function MergabAI() {
  const navigate = useNavigate();
  const {
    isOpen,
    isLoading,
    messages,
    unreadCount,
    toggleChat,
    closeChat,
    sendMessage,
    clearConversation,
  } = useAIChat();

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const latestAssistantMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [isOpen, isLoading, messages, phoneMode]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    void sendMessage(text);
  }

  function runAction(action: AIAction) {
    if (action.type === "navigate" || action.type === "open_product") {
      navigate(action.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (action.type === "request_phone") {
      setPhoneMode(true);
      setPhoneInput("");
      return;
    }

    if (action.type === "restart_flow") {
      clearConversation();
      setPhoneMode(false);
      setPhoneInput("");
      return;
    }

    if (action.type === "prompt") {
      void sendMessage(action.prompt, action.label);
    }
  }

  function submitPhone(event: FormEvent) {
    event.preventDefault();

    const phone = normalizePhone(phoneInput);
    if (phone.length !== 8) return;

    setPhoneMode(false);
    setPhoneInput("");

    navigate(`/my-orders?phone=${encodeURIComponent(phone)}&search=1`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label="فتح زليخة"
        className="group fixed bottom-5 right-5 z-[9990] flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-[25px] border border-white/20 bg-gradient-to-br from-[#164D3A] via-[#0F3A2B] to-[#07261C] text-white shadow-[0_22px_65px_rgba(15,58,43,.42)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] active:scale-95 sm:bottom-7 sm:right-7"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_15%,rgba(231,217,167,.30),transparent_42%)]" />

        {isOpen ? (
          <X className="relative h-7 w-7" />
        ) : (
          <Bot className="relative h-8 w-8" />
        )}

        {!isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#D8C99B] text-[#0F3A2B] shadow-lg">
            <Sparkles className="h-4 w-4" />
          </span>
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black ring-4 ring-[#F8F7F2]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          dir="rtl"
          aria-label="زليخة"
          className="fixed bottom-24 right-3 z-[9989] flex h-[min(780px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-[440px] flex-col overflow-hidden rounded-[34px] border border-[#D8D0C1] bg-[#F8F7F2] shadow-[0_36px_110px_rgba(15,58,43,.32)] sm:bottom-28 sm:right-7"
        >
          <header className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-l from-[#0F3A2B] to-[#07281D] px-5 py-4 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_-10%,rgba(216,201,155,.28),transparent_42%)]" />

            <div className="relative flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/10 shadow-inner">
                <Sparkles className="h-6 w-6 text-[#E7D9A7]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-black">زليخة</h2>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    متصلة
                  </span>
                </div>

                <p className="mt-0.5 truncate text-xs text-white/70">
                  مساعدتك الذكية في متجر مرقاب
                </p>
              </div>
            </div>

            <div className="relative flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  clearConversation();
                  setPhoneMode(false);
                  setPhoneInput("");
                }}
                title="محادثة جديدة"
                className="rounded-full p-2.5 transition hover:bg-white/10"
              >
                <Eraser className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={closeChat}
                title="تصغير"
                className="rounded-full p-2.5 transition hover:bg-white/10"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(216,201,155,.13),transparent_35%)] px-4 py-5"
          >
            {messages.map((message, messageIndex) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[94%]">
                  <div
                    className={`whitespace-pre-wrap rounded-[24px] px-4 py-3.5 text-sm font-medium leading-7 ${
                      message.role === "user"
                        ? "rounded-tr-md bg-gradient-to-br from-[#164D3A] to-[#0F3A2B] text-white shadow-md"
                        : "rounded-tl-md border border-[#E0D9CC] bg-white text-[#24372F] shadow-[0_8px_24px_rgba(15,58,43,.07)]"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.actions && message.actions.length > 0 && (
                    <div
                      className={`mt-3 ${
                        messageIndex === 0
                          ? "grid grid-cols-1 gap-2 sm:grid-cols-3"
                          : "flex flex-wrap gap-2"
                      }`}
                    >
                      {message.actions.map((action, index) => (
                        <button
                          key={`${message.id}-${index}`}
                          type="button"
                          onClick={() => runAction(action)}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition hover:-translate-y-0.5 ${
                            action.style === "primary"
                              ? "border-[#0F3A2B] bg-[#0F3A2B] text-white shadow-[0_8px_20px_rgba(15,58,43,.18)]"
                              : "border-[#D4CDBE] bg-white text-[#0F3A2B] hover:border-[#0F3A2B]/50"
                          }`}
                        >
                          {(action.type === "navigate" ||
                            action.type === "open_product") && (
                            <Navigation className="h-3.5 w-3.5 opacity-70" />
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-end">
                <div className="flex items-center gap-3 rounded-[24px] rounded-tl-md border border-[#E0D9CC] bg-white px-4 py-3 text-sm font-bold text-[#0F3A2B] shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0F3A2B] [animation-delay:-.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0F3A2B] [animation-delay:-.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#0F3A2B]" />
                  </span>
                  زليخة تفكر...
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-[#E3DCCE] bg-white/90 p-3 backdrop-blur-xl">
            {!phoneMode && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSuggestions((open) => !open)}
                  className="mb-2 flex w-full items-center justify-between rounded-2xl bg-[#F3F0E8] px-4 py-2.5 text-xs font-black text-[#0F3A2B] transition hover:bg-[#ECE7DB]"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircleMore className="h-4 w-4" />
                    اقتراحات تساعدك تبدأ
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      showSuggestions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSuggestions && (
                  <div className="mb-3 rounded-2xl border border-[#E3DCCE] bg-[#F8F7F2] p-2">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            void sendMessage(prompt);
                          }}
                          className="rounded-full border border-[#D8D1C3] bg-white px-3 py-2 text-xs font-bold text-[#0F3A2B] transition hover:border-[#0F3A2B]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {latestAssistantMessage?.actions?.some(
                  (action) =>
                    action.type === "navigate" ||
                    action.type === "open_product",
                ) && (
                  <p className="mb-2 text-center text-[11px] text-gray-400">
                    تقدر تفتح المنتج وتكمل محادثتك مع زليخة بعد ذلك.
                  </p>
                )}
              </>
            )}

            {phoneMode ? (
              <form onSubmit={submitPhone} className="space-y-3">
                <div className="rounded-2xl border border-[#E0D9CC] bg-[#F4F1E9] p-4">
                  <div className="mb-3 flex items-center gap-2 text-[#0F3A2B]">
                    <PackageSearch className="h-5 w-5" />
                    <p className="text-sm font-black">
                      رقم الهاتف المستخدم في الطلب
                    </p>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(event) =>
                      setPhoneInput(normalizePhone(event.target.value))
                    }
                    placeholder="XXXXXXXX"
                    autoFocus
                    className="w-full rounded-2xl border border-[#D8D1C3] bg-white px-4 py-4 text-center text-lg font-black tracking-[.2em] text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:ring-4 focus:ring-[#0F3A2B]/5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneInput.length !== 8}
                  className="w-full rounded-2xl bg-gradient-to-l from-[#0F3A2B] to-[#164D3A] py-4 font-black text-white shadow-lg disabled:opacity-40"
                >
                  فتح مشترياتي والبحث تلقائيًا
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneMode(false);
                    setPhoneInput("");
                  }}
                  className="w-full rounded-2xl border border-[#D8D1C3] py-3 font-bold text-[#0F3A2B]"
                >
                  رجوع
                </button>
              </form>
            ) : (
              <form onSubmit={submit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit(event);
                    }
                  }}
                  rows={1}
                  placeholder="مثال: أنا مبتدئ وميزانيتي 300 ريال..."
                  className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-[#D8D1C3] bg-[#F8F7F2] px-4 py-3 text-sm font-medium text-[#0F3A2B] outline-none transition focus:border-[#0F3A2B] focus:ring-4 focus:ring-[#0F3A2B]/5"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#164D3A] to-[#0F3A2B] text-white shadow-md disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            )}

            <p className="mt-2 text-center text-[10px] leading-4 text-gray-400">
              الأسعار والتوفر تُقرأ مباشرة من متجر مرقاب.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
