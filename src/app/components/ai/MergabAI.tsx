import {
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


function NoorAvatar({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#EAF4EF] via-white to-[#CFE4D8] shadow-[0_8px_24px_rgba(15,58,43,.18)] ring-1 ring-[#0F3A2B]/10 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="noorHelmet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C8DDD2" />
          </linearGradient>
          <linearGradient id="noorSuit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D654A" />
            <stop offset="100%" stopColor="#0B3024" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="#F4F8F5" />
        <path
          d="M18 48C18 25 31 11 50 11s32 14 32 37v16H18V48Z"
          fill="url(#noorHelmet)"
          stroke="#0F3A2B"
          strokeWidth="3"
        />
        <path
          d="M25 46c0-17 10-28 25-28s25 11 25 28v10H25V46Z"
          fill="#182D26"
        />
        <ellipse cx="50" cy="48" rx="21" ry="23" fill="#F3C7A9" />
        <path
          d="M30 41c4-15 14-20 20-20 9 0 18 6 21 18-8-4-14-8-20-13-5 7-11 12-21 15Z"
          fill="#272522"
        />
        <ellipse cx="41" cy="49" rx="3.5" ry="4.5" fill="#10261E" />
        <ellipse cx="59" cy="49" rx="3.5" ry="4.5" fill="#10261E" />
        <circle cx="42" cy="48" r="1.2" fill="white" />
        <circle cx="60" cy="48" r="1.2" fill="white" />
        <path
          d="M43 59c4 3 10 3 14 0"
          fill="none"
          stroke="#A85B52"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M27 71c4-8 12-13 23-13s19 5 23 13v19H27V71Z"
          fill="url(#noorSuit)"
        />
        <circle cx="50" cy="72" r="8" fill="#EAF4EF" />
        <path
          d="M47 67h6v4h4v6h-4v4h-6v-4h-4v-6h4v-4Z"
          fill="#1D654A"
        />
        <path
          d="M18 44c-5 1-8 7-8 13s3 12 8 13V44Zm64 0c5 1 8 7 8 13s-3 12-8 13V44Z"
          fill="#0F3A2B"
        />
        <circle cx="50" cy="8" r="4" fill="#55B98A" />
      </svg>
    </span>
  );
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
      closeChat();
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
    closeChat();

    navigate(`/my-orders?phone=${encodeURIComponent(phone)}&search=1`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label={t("فتح نور", "Open Noor")}
        className={`group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] ${
          isArabic ? "right-4 sm:right-7" : "left-4 sm:left-7"
        } z-[9990] flex h-[66px] w-[66px] items-center justify-center overflow-visible rounded-[24px] border border-white/40 bg-gradient-to-br from-[#174F3B] via-[#0F3A2B] to-[#071F17] shadow-[0_18px_50px_rgba(15,58,43,.38)] transition duration-300 hover:-translate-y-1 hover:scale-[1.04] active:scale-95 sm:bottom-7 sm:h-[76px] sm:w-[76px] sm:rounded-[28px]`}
      >
        {!isOpen && (
          <>
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-[24px] border border-[#4DB487]/25 [animation-duration:2.7s] sm:rounded-[28px]" />
            <span className="pointer-events-none absolute -inset-3 rounded-[30px] bg-[#2D8A67]/10 blur-xl" />
          </>
        )}

        {isOpen ? (
          <X className="relative h-7 w-7 text-white" />
        ) : (
          <NoorAvatar
            size={52}
            className="relative transition duration-500 group-hover:scale-105 sm:!h-[58px] sm:!w-[58px]"
          />
        )}

        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-[#0F3A2B] ring-3 ring-[#F8F7F2]">
            AI
          </span>
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -left-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black text-white ring-4 ring-[#F8F7F2]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          dir={direction}
          aria-label={t("نور", "Noor")}
          className={`
            fixed
            bottom-[calc(5.7rem+env(safe-area-inset-bottom))]
            ${isArabic ? "right-2 sm:right-7" : "left-2 sm:left-7"}
            z-[9989]
            flex
            h-[78dvh]
            max-h-[760px]
            min-h-[520px]
            w-[calc(100vw-1rem)]
            max-w-[430px]
            flex-col
            overflow-hidden
            rounded-[30px]
            border
            border-[#D7E0DA]
            bg-[#F9FBF9]
            shadow-[0_30px_100px_rgba(15,58,43,.30)]
            sm:bottom-28
            sm:h-[min(790px,calc(100dvh-7rem))]
            sm:max-h-none
            sm:w-[calc(100vw-1.5rem)]
            sm:max-w-[460px]
            sm:rounded-[36px]
          `}
        >
          <header className="relative flex flex-shrink-0 items-center justify-between overflow-hidden bg-gradient-to-l from-[#14523D] via-[#0F3A2B] to-[#06251B] px-4 py-4 text-white sm:px-5 sm:py-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(92,194,148,.24),transparent_48%)]" />
            <div className="absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-white/5 blur-2xl" />

            <div className="relative flex min-w-0 items-center gap-3.5">
              <NoorAvatar size={52} className="ring-2 ring-white/15" />

              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="truncate text-2xl font-black tracking-tight sm:text-3xl">
                    {t("نور", "Noor")}
                  </h2>

                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-[#A5E4C7] backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#67D7A7]" />
                    {t("متصلة", "Online")}
                  </span>
                </div>
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
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
              >
                <Eraser className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={closeChat}
                title={t("تصغير", "Minimize")}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_50%_0%,rgba(47,139,107,.09),transparent_38%)] px-3.5 py-5 sm:px-5 sm:py-6"
          >
            {messages.map((message, messageIndex) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${
                    isUser ? "justify-start" : "justify-end"
                  }`}
                >
                  {isUser && (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#D6DDD8] bg-white text-[#0F3A2B] shadow-sm">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}

                  <div className="max-w-[84%]">
                    <div
                      className={`mb-1.5 flex px-1 text-[11px] font-black ${
                        isUser
                          ? "justify-start text-[#607068]"
                          : "justify-end text-[#2F7257]"
                      }`}
                    >
                      {isUser ? t("أنت", "You") : t("نور", "Noor")}
                    </div>

                    <div
                      className={`whitespace-pre-wrap rounded-[22px] px-4 py-3 text-[15px] font-medium leading-7 ${
                        isUser
                          ? "rounded-br-md bg-gradient-to-br from-[#15523E] to-[#0F3A2B] text-white shadow-[0_10px_24px_rgba(15,58,43,.18)]"
                          : "rounded-bl-md border border-[#DBE4DE] bg-white text-[#23372F] shadow-[0_10px_26px_rgba(15,58,43,.07)]"
                      }`}
                    >
                      {message.text}
                    </div>

                    {message.actions && message.actions.length > 0 && (
                      <div
                        className={`mt-3 ${
                          messageIndex === 0
                            ? "grid grid-cols-1 gap-2.5"
                            : "flex flex-wrap gap-2"
                        }`}
                      >
                        {message.actions
                          .filter(
                            (action) =>
                              action.type !== "auto_open_product",
                          )
                          .map((action, index) => (
                            <button
                              key={`${message.id}-${index}`}
                              type="button"
                              onClick={() => runAction(action)}
                              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[17px] border px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 ${
                                action.style === "primary"
                                  ? "border-[#0F3A2B] bg-[#0F3A2B] text-white shadow-[0_10px_24px_rgba(15,58,43,.17)]"
                                  : "border-[#D6DFD9] bg-white text-[#0F3A2B] shadow-sm hover:border-[#4E9478]"
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
                    <NoorAvatar size={36} />
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-end justify-end gap-2.5">
                <div className="rounded-[22px] rounded-bl-md border border-[#DBE4DE] bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-black text-[#0F3A2B]">
                    <span className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58] [animation-delay:-.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58] [animation-delay:-.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F7A58]" />
                    </span>

                    {t("نور تفكر...", "Noor is thinking...")}
                  </div>
                </div>

                <NoorAvatar size={36} />
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t border-[#DDE4DF] bg-white/95 p-3 backdrop-blur-xl sm:p-4">
            {!phoneMode && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSuggestions((open) => !open)}
                  className="mb-2.5 flex w-full items-center justify-between rounded-[18px] bg-[#EDF4F0] px-4 py-2.5 text-xs font-black text-[#0F3A2B] transition hover:bg-[#E4EEE8]"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircleMore className="h-4 w-4" />
                    {t(
                      "اقتراحات تساعدك تبدأ",
                      "Suggestions to get started",
                    )}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      showSuggestions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSuggestions && (
                  <div className="mb-3 max-h-36 overflow-y-auto rounded-[20px] border border-[#DDE4DF] bg-[#F7F9F7] p-2.5">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            void sendMessage(prompt);
                          }}
                          className="rounded-full border border-[#D7DED9] bg-white px-3.5 py-2 text-xs font-bold text-[#0F3A2B] transition hover:border-[#4E9478]"
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
                    {t(
                      "تقدر تفتح المنتج وتكمل المحادثة بعد ذلك.",
                      "You can open the product and continue the conversation afterward.",
                    )}
                  </p>
                )}
              </>
            )}

            {phoneMode ? (
              <form onSubmit={submitPhone} className="space-y-2.5">
                <div className="rounded-[20px] border border-[#DDE4DF] bg-[#EEF3EF] p-3">
                  <div className="mb-2 flex items-center gap-2 text-[#0F3A2B]">
                    <PackageSearch className="h-5 w-5" />
                    <p className="text-sm font-black">
                      {t(
                        "رقم الهاتف المستخدم في الطلب",
                        "Phone number used for the order",
                      )}
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
                    className="w-full rounded-[18px] border border-[#D7DED9] bg-white px-4 py-3 text-center text-[16px] font-black tracking-[.2em] text-[#0F3A2B] outline-none transition focus:border-[#3B8C6A] focus:ring-4 focus:ring-[#3B8C6A]/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneInput.length !== 8}
                  className="w-full rounded-[18px] bg-gradient-to-l from-[#0F3A2B] to-[#1A5B43] py-3 font-black text-white shadow-lg disabled:opacity-40"
                >
                  {t("فتح مشترياتي", "Open My Orders")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhoneMode(false);
                    setPhoneInput("");
                  }}
                  className="w-full rounded-[18px] border border-[#D7DED9] py-2.5 font-bold text-[#0F3A2B]"
                >
                  {t("رجوع", "Back")}
                </button>
              </form>
            ) : (
              <form onSubmit={submit} className="flex items-end gap-2.5">
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
                  placeholder={t(
                    "اكتب سؤالك هنا...",
                    "Type your question here...",
                  )}
                  className="max-h-28 min-h-[52px] flex-1 resize-none rounded-[19px] border border-[#D7DED9] bg-[#F7F9F7] px-4 py-3.5 text-[16px] font-medium leading-6 text-[#0F3A2B] outline-none transition focus:border-[#3B8C6A] focus:bg-white focus:ring-4 focus:ring-[#3B8C6A]/10"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[19px] bg-gradient-to-br from-[#1A5B43] to-[#0F3A2B] text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </>
  );
}
