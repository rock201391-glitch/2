import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * زليخة — محرك مساعد متجر مرقاب المجاني
 * ----------------------------------------
 * لا يستخدم OpenAI أو Gemini أو أي API مدفوع.
 *
 * يعتمد على:
 * 1) منتجات المتجر الحقيقية من Supabase.
 * 2) فهم النية والميزانية والفئة من كلام العميل.
 * 3) ذاكرة آخر رسائل المحادثة.
 * 4) مطابقة مرنة للأسماء والأخطاء الإملائية.
 * 5) قاعدة معرفة مختصرة لبعض المنتجات الموثقة.
 *
 * مهم:
 * - السعر والمخزون دائمًا يؤخذان من جدول products.
 * - المواصفات الإضافية تؤخذ أولًا من description في قاعدة البيانات.
 * - لا تضع مواصفات غير مؤكدة داخل CURATED_KNOWLEDGE.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SECRET_KEYS = JSON.parse(
  Deno.env.get("SUPABASE_SECRET_KEYS") || "{}",
);

const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  SUPABASE_SECRET_KEYS.service_role ||
  SUPABASE_SECRET_KEYS.secret;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatRole = "assistant" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AIAction =
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

type Product = {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  category_id: number | null;
  colors: string[] | null;
  is_active: boolean;
  created_at?: string | null;
};

type RentalDrone = {
  id: number;
  name: string;
  description: string | null;
  image_url?: string | null;
  daily_price: number;
  deposit_amount: number | null;
  is_active: boolean;
};

type CuratedKnowledge = {
  aliases: string[];
  kind: "drone" | "camera" | "microphone" | "accessory" | "memory" | "other";
  summary: string;
  specs?: {
    camera?: string;
    flightTime?: string;
    transmission?: string;
    maxTakeoffAltitude?: string;
    weight?: string;
    sensors?: string;
    usage?: string;
    comboContents?: string;
  };
  tags: string[];
  beginnerScore?: number;
  travelScore?: number;
  cameraScore?: number;
  powerScore?: number;
};

/**
 * قاعدة معرفة مختصرة وآمنة.
 *
 * السعر غير موجود هنا لأنه يتغير ويؤخذ من Supabase.
 * أضف أي منتج جديد هنا فقط إذا كانت مواصفاته مؤكدة.
 */
const CURATED_KNOWLEDGE: Record<string, CuratedKnowledge> = {
  "dji mini 4 pro": {
    aliases: [
      "mini 4 pro",
      "mini4pro",
      "ميني 4 برو",
      "ميني فور برو",
      "mini 4 pro combo",
      "mini 4 pro combo plus",
    ],
    kind: "drone",
    summary:
      "درون خفيف ومناسب للسفر والتصوير، مع حساسات عوائق شاملة وتصوير عمودي.",
    specs: {
      camera: "كاميرا 48MP وتصوير فيديو حتى 4K/100fps",
      flightTime: "حتى 34 دقيقة بالبطارية العادية أو 45 دقيقة ببطارية Plus",
      transmission: "نظام O4، حتى 20 كم وفق معيار FCC في بيئة مفتوحة",
      weight: "أقل من 249 جرام بالبطارية العادية",
      sensors: "استشعار عوائق شامل الاتجاهات",
      usage: "مناسب للمبتدئ والسفر والتصوير الاحترافي الخفيف",
      comboContents:
        "محتويات الكومبو تختلف حسب النسخة؛ راجع وصف المنتج في المتجر لمعرفة عدد البطاريات ونوع الريموت",
    },
    tags: [
      "مبتدئ",
      "سفر",
      "خفيف",
      "تصوير",
      "عمودي",
      "حساسات",
      "4k",
      "بطارية طويلة",
    ],
    beginnerScore: 9,
    travelScore: 10,
    cameraScore: 8,
    powerScore: 7,
  },

  "dji avata 2": {
    aliases: [
      "avata 2",
      "avata2",
      "افاتا 2",
      "افاتـا 2",
      "افاتا تو",
      "dji avata 2 combo",
    ],
    kind: "drone",
    summary:
      "درون FPV للتجربة الغامرة والحركة السريعة، مناسب للتصوير الديناميكي أكثر من التصوير التقليدي.",
    specs: {
      camera: "مستشعر 1/1.3 بوصة وتصوير حتى 4K/100fps",
      flightTime: "حتى نحو 23 دقيقة",
      transmission:
        "نظام O4، حتى 13 كم وفق FCC أو 10 كم وفق CE في بيئة مفتوحة",
      weight: "حوالي 377 جرام",
      sensors: "تموضع بصري سفلي وخلفي، وليست حساسات شاملة مثل Mini 4 Pro",
      usage: "مناسب لتصوير FPV والحركة؛ يحتاج تعود أكثر من الدرونات التقليدية",
      comboContents:
        "محتويات الكومبو تختلف حسب النسخة، وقد تشمل النظارة ووحدة التحكم والبطاريات",
    },
    tags: ["fpv", "سرعة", "حركة", "اكشن", "4k", "نظارة"],
    beginnerScore: 5,
    travelScore: 6,
    cameraScore: 8,
    powerScore: 9,
  },
};

/**
 * كلمات ومرادفات تساعد زليخة على فهم اللهجة والأخطاء البسيطة.
 */
const INTENT_WORDS = {
  greeting: ["هلا", "مرحبا", "السلام", "هاي", "hello", "اهلين"],
  recommend: [
    "شو تنصح",
    "وش تنصح",
    "انصحني",
    "تنصحني",
    "ساعديني",
    "ساعدني",
    "اختار",
    "اختيار",
    "مناسب لي",
    "رشحي",
    "رشح",
    "افضل شي",
    "أفضل شي",
  ],
  price: ["كم سعر", "السعر", "سعره", "بكم", "كم قيمته", "القيمه"],
  specs: [
    "مواصفات",
    "مميزاته",
    "مميزات",
    "تفاصيل",
    "البطاريه",
    "البطارية",
    "المدى",
    "البعد",
    "التصوير",
    "الارتفاع",
    "الوزن",
    "الحساسات",
    "الملحقات",
    "شو معه",
    "ايش معه",
  ],
  availability: [
    "متوفر",
    "موجود",
    "خلص",
    "نفذ",
    "كم الكميه",
    "كم الكمية",
    "في مخزون",
  ],
  compare: ["قارن", "مقارنه", "مقارنة", "الفرق بين", "افضل بينهم"],
  order: [
    "طلبي",
    "تتبع",
    "متابعه طلب",
    "متابعة طلب",
    "وين الطلب",
    "حاله الطلب",
    "حالة الطلب",
    "طلباتي",
  ],
  rental: ["ايجار", "إيجار", "استاجر", "استأجر", "تاجير", "تأجير"],
  workshop: [
    "ورشه",
    "ورشة",
    "صيانه",
    "صيانة",
    "تصليح",
    "عطل",
    "خربان",
    "مشكله في الدرون",
  ],
  payment: [
    "دفع",
    "تحويل",
    "عند الاستلام",
    "بطاقه",
    "بطاقة",
    "فيزا",
    "مدى",
  ],
  shipping: ["شحن", "توصيل", "كم يوم", "مده التوصيل", "مدة التوصيل"],
  cheaper: ["ارخص", "أرخص", "اقل سعر", "أقل سعر", "اقتصادي"],
  stronger: ["اقوى", "أقوى", "احترافي", "افضل", "أفضل", "متطور"],
  previous: [
    "هذا",
    "هذي",
    "هذاك",
    "اللي قبل",
    "السابق",
    "قصدي",
    "نفسه",
    "منه",
    "عنه",
  ],
  second: ["الثاني", "الخيار الثاني", "رقم 2"],
  first: ["الاول", "الأول", "الخيار الاول", "الخيار الأول", "رقم 1"],
};

/**
 * أنواع المنتجات والعبارات التي تدل عليها.
 */
const CATEGORY_DICTIONARY = {
  drone: [
    "درون",
    "طائره",
    "طائرة",
    "dji",
    "ميني",
    "mini",
    "نيو",
    "neo",
    "افاتا",
    "avata",
    "air",
    "mavic",
    "مافيك",
  ],
  camera: [
    "كاميرا",
    "اكشن",
    "action",
    "اوزمو",
    "osmo",
    "pocket",
    "بوكيت",
    "insta",
    "انستا",
  ],
  microphone: ["مايك", "ميكروفون", "mic", "wireless mic"],
  memory: [
    "ذاكره",
    "ذاكرة",
    "ميموري",
    "memory",
    "micro sd",
    "sd card",
    "سان ديسك",
    "sandisk",
  ],
  accessory: [
    "ملحق",
    "ملحقات",
    "اكسسوار",
    "اكسسوارات",
    "بطاريه",
    "بطارية",
    "فلتر",
    "شنطه",
    "شنطة",
    "مراوح",
    "شاحن",
    "كيبل",
    "كفر",
    "حامل",
  ],
};

const ACCESSORY_WORDS = CATEGORY_DICTIONARY.accessory;

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
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s.+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function includesAny(text: string, phrases: string[]) {
  const normalized = normalizeText(text);
  return phrases.some((phrase) => normalized.includes(normalizeText(phrase)));
}

function slugify(value: string) {
  return (
    normalizeText(value)
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function formatPrice(value: number | null | undefined) {
  return `${Number(value || 0).toFixed(3)} ر.ع`;
}

function productPath(product: Product) {
  return `/product/${product.id}/${slugify(product.name)}`;
}

function rentalPath(drone: RentalDrone) {
  return `/rentals/${drone.id}/${slugify(drone.name)}`;
}

function extractPhone(text: string) {
  const normalized = normalizeDigits(text);
  const matches = normalized.match(/(?:\+?968[\s-]?)?[279]\d{7}/g);

  if (!matches?.length) return null;

  const digits = matches[0].replace(/\D/g, "");
  return digits.startsWith("968") ? digits.slice(3) : digits;
}

function phoneFilter(phone: string) {
  const local = phone.startsWith("968") ? phone.slice(3) : phone;
  const full = `968${local}`;

  return `phone.eq.${local},phone.eq.${full},phone.eq.+${full}`;
}

type BudgetRange = {
  min: number | null;
  max: number | null;
};

function extractBudgetRange(text: string): BudgetRange {
  const normalized = normalizeDigits(normalizeText(text));

  const between = normalized.match(
    /(?:من\s*)?(\d+(?:\.\d+)?)\s*(?:الى|إلى|-)\s*(\d+(?:\.\d+)?)/,
  );

  if (between) {
    const first = Number(between[1]);
    const second = Number(between[2]);

    return {
      min: Math.min(first, second),
      max: Math.max(first, second),
    };
  }

  const under = normalized.match(
    /(?:اقل من|أقل من|تحت|حدي|ميزانيتي|ميزانيه|اقصى|أقصى)\s*(?:حوالي\s*)?(\d+(?:\.\d+)?)/,
  );

  if (under) {
    return { min: null, max: Number(under[1]) };
  }

  const over = normalized.match(
    /(?:اكثر من|أكثر من|فوق)\s*(\d+(?:\.\d+)?)/,
  );

  if (over) {
    return { min: Number(over[1]), max: null };
  }

  const rial = normalized.match(/(\d+(?:\.\d+)?)\s*(?:ريال|ر\.ع)/);

  if (rial) {
    return { min: null, max: Number(rial[1]) };
  }

  return { min: null, max: null };
}

function hasBudget(range: BudgetRange) {
  return range.min !== null || range.max !== null;
}

function priceWithinBudget(price: number, range: BudgetRange) {
  if (range.min !== null && price < range.min) return false;
  if (range.max !== null && price > range.max) return false;
  return true;
}

/**
 * مسافة Levenshtein لفهم الأخطاء الإملائية البسيطة.
 */
function levenshtein(a: string, b: string) {
  const left = compactText(a);
  const right = compactText(b);

  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix: number[][] = Array.from(
    { length: left.length + 1 },
    () => Array(right.length + 1).fill(0),
  );

  for (let i = 0; i <= left.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i++) {
    for (let j = 1; j <= right.length; j++) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function similarity(a: string, b: string) {
  const left = compactText(a);
  const right = compactText(b);
  const maxLength = Math.max(left.length, right.length);

  if (!maxLength) return 1;

  return 1 - levenshtein(left, right) / maxLength;
}

function detectRequestedCategory(text: string) {
  const normalized = normalizeText(text);

  for (const [category, words] of Object.entries(CATEGORY_DICTIONARY)) {
    if (includesAny(normalized, words)) {
      return category as keyof typeof CATEGORY_DICTIONARY;
    }
  }

  return null;
}

function productLooksLikeCategory(
  product: Product,
  category: keyof typeof CATEGORY_DICTIONARY | null,
) {
  if (!category) return true;

  const haystack = normalizeText(
    `${product.name} ${product.description || ""}`,
  );

  return CATEGORY_DICTIONARY[category].some((word) =>
    haystack.includes(normalizeText(word)),
  );
}

function isAccessory(product: Product) {
  const haystack = normalizeText(
    `${product.name} ${product.description || ""}`,
  );

  return ACCESSORY_WORDS.some((word) =>
    haystack.includes(normalizeText(word)),
  );
}

function getCuratedKnowledge(product: Product) {
  const normalizedName = normalizeText(product.name);

  for (const [key, knowledge] of Object.entries(CURATED_KNOWLEDGE)) {
    const names = [key, ...knowledge.aliases].map(normalizeText);

    if (
      names.some(
        (name) =>
          normalizedName.includes(name) ||
          name.includes(normalizedName) ||
          similarity(normalizedName, name) >= 0.86,
      )
    ) {
      return knowledge;
    }
  }

  return null;
}

function aliasesForProduct(product: Product) {
  const knowledge = getCuratedKnowledge(product);

  return [
    product.name,
    product.slug || "",
    ...(knowledge?.aliases || []),
  ].filter(Boolean);
}

function nameMatchScore(product: Product, query: string) {
  const normalizedQuery = normalizeText(query);
  const compactQuery = compactText(query);
  const queryTokens = tokenize(query);

  let best = 0;

  for (const alias of aliasesForProduct(product)) {
    const normalizedAlias = normalizeText(alias);
    const compactAlias = compactText(alias);
    const aliasTokens = tokenize(alias);

    if (normalizedQuery === normalizedAlias) best = Math.max(best, 120);
    if (compactQuery === compactAlias) best = Math.max(best, 118);

    if (
      normalizedQuery.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedQuery)
    ) {
      best = Math.max(best, 82);
    }

    const tokenHits = aliasTokens.filter((token) =>
      queryTokens.some(
        (queryToken) =>
          queryToken === token ||
          queryToken.includes(token) ||
          token.includes(queryToken) ||
          similarity(queryToken, token) >= 0.78,
      ),
    ).length;

    if (tokenHits > 0) {
      best = Math.max(
        best,
        tokenHits * 18 + (tokenHits === aliasTokens.length ? 20 : 0),
      );
    }

    const fuzzy = similarity(compactQuery, compactAlias);
    if (fuzzy >= 0.72) {
      best = Math.max(best, fuzzy * 70);
    }
  }

  const description = normalizeText(product.description || "");

  for (const token of queryTokens) {
    if (description.includes(token)) best += 2;
  }

  return best;
}

function findProductCandidates(
  products: Product[],
  query: string,
  requestedCategory: keyof typeof CATEGORY_DICTIONARY | null,
) {
  const asksForDrone = requestedCategory === "drone";

  return products
    .filter((product) => product.is_active)
    .map((product) => {
      let score = nameMatchScore(product, query);

      if (requestedCategory) {
        if (productLooksLikeCategory(product, requestedCategory)) {
          score += 25;
        } else {
          score -= 25;
        }
      }

      /**
       * إذا العميل يقول "الدرون" لا نختار فلتر أو بطارية تحمل نفس الاسم.
       */
      if (asksForDrone && isAccessory(product)) {
        score -= 45;
      }

      if (product.quantity > 0) score += 3;

      return { product, score };
    })
    .filter((item) => item.score >= 12)
    .sort((a, b) => b.score - a.score);
}

function findBestProduct(
  products: Product[],
  query: string,
  requestedCategory: keyof typeof CATEGORY_DICTIONARY | null,
) {
  return findProductCandidates(products, query, requestedCategory)[0]?.product;
}

function extractProductsFromHistory(
  products: Product[],
  history: ChatMessage[],
) {
  const found: Product[] = [];

  for (const message of [...history].reverse()) {
    const candidates = findProductCandidates(
      products,
      message.content,
      detectRequestedCategory(message.content),
    );

    for (const candidate of candidates.slice(0, 3)) {
      if (!found.some((product) => product.id === candidate.product.id)) {
        found.push(candidate.product);
      }
    }

    if (found.length >= 4) break;
  }

  return found;
}

function inferContextText(history: ChatMessage[]) {
  return history
    .slice(-8)
    .map((message) => message.content)
    .join(" ");
}

function lastAssistantAskedForPhone(history: ChatMessage[]) {
  const lastAssistant = [...history]
    .reverse()
    .find((message) => message.role === "assistant");

  if (!lastAssistant) return false;

  return includesAny(lastAssistant.content, [
    "اكتب رقم الهاتف",
    "اكتب رقمك",
    "رقم الهاتف المستخدم",
    "ابحث في طلبات المتجر",
  ]);
}

function getPreviouslyMentionedProductIds(
  products: Product[],
  history: ChatMessage[],
) {
  return new Set(
    extractProductsFromHistory(products, history).map(
      (product) => product.id,
    ),
  );
}

function inferBudgetFromHistory(
  currentMessage: string,
  history: ChatMessage[],
) {
  const current = extractBudgetRange(currentMessage);
  if (hasBudget(current)) return current;

  for (const message of [...history].reverse()) {
    if (message.role !== "user") continue;

    const range = extractBudgetRange(message.content);
    if (hasBudget(range)) return range;
  }

  return { min: null, max: null };
}

function inferCategoryFromHistory(
  currentMessage: string,
  history: ChatMessage[],
) {
  const current = detectRequestedCategory(currentMessage);
  if (current) return current;

  for (const message of [...history].reverse()) {
    if (message.role !== "user") continue;

    const category = detectRequestedCategory(message.content);
    if (category) return category;
  }

  return null;
}

function inferUseCase(text: string) {
  const normalized = normalizeText(text);

  return {
    beginner: includesAny(normalized, [
      "مبتدئ",
      "اول مره",
      "أول مرة",
      "سهل",
      "سهوله",
    ]),
    travel: includesAny(normalized, [
      "سفر",
      "خفيف",
      "صغير",
      "رحلات",
      "تنقل",
    ]),
    photography: includesAny(normalized, [
      "تصوير",
      "كاميرا",
      "جوده",
      "جودة",
      "فيديو",
      "صور",
      "احترافي",
    ]),
    battery: includesAny(normalized, [
      "بطاريه",
      "بطارية",
      "وقت طويل",
      "اطول",
      "أطول",
    ]),
    power: includesAny(normalized, [
      "قوي",
      "اقوى",
      "أقوى",
      "احترافي",
      "سرعه",
      "سرعة",
    ]),
    cheap: includesAny(normalized, INTENT_WORDS.cheaper),
  };
}

function recommendationScore(
  product: Product,
  text: string,
  budget: BudgetRange,
  category: keyof typeof CATEGORY_DICTIONARY | null,
) {
  let score = 0;
  const price = Number(product.price);
  const useCase = inferUseCase(text);
  const knowledge = getCuratedKnowledge(product);
  const haystack = normalizeText(
    `${product.name} ${product.description || ""} ${(knowledge?.tags || []).join(" ")}`,
  );

  if (!product.is_active || product.quantity <= 0) return -9999;
  if (!priceWithinBudget(price, budget)) return -9999;

  if (category) {
    score += productLooksLikeCategory(product, category) ? 40 : -60;
  }

  if (useCase.beginner) {
    score += (knowledge?.beginnerScore || 0) * 4;
    if (includesAny(haystack, ["مبتدئ", "سهل", "حساسات"])) score += 14;
  }

  if (useCase.travel) {
    score += (knowledge?.travelScore || 0) * 4;
    if (includesAny(haystack, ["خفيف", "سفر", "صغير", "249"])) score += 14;
  }

  if (useCase.photography) {
    score += (knowledge?.cameraScore || 0) * 4;
    if (includesAny(haystack, ["4k", "5.4k", "48mp", "تصوير", "كاميرا"])) {
      score += 14;
    }
  }

  if (useCase.power) {
    score += (knowledge?.powerScore || 0) * 4;
    if (includesAny(haystack, ["احترافي", "fpv", "قوي", "سرعه"])) score += 12;
  }

  if (useCase.battery) {
    if (
      includesAny(haystack, [
        "45 دقيقه",
        "45 دقيقة",
        "بطاريه طويله",
        "بطارية طويلة",
      ])
    ) {
      score += 20;
    }
  }

  /**
   * المنتج القريب من سقف الميزانية غالبًا أقوى،
   * لكن لا نجعله العامل الوحيد.
   */
  if (budget.max !== null && budget.max > 0) {
    const ratio = Math.min(price / budget.max, 1);
    score += ratio * 12;
  }

  if (useCase.cheap) {
    score += Math.max(0, 20 - price / 20);
  }

  score += Math.min(product.quantity, 10) * 0.2;

  return score;
}

function recommendProducts(
  products: Product[],
  text: string,
  budget: BudgetRange,
  category: keyof typeof CATEGORY_DICTIONARY | null,
) {
  return products
    .map((product) => ({
      product,
      score: recommendationScore(
        product,
        text,
        budget,
        category,
      ),
    }))
    .filter((item) => item.score > -9000)
    .sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.01) {
        return b.score - a.score;
      }

      return Number(a.product.price) - Number(b.product.price);
    })
    .slice(0, 5)
    .map((item) => item.product);
}

function productActions(products: Product[]): AIAction[] {
  return products.slice(0, 3).map((product, index) => ({
    type: "navigate",
    label: `فتح ${product.name}`,
    path: productPath(product),
    style: index === 0 ? "primary" : "secondary",
  }));
}

function alternativeActions(
  currentProduct?: Product,
): AIAction[] {
  const productName = currentProduct?.name || "المنتج السابق";

  return [
    {
      type: "prompt",
      label: "أرخص",
      prompt: `أريد خيارًا أرخص من ${productName}، ولا تعرض ${productName} مرة ثانية.`,
      style: "secondary",
    },
    {
      type: "prompt",
      label: "أقوى",
      prompt: `أريد خيارًا أقوى من ${productName}، ولا تعرض ${productName} مرة ثانية.`,
      style: "secondary",
    },
    {
      type: "prompt",
      label: "خيار ثاني",
      prompt: `أعطني منتجًا ثانيًا مختلفًا عن ${productName}، ولا تعرض ${productName} مرة ثانية.`,
      style: "secondary",
    },
  ];
}

function formatBudget(range: BudgetRange) {
  if (range.min !== null && range.max !== null) {
    return `من ${range.min} إلى ${range.max} ريال`;
  }

  if (range.max !== null) {
    return `حتى ${range.max} ريال`;
  }

  if (range.min !== null) {
    return `أكثر من ${range.min} ريال`;
  }

  return "";
}

function formatProductDetails(product: Product) {
  const knowledge = getCuratedKnowledge(product);
  const lines = [
    `${product.name}`,
    `السعر: ${formatPrice(product.price)}`,
    `الحالة: ${
      product.quantity > 0
        ? "متوفر"
        : "غير متوفر حاليًا"
    }`,
  ];

  /**
   * نخلي الرد مختصرًا:
   * التصوير + البطارية + المدى فقط للدرونات.
   * لا نعرض Max Takeoff Altitude لأنه ارتفاع مكان الإقلاع
   * عن سطح البحر، وليس ارتفاع الدرون فوق نقطة الإقلاع.
   */
  if (knowledge?.specs?.camera) {
    lines.push(`التصوير: ${knowledge.specs.camera}`);
  }

  if (knowledge?.specs?.flightTime) {
    lines.push(`البطارية: ${knowledge.specs.flightTime}`);
  }

  if (knowledge?.specs?.transmission) {
    lines.push(`المدى: ${knowledge.specs.transmission}`);
  }

  /**
   * للمنتجات غير الموجودة في قاعدة المعرفة،
   * نعرض وصف المتجر بشكل مختصر بدل كلام طويل.
   */
  if (
    !knowledge &&
    product.description?.trim()
  ) {
    const shortDescription =
      product.description.trim().length > 160
        ? `${product.description.trim().slice(0, 160)}...`
        : product.description.trim();

    lines.push(`نبذة: ${shortDescription}`);
  }

  if (
    !knowledge &&
    !product.description?.trim()
  ) {
    lines.push(
      "لا يوجد وصف مختصر مضاف لهذا المنتج حاليًا.",
    );
  }

  return lines.join("
");
}

function formatRecommendationReason(
  product: Product,
  text: string,
) {
  const useCase = inferUseCase(text);
  const knowledge = getCuratedKnowledge(product);
  const reasons: string[] = [];

  if (useCase.beginner && (knowledge?.beginnerScore || 0) >= 7) {
    reasons.push("سهل ومناسب للمبتدئ");
  }

  if (useCase.travel && (knowledge?.travelScore || 0) >= 7) {
    reasons.push("مناسب للسفر");
  }

  if (useCase.photography && (knowledge?.cameraScore || 0) >= 7) {
    reasons.push("تصويره قوي");
  }

  if (useCase.power && (knowledge?.powerScore || 0) >= 8) {
    reasons.push("أداء قوي");
  }

  if (!reasons.length) {
    if (product.description?.trim()) {
      reasons.push(product.description.trim().slice(0, 90));
    } else {
      reasons.push("متوفر ضمن المواصفات والميزانية المطلوبة");
    }
  }

  return reasons.slice(0, 2).join("، ");
}

function extractRequestedProductFromContext(
  products: Product[],
  message: string,
  history: ChatMessage[],
) {
  const category = inferCategoryFromHistory(message, history);
  const currentCandidates = findProductCandidates(
    products,
    message,
    category,
  );

  /**
   * إذا الرسالة الحالية تذكر اسمًا واضحًا نستخدمه.
   */
  if (currentCandidates[0]?.score >= 28) {
    return currentCandidates[0].product;
  }

  /**
   * إذا قال: هذا، قصدي الدرون، اللي قبله...
   * نرجع لآخر المنتجات المذكورة في المحادثة.
   */
  if (includesAny(message, INTENT_WORDS.previous)) {
    const historyProducts = extractProductsFromHistory(products, history);

    if (includesAny(message, INTENT_WORDS.second)) {
      return historyProducts[1] || historyProducts[0] || null;
    }

    if (includesAny(message, INTENT_WORDS.first)) {
      return historyProducts[0] || null;
    }

    /**
     * "قصدي الدرون" يفضل منتجًا ليس ملحقًا.
     */
    if (detectRequestedCategory(message) === "drone") {
      return (
        historyProducts.find((product) => !isAccessory(product)) ||
        historyProducts[0] ||
        null
      );
    }

    return historyProducts[0] || null;
  }

  return null;
}

function findComparisonProducts(
  products: Product[],
  message: string,
  history: ChatMessage[],
) {
  const current = findProductCandidates(
    products,
    message,
    detectRequestedCategory(message),
  )
    .slice(0, 5)
    .map((item) => item.product);

  const historical = extractProductsFromHistory(products, history);

  const combined = [...current, ...historical].filter(
    (product, index, array) =>
      array.findIndex((item) => item.id === product.id) === index,
  );

  return combined.slice(0, 2);
}

function compareProducts(first: Product, second: Product) {
  const firstKnowledge = getCuratedKnowledge(first);
  const secondKnowledge = getCuratedKnowledge(second);

  const lines = [
    `مقارنة سريعة:`,
    ``,
    `${first.name}`,
    `السعر: ${formatPrice(first.price)}`,
    `التوفر: ${
      first.quantity > 0
        ? `${first.quantity} قطعة`
        : "غير متوفر"
    }`,
    firstKnowledge?.summary ||
      first.description ||
      "لا يوجد وصف مضاف",
    ``,
    `${second.name}`,
    `السعر: ${formatPrice(second.price)}`,
    `التوفر: ${
      second.quantity > 0
        ? `${second.quantity} قطعة`
        : "غير متوفر"
    }`,
    secondKnowledge?.summary ||
      second.description ||
      "لا يوجد وصف مضاف",
  ];

  if (firstKnowledge && secondKnowledge) {
    const firstBeginner = firstKnowledge.beginnerScore || 0;
    const secondBeginner = secondKnowledge.beginnerScore || 0;
    const firstCamera = firstKnowledge.cameraScore || 0;
    const secondCamera = secondKnowledge.cameraScore || 0;
    const firstPower = firstKnowledge.powerScore || 0;
    const secondPower = secondKnowledge.powerScore || 0;

    lines.push("");
    lines.push(
      `للمبتدئ: ${
        firstBeginner >= secondBeginner
          ? first.name
          : second.name
      }`,
    );
    lines.push(
      `للتصوير: ${
        firstCamera >= secondCamera
          ? first.name
          : second.name
      }`,
    );
    lines.push(
      `للأداء والحركة: ${
        firstPower >= secondPower
          ? first.name
          : second.name
      }`,
    );
  }

  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        message:
          "زليخة لا تستطيع قراءة بيانات المتجر لأن مفتاح Supabase الخاص بالخادم غير متوفر.",
        actions: [],
      },
      500,
    );
  }

  try {
    const body = await req.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim().slice(0, 2500)
        : "";

    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item: ChatMessage) =>
              item &&
              (item.role === "user" ||
                item.role === "assistant") &&
              typeof item.content === "string",
          )
          .slice(-16)
      : [];

    if (!message) {
      return jsonResponse({
        message:
          "اكتب سؤالك، مثل: أريد درون للمبتدئ وميزانيتي 300 ريال.",
        actions: [],
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
      },
    );

    const [
      productsResult,
      rentalsResult,
      settingsResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,slug,description,price,image_url,quantity,category_id,colors,is_active,created_at",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(300),

      supabase
        .from("rental_drones")
        .select(
          "id,name,description,image_url,daily_price,deposit_amount,is_active",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(80),

      supabase.from("site_settings").select("*").limit(30),
    ]);

    const products = (productsResult.data || []) as Product[];
    const rentals = (rentalsResult.data || []) as RentalDrone[];
    const settings = settingsResult.data || [];

    const normalizedMessage = normalizeText(message);
    const combinedContext = `${inferContextText(history)} ${message}`;
    const category = inferCategoryFromHistory(message, history);
    const budget = inferBudgetFromHistory(message, history);

    /**
     * 1) التحية
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.greeting)) {
      return jsonResponse({
        message: "أهلًا، أنا زليخة، مساعدتك الذكية في مرقاب.",
        actions: [
          {
            type: "prompt",
            label: "ساعديني أختار",
            prompt:
              "ساعديني أختار منتج مناسب. اسأليني عن الفئة والاستخدام والميزانية.",
            style: "primary",
          },
          {
            type: "prompt",
            label: "متابعة طلب",
            prompt: "أريد أتابع طلبي.",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * 2) متابعة الطلبات
     *
     * يدعم حالتين:
     * - العميل يكتب "متابعة طلب".
     * - زليخة تطلب الرقم، ثم يرسل العميل الرقم وحده.
     */
    const submittedPhone = extractPhone(message);
    const shouldSearchOrders =
      includesAny(normalizedMessage, INTENT_WORDS.order) ||
      (submittedPhone !== null &&
        (lastAssistantAskedForPhone(history) ||
          normalizeDigits(message).replace(/\D/g, "").length >= 8));

    if (shouldSearchOrders) {
      const phone = submittedPhone;

      if (!phone) {
        return jsonResponse({
          message:
            "أكيد. اكتب رقم الهاتف المستخدم في الطلب، وأنا أبحث في طلبات المتجر والإيجار والورشة.",
          actions: [],
        });
      }

      const filter = phoneFilter(phone);

      const [orders, bookings, workshop] =
        await Promise.all([
          supabase
            .from("orders")
            .select(
              "id,product_name,total,status,payment_method,delivery_method,created_at",
            )
            .or(filter)
            .order("created_at", { ascending: false })
            .limit(10),

          supabase
            .from("rental_bookings")
            .select(
              "id,start_date,end_date,total_days,total_amount,status,created_at,rental_drones(name)",
            )
            .or(filter)
            .order("created_at", { ascending: false })
            .limit(10),

          supabase
            .from("workshop_requests")
            .select("id,drone_model,status,created_at")
            .or(filter)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      const lines: string[] = [];

      for (const order of orders.data || []) {
        lines.push(
          `طلب متجر #${order.id}: ${
            order.product_name || "منتج"
          }\nالحالة: ${
            order.status || "غير محددة"
          }\nالإجمالي: ${formatPrice(order.total)}`,
        );
      }

      for (const booking of bookings.data || []) {
        const droneName = Array.isArray(
          booking.rental_drones,
        )
          ? booking.rental_drones[0]?.name
          : booking.rental_drones?.name;

        lines.push(
          `حجز إيجار #${booking.id}: ${
            droneName || "درون"
          }\nالحالة: ${
            booking.status || "غير محددة"
          }\nالإجمالي: ${formatPrice(
            booking.total_amount,
          )}`,
        );
      }

      for (const request of workshop.data || []) {
        lines.push(
          `طلب ورشة #${request.id}: ${
            request.drone_model || "درون"
          }\nالحالة: ${
            request.status || "غير محددة"
          }`,
        );
      }

      if (!lines.length) {
        return jsonResponse({
          message:
            "ما حصلت طلبات بهذا الرقم. تأكد أنك كتبت نفس الرقم المستخدم وقت الطلب.",
          actions: [
            {
              type: "navigate",
              label: "فتح مشترياتي",
              path: "/my-orders",
              style: "primary",
            },
          ],
        });
      }

      return jsonResponse({
        message: `حصلت لك التالي:\n\n${lines.join(
          "\n\n",
        )}`,
        actions: [
          {
            type: "navigate",
            label: "فتح مشترياتي",
            path: "/my-orders",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 3) التأجير
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.rental)) {
      if (!rentals.length) {
        return jsonResponse({
          message:
            "حاليًا ما فيه درونات إيجار مفعلة في النظام.",
          actions: [],
        });
      }

      const list = rentals
        .slice(0, 6)
        .map(
          (drone) =>
            `${drone.name}: ${formatPrice(
              drone.daily_price,
            )} لليوم`,
        )
        .join("\n");

      return jsonResponse({
        message: `الدرونات المتاحة للإيجار:\n\n${list}`,
        actions: rentals
          .slice(0, 3)
          .map((drone, index) => ({
            type: "navigate" as const,
            label: `حجز ${drone.name}`,
            path: rentalPath(drone),
            style:
              index === 0
                ? ("primary" as const)
                : ("secondary" as const),
          })),
      });
    }

    /**
     * 4) الورشة
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.workshop)) {
      return jsonResponse({
        message:
          "تقدر تدخل صفحة الورشة وترسل الاسم ورقم الهاتف ونوع الدرون ووصف المشكلة وصورة العطل.",
        actions: [
          {
            type: "navigate",
            label: "فتح الورشة",
            path: "/workshop",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 5) الدفع والشحن
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.payment)) {
      const hasSettings = settings.length > 0;

      return jsonResponse({
        message: hasSettings
          ? "طرق الدفع تعتمد على إعدادات المتجر، وتظهر الخيارات المتاحة لك عند إتمام الطلب."
          : "أكمل الطلب وستظهر لك طرق الدفع المتاحة في صفحة الدفع.",
        actions: [
          {
            type: "navigate",
            label: "فتح المتجر",
            path: "/shop",
            style: "primary",
          },
        ],
      });
    }

    if (includesAny(normalizedMessage, INTENT_WORDS.shipping)) {
      return jsonResponse({
        message:
          "مدة التوصيل تعتمد على المنطقة وطريقة الشحن. بعد تقديم الطلب تقدر تتابع حالته من صفحة مشترياتي.",
        actions: [
          {
            type: "navigate",
            label: "مشترياتي",
            path: "/my-orders",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 6) المقارنة
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.compare)) {
      const comparison = findComparisonProducts(
        products,
        message,
        history,
      );

      if (comparison.length < 2) {
        return jsonResponse({
          message:
            "اكتب اسم المنتجين، مثل: قارن بين Mini 4 Pro وAvata 2.",
          actions: [],
        });
      }

      return jsonResponse({
        message: compareProducts(
          comparison[0],
          comparison[1],
        ),
        actions: productActions(comparison),
      });
    }

    /**
     * 7) ربط السؤال بالسياق السابق:
     * "قصدي الدرون"، "هذا"، "اللي قبله"، "أرخص منه"...
     */
    const contextualProduct =
      extractRequestedProductFromContext(
        products,
        message,
        history,
      );

    if (
      contextualProduct &&
      (includesAny(normalizedMessage, INTENT_WORDS.price) ||
        includesAny(normalizedMessage, INTENT_WORDS.specs) ||
        includesAny(
          normalizedMessage,
          INTENT_WORDS.availability,
        ) ||
        includesAny(normalizedMessage, INTENT_WORDS.previous))
    ) {
      return jsonResponse({
        message: formatProductDetails(contextualProduct),
        actions: [
          {
            type: "navigate",
            label: "فتح المنتج",
            path: productPath(contextualProduct),
            style: "primary",
          },
          ...alternativeActions(contextualProduct),
        ].slice(0, 6),
      });
    }

    /**
     * 8) سؤال مباشر عن سعر أو مواصفات منتج.
     */
    if (
      includesAny(normalizedMessage, INTENT_WORDS.price) ||
      includesAny(normalizedMessage, INTENT_WORDS.specs) ||
      includesAny(
        normalizedMessage,
        INTENT_WORDS.availability,
      )
    ) {
      const candidates = findProductCandidates(
        products,
        message,
        category,
      );

      if (!candidates.length) {
        return jsonResponse({
          message:
            "ما قدرت أحدد المنتج. اكتب اسمه بشكل أوضح، مثل: كم سعر Mini 4 Pro؟",
          actions: [
            {
              type: "navigate",
              label: "تصفح المنتجات",
              path: "/shop",
              style: "primary",
            },
          ],
        });
      }

      /**
       * إذا أول نتيجتين متقاربتان جدًا:
       * نسأل العميل بدل اختيار منتج غلط.
       */
      if (
        candidates.length > 1 &&
        candidates[0].score - candidates[1].score < 7 &&
        candidates[0].product.id !==
          candidates[1].product.id
      ) {
        const options = candidates
          .slice(0, 3)
          .map((item) => item.product);

        return jsonResponse({
          message: `تقصد أي منتج؟\n\n${options
            .map(
              (product, index) =>
                `${index + 1}. ${product.name}`,
            )
            .join("\n")}`,
          actions: options.map((product, index) => ({
            type: "prompt" as const,
            label: product.name,
            prompt: `أقصد ${product.name}. أعطني السعر والمواصفات.`,
            style:
              index === 0
                ? ("primary" as const)
                : ("secondary" as const),
          })),
        });
      }

      const product = candidates[0].product;

      return jsonResponse({
        message: formatProductDetails(product),
        actions: [
          {
            type: "navigate",
            label: "فتح المنتج",
            path: productPath(product),
            style: "primary",
          },
          ...alternativeActions(product),
        ].slice(0, 6),
      });
    }

    /**
     * 9) العميل يطلب اقتراحًا لكنه لم يذكر الميزانية.
     */
    const recommendationIntent =
      includesAny(normalizedMessage, INTENT_WORDS.recommend) ||
      hasBudget(budget) ||
      includesAny(normalizedMessage, INTENT_WORDS.cheaper) ||
      includesAny(normalizedMessage, INTENT_WORDS.stronger);

    if (recommendationIntent && !hasBudget(budget)) {
      return jsonResponse({
        message:
          "تمام. كم ميزانيتك تقريبًا؟ وتبحث عن درون، كاميرا، مايك، ذاكرة أو ملحقات؟",
        actions: [
          {
            type: "prompt",
            label: "حتى 100 ريال",
            prompt:
              "ميزانيتي حتى 100 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
          {
            type: "prompt",
            label: "100–250 ريال",
            prompt:
              "ميزانيتي من 100 إلى 250 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
          {
            type: "prompt",
            label: "250–600 ريال",
            prompt:
              "ميزانيتي من 250 إلى 600 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * 10) توصيات حسب الميزانية والفئة والاستخدام.
     */
    if (recommendationIntent) {
      if (!category) {
        return jsonResponse({
          message: `ميزانيتك ${
            formatBudget(budget) || "وصلت"
          }. شو نوع المنتج اللي تبحث عنه: درون، كاميرا، مايك، ذاكرة أو ملحق؟`,
          actions: [
            {
              type: "prompt",
              label: "درون",
              prompt:
                "أريد درون ضمن الميزانية التي ذكرتها.",
              style: "primary",
            },
            {
              type: "prompt",
              label: "كاميرا",
              prompt:
                "أريد كاميرا ضمن الميزانية التي ذكرتها.",
              style: "secondary",
            },
            {
              type: "prompt",
              label: "ملحقات",
              prompt:
                "أريد ملحقات ضمن الميزانية التي ذكرتها.",
              style: "secondary",
            },
          ],
        });
      }

      let recommendations = recommendProducts(
        products,
        combinedContext,
        budget,
        category,
      );

      /**
       * إذا العميل طلب خيارًا ثانيًا/أرخص/أقوى،
       * نستبعد المنتجات التي ظهرت في المحادثة السابقة
       * حتى لا نكرر نفس المنتج.
       */
      const requestsAlternative =
        includesAny(normalizedMessage, [
          "خيار ثاني",
          "منتج ثاني",
          "غيره",
          "غير هذا",
          "مختلف",
          ...INTENT_WORDS.cheaper,
          ...INTENT_WORDS.stronger,
        ]);

      if (requestsAlternative) {
        const previousProductIds =
          getPreviouslyMentionedProductIds(
            products,
            history,
          );

        const filtered = recommendations.filter(
          (product) =>
            !previousProductIds.has(product.id),
        );

        if (filtered.length > 0) {
          recommendations = filtered;
        }
      }

      if (!recommendations.length) {
        return jsonResponse({
          message: `ما حصلت منتج متوفر ${
            formatBudget(budget)
          } في الفئة المطلوبة. جرب ترفع الميزانية أو تختار فئة ثانية.`,
          actions: [
            {
              type: "navigate",
              label: "تصفح المتجر",
              path: "/shop",
              style: "primary",
            },
          ],
        });
      }

      const lines = recommendations
        .slice(0, 3)
        .map(
          (product, index) =>
            `${index + 1}. ${product.name} — ${formatPrice(
              product.price,
            )}\nالسبب: ${formatRecommendationReason(
              product,
              combinedContext,
            )}`,
        );

      return jsonResponse({
        message: `هذه أنسب الخيارات ${
          formatBudget(budget)
            ? `ضمن ميزانية ${formatBudget(budget)}`
            : ""
        }:\n\n${lines.join("\n\n")}`,
        actions: [
          ...productActions(recommendations),
          ...alternativeActions(recommendations[0]),
        ].slice(0, 6),
      });
    }

    /**
     * 11) كلمات مثل "الثاني" أو "الأول" بدون صياغة كاملة.
     */
    if (
      includesAny(normalizedMessage, INTENT_WORDS.first) ||
      includesAny(normalizedMessage, INTENT_WORDS.second)
    ) {
      const historicalProducts =
        extractProductsFromHistory(products, history);

      const selected = includesAny(
        normalizedMessage,
        INTENT_WORDS.second,
      )
        ? historicalProducts[1]
        : historicalProducts[0];

      if (selected) {
        return jsonResponse({
          message: formatProductDetails(selected),
          actions: [
            {
              type: "navigate",
              label: "فتح المنتج",
              path: productPath(selected),
              style: "primary",
            },
          ],
        });
      }
    }

    /**
     * 12) البحث المباشر بالاسم حتى لو لم يكتب "كم سعر".
     */
    const directCandidates = findProductCandidates(
      products,
      message,
      category,
    );

    if (
      directCandidates[0] &&
      directCandidates[0].score >= 28
    ) {
      const product = directCandidates[0].product;

      return jsonResponse({
        message: formatProductDetails(product),
        actions: [
          {
            type: "navigate",
            label: "فتح المنتج",
            path: productPath(product),
            style: "primary",
          },
        ],
      });
    }

    /**
     * 13) عرض قائمة المنتجات.
     */
    if (
      includesAny(normalizedMessage, [
        "شو عندكم",
        "ما المنتجات",
        "المنتجات",
        "اعرض المنتجات",
        "المتجر",
      ])
    ) {
      const available = products.filter(
        (product) =>
          product.is_active && product.quantity > 0,
      );

      const list = available
        .slice(0, 10)
        .map(
          (product) =>
            `${product.name} — ${formatPrice(
              product.price,
            )}`,
        )
        .join("\n");

      return jsonResponse({
        message: `بعض المنتجات المتوفرة:\n\n${list}`,
        actions: [
          {
            type: "navigate",
            label: "فتح المتجر",
            path: "/shop",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 14) الرد العام.
     */
    return jsonResponse({
      message:
        "أقدر أساعدك في اختيار المنتج حسب الميزانية، الأسعار، المواصفات، المقارنة، التأجير، الورشة أو متابعة الطلب. اكتب سؤالك بشكل مباشر، مثل: أريد درون للمبتدئ وميزانيتي 300 ريال.",
      actions: [
        {
          type: "prompt",
          label: "ساعديني أختار",
          prompt:
            "ساعديني أختار منتج مناسب. اسأليني عن الميزانية والاستخدام.",
          style: "primary",
        },
        {
          type: "navigate",
          label: "فتح المتجر",
          path: "/shop",
          style: "secondary",
        },
      ],
    });
  } catch (error) {
    console.error("mergab-ai-smart-free error:", error);

    return jsonResponse(
      {
        message:
          "صار خطأ مؤقت في زليخة. جرّب مرة ثانية أو افتح المتجر.",
        actions: [
          {
            type: "navigate",
            label: "فتح المتجر",
            path: "/shop",
            style: "primary",
          },
        ],
      },
      500,
    );
  }
});
