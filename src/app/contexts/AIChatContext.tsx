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
      type: "navigate";
      label: string;
      path: string;
      style?: "primary" | "secondary";
    }
  | {
      type: "prompt";
      label: string;
      prompt: string;
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
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
}

const STORAGE_KEY = "mergab_ai_chat_v1";

const WELCOME_MESSAGE: AIMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: Date.now(),
  text:
    "هلا بك في مساعد مرقاب الذكي. أقدر أساعدك تختار المنتج المناسب، أقارن بين المنتجات، أجاوب عن الأسعار والمواصفات، وأتابع حالة طلبك أو الإيجار.",
  actions: [
    {
      type: "prompt",
      label: "أنا مبتدئ",
      prompt: "أنا مبتدئ في الدرونات، اسألني الأسئلة المناسبة ثم رشح لي أفضل الخيارات المتوفرة.",
      style: "primary",
    },
    {
      type: "prompt",
      label: "اختيار حسب الميزانية",
      prompt: "ساعدني أختار درون حسب ميزانيتي.",
    },
    {
      type: "prompt",
      label: "مقارنة منتجات",
      prompt: "أريد أقارن بين منتجين.",
    },
    {
      type: "prompt",
      label: "تتبع طلب",
      prompt: "أريد أستفسر عن طلبي. اطلب مني رقم الهاتف.",
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

function loadMessages(): AIMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [WELCOME_MESSAGE];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [WELCOME_MESSAGE];
    }

    return parsed.slice(-40);
  } catch {
    return [WELCOME_MESSAGE];
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
    setMessages([{ ...WELCOME_MESSAGE, createdAt: Date.now() }]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      const userMessage = createMessage("user", text);
      const nextMessages = [...messages, userMessage].slice(-20);

      setMessages(nextMessages);
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke<AIReply>(
          "mergab-ai",
          {
            body: {
              message: text,
              history: nextMessages.slice(-12).map((message) => ({
                role: message.role,
                content: message.text,
              })),
              current_path: window.location.pathname,
            },
          },
        );

        if (error) throw error;

        const replyText =
          data?.message?.trim() ||
          "ما قدرت أجهز الإجابة الآن. جرّب مرة ثانية أو اكتب سؤالك بطريقة مختلفة.";

        const assistantMessage = createMessage(
          "assistant",
          replyText,
          Array.isArray(data?.actions) ? data.actions.slice(0, 6) : undefined,
        );

        setMessages((current) => [...current, assistantMessage].slice(-40));

        if (!isOpen) {
          setUnreadCount((count) => count + 1);
        }
      } catch (error) {
        console.error("Mergab AI error:", error);

        const fallback = createMessage(
          "assistant",
          "صار خطأ مؤقت في المساعد. تقدر تفتح المتجر أو مشترياتي من الخيارات تحت.",
          [
            {
              type: "navigate",
              label: "فتح المتجر",
              path: "/shop",
              style: "primary",
            },
            {
              type: "navigate",
              label: "مشترياتي",
              path: "/my-orders",
            },
          ],
        );

        setMessages((current) => [...current, fallback].slice(-40));
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

