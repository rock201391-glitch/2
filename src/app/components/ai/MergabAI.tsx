import {
  Bot,
  ChevronDown,
  Eraser,
  Loader2,
  MessageCircleMore,
  Navigation,
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
  "ساعديني أختار منتج مناسب",
  "أريد منتج حسب ميزانيتي",
  "أريد أسأل عن منتج",
  "أريد مقارنة بين منتجين",
  "أريد أتابع طلبي",
];

function normalizePhone(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
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
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [isOpen, isLoading, messages, phoneMode]);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

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
      void sendMessage(action.prompt);
    }
  }

  function submitPhone(event: FormEvent) {
    event.preventDefault();

    const cleanPhone = normalizePhone(phoneInput);

    if (cleanPhone.length !== 8) {
      return;
    }

    setPhoneMode(false);
    setPhoneInput("");

    navigate(`/my-orders?phone=${encodeURIComponent(cleanPhone)}&search=1`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label="زليخة"
        className="fixed bottom-5 right-5 z-[9990] flex h-16 w-16 items-center justify-center rounded-full bg-[#0F3A2B] text-white shadow-[0_18px_45px_rgba(15,58,43,.35)] transition hover:scale-105 active:scale-95 sm:bottom-7 sm:right-7"
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <Bot className="h-8 w-8" />
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black">
            {unreadCount}
          </span>
        )}

        {!isOpen && (
          <span className="absolute -left-1 -top-1 h-4 w-4 animate-ping rounded-full bg-[#D8C99B]/70" />
        )}
      </button>

      {isOpen && (
        <section
          className="fixed bottom-24 right-3 z-[9989] flex h-[min(720px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-[410px] flex-col overflow-hidden rounded-[28px] border border-[#DED8C9] bg-[#F8F7F2] shadow-[0_28px_80px_rgba(15,58,43,.28)] sm:bottom-28 sm:right-7"
          dir="rtl"
          aria-label="محادثة مساعد مرقاب"
        >
          <header className="flex flex-shrink-0 items-center justify-between bg-[#0F3A2B] px-4 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6 text-[#E7D9A7]" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base font-black">
                  زليخة
                </h2>
                <p className="truncate text-xs text-white/70">
                  مساعدتك الذكية في متجر مرقاب
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  clearConversation();
                  setPhoneMode(false);
                  setPhoneInput("");
                }}
                title="مسح المحادثة"
                className="rounded-full p-2 hover:bg-white/10"
              >
                <Eraser className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={closeChat}
                title="تصغير"
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div className="max-w-[90%]">
                  <div
                    className={`whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm font-medium leading-7 ${
                      message.role === "user"
                        ? "rounded-tr-md bg-[#0F3A2B] text-white"
                        : "rounded-tl-md border border-[#E4DED1] bg-white text-[#24372F] shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={`${message.id}-${index}`}
                          type="button"
                          onClick={() => runAction(action)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                            action.style === "primary"
                              ? "border-[#0F3A2B] bg-[#0F3A2B] text-white"
                              : "border-[#CFC8B8] bg-white text-[#0F3A2B]"
                          }`}
                        >
                          {(action.type === "navigate" ||
                            action.type === "open_product") && (
                            <Navigation className="h-3.5 w-3.5" />
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
                <div className="flex items-center gap-2 rounded-3xl rounded-tl-md border border-[#E4DED1] bg-white px-4 py-3 text-sm font-bold text-[#0F3A2B] shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تجهيز الإجابة...
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-[#E4DED1] bg-white/85 p-3 backdrop-blur">
            {!phoneMode && (
              <>
                <button
                  type="button"
                  onClick={() => setShowQuickPrompts((open) => !open)}
                  className="mb-2 flex w-full items-center justify-between rounded-2xl bg-[#F4F1E9] px-4 py-2.5 text-xs font-black text-[#0F3A2B]"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircleMore className="h-4 w-4" />
                    كيف أقدر أساعدك؟
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      showQuickPrompts ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showQuickPrompts && (
                  <div className="mb-3 max-h-48 overflow-y-auto rounded-2xl border border-[#E4DED1] bg-[#F8F7F2] p-2">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setShowQuickPrompts(false);
                            void sendMessage(prompt);
                          }}
                          className="rounded-full border border-[#D8D1C3] bg-white px-3 py-2 text-xs font-bold text-[#0F3A2B] hover:border-[#0F3A2B]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {latestAssistantMessage?.actions?.some(
                  (action) =>
                    action.type === "navigate" || action.type === "open_product",
                ) && (
                  <p className="mb-2 text-center text-[11px] text-gray-400">
                    تقدر تفتح الصفحة المقترحة وتكمل المحادثة؛ المساعد ما راح يتسكر.
                  </p>
                )}
              </>
            )}

            {phoneMode ? (
              <form onSubmit={submitPhone} className="space-y-3">
                <div className="rounded-2xl bg-[#F4F1E9] p-4">
                  <p className="mb-3 text-sm font-black text-[#0F3A2B]">
                    اكتب رقم الهاتف المستخدم في الطلب
                  </p>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(event) =>
                      setPhoneInput(normalizePhone(event.target.value))
                    }
                    placeholder="XXXXXXXX"
                    autoFocus
                    className="w-full rounded-2xl border border-[#D8D1C3] bg-white px-4 py-4 text-center text-lg font-black tracking-widest text-[#0F3A2B] outline-none focus:border-[#0F3A2B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneInput.length !== 8}
                  className="w-full rounded-2xl bg-[#0F3A2B] py-4 font-black text-white disabled:opacity-40"
                >
                  فتح مشترياتي
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
                  placeholder="اكتب سؤالك هنا..."
                  className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-[#D8D1C3] bg-[#F8F7F2] px-4 py-3 text-sm font-medium text-[#0F3A2B] outline-none focus:border-[#0F3A2B]"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            )}

            <p className="mt-2 text-center text-[10px] leading-4 text-gray-400">
              الأسعار والتوفر تؤخذ من بيانات متجر مرقاب.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
