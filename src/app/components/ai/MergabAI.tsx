import {
  Bot,
  ChevronDown,
  Eraser,
  Loader2,
  MessageCircleMore,
  Navigation,
  PackageSearch,
  Send,
  UserRound,
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
import { useLanguage } from "../../contexts/LanguageContext";

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
  const { language, isArabic, direction, t } = useLanguage();

  const QUICK_PROMPTS = [
    t("أنا مبتدئ وأريد درون مناسب", "I’m a beginner and need a suitable drone"),
    t("أريد كاميرا للسفر والفلوقات", "I need a camera for travel and vlogs"),
    t("أريد إكسسوار لجهازي", "I need an accessory for my device"),
    t("قارن بين منتجين", "Compare two products"),
    t("أريد أتابع طلبي", "I want to track my order"),
  ];
  const {
    isOpen,
    isLoading,
    messages,
    unreadCount,
    toggleChat,
    closeChat,
    sendMessage,
    clearConversation,
    savePendingRecommendation,
  } = useAIChat();

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const executedAutoActionRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (!latestMessage || latestMessage.role !== "assistant") return;

    const autoAction = latestMessage.actions?.find(
      (action) => action.type === "auto_open_product",
    );

    if (!autoAction || autoAction.type !== "auto_open_product") return;
    if (executedAutoActionRef.current.has(latestMessage.id)) return;

    executedAutoActionRef.current.add(latestMessage.id);

    savePendingRecommendation({
      productName: autoAction.productName,
      productPrice: autoAction.productPrice,
      path: autoAction.path,
      createdAt: Date.now(),
    });

    const timer = window.setTimeout(() => {
      closeChat();
      navigate(autoAction.path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    messages,
    closeChat,
    navigate,
    savePendingRecommendation,
  ]);

  function scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    void sendMessage(text);
  }

  function runAction(action: AIAction) {
    if (
      action.type === "navigate" ||
      action.type === "open_product" ||
      action.type === "auto_open_product"
    ) {
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
        aria-label={t("فتح زليخة", "Open Zulekha")}
        className={`group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] ${isArabic ? "right-4 sm:right-7" : "left-4 sm:left-7"} z-[9990] flex h-[60px] w-[60px] items-center justify-center rounded-[22px] border border-white/15 bg-gradient-to-br from-[#1B5843] via-[#0F3A2B] to-[#061F17] text-white shadow-[0_18px_50px_rgba(15,58,43,.40)] transition duration-300 hover:-translate-y-1 hover:scale-[1.04] active:scale-95 sm:bottom-7 sm:h-[70px] sm:w-[70px] sm:rounded-[25px]`}
      >
        {!isOpen && (
          <>
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-[22px] border border-[#2F8B6B]/35 [animation-duration:2.4s] sm:rounded-[25px]" />
            <span className="pointer-events-none absolute -inset-2 animate-pulse rounded-[28px] bg-[#1F6B50]/10 blur-md [animation-duration:2s]" />
          </>
        )}

        {isOpen ? (
          <X className="relative h-7 w-7" />
        ) : (
          <Bot className="relative h-7 w-7 transition duration-500 group-hover:rotate-6 group-hover:scale-110 sm:h-8 sm:w-8" />
        )}

        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#38A276] px-1 text-[10px] font-black text-white ring-4 ring-[#F8F7F2]">
            AI
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
          dir={direction}
          aria-label={t("زليخة", "Zulekha")}
          className={`
            fixed
            bottom-[calc(5.5rem+env(safe-area-inset-bottom))]
            ${isArabic ? "right-2 sm:right-7" : "left-2 sm:left-7"}
            z-[9989]
            flex
            h-[58dvh]
            max-h-[560px]
            w-[calc(100vw-1rem)]
            max-w-[420px]
            flex-col
            overflow-hidden
            rounded-[28px]
            border
            border-[#D8DED9]
            bg-[#F7F9F7]
            shadow-[0_28px_90px_rgba(15,58,43,.28)]
            sm:bottom-28
                        sm:h-[min(760px,calc(100dvh-7rem))]
            sm:max-h-none
            sm:w-[calc(100vw-1.5rem)]
            sm:max-w-[440px]
            sm:rounded-[34px]
          `}
        >
          <header className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-l from-[#103D2F] to-[#06261C] px-4 py-3.5 text-white sm:px-5 sm:py-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(67,163,122,.24),transparent_46%)]" />

            <div className="relative flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/10 sm:h-12 sm:w-12 sm:rounded-[18px]">
                <Bot className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-black">{t("زليخة", "Zulekha")}</h2>

                  <span className="flex items-center gap-1 rounded-full bg-[#2F8B6B]/20 px-2 py-1 text-[10px] font-bold text-[#8FE0BE]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#65D6A6]" />
                    {t("متصلة", "Online")}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-[11px] text-white/65 sm:text-xs">
                  {t("مساعدتك الذكية في متجر مرقاب", "Your smart assistant at Mergab Store")}
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
                title={t("محادثة جديدة", "New conversation")}
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <Eraser className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={closeChat}
                title={t("تصغير", "Minimize")}
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_50%_0%,rgba(47,139,107,.08),transparent_38%)] px-3 py-4 sm:space-y-5 sm:px-4 sm:py-5"
          >
            {messages.map((message, messageIndex) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    isUser ? "justify-start" : "justify-end"
                  }`}
                >
                  {isUser && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#D6DDD8] bg-white text-[#0F3A2B] shadow-sm sm:h-9 sm:w-9">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}

                  <div className="max-w-[82%]">
                    <div
                      className={`mb-1 flex px-1 text-[10px] font-bold ${
                        isUser
                          ? "justify-start text-[#607068]"
                          : "justify-end text-[#39745D]"
                      }`}
                    >
                      {isUser ? t("أنت", "You") : t("زليخة", "Zulekha")}
                    </div>

                    <div
                      className={`whitespace-pre-wrap rounded-[20px] px-3.5 py-2.5 text-[15px] font-medium leading-6 sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-sm sm:leading-7 ${
                        isUser
                          ? "rounded-br-md bg-[#0F3A2B] text-white shadow-md"
                          : "rounded-bl-md border border-[#DCE3DE] bg-white text-[#24372F] shadow-[0_8px_24px_rgba(15,58,43,.06)]"
                      }`}
                    >
                      {message.text}
                    </div>

                    {message.actions && message.actions.length > 0 && (
                      <div
                        className={`mt-3 ${
                          messageIndex === 0
                            ? "grid grid-cols-1 gap-2"
                            : "flex flex-wrap gap-2"
                        } sm:${messageIndex === 0 ? "grid-cols-3" : ""}`}
                      >
                        {message.actions
                          .filter((action) => action.type !== "auto_open_product")
                          .map((action, index) => (
                          <button
                            key={`${message.id}-${index}`}
                            type="button"
                            onClick={() => runAction(action)}
                            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 ${
                              action.style === "primary"
                                ? "border-[#0F3A2B] bg-[#0F3A2B] text-white shadow-[0_8px_20px_rgba(15,58,43,.16)]"
                                : "border-[#D7DED9] bg-white text-[#0F3A2B] hover:border-[#4E9478]"
                            }`}
                          >
                            {(action.type === "navigate" ||
                              action.type === "open_product" ||
                              action.type === "auto_open_product") && (
                              <Navigation className="h-3.5 w-3.5 opacity-70" />
                            )}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D664B] to-[#0F3A2B] text-white shadow-md sm:h-9 sm:w-9">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-end justify-end gap-2">
                <div className="rounded-[20px] rounded-bl-md border border-[#DCE3DE] bg-white px-3.5 py-2.5 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-bold text-[#0F3A2B]">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58] [animation-delay:-.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58] [animation-delay:-.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58]" />
                    </span>
                    {t("زليخة تفكر...", "Zulekha is thinking...")}
                  </div>
                </div>

                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D664B] to-[#0F3A2B] text-white shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-[#DDE4DF] bg-white/95 p-2.5 backdrop-blur-xl sm:p-3">
            {!phoneMode && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSuggestions((open) => !open)}
                  className="mb-2 flex w-full items-center justify-between rounded-2xl bg-[#EEF3EF] px-3.5 py-2 text-xs font-black text-[#0F3A2B] transition hover:bg-[#E7EEE9]"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircleMore className="h-4 w-4" />
                    {t("اقتراحات تساعدك تبدأ", "Suggestions to get started")}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      showSuggestions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSuggestions && (
                  <div className="mb-2 max-h-32 overflow-y-auto rounded-2xl border border-[#DDE4DF] bg-[#F7F9F7] p-2">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            void sendMessage(prompt);
                          }}
                          className="rounded-full border border-[#D7DED9] bg-white px-3 py-2 text-xs font-bold text-[#0F3A2B] transition hover:border-[#4E9478]"
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
                  <p className="mb-2 text-center text-[10px] text-gray-400">
                    {t("تقدر تفتح المنتج وتكمل المحادثة بعد ذلك.", "You can open the product and continue the conversation afterward.")}
                  </p>
                )}
              </>
            )}

            {phoneMode ? (
              <form onSubmit={submitPhone} className="space-y-2">
                <div className="rounded-2xl border border-[#DDE4DF] bg-[#EEF3EF] p-3">
                  <div className="mb-2 flex items-center gap-2 text-[#0F3A2B]">
                    <PackageSearch className="h-5 w-5" />
                    <p className="text-sm font-black">
                      {t("رقم الهاتف المستخدم في الطلب", "Phone number used for the order")}
                    </p>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneInput}
                    onChange={(event) =>
                      setPhoneInput(normalizePhone(event.target.value))
                    }
                    onFocus={scrollMessagesToBottom}
                    placeholder="XXXXXXXX"
                    autoFocus
                    className="w-full rounded-2xl border border-[#D7DED9] bg-white px-4 py-3 text-center text-[16px] font-black tracking-[.2em] text-[#0F3A2B] outline-none transition focus:border-[#3B8C6A] focus:ring-4 focus:ring-[#3B8C6A]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneInput.length !== 8}
                  className="w-full rounded-2xl bg-gradient-to-l from-[#0F3A2B] to-[#1A5B43] py-3 font-black text-white shadow-lg disabled:opacity-40"
                >
                  {t("فتح مشترياتي", "Open My Orders")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneMode(false);
                    setPhoneInput("");
                  }}
                  className="w-full rounded-2xl border border-[#D7DED9] py-2.5 font-bold text-[#0F3A2B]"
                >
                  رجوع
                </button>
              </form>
            ) : (
              <form onSubmit={submit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onFocus={scrollMessagesToBottom}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit(event);
                    }
                  }}
                  rows={1}
                  placeholder={t("اكتب سؤالك هنا...", "Type your question here...")}
                  className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-[#D7DED9] bg-[#F7F9F7] px-4 py-3 text-[16px] font-medium leading-5 text-[#0F3A2B] outline-none transition focus:border-[#3B8C6A] focus:bg-white focus:ring-4 focus:ring-[#3B8C6A]/10"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A5B43] to-[#0F3A2B] text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            )}

            <p className="mt-1.5 text-center text-[9px] leading-4 text-gray-400 sm:text-[10px]">
              {t("الأسعار والتوفر تُقرأ مباشرة من متجر مرقاب.", "Prices and availability are read directly from Mergab Store.")}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
