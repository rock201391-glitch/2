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
}

const STORAGE_KEY = "mergab_zulekha_openai_v2";

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
        "أريد مساعدتك في اختيار درون مناسب. ابدئي بسؤالي عن خبرتي واستخدامي وميزانيتي، سؤالًا واحدًا في كل مرة.",
      style: "primary",
    },
    {
      type: "prompt",
      label: "أبحث عن كاميرا",
      prompt:
        "أريد كاميرا مناسبة. اسأليني عن نوع التصوير والاستخدام والميزانية، سؤالًا واحدًا في كل مرة.",
    },
    {
      type: "prompt",
      label: "منتج حسب ميزانيتي",
      prompt:
        "أريد منتجًا مناسبًا حسب ميزانيتي. اسأليني أولًا عن نوع المنتج ثم الميزانية والاستخدام.",
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

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>(loadMessages);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((current) => {
      const next = !current;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([freshWelcome()]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
            "ما قدرت أجهز الإجابة الآن. جرّب مرة ثانية.",
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
            "صار خطأ مؤقت في زليخة. جرّب مرة ثانية أو افتح المتجر.",
            [
              {
                type: "navigate",
                label: "فتح المتجر",
                path: "/shop",
                style: "primary",
              },
              {
                type: "request_phone",
                label: "متابعة الطلب",
                purpose: "track_order",
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
