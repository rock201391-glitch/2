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

const STORAGE_KEY = "mergab_zulekha_openai_v3";
const PENDING_RECOMMENDATION_KEY = "mergab_zulekha_pending_recommendation";

const WELCOME_MESSAGE: AIMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: Date.now(),
  text: "أهلًا، أنا زليخة. كيف ممكن أساعدك؟",
  actions: [
    {
      type: "prompt",
      label: "أريد درون مناسب",
      prompt:
        "أريد مساعدتك في اختيار درون مناسب. اسأليني أولًا عن خبرتي، وبعدها خليني أكتب استخدامي وميزانيتي بنفسي.",
      style: "primary",
    },
    {
      type: "prompt",
      label: "أبحث عن كاميرا",
      prompt:
        "أريد كاميرا مناسبة. خليني أكتب استخدامي وميزانيتي بنفسي، سؤالًا واحدًا في كل مرة.",
    },
    {
      type: "prompt",
      label: "منتج حسب ميزانيتي",
      prompt:
        "أريد منتجًا مناسبًا حسب ميزانيتي. اسأليني أولًا عن نوع المنتج وبعدها خليني أكتب الميزانية والاستخدام بنفسي.",
    },
  ],
};

const AIChatContext = createContext<AIChatContextValue | null>(null);

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

function freshWelcome(): AIMessage {
  return { ...WELCOME_MESSAGE, createdAt: Date.now() };
}

function loadMessages(): AIMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [freshWelcome()];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [freshWelcome()];
    }

    return parsed.slice(-40);
  } catch {
    return [freshWelcome()];
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
): AIMessage {
  const priceText = recommendation.productPrice
    ? ` بسعر ${recommendation.productPrice}`
    : "";

  return createMessage(
    "assistant",
    `شو رأيك في ${recommendation.productName}${priceText}؟ هل مناسب لك؟`,
    [
      {
        type: "prompt",
        label: "نعم، مناسب",
        prompt: `نعم، المنتج ${recommendation.productName} مناسب لي.`,
        style: "primary",
      },
      {
        type: "prompt",
        label: "أريد شيء أفضل",
        prompt:
          `المنتج الحالي هو ${recommendation.productName}. ` +
          "أريد خيارًا أفضل وأقوى حتى لو كان أغلى. رشحي لي المنتج التالي مباشرة.",
      },
      {
        type: "prompt",
        label: "أريد أرخص",
        prompt:
          `المنتج الحالي هو ${recommendation.productName}. ` +
          "أريد خيارًا أرخص ويكون قريب من احتياجي. رشحي لي المنتج التالي مباشرة.",
      },
      {
        type: "prompt",
        label: "أريد بديل",
        prompt:
          `المنتج الحالي هو ${recommendation.productName}. ` +
          "أريد بديلًا مختلفًا بنفس المستوى تقريبًا. رشحي لي المنتج التالي مباشرة.",
      },
    ],
  );
}

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>(loadMessages);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const injectPendingFollowup = useCallback(() => {
    const pending = readPendingRecommendation();
    if (!pending) return;

    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);

    setMessages((current) => {
      const last = current[current.length - 1];

      if (
        last?.role === "assistant" &&
        last.text.includes(pending.productName) &&
        last.text.includes("هل مناسب لك")
      ) {
        return current;
      }

      return [
        ...current,
        createRecommendationFollowup(pending),
      ].slice(-40);
    });
  }, []);

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
    setMessages([freshWelcome()]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PENDING_RECOMMENDATION_KEY);
  }, []);

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
              history: nextMessages.slice(-14).map((item) => ({
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
            "ما قدرت أجهز الإجابة الحين. جرّب مرة ثانية.",
          Array.isArray(data?.actions)
            ? data.actions.slice(0, 8)
            : undefined,
        );

        setMessages((current) => [...current, assistantMessage].slice(-40));

        if (!isOpen) {
          setUnreadCount((count) => count + 1);
        }
      } catch (error) {
        console.error("Zulekha error:", error);

        setMessages((current) => [
          ...current,
          createMessage(
            "assistant",
            "صار خطأ بسيط في زليخة. جرّب مرة ثانية.",
            [
              {
                type: "navigate",
                label: "فتح المتجر",
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
    [isLoading, isOpen, messages],
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
