import OpenAI from "npm:openai";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SECRET_KEYS = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS") || "{}",
);

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  SUPABASE_SECRET_KEYS.service_role ||
  SUPABASE_SECRET_KEYS.secret;

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Product = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  quantity: number;
  category_id: number | null;
  is_active: boolean;
};

type Category = {
  id: number;
  name: string;
};

type AIAction =
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

type Intent =
  | "tracking"
  | "rental"
  | "auction"
  | "workshop"
  | "drone"
  | "camera"
  | "microphone"
  | "accessory"
  | "general";

const STOP_WORDS = new Set([
  "اريد",
  "أريد",
  "ابي",
  "ابغى",
  "ابا",
  "أبا",
  "عطني",
  "اعطني",
  "أعطني",
  "كم",
  "سعر",
  "بكم",
  "شو",
  "وش",
  "ايش",
  "ما",
  "هو",
  "هي",
  "هذا",
  "هذه",
  "لي",
  "عن",
  "على",
  "في",
  "من",
  "حق",
  "product",
  "price",
  "how",
  "much",
  "cost",
  "want",
  "need",
  "a",
  "an",
  "the",
  "for",
  "me",
  "please",
]);

const ACCESSORY_WORDS = [
  "فلتر",
  "filter",
  "nd",
  "شنطه",
  "شنطة",
  "bag",
  "بطاري",
  "battery",
  "مراوح",
  "مروحه",
  "propeller",
  "propellers",
  "حمايه",
  "حماية",
  "guard",
  "cover",
  "غطاء",
  "ذاكره",
  "ذاكرة",
  "memory",
  "مومري",
  "receiver",
  "استقبال",
  "ارسال",
  "إرسال",
  "transmitter",
  "ريموت",
  "remote",
  "rc-",
  "rc ",
  "ار سي",
  "آر سي",
  "جيمبال",
  "gimbal",
  "حامل",
  "mount",
  "استيديو",
  "studio",
];

const MICROPHONE_WORDS = [
  "مايك",
  "ميكروفون",
  "mic",
  "microphone",
];

const CAMERA_WORDS = [
  "كاميرا",
  "camera",
  "osmo",
  "اسمو",
  "أوسمو",
  "اوسمو",
  "pocket",
  "بوكت",
  "action",
  "اكشن",
  "أكشن",
  "insta",
  "انستا",
];

const DRONE_WORDS = [
  "درون",
  "drone",
  "mini",
  "ميني",
  "neo",
  "نيو",
  "mavic",
  "مافيك",
  "air",
  "اير",
  "إير",
  "avata",
  "افاتا",
  "أفاتا",
  "fpv",
];

const PRODUCT_KNOWLEDGE: Array<{
  keys: string[];
  textAr: string;
  textEn: string;
}> = [
  {
    keys: ["neo", "نيو"],
    textAr:
      "DJI Neo / Neo 2: مناسب جدًا للمبتدئ والتصوير السريع والسفر، خفيف وسهل الاستخدام.",
    textEn:
      "DJI Neo / Neo 2: very suitable for beginners, quick filming and travel; lightweight and easy to use.",
  },
  {
    keys: ["mini 4", "ميني 4"],
    textAr:
      "DJI Mini 4 Pro Combo Plus: مناسب للمبتدئ والسفر والتصوير الجوي، حساسات شاملة، تصوير عمودي، 4K، وارتفاع تشغيل حتى 500م AGL حسب القوانين المحلية.",
    textEn:
      "DJI Mini 4 Pro Combo Plus: suitable for beginners, travel and aerial filming; omnidirectional sensing, vertical shooting, 4K, and up to 500m AGL where legally permitted.",
  },
  {
    keys: ["mini 5", "ميني 5"],
    textAr:
      "DJI Mini 5 Pro: مناسب للسفر والتصوير المتقدم، حساسات متقدمة وتصوير عمودي، وارتفاع تشغيل حتى 500م AGL حسب القوانين.",
    textEn:
      "DJI Mini 5 Pro: suitable for travel and advanced filming, with advanced sensing and vertical shooting; up to 500m AGL where legally permitted.",
  },
  {
    keys: ["air 3", "air 3s", "اير 3", "إير 3"],
    textAr:
      "DJI Air 3S: تصوير احترافي، كاميرتان، بطارية ومدى قويان، مناسب للسفر والإنتاج.",
    textEn:
      "DJI Air 3S: professional filming, dual cameras, strong battery and range; suitable for travel and production.",
  },
  {
    keys: ["mavic 4", "مافيك 4"],
    textAr:
      "DJI Mavic 4 Pro: للمحترفين والإنتاج السينمائي والتصوير عالي المستوى.",
    textEn:
      "DJI Mavic 4 Pro: for professionals, cinematic production and high-end filming.",
  },
  {
    keys: ["avata", "افاتا", "أفاتا"],
    textAr:
      "DJI Avata 2 / Avata 360: تجربة FPV وحركة، وليست الخيار الأول للمبتدئ الذي يريد تصويرًا عاديًا.",
    textEn:
      "DJI Avata 2 / Avata 360: designed for FPV and dynamic flying; not the first choice for a beginner wanting conventional filming.",
  },
  {
    keys: ["pocket 3", "pocket 4", "بوكت 3", "بوكت 4"],
    textAr:
      "Osmo Pocket 3 / Pocket 4: فلوقات، سفر، يوتيوب وتصوير يومي بجيمبال.",
    textEn:
      "Osmo Pocket 3 / Pocket 4: for vlogs, travel, YouTube and everyday stabilized filming.",
  },
  {
    keys: ["action 4", "action 6", "اكشن 4", "اكشن 6", "أكشن 4", "أكشن 6"],
    textAr:
      "Osmo Action 4 / Action 6: أكشن، خوذة، رياضة، دراجة ومغامرات.",
    textEn:
      "Osmo Action 4 / Action 6: for action, helmets, sports, bikes and adventures.",
  },
  {
    keys: ["insta", "انستا"],
    textAr: "Insta360: تصوير 360 ومحتوى إبداعي.",
    textEn: "Insta360: for 360° filming and creative content.",
  },
  {
    keys: ["mic", "مايك", "ميكروفون"],
    textAr:
      "DJI Mic Mini / Mic 2 / Mic 3: مايكات لاسلكية للمحتوى والمقابلات.",
    textEn:
      "DJI Mic Mini / Mic 2 / Mic 3: wireless microphones for content and interviews.",
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function normalizeDigits(value: string) {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabic.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit)));
}

function normalizeText(value: string) {
  return normalizeDigits(value)
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}\s\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPhone(value: string) {
  const digits = normalizeDigits(value).replace(/\D/g, "");
  const local = digits.startsWith("968") ? digits.slice(3) : digits;
  return /^[279]\d{7}$/.test(local) ? local : null;
}

function historyWantsTracking(history: ChatMessage[]) {
  const recent = history
    .slice(-4)
    .map((item) => normalizeText(item.content))
    .join(" ");

  return [
    "اتابع طلبي",
    "متابعه الطلب",
    "تتبع الطلب",
    "مشترياتي",
    "اكتب رقم",
    "رقم الهاتف",
    "track my order",
    "track order",
    "my orders",
    "phone number",
  ].some((phrase) => recent.includes(normalizeText(phrase)));
}

function slugify(value: string) {
  return (
    normalizeText(value)
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

function productPath(product: Product) {
  return `/product/${product.id}/${slugify(product.name)}`;
}

function formatPrice(value: number, isEnglish = false) {
  return `${Number(value || 0).toFixed(3)} ${isEnglish ? "OMR" : "ر.ع"}`;
}

function compactDescription(value: string | null) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 140);
}

function containsAny(text: string, words: string[]) {
  const normalized = normalizeText(text);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

function detectIntent(message: string): Intent {
  const text = normalizeText(message);

  if (
    containsAny(text, [
      "تتبع",
      "متابعه الطلب",
      "اتابع طلبي",
      "مشترياتي",
      "track order",
      "track my order",
      "my orders",
    ])
  ) {
    return "tracking";
  }

  if (
    containsAny(text, [
      "تاجير",
      "ايجار",
      "استاجر",
      "rent",
      "rental",
    ])
  ) {
    return "rental";
  }

  if (containsAny(text, ["مزاد", "مزادات", "auction", "auctions"])) {
    return "auction";
  }

  if (
    containsAny(text, [
      "ورشه",
      "صيانه",
      "اصلاح",
      "خربان",
      "workshop",
      "repair",
      "maintenance",
    ])
  ) {
    return "workshop";
  }

  if (containsAny(text, MICROPHONE_WORDS)) return "microphone";
  if (containsAny(text, CAMERA_WORDS)) return "camera";
  if (containsAny(text, ACCESSORY_WORDS)) return "accessory";
  if (containsAny(text, DRONE_WORDS)) return "drone";

  return "general";
}

function extractBudget(message: string): number | null {
  const text = normalizeDigits(message).toLowerCase();

  const patterns = [
    /(?:ميزانيتي|ميزانيه|ميزانية|budget)\s*(?:هي|حوالي|تقريبا|تقريباً|=|:)?\s*(\d{1,4}(?:\.\d+)?)/i,
    /(\d{1,4}(?:\.\d+)?)\s*(?:ر\.?\s*ع|ريال(?:\s+عماني)?|omr)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const value = Number(match[1]);
    if (Number.isFinite(value) && value > 0 && value <= 5000) {
      return value;
    }
  }

  return null;
}

function categoryNameMap(categories: Category[]) {
  return new Map(
    categories.map((category) => [
      Number(category.id),
      normalizeText(category.name || ""),
    ]),
  );
}

function productKind(
  product: Product,
  categories: Map<number, string>,
): "drone" | "camera" | "microphone" | "accessory" | "other" {
  const category = product.category_id
    ? categories.get(Number(product.category_id)) || ""
    : "";

  if (containsAny(category, ["درون", "drone"])) return "drone";
  if (containsAny(category, ["كاميرا", "camera"])) return "camera";
  if (containsAny(category, ["مايك", "ميكروفون", "microphone", "mic"])) {
    return "microphone";
  }
  if (containsAny(category, ["اكسسوار", "إكسسوار", "accessor"])) {
    return "accessory";
  }

  const name = product.name || "";

  if (containsAny(name, MICROPHONE_WORDS)) return "microphone";
  if (containsAny(name, CAMERA_WORDS)) return "camera";
  if (containsAny(name, ACCESSORY_WORDS)) return "accessory";
  if (containsAny(name, DRONE_WORDS)) return "drone";

  return "other";
}

function significantTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2 &&
        !STOP_WORDS.has(token) &&
        !/^\d{3,}$/.test(token),
    );
}

function scoreProduct(
  product: Product,
  query: string,
  categories: Map<number, string>,
) {
  const q = normalizeText(query);
  const name = normalizeText(product.name);
  const qTokens = significantTokens(q);
  const nameTokens = significantTokens(name);
  const kind = productKind(product, categories);
  const queryAccessory = containsAny(q, ACCESSORY_WORDS);

  let score = 0;

  if (q.includes(name) && name.length >= 4) score += 120;
  if (name.includes(q) && q.length >= 4) score += 90;

  for (const token of qTokens) {
    if (nameTokens.includes(token)) score += 16;
    else if (name.includes(token)) score += 8;
  }

  const modelNumbers = q.match(/\b\d{1,2}\b/g) || [];
  for (const number of modelNumbers) {
    if (name.includes(number)) score += 12;
  }

  if (queryAccessory) {
    if (kind === "accessory") score += 35;
    else score -= 15;
  } else {
    if (kind === "accessory") score -= 45;

    // عند كتابة Mini / Neo / Air / Mavic / Avata بدون كلمة ملحق،
    // نفضّل الدرون الأساسي على الفلاتر والشنط والبطاريات.
    if (
      containsAny(q, DRONE_WORDS) &&
      kind === "drone"
    ) {
      score += 28;
    }
  }

  return score;
}

function topMatchingProducts(
  products: Product[],
  query: string,
  categories: Map<number, string>,
  limit = 8,
) {
  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, query, categories),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function selectRelevantProducts(
  products: Product[],
  query: string,
  intent: Intent,
  categories: Map<number, string>,
) {
  const budget = extractBudget(query);
  const ranked = topMatchingProducts(products, query, categories, 12);

  // إذا المستخدم ذكر موديل أو اسم واضح، أعطِ النموذج النتائج الأقرب فقط.
  if (ranked[0]?.score >= 45) {
    return ranked.slice(0, 6).map((entry) => entry.product);
  }

  let pool = products;

  if (
    intent === "drone" ||
    intent === "camera" ||
    intent === "microphone" ||
    intent === "accessory"
  ) {
    pool = products.filter(
      (product) => productKind(product, categories) === intent,
    );
  }

  if (budget) {
    const underBudget = pool.filter(
      (product) => Number(product.price || 0) <= budget,
    );

    if (underBudget.length > 0) {
      pool = underBudget;
    }
  }

  // أعرض المتوفر أولًا، ثم الأقرب للميزانية/السعر، وبحد أقصى 12 منتج.
  return [...pool]
    .sort((a, b) => {
      const stockDiff =
        Number((b.quantity || 0) > 0) - Number((a.quantity || 0) > 0);
      if (stockDiff !== 0) return stockDiff;

      if (budget) {
        return (
          Math.abs(budget - Number(a.price || 0)) -
          Math.abs(budget - Number(b.price || 0))
        );
      }

      return Number(a.price || 0) - Number(b.price || 0);
    })
    .slice(0, 12);
}

function catalogText(products: Product[], isEnglish: boolean) {
  if (!products.length) {
    return isEnglish
      ? "No matching store products were found."
      : "لا توجد منتجات مطابقة متاحة.";
  }

  return products
    .map((product) => {
      const description = compactDescription(product.description);

      return [
        `ID:${product.id}`,
        `${isEnglish ? "Name" : "الاسم"}:${product.name}`,
        `${isEnglish ? "Price" : "السعر"}:${formatPrice(product.price, isEnglish)}`,
        `${isEnglish ? "Availability" : "التوفر"}:${
          product.quantity > 0
            ? isEnglish
              ? "Available"
              : "متوفر"
            : isEnglish
              ? "Unavailable"
              : "غير متوفر"
        }`,
        description
          ? `${isEnglish ? "Description" : "الوصف"}:${description}`
          : "",
        `${isEnglish ? "Path" : "الرابط"}:${productPath(product)}`,
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");
}

function relevantKnowledge(
  message: string,
  products: Product[],
  intent: Intent,
  isEnglish: boolean,
) {
  const haystack = normalizeText(
    `${message} ${products.map((product) => product.name).join(" ")}`,
  );

  let entries = PRODUCT_KNOWLEDGE.filter((entry) =>
    entry.keys.some((key) => haystack.includes(normalizeText(key))),
  );

  if (!entries.length && intent === "drone") {
    entries = PRODUCT_KNOWLEDGE.slice(0, 6);
  }

  if (!entries.length && intent === "camera") {
    entries = PRODUCT_KNOWLEDGE.slice(6, 9);
  }

  if (!entries.length && intent === "microphone") {
    entries = PRODUCT_KNOWLEDGE.slice(9);
  }

  return entries
    .slice(0, 6)
    .map((entry) => (isEnglish ? entry.textEn : entry.textAr))
    .join("\n");
}

function isPriceQuestion(message: string) {
  return containsAny(message, [
    "سعر",
    "بكم",
    "كم سعر",
    "price",
    "how much",
    "cost",
  ]);
}

function isAvailabilityQuestion(message: string) {
  return containsAny(message, [
    "متوفر",
    "موجود",
    "توفر",
    "availability",
    "available",
    "in stock",
  ]);
}

function directProductAnswer(
  products: Product[],
  categories: Map<number, string>,
  message: string,
  isEnglish: boolean,
) {
  if (!isPriceQuestion(message) && !isAvailabilityQuestion(message)) {
    return null;
  }

  const matches = topMatchingProducts(products, message, categories, 5);
  const best = matches[0];

  // لا نجاوب بشكل حتمي إذا التطابق ضعيف.
  if (!best || best.score < 42) return null;

  const product = best.product;
  const available = product.quantity > 0;

  let text = "";

  if (isPriceQuestion(message) && isAvailabilityQuestion(message)) {
    text = isEnglish
      ? `${product.name} is ${formatPrice(product.price, true)} and is currently ${available ? "available" : "unavailable"}.`
      : `${product.name} سعره ${formatPrice(product.price)} وحالته حاليًا ${available ? "متوفر" : "غير متوفر"}.`;
  } else if (isPriceQuestion(message)) {
    text = isEnglish
      ? `${product.name} is ${formatPrice(product.price, true)}.`
      : `${product.name} سعره ${formatPrice(product.price)}.`;
  } else {
    text = isEnglish
      ? `${product.name} is currently ${available ? "available" : "unavailable"}.`
      : `${product.name} حاليًا ${available ? "متوفر" : "غير متوفر"}.`;
  }

  return {
    message: text,
    actions: [
      {
        type: "open_product",
        label: isEnglish ? "Open product" : "فتح المنتج",
        path: productPath(product),
        style: "primary",
      },
    ],
  };
}

function dedupeAndTrimHistory(
  history: ChatMessage[],
  currentMessage: string,
) {
  const cleaned = history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 700),
    }))
    .filter((item) => item.content);

  // الواجهة القديمة كانت ترسل رسالة المستخدم الحالية داخل history
  // ثم نضيفها مرة ثانية هنا. نحذف النسخة المكررة لتوفير التوكنات.
  const last = cleaned[cleaned.length - 1];
  if (
    last?.role === "user" &&
    normalizeText(last.content) === normalizeText(currentMessage)
  ) {
    cleaned.pop();
  }

  return cleaned.slice(-6);
}

function messageIsExperienceQuestion(message: string) {
  const normalized = normalizeText(message);

  const ar =
    normalized.includes("مبتدئ") &&
    (normalized.includes("خبره") ||
      normalized.includes("محترف") ||
      normalized.includes("اول مره") ||
      normalized.includes("سبق"));

  const en =
    normalized.includes("beginner") &&
    (normalized.includes("experience") ||
      normalized.includes("experienced") ||
      normalized.includes("first time"));

  return ar || en;
}

function sanitizeActions(
  actions: unknown,
  assistantMessage: string,
): AIAction[] {
  if (!Array.isArray(actions)) return [];

  const result: AIAction[] = [];
  const allowExperienceButtons =
    messageIsExperienceQuestion(assistantMessage);

  for (const raw of actions.slice(0, 4)) {
    if (!raw || typeof raw !== "object") continue;

    const action = raw as Record<string, unknown>;
    const type = String(action.type || "");
    const label = String(action.label || "").trim().slice(0, 60);

    if (!label) continue;

    const style =
      action.style === "primary" || action.style === "secondary"
        ? action.style
        : undefined;

    if (type === "auto_open_product") {
      const path = String(action.path || "");
      const productName = String(action.productName || "")
        .trim()
        .slice(0, 120);
      const productPrice = String(action.productPrice || "")
        .trim()
        .slice(0, 50);

      if (
        path.startsWith("/") &&
        !path.startsWith("//") &&
        path.length < 300 &&
        productName
      ) {
        result.push({
          type,
          label,
          path,
          productName,
          productPrice: productPrice || undefined,
          style,
        });
      }

      continue;
    }

    if (type === "navigate" || type === "open_product") {
      const path = String(action.path || "");

      if (
        path.startsWith("/") &&
        !path.startsWith("//") &&
        path.length < 300
      ) {
        result.push({ type, label, path, style });
      }

      continue;
    }

    if (type === "prompt") {
      if (!allowExperienceButtons) continue;

      const normalizedLabel = normalizeText(label);
      const isExperienceChoice =
        normalizedLabel.includes("مبتدئ") ||
        normalizedLabel.includes("خبره") ||
        normalizedLabel.includes("محترف") ||
        normalizedLabel.includes("اول مره") ||
        normalizedLabel.includes("beginner") ||
        normalizedLabel.includes("experienced") ||
        normalizedLabel.includes("first time");

      if (!isExperienceChoice) continue;

      const prompt = String(action.prompt || "").trim().slice(0, 300);

      if (prompt) {
        result.push({ type, label, prompt, style });
      }

      continue;
    }

    if (type === "request_phone") {
      result.push({
        type,
        label,
        purpose: "track_order",
        style,
      });

      continue;
    }

    if (type === "restart_flow") {
      result.push({ type, label, style });
    }
  }

  return result;
}

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    actions: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: [
              "navigate",
              "open_product",
              "auto_open_product",
              "prompt",
              "request_phone",
              "restart_flow",
            ],
          },
          label: { type: "string" },
          path: { type: ["string", "null"] },
          productName: { type: ["string", "null"] },
          productPrice: { type: ["string", "null"] },
          prompt: { type: ["string", "null"] },
          purpose: {
            type: ["string", "null"],
            enum: ["track_order", null],
          },
          style: {
            type: ["string", "null"],
            enum: ["primary", "secondary", null],
          },
        },
        required: [
          "type",
          "label",
          "path",
          "productName",
          "productPrice",
          "prompt",
          "purpose",
          "style",
        ],
      },
    },
  },
  required: ["message", "actions"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { message: "Method not allowed", actions: [] },
      405,
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        message: "بيانات اتصال Supabase غير مكتملة.",
        actions: [],
      },
      500,
    );
  }

  if (!OPENAI_API_KEY) {
    return jsonResponse(
      {
        message:
          "مفتاح OpenAI غير موجود في Supabase Secrets. أضف OPENAI_API_KEY ثم أعد نشر الدالة.",
        actions: [],
      },
      500,
    );
  }

  let isEnglish = false;

  try {
    const body = await req.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim().slice(0, 1200)
        : "";

    const language = body?.language === "en" ? "en" : "ar";
    isEnglish = language === "en";

    const rawHistory: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
      : [];

    const history = dedupeAndTrimHistory(rawHistory, message);

    if (!message) {
      return jsonResponse({
        message: isEnglish
          ? "Tell me what you are looking for and I’ll help you."
          : "اكتب لي شو تدور عليه وبساعدك.",
        actions: [],
      });
    }

    const phone = extractPhone(message);

    if (phone && historyWantsTracking(history)) {
      return jsonResponse({
        message: isEnglish
          ? "Done. I’ll open your orders and search using this number."
          : "تمام، بفتح مشترياتك وببحث بهذا الرقم تلقائي.",
        actions: [
          {
            type: "navigate",
            label: isEnglish ? "Open My Orders" : "فتح مشترياتي",
            path: `/my-orders?phone=${encodeURIComponent(phone)}&search=1`,
            style: "primary",
          },
        ],
      });
    }

    const intent = detectIntent(message);

    // نوفّر استدعاء OpenAI بالكامل في الطلبات الواضحة جدًا.
    if (intent === "tracking") {
      return jsonResponse({
        message: isEnglish
          ? "Enter the phone number used for the order."
          : "اكتب رقم الهاتف المستخدم في الطلب.",
        actions: [
          {
            type: "request_phone",
            label: isEnglish ? "Enter phone number" : "اكتب رقم الهاتف",
            purpose: "track_order",
            style: "primary",
          },
        ],
      });
    }

    if (intent === "workshop") {
      return jsonResponse({
        message: isEnglish
          ? "I’ll open the workshop page for you."
          : "تمام، بفتح لك صفحة الورشة.",
        actions: [
          {
            type: "navigate",
            label: isEnglish ? "Open Workshop" : "فتح الورشة",
            path: "/workshop",
            style: "primary",
          },
        ],
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );

    // المنتجات + التصنيفات فقط أولًا.
    // لا نجلب بيانات التأجير أو المزادات إلا إذا السؤال عنها.
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,slug,description,price,quantity,category_id,is_active",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(250),

      supabase
        .from("categories")
        .select("id,name")
        .limit(50),
    ]);

    const products = (productsResult.data || []) as Product[];
    const categories = (categoriesResult.data || []) as Category[];
    const categoriesMap = categoryNameMap(categories);

    // أسئلة السعر/التوفر الواضحة نجاوبها مباشرة من Supabase بدون OpenAI.
    const deterministicProductReply = directProductAnswer(
      products,
      categoriesMap,
      message,
      isEnglish,
    );

    if (deterministicProductReply) {
      return jsonResponse(deterministicProductReply);
    }

    let rentalsText = "";
    let auctionsText = "";

    if (intent === "rental") {
      const rentalsResult = await supabase
        .from("rental_drones")
        .select(
          "id,name,description,daily_price,deposit_amount,is_active",
        )
        .eq("is_active", true)
        .limit(20);

      rentalsText = (rentalsResult.data || [])
        .slice(0, 12)
        .map(
          (item: Record<string, unknown>) =>
            `${item.name} | ${
              isEnglish ? "Daily" : "اليومي"
            }: ${formatPrice(
              Number(item.daily_price || 0),
              isEnglish,
            )} | ${isEnglish ? "Path" : "الرابط"}: /rentals/${item.id}`,
        )
        .join("\n");
    }

    if (intent === "auction") {
      const auctionsResult = await supabase
        .from("auctions")
        .select(
          "id,title,name,product_name,status,current_price,highest_bid,start_price,starting_price,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(10);

      auctionsText = (auctionsResult.data || [])
        .map((item: Record<string, unknown>) => {
          const name =
            item.title ||
            item.name ||
            item.product_name ||
            (isEnglish ? "Auction" : "مزاد");

          const price =
            item.current_price ||
            item.highest_bid ||
            item.start_price ||
            item.starting_price ||
            0;

          return `${name} | ${
            isEnglish ? "Status" : "الحالة"
          }: ${item.status || (isEnglish ? "Unspecified" : "غير محددة")} | ${
            isEnglish ? "Current price" : "السعر الحالي"
          }: ${formatPrice(Number(price), isEnglish)} | ${
            isEnglish ? "Path" : "الرابط"
          }: /auctions/${item.id}`;
        })
        .join("\n");
    }

    const relevantProducts = selectRelevantProducts(
      products,
      message,
      intent,
      categoriesMap,
    );

    const knowledge = relevantKnowledge(
      message,
      relevantProducts,
      intent,
      isEnglish,
    );

    const catalog = catalogText(relevantProducts, isEnglish);

    const systemPrompt = isEnglish
      ? `
You are "Nour", Mergab Store's smart sales assistant in Oman.

Rules:
- Reply only in natural English, briefly and clearly.
- Ask one question at a time and remember the recent conversation.
- Never mention OpenAI, internal quantities, purchase cost, profit, or private data.
- Store prices and availability must come only from the supplied store data.
- If the customer says Mini 4 / Mini 5 / Neo / Air / Mavic / Avata without saying filter, bag, battery, propellers, etc., interpret it as the DRONE, not an accessory.
- If information is uncertain, say it needs confirmation. Never invent specifications.
- For drone altitude, use AGL (above ground level), not altitude above sea level.
- If choosing a drone for the customer: ask experience first if unknown; then ask them to type their use case; then their OMR budget. Do not ask questions already answered.
- Only the first experience question may have prompt buttons. Otherwise let the customer type.
- Once the right product is clear, recommend up to 3 products. If one product is clearly best, return one auto_open_product action with the exact supplied path, name and price.
- "better" means a stronger normally more expensive suitable option; "cheaper" means a cheaper suitable option; "alternative" must not repeat the same product.
- Tracking => request_phone. Rentals => /rentals. Workshop => /workshop. Auctions => /auctions.
- Keep normal replies around 1-5 short sentences.

Relevant product notes:
${knowledge || "Use only the supplied store data."}

Relevant store products:
${catalog}

${intent === "rental" ? `Current rentals:\n${rentalsText || "No rentals available."}` : ""}
${intent === "auction" ? `Current auctions:\n${auctionsText || "No auctions available."}` : ""}
`
      : `
أنتِ "نور"، مستشارة المبيعات الذكية في متجر مرقاب في سلطنة عمان.

القواعد:
- ردي بالعربية وبلهجة عمانية خفيفة وطبيعية، باختصار ووضوح.
- اسألي سؤالًا واحدًا فقط كل مرة وتذكري آخر كلام في المحادثة.
- لا تذكري OpenAI، ولا عدد القطع، ولا سعر الشراء، ولا الربح، ولا أي بيانات داخلية.
- الأسعار والتوفر تؤخذ فقط من بيانات المتجر المرفقة.
- إذا قال الزبون Mini 4 أو Mini 5 أو Neo أو Air أو Mavic أو Avata بدون كلمة فلتر/شنطة/بطارية/مراوح أو ملحق، فالمقصود الدرون الأساسي وليس الإكسسوار.
- إذا المعلومة غير مؤكدة، قولي تحتاج تأكيد ولا تخترعين مواصفات.
- ارتفاع الدرون يكون AGL من سطح الأرض وليس عن سطح البحر.
- عند اختيار درون: إذا خبرته غير معروفة اسألي أولًا هل مبتدئ أو عنده خبرة؛ بعدها خليه يكتب استخدامه؛ بعدها الميزانية بالريال العماني. لا تعيدي سؤال جاوبه مسبقًا.
- أزرار prompt مسموحة فقط في سؤال الخبرة الأول. بعد ذلك خليه يكتب بنفسه.
- إذا اكتملت المعلومات رشحي من 1 إلى 3 منتجات فقط. إذا منتج واحد واضح أنه الأنسب، أعيدي auto_open_product واحد فقط بالرابط والاسم والسعر الحقيقي المرفق.
- "أريد أفضل" = خيار أقوى وغالبًا أغلى إذا مناسب. "أريد أرخص" = خيار أرخص مع بقاءه مناسبًا. "أريد بديل" = لا تعيدي نفس المنتج.
- متابعة الطلب => request_phone. التأجير => /rentals. الورشة => /workshop. المزادات => /auctions.
- الرد العادي يكون غالبًا من جملة إلى 5 جمل قصيرة.

معلومات مفيدة فقط للمنتجات ذات الصلة:
${knowledge || "اعتمدي فقط على بيانات المتجر المرفقة."}

المنتجات ذات الصلة من المتجر:
${catalog}

${intent === "rental" ? `التأجير الحالي:\n${rentalsText || "لا توجد بيانات تأجير."}` : ""}
${intent === "auction" ? `المزادات الحالية:\n${auctionsText || "لا توجد مزادات."}` : ""}
`;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: systemPrompt,
      input: [
        ...history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "nour_reply",
          strict: true,
          schema: outputSchema,
        },
      },
      // الردود عندك قصيرة؛ 450 كفاية لمعظم الأسئلة
      // وتقلل احتمال صرف توكنات إخراج بلا داعٍ.
      max_output_tokens: 450,
    });

    const raw = response.output_text?.trim();

    if (!raw) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = JSON.parse(raw);

    const assistantMessage =
      typeof parsed.message === "string"
        ? parsed.message.trim()
        : isEnglish
          ? "How can I help you?"
          : "شو تحب أساعدك فيه؟";

    return jsonResponse({
      message: assistantMessage,
      actions: sanitizeActions(
        parsed.actions,
        assistantMessage,
      ),
    });
  } catch (error) {
    console.error("mergab-ai error:", error);

    return jsonResponse(
      {
        message: isEnglish
          ? "A temporary error occurred. Please try again shortly."
          : "صار خطأ بسيط عند نور. جرّب مرة ثانية بعد شوي.",
        actions: [
          {
            type: "navigate",
            label: isEnglish ? "Open Shop" : "فتح المتجر",
            path: "/shop",
            style: "primary",
          },
        ],
      },
      500,
    );
  }
});
