import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "./LanguageContext";

export type AIAction =
  | {
      type: "navigate" | "open_product";
      label: string;
      path: string;
      style?: "primary" | "secondary";
    }
  | {
      type: "auto_open_product";
      label: string;
      path: string;
      productName: string;
      productPrice?: string;
      style?: "primary" | "secondary";
    }
  | {
      type: "prompt";
      label: string;
      prompt: string;
      style?: "primary" | "secondary";
    }
  | {
      type: "request_phone";
      label: string;
      purpose: "track_order";
      style?: "primary" | "secondary";
    }
  | {
      type: "restart_flow";
      label: string;
      style?: "primary" | "secondary";
    };

export interface AIMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  actions?: AIAction[];
  createdAt: number;
}

interface AIReply {
  message?: string;
  actions?: AIAction[];
}

interface PendingRecommendation {
  productName: string;
  productPrice?: string;
  path: string;
  createdAt: number;
}

interface AIChatContextValue {
  isOpen: boolean;
  isLoading: boolean;
  messages: AIMessage[];
  unreadCount: number;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (text: string, visibleText?: string) => Promise<void>;
  clearConversation: () => void;
  savePendingRecommendation: (recommendation: PendingRecommendation) => void;
}

const PENDING_RECOMMENDATION_KEY = "mergab_zulekha_pending_recommendation";

const AIChatContext = createContext<AIChatContextValue | null>(null);

function storageKey(language: "ar" | "en") {
  return `mergab_zulekha_openai_v4_${language}`;
}

function createMessage(
  role: AIMessage["role"],
  text: string,
  actions?: AIAction[],
): AIMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    actions,
    createdAt: Date.now(),
  };
}

function createWelcome(language: "ar" | "en"): AIMessage {
  const isArabic = language === "ar";

  return {
    id: `welcome-${language}`,
    role: "assistant",
    createdAt: Date.now(),
    text: isArabic
      ? "أهلًا، أنا نور. كيف ممكن أساعدك؟"
      : "Hi, I’m Nour. How can I help you?",
    actions: [
      {
        type: "prompt",
        label: isArabic ? "أريد درون مناسب" : "Help me choose a drone",
        prompt: isArabic
          ? "أريد مساعدتك في اختيار درون مناسب. اسأليني أولًا عن خبرتي، وبعدها خليني أكتب استخدامي وميزانيتي بنفسي."
          : "Help me choose a suitable drone. First ask about my experience, then let me type my use case and budget.",
        style: "primary",
      },
      {
        type: "prompt",
        label: isArabic ? "أبحث عن كاميرا" : "I’m looking for a camera",
        prompt: isArabic
          ? "أريد كاميرا مناسبة. خليني أكتب استخدامي وميزانيتي بنفسي، سؤالًا واحدًا في كل مرة."
          : "Help me choose a suitable camera. Ask one question at a time and let me type my use case and budget.",
      },
      {
        type: "prompt",
        label: isArabic ? "منتج حسب ميزانيتي" : "Find a product for my budget",
        prompt: isArabic
          ? "أريد منتجًا مناسبًا حسب ميزانيتي. اسأليني أولًا عن نوع المنتج وبعدها خليني أكتب الميزانية والاستخدام بنفسي."
          : "Help me find a product within my budget. First ask what type of product I need, then let me type my budget and use case.",
      },
    ],
  };
}

function loadMessages(language: "ar" | "en"): AIMessage[] {
  try {
    const saved = localStorage.getItem(storageKey(language));
    if (!saved) return [createWelcome(language)];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createWelcome(language)];
    }

    return parsed.slice(-40);
  } catch {
    return [createWelcome(language)];
  }
}

function readPendingRecommendation(): PendingRecommendation | null {
  try {
    const raw = localStorage.getItem(PENDING_RECOMMENDATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingRecommendation;

    if (
      !parsed ||
      typeof parsed.productName !== "string" ||
      typeof parsed.path !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function createRecommendationFollowup(
  recommendation: PendingRecommendation,
  language: "ar" | "en",
): AIMessage {
  const isArabic = language === "ar";
  const priceText = recommendation.productPrice
    ? isArabic
      ? ` بسعر ${recommendation.productPrice}`
      : ` for ${recommendation.productPrice}`
    : "";

  return createMessage(
    "assistant",
    isArabic
      ? `شو رأيك في ${recommendation.productName}${priceText}؟ هل مناسب لك؟`
      : `What do you think of ${recommendation.productName}${priceText}? Does it suit you?`,
    [
      {
        type: "prompt",
        label: isArabic ? "نعم، مناسب" : "Yes, it suits me",
        prompt: isArabic
          ? `نعم، المنتج ${recommendation.productName} مناسب لي.`
          : `Yes, ${recommendation.productName} suits me.`,
        style: "primary",
      },
      {
        type: "prompt",
        label: isArabic ? "أريد شيء أفضل" : "I want something better",
        prompt: isArabic
          ? `المنتج الحالي هو ${recommendation.productName}. أريد خيارًا أفضل وأقوى حتى لو كان أغلى. رشحي لي المنتج التالي مباشرة.`
          : `The current product is ${recommendation.productName}. I want a better and more powerful option even if it costs more. Recommend the next product directly.`,
      },
      {
        type: "prompt",
        label: isArabic ? "أريد أرخص" : "I want a cheaper option",
        prompt: isArabic
          ? `المنتج الحالي هو ${recommendation.productName}. أريد خيارًا أرخص ويكون قريب من احتياجي. رشحي لي المنتج التالي مباشرة.`
          : `The current product is ${recommendation.productName}. I want a cheaper option that still closely matches my needs. Recommend the next product directly.`,
      },
      {
        type: "prompt",
        label: isArabic ? "أريد بديل" : "Show me an alternative",
        prompt: isArabic
          ? `المنتج الحالي هو ${recommendation.productName}. أريد بديلًا مختلفًا بنفس المستوى تقريبًا. رشحي لي المنتج التالي مباشرة.`
          : `The current product is ${recommendation.productName}. I want a different alternative at roughly the same level. Recommend the next product directly.`,
      },
    ],
  );
}

export function AIChatProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>(() =>
    loadMessages(language),
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMessages(loadMessages(language));
    setUnreadCount(0);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(
      storageKey(language),
      JSON.stringify(messages.slice(-40)),
    );
  }, [messages, language]);

  const injectPendingFollowup = useCallback(() => {
    const pending = readPendingRecommendation();
    if (!pending) return;

    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);

    setMessages((current) => {
      const last = current[current.length - 1];

      if (
        last?.role === "assistant" &&
        last.text.includes(pending.productName)
      ) {
        return current;
      }

      return [
        ...current,
        createRecommendationFollowup(pending, language),
      ].slice(-40);
    });
  }, [language]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
    injectPendingFollowup();
  }, [injectPendingFollowup]);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((current) => {
      const next = !current;

      if (next) {
        setUnreadCount(0);
        setTimeout(injectPendingFollowup, 0);
      }

      return next;
    });
  }, [injectPendingFollowup]);

  const clearConversation = useCallback(() => {
    setMessages([createWelcome(language)]);
    localStorage.removeItem(storageKey(language));
    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);
  }, [language]);

  const savePendingRecommendation = useCallback(
    (recommendation: PendingRecommendation) => {
      localStorage.setItem(
        PENDING_RECOMMENDATION_KEY,
        JSON.stringify(recommendation),
      );
    },
    [],
  );

  const sendMessage = useCallback(
    async (rawText: string, visibleText?: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      const userMessage = createMessage(
        "user",
        visibleText?.trim() || text,
      );

      const nextMessages = [...messages, userMessage].slice(-20);

      setMessages(nextMessages);
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke<AIReply>(
          "mergab-ai",
          {
            body: {
              message: text,
              language,
              // تم التعديل هنا لتقليل السجل إلى آخر 6 رسائل
              history: nextMessages.slice(-6).map((item) => ({
                role: item.role,
                content: item.text,
              })),
              current_path:
                window.location.pathname + window.location.search,
            },
          },
        );

        if (error) throw error;

        const assistantMessage = createMessage(
          "assistant",
          data?.message?.trim() ||
            (language === "ar"
              ? "ما قدرت أجهز الإجابة الحين. جرّب مرة ثانية."
              : "I couldn’t prepare the answer right now. Please try again."),
          Array.isArray(data?.actions)
            ? data.actions.slice(0, 8)
            : undefined,
        );

        setMessages((current) => [...current, assistantMessage].slice(-40));

        if (!isOpen) {
          setUnreadCount((count) => count + 1);
        }
      } catch (error) {
        console.error("Nour error:", error);

        setMessages((current) => [
          ...current,
          createMessage(
            "assistant",
            language === "ar"
              ? "صار خطأ بسيط عند نور. جرّب مرة ثانية."
              : "A temporary error occurred. Please try again.",
            [
              {
                type: "navigate",
                label: language === "ar" ? "فتح المتجر" : "Open shop",
                path: "/shop",
                style: "primary",
              },
            ],
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isOpen, messages, language],
  );

  const value = useMemo<AIChatContextValue>(
    () => ({
      isOpen,
      isLoading,
      messages,
      unreadCount,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      clearConversation,
      savePendingRecommendation,
    }),
    [
      isOpen,
      isLoading,
      messages,
      unreadCount,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      clearConversation,
      savePendingRecommendation,
    ],
  );

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);

  if (!context) {
    throw new Error("useAIChat must be used within AIChatProvider");
  }

  return context;
}
