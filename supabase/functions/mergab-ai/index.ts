import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * زليخة — محرك مساعد متجر مرقاب (نسخة ذكية موسّعة)
 * -------------------------------------------------
 * لا يستخدم OpenAI أو Gemini أو أي API مدفوع.
 *
 * يعتمد على:
 * 1) منتجات المتجر الحقيقية من Supabase (السعر والمخزون دائمًا من الجدول).
 * 2) فهم النية والميزانية والفئة واللهجة والأخطاء الإملائية.
 * 3) ذاكرة آخر رسائل المحادثة.
 * 4) مطابقة مرنة للأسماء مع تفضيل الدرون على الفلاتر/الملحقات عند السؤال عن "Mini 4" إلخ.
 * 5) قاعدة معرفة موسّعة (CURATED_KNOWLEDGE) بكل المنتجات الرئيسية + ملحقاتها.
 * 6) دعم التأجير، الورشة، المزاد، متابعة الطلبات، المقارنة، التوصيات.
 *
 * مهم:
 * - السعر والمخزون دائمًا من جدول products.
 * - المواصفات الإضافية من description أو من CURATED_KNOWLEDGE (مؤكدة فقط).
 * - ارتفاع الطيران = من سطح الأرض (AGL) وليس ارتفاع الإقلاع عن سطح البحر.
 * - كل الدرونات المباعة كومبو (عادة 3 بطاريات) ما لم يُذكر خلاف ذلك.
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

type AuctionRow = Record<string, unknown> & {
  id?: string | number;
  title?: string | null;
  name?: string | null;
  product_name?: string | null;
  status?: string | null;
  current_price?: number | null;
  highest_bid?: number | null;
  start_price?: number | null;
  starting_price?: number | null;
  end_at?: string | null;
  end_date?: string | null;
  created_at?: string | null;
};

type CuratedKnowledge = {
  aliases: string[];
  kind: "drone" | "camera" | "microphone" | "accessory" | "memory" | "other";
  summary: string;
  specs?: {
    camera?: string;
    flightTime?: string;
    transmission?: string;
    maxFlightAltitudeAGL?: string; // من سطح الأرض
    weight?: string;
    sensors?: string;
    usage?: string;
    comboContents?: string;
    windResistance?: string;
    maxSpeed?: string;
    other?: string;
  };
  tags: string[];
  beginnerScore?: number;
  travelScore?: number;
  cameraScore?: number;
  powerScore?: number;
  isAccessoryFor?: string[]; // مثل ["mini 4", "mini 5"] للفلاتر
};

/**
 * قاعدة معرفة موسّعة وآمنة.
 * السعر غير موجود هنا — يُؤخذ دائمًا من Supabase.
 * أُضيفت كل المنتجات الرئيسية من المتجر + مواصفات مؤكدة عامة (DJI / Insta360).
 * الارتفاع = من سطح الأرض (Above Ground Level).
 */
const CURATED_KNOWLEDGE: Record<string, CuratedKnowledge> = {
  // ===================== درونات =====================
  "dji mini 4 pro": {
    aliases: [
      "mini 4 pro",
      "mini4pro",
      "ميني 4 برو",
      "ميني فور برو",
      "mini 4 pro combo",
      "mini 4 pro combo plus",
      "mini 4 pro plus",
      "ميني 4 برو كومبو",
      "ميني 4",
    ],
    kind: "drone",
    summary:
      "درون خفيف تحت 249 جرام، مناسب للسفر والتصوير الاحترافي الخفيف، مع حساسات عوائق شاملة وتصوير عمودي.",
    specs: {
      camera: "كاميرا 1/1.3 بوصة 48MP، فيديو حتى 4K/100fps، HDR، تصوير عمودي",
      flightTime: "حتى 34 دقيقة بالبطارية العادية، أو حتى 45 دقيقة ببطارية Plus",
      transmission: "نظام O4، حتى 20 كم (FCC) في بيئة مفتوحة",
      maxFlightAltitudeAGL: "حتى 500 متر من سطح الأرض (حسب اللوائح المحلية)",
      weight: "أقل من 249 جرام بالبطارية العادية",
      sensors: "استشعار عوائق شامل الاتجاهات (أمامي، خلفي، علوي، سفلي، جانبي)",
      usage: "مبتدئ، سفر، تصوير جوي احترافي خفيف، عمودي",
      comboContents:
        "كومبو عادةً: الدرون + 3 بطاريات + ريموت + شاحن + كابلات + واقيات مراوح + شنطة (تحقق من وصف المنتج في المتجر)",
      windResistance: "مقاومة رياح حتى المستوى 5 تقريبًا",
      maxSpeed: "حتى 16 م/ث في الوضع الرياضي",
    },
    tags: ["مبتدئ", "سفر", "خفيف", "تصوير", "عمودي", "حساسات", "4k", "بطارية طويلة", "mini 4"],
    beginnerScore: 9,
    travelScore: 10,
    cameraScore: 8,
    powerScore: 7,
  },

  "dji mini 5 pro": {
    aliases: [
      "mini 5 pro",
      "mini5pro",
      "ميني 5 برو",
      "ميني فايف برو",
      "mini 5 pro combo",
      "ميني 5",
      "mini 5",
    ],
    kind: "drone",
    summary:
      "الجيل الأحدث من سلسلة Mini، أخف وأقوى تصويرًا مع تحسينات في البطارية والنقل والحساسات.",
    specs: {
      camera: "كاميرا محسّنة بدقة عالية، فيديو 4K بمعدلات إطارات مرتفعة، تصوير عمودي",
      flightTime: "وقت طيران طويل (تحقق من البطارية المرفقة في الكومبو)",
      transmission: "نظام نقل حديث طويل المدى",
      maxFlightAltitudeAGL: "حتى 500 متر من سطح الأرض (حسب اللوائح)",
      weight: "خفيف جدًا (تحت حد الترخيص في معظم الدول)",
      sensors: "حساسات عوائق متقدمة شاملة",
      usage: "سفر، تصوير احترافي، مبتدئ ومتقدم",
      comboContents: "كومبو عادةً 3 بطاريات + ريموت + ملحقات (راجع وصف المنتج)",
    },
    tags: ["مبتدئ", "سفر", "خفيف", "تصوير", "mini 5", "أحدث"],
    beginnerScore: 9,
    travelScore: 10,
    cameraScore: 9,
    powerScore: 8,
  },

  "dji avata 2": {
    aliases: [
      "avata 2",
      "avata2",
      "افاتا 2",
      "افاتـا 2",
      "افاتا تو",
      "dji avata 2 combo",
      "avata 2 combo",
      "افاتا 2 كومبو",
    ],
    kind: "drone",
    summary:
      "درون FPV غامر للحركة السريعة والتصوير الديناميكي، يأتي عادة مع نظارة ووحدة تحكم.",
    specs: {
      camera: "مستشعر 1/1.3 بوصة، فيديو حتى 4K/100fps",
      flightTime: "حتى نحو 23 دقيقة",
      transmission: "نظام O4، حتى 13 كم (FCC) أو 10 كم (CE)",
      maxFlightAltitudeAGL: "حتى 500 متر من سطح الأرض",
      weight: "حوالي 377 جرام",
      sensors: "تموضع بصري سفلي وخلفي (ليست حساسات شاملة مثل Mini)",
      usage: "FPV، أكشن، حركة سريعة، تجربة غامرة",
      comboContents:
        "كومبو عادة: الدرون + نظارة + وحدة تحكم (Motion أو RC) + بطاريات (غالبًا 3) + شاحن",
      maxSpeed: "سرعة عالية مناسبة للحركة",
    },
    tags: ["fpv", "سرعة", "حركة", "اكشن", "4k", "نظارة", "avata"],
    beginnerScore: 5,
    travelScore: 6,
    cameraScore: 8,
    powerScore: 9,
  },

  "dji neo": {
    aliases: [
      "neo",
      "dji neo",
      "نيو",
      "neo combo",
      "نيو كومبو",
      "dji neo 2",
      "neo 2",
      "نيو 2",
      "neo 2 combo",
      "نيو 2 كومبو",
      "نيو 2 الموشن",
    ],
    kind: "drone",
    summary:
      "درون صغير جدًا وخفيف للتصوير السريع والـ Selfie الجوي، سهل الاستخدام للمبتدئين.",
    specs: {
      camera: "كاميرا مناسبة للتصوير اليومي والفيديوهات القصيرة",
      flightTime: "وقت طيران متوسط مناسب للاستخدام اليومي",
      transmission: "نقل لاسلكي قصير إلى متوسط المدى",
      maxFlightAltitudeAGL: "حتى مئات الأمتار من سطح الأرض (حسب الطراز واللوائح)",
      weight: "خفيف جدًا",
      sensors: "حساسات أساسية للتموضع",
      usage: "مبتدئ، سفر، تصوير سريع، محتوى سوشيال",
      comboContents: "كومبو عادة 3 بطاريات + ريموت أو موشن + ملحقات",
    },
    tags: ["مبتدئ", "خفيف", "صغير", "سفر", "neo", "نيو"],
    beginnerScore: 10,
    travelScore: 9,
    cameraScore: 6,
    powerScore: 5,
  },

  "dji air 3s": {
    aliases: [
      "air 3s",
      "air 3 s",
      "air3s",
      "اير 3 اس",
      "اير 3s",
      "air 3 s pro",
      "air 3s pro",
      "اير 3 اس برو",
      "air 3",
    ],
    kind: "drone",
    summary:
      "درون متوسط الحجم بكاميرتين، مناسب للتصوير الاحترافي والسفر مع مدى وبطارية ممتازين.",
    specs: {
      camera: "كاميرتان (واسعة + تليفوتو)، فيديو عالي الجودة 4K+",
      flightTime: "وقت طيران طويل (حوالي 45 دقيقة حسب الطراز)",
      transmission: "نظام O4 أو أحدث، مدى طويل",
      maxFlightAltitudeAGL: "حتى 500 متر من سطح الأرض",
      weight: "حوالي 700+ جرام (يحتاج تسجيل في بعض الدول)",
      sensors: "حساسات عوائق شاملة",
      usage: "تصوير احترافي، سفر، فيديو سينمائي",
      comboContents: "كومبو عادة 3 بطاريات + ريموت متقدم + شنطة + ملحقات",
    },
    tags: ["احترافي", "تصوير", "سفر", "كاميرتين", "air 3"],
    beginnerScore: 6,
    travelScore: 8,
    cameraScore: 9,
    powerScore: 8,
  },

  "dji mavic 4 pro": {
    aliases: [
      "mavic 4 pro",
      "mavic4pro",
      "مافيك 4 برو",
      "مافيك فور برو",
      "mavic 4 pro combo",
      "مافيك 4 كريتر",
      "mavic 4 creator",
      "مافيك 4",
    ],
    kind: "drone",
    summary:
      "درون احترافي عالي المستوى بكاميرا متقدمة وميزات سينمائية، مناسب للمحترفين.",
    specs: {
      camera: "كاميرا Hasselblad أو مكافئة عالية الدقة، فيديو سينمائي",
      flightTime: "وقت طيران طويل جدًا",
      transmission: "مدى بعيد جدًا",
      maxFlightAltitudeAGL: "حتى 500 متر من سطح الأرض",
      weight: "أثقل من سلسلة Mini (يحتاج تسجيل)",
      sensors: "حساسات عوائق متقدمة شاملة",
      usage: "تصوير احترافي، سينما، إنتاج محتوى عالي",
      comboContents: "كومبو احترافي عادة 3 بطاريات + ريموت + ملحقات إضافية",
    },
    tags: ["احترافي", "سينما", "تصوير", "mavic", "مافيك"],
    beginnerScore: 4,
    travelScore: 5,
    cameraScore: 10,
    powerScore: 9,
  },

  "avata360 rc2": {
    aliases: [
      "avata360",
      "avata 360",
      "avata360 rc2",
      "avata360 combo",
      "افاتـا 360",
    ],
    kind: "drone",
    summary: "طقم FPV / VR مرتبط بسلسلة Avata مع وحدة تحكم RC2.",
    specs: {
      usage: "تجربة FPV غامرة",
      comboContents: "درون + نظارة / وحدة تحكم حسب النسخة",
    },
    tags: ["fpv", "avata", "vr"],
    beginnerScore: 5,
    travelScore: 5,
    cameraScore: 7,
    powerScore: 8,
  },

  // ===================== كاميرات =====================
  "osmo pocket 4": {
    aliases: [
      "osmo pocket 4",
      "osmo pocket4",
      "اوزمو بوكيت 4",
      "اسمو بوكيت 4",
      "osmo pocket 4 creator",
      "بوكيت 4",
      "pocket 4",
    ],
    kind: "camera",
    summary: "كاميرا جيب صغيرة مع جيمبال ثلاثي المحاور، ممتازة للفيديو اليومي والمحتوى.",
    specs: {
      camera: "مستشعر عالي الدقة، فيديو 4K، استقرار ممتاز",
      usage: "سفر، يوميات، يوتيوب، سوشيال ميديا",
      comboContents: "حسب النسخة: الكاميرا + حامل + بطاريات إضافية + كيس",
    },
    tags: ["كاميرا", "جيب", "جيمبال", "سفر", "osmo", "pocket"],
    beginnerScore: 9,
    travelScore: 10,
    cameraScore: 8,
    powerScore: 6,
  },

  "osmo pocket 3": {
    aliases: [
      "osmo pocket 3",
      "osmo pocket3",
      "اوزمو بوكيت 3",
      "اسمو بوكيت 3",
      "osmo pocker 3",
      "osmo pocket 3 combo",
      "بوكيت 3",
    ],
    kind: "camera",
    summary: "كاميرا جيب سابقة مع جيمبال ممتاز وتصوير 4K.",
    specs: {
      camera: "1 بوصة تقريبًا في بعض النسخ، 4K، استقرار قوي",
      usage: "سفر ومحتوى يومي",
      comboContents: "كومبو عادة مع ملحقات إضافية",
    },
    tags: ["كاميرا", "جيب", "osmo", "pocket"],
    beginnerScore: 9,
    travelScore: 9,
    cameraScore: 8,
    powerScore: 6,
  },

  "osmo action 6": {
    aliases: [
      "osmo action 6",
      "اوزمو اكشن 6",
      "اسمو اكشن 6",
      "osmo action 6 combo",
      "اكشن 6",
    ],
    kind: "camera",
    summary: "كاميرا أكشن مقاومة للماء والصدمات مع استقرار ممتاز.",
    specs: {
      camera: "فيديو عالي الدقة، استقرار RockSteady / Horizon",
      usage: "رياضات، غوص، مغامرات",
      comboContents: "كومبو مع ملحقات تثبيت وبطاريات",
    },
    tags: ["اكشن", "ماء", "رياضة", "osmo", "action"],
    beginnerScore: 8,
    travelScore: 8,
    cameraScore: 8,
    powerScore: 7,
  },

  "osmo action 4": {
    aliases: [
      "osmo action 4",
      "اوزمو اكشن 4",
      "اسمو اكشن 4",
      "اكشن 4",
    ],
    kind: "camera",
    summary: "كاميرا أكشن سابقة من DJI بأداء قوي في الإضاءة المنخفضة.",
    specs: {
      camera: "مستشعر كبير نسبيًا، 4K، مقاومة ماء",
      usage: "أكشن ومغامرات",
    },
    tags: ["اكشن", "osmo", "action"],
    beginnerScore: 8,
    travelScore: 7,
    cameraScore: 7,
    powerScore: 7,
  },

  "osmo mobile 7": {
    aliases: [
      "osmo mobile 7",
      "جيمبال اوسمو موبايل 7",
      "osmo mobile",
      "جيمبال جوال",
    ],
    kind: "accessory",
    summary: "جيمبال للجوال يوفر استقرارًا سينمائيًا للفيديوهات بالهاتف.",
    specs: {
      usage: "تصوير بالهاتف، يوتيوب، ريلز",
    },
    tags: ["جيمبال", "جوال", "osmo", "mobile"],
    beginnerScore: 9,
    travelScore: 8,
    cameraScore: 6,
    powerScore: 5,
  },

  "insta360 x4 / luna": {
    aliases: [
      "insta360",
      "انستا360",
      "انستا 360",
      "لونا الترا",
      "insta360 luna",
      "انستا360 لونا الترا",
    ],
    kind: "camera",
    summary: "كاميرات 360 درجة من Insta360 للتصوير الشامل.",
    specs: {
      camera: "تصوير 360، فيديو عالي الدقة، إمكانية reframing",
      usage: "سفر، مغامرات، محتوى إبداعي",
    },
    tags: ["360", "insta360", "انستا"],
    beginnerScore: 7,
    travelScore: 9,
    cameraScore: 8,
    powerScore: 7,
  },

  "osmo pocket / p4": {
    aliases: ["اوزمو p4", "osmo p4", "اوزمو بي 4"],
    kind: "camera",
    summary: "إحدى نسخ سلسلة Osmo Pocket.",
    specs: {
      usage: "تصوير يومي محمول",
    },
    tags: ["osmo", "pocket", "كاميرا"],
    beginnerScore: 8,
    travelScore: 8,
    cameraScore: 7,
    powerScore: 6,
  },

  // ===================== مايكات =====================
  "dji mic mini": {
    aliases: [
      "ميني مايك dji",
      "mini mic",
      "dji mic mini",
      "مايك ميني",
      "ميني مايك",
    ],
    kind: "microphone",
    summary: "مايك لاسلكي صغير وخفيف من DJI للتسجيل الواضح.",
    specs: {
      usage: "يوتيوب، مقابلة، محتوى",
      other: "بطارية طويلة وشحن سهل",
    },
    tags: ["مايك", "لاسلكي", "dji", "mini"],
    beginnerScore: 9,
    travelScore: 8,
    cameraScore: 5,
    powerScore: 5,
  },

  "dji mic 2": {
    aliases: [
      "dji mic 2",
      "مايك 2",
      "dji ميكروفون ميني 2",
      "ميكروفون ميني 2",
    ],
    kind: "microphone",
    summary: "مايك لاسلكي DJI Mic 2 بجودة تسجيل عالية.",
    specs: {
      usage: "تسجيل احترافي للمحتوى",
    },
    tags: ["مايك", "dji", "لاسلكي"],
    beginnerScore: 8,
    travelScore: 7,
    cameraScore: 5,
    powerScore: 6,
  },

  "dji mic 3": {
    aliases: [
      "dji mic 3",
      "ميكروفون دي جيه اي 3",
      "مايك 3",
      "dji microphone 3",
    ],
    kind: "microphone",
    summary: "الجيل الأحدث من مايكات DJI اللاسلكية.",
    specs: {
      usage: "تسجيل احترافي متعدد القنوات",
    },
    tags: ["مايك", "dji", "احترافي"],
    beginnerScore: 7,
    travelScore: 7,
    cameraScore: 5,
    powerScore: 7,
  },

  "mic mini pro": {
    aliases: ["ميكروفون ميني برو", "مايك ميني برو", "mini pro mic"],
    kind: "microphone",
    summary: "مايك صغير اقتصادي.",
    tags: ["مايك", "اقتصادي"],
    beginnerScore: 8,
    travelScore: 7,
    cameraScore: 4,
    powerScore: 4,
  },

  // ===================== ملحقات وفلاتر =====================
  "filters mini 4": {
    aliases: [
      "فلاتر ميني 4",
      "فلتر ميني 4",
      "filters mini 4",
      "nd mini 4",
      "فلاتر mini 4",
    ],
    kind: "accessory",
    summary: "فلاتر ND / CPL لدرون Mini 4 Pro للتحكم في الإضاءة.",
    specs: {
      usage: "تحسين التصوير في الإضاءة القوية",
      other: "متوافقة مع Mini 4 Pro",
    },
    tags: ["فلتر", "nd", "mini 4", "ملحق"],
    isAccessoryFor: ["mini 4", "mini 4 pro"],
    beginnerScore: 7,
    travelScore: 6,
    cameraScore: 6,
    powerScore: 3,
  },

  "filters mini 5": {
    aliases: [
      "فلاتر ميني 5",
      "فلتر ميني 5",
      "filters mini 5",
      "nd mini 5",
    ],
    kind: "accessory",
    summary: "فلاتر لدرون Mini 5 Pro.",
    specs: {
      usage: "التحكم في التعريض والضوء",
      other: "متوافقة مع Mini 5",
    },
    tags: ["فلتر", "nd", "mini 5", "ملحق"],
    isAccessoryFor: ["mini 5", "mini 5 pro"],
    beginnerScore: 7,
    travelScore: 6,
    cameraScore: 6,
    powerScore: 3,
  },

  "filters neo": {
    aliases: [
      "فلاتر نيو",
      "فلتر نيو",
      "filters neo",
      "فلاتر نيو 2",
      "فلتر نيو 2",
    ],
    kind: "accessory",
    summary: "فلاتر لدرونات سلسلة Neo / Neo 2.",
    tags: ["فلتر", "neo", "ملحق"],
    isAccessoryFor: ["neo", "neo 2"],
    beginnerScore: 7,
    travelScore: 6,
    cameraScore: 5,
    powerScore: 3,
  },

  "nd filter avata 2": {
    aliases: [
      "nd filter avata 2",
      "فلتر افاتا 2",
      "فلاتر افاتا",
      "nd avata 2",
    ],
    kind: "accessory",
    summary: "فلاتر ND لدرون Avata 2.",
    tags: ["فلتر", "avata", "nd", "ملحق"],
    isAccessoryFor: ["avata 2", "avata"],
    beginnerScore: 6,
    travelScore: 5,
    cameraScore: 6,
    powerScore: 3,
  },

  "propellers mini": {
    aliases: [
      "مراوح ميني 5",
      "مراوح ميني 3 و 4",
      "مراوح ميني",
      "حماية مراوح ميني 5",
      "واقي مراوح",
    ],
    kind: "accessory",
    summary: "مراوح بديلة أو واقيات مراوح لسلسلة Mini.",
    tags: ["مراوح", "ملحق", "mini"],
    isAccessoryFor: ["mini 3", "mini 4", "mini 5"],
    beginnerScore: 8,
    travelScore: 7,
    cameraScore: 2,
    powerScore: 2,
  },

  "propellers air 3": {
    aliases: ["مراوح اير 3", "مراوح air 3"],
    kind: "accessory",
    summary: "مراوح بديلة لـ Air 3 / Air 3S.",
    tags: ["مراوح", "air 3", "ملحق"],
    isAccessoryFor: ["air 3", "air 3s"],
    beginnerScore: 7,
    travelScore: 6,
    cameraScore: 2,
    powerScore: 2,
  },

  "battery mini": {
    aliases: [
      "بطارية لدرون الميني",
      "بطارية ميني",
      "battery mini",
      "بطارية mini",
    ],
    kind: "accessory",
    summary: "بطارية إضافية لسلسلة Mini.",
    tags: ["بطارية", "mini", "ملحق"],
    isAccessoryFor: ["mini 3", "mini 4", "mini 5"],
    beginnerScore: 8,
    travelScore: 8,
    cameraScore: 2,
    powerScore: 3,
  },

  "bag / case": {
    aliases: [
      "شنطة مافيك 4",
      "شنطة اير 3",
      "شنطة نيو 2",
      "شنطة اوسمو",
      "شنطة دي جي اي فليب",
      "شنطة",
    ],
    kind: "accessory",
    summary: "شنط وحافظات حماية للدرونات والكاميرات.",
    tags: ["شنطة", "حافظة", "ملحق"],
    beginnerScore: 8,
    travelScore: 9,
    cameraScore: 2,
    powerScore: 2,
  },

  "memory 128gb": {
    aliases: [
      "مومري 128gb",
      "ذاكرة 128",
      "memory 128",
      "micro sd 128",
      "سان ديسك",
    ],
    kind: "memory",
    summary: "بطاقة ذاكرة 128GB مناسبة للدرونات والكاميرات.",
    specs: {
      other: "يفضّل سرعات عالية (V30 أو أعلى) للفيديو 4K",
    },
    tags: ["ذاكرة", "sd", "128gb"],
    beginnerScore: 9,
    travelScore: 8,
    cameraScore: 5,
    powerScore: 2,
  },

  "fpv goggles / accessories": {
    aliases: [
      "fpv 3",
      "fpv 2",
      "نظارة fpv",
      "ار سي موشن 3",
      "آر سي-إن 3",
      "rc motion",
    ],
    kind: "accessory",
    summary: "نظارات FPV ووحدات تحكم موشن وإكسسوارات طيران غامر.",
    tags: ["fpv", "نظارة", "موشن", "ملحق"],
    beginnerScore: 4,
    travelScore: 4,
    cameraScore: 5,
    powerScore: 8,
  },

  "transmitter neo 2": {
    aliases: [
      "جهاز ارسال واستقبال رقمي نيو 2",
      "ارسال نيو 2",
      "transmitter neo",
    ],
    kind: "accessory",
    summary: "جهاز إرسال/استقبال رقمي متوافق مع سلسلة Neo 2.",
    tags: ["ارسال", "neo", "ملحق"],
    isAccessoryFor: ["neo 2", "neo"],
    beginnerScore: 6,
    travelScore: 5,
    cameraScore: 3,
    powerScore: 4,
  },

  "studio kit": {
    aliases: ["استيديو كامل", "studio", "استوديو"],
    kind: "accessory",
    summary: "طقم استوديو كامل للإضاءة أو التصوير.",
    tags: ["استوديو", "إضاءة", "ملحق"],
    beginnerScore: 7,
    travelScore: 4,
    cameraScore: 6,
    powerScore: 5,
  },

  "magnetic cover mic": {
    aliases: [
      "غطاء مغناطيسي",
      "dji غطاء مغناطيسي متعدد الالوان للميكروفون",
    ],
    kind: "accessory",
    summary: "أغطية مغناطيسية ملونة لمايكات DJI.",
    tags: ["مايك", "غطاء", "ملحق"],
    beginnerScore: 8,
    travelScore: 7,
    cameraScore: 2,
    powerScore: 2,
  },
};

/**
 * كلمات ومرادفات تساعد زليخة على فهم اللهجة والأخطاء البسيطة.
 */
const INTENT_WORDS = {
  greeting: [
    "هلا",
    "مرحبا",
    "السلام",
    "هاي",
    "hello",
    "اهلين",
    "السلام عليكم",
    "صباح الخير",
    "مساء الخير",
  ],
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
    "وش اشتري",
    "شو اشتري",
    "ابي درون",
    "أريد درون",
    "ابغى",
    "أبغى",
  ],
  price: [
    "كم سعر",
    "السعر",
    "سعره",
    "بكم",
    "كم قيمته",
    "القيمه",
    "كم يكلف",
    "بكم ال",
    "سعر",
  ],
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
    "وش معه",
    "كم البطارية",
    "كم المدى",
    "كم الارتفاع",
  ],
  availability: [
    "متوفر",
    "موجود",
    "خلص",
    "نفذ",
    "كم الكميه",
    "كم الكمية",
    "في مخزون",
    "عندكم",
  ],
  compare: ["قارن", "مقارنه", "مقارنة", "الفرق بين", "افضل بينهم", "ولا"],
  order: [
    "طلبي",
    "تتبع",
    "متابعه طلب",
    "متابعة طلب",
    "وين الطلب",
    "حاله الطلب",
    "حالة الطلب",
    "طلباتي",
    "مشترياتي",
    "مشتريات",
    "ابي اتابع",
    "أريد أتابع",
  ],
  rental: [
    "ايجار",
    "إيجار",
    "استاجر",
    "استأجر",
    "تاجير",
    "تأجير",
    "اؤجر",
    "أجر",
  ],
  workshop: [
    "ورشه",
    "ورشة",
    "صيانه",
    "صيانة",
    "تصليح",
    "عطل",
    "خربان",
    "مشكله في الدرون",
    "مشكلة",
    "اصلاح",
    "إصلاح",
  ],
  auction: [
    "مزاد",
    "المزاد",
    "مزادات",
    "زايد",
    "مزايده",
    "مزايدة",
    "auction",
  ],
  payment: [
    "دفع",
    "تحويل",
    "عند الاستلام",
    "بطاقه",
    "بطاقة",
    "فيزا",
    "مدى",
    "كيف ادفع",
  ],
  shipping: [
    "شحن",
    "توصيل",
    "كم يوم",
    "مده التوصيل",
    "مدة التوصيل",
    "متى يوصل",
  ],
  cheaper: ["ارخص", "أرخص", "اقل سعر", "أقل سعر", "اقتصادي", "رخيص"],
  stronger: ["اقوى", "أقوى", "احترافي", "افضل", "أفضل", "متطور", "أعلى"],
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
    "هذا المنتج",
  ],
  second: ["الثاني", "الخيار الثاني", "رقم 2", "الثانيه"],
  first: ["الاول", "الأول", "الخيار الاول", "الخيار الأول", "رقم 1"],
  thanks: ["شكرا", "شكرًا", "مشكور", "يعطيك العافية", "تسلم"],
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
    "اير",
    "mavic",
    "مافيك",
    "طائرة بدون طيار",
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
    "جيمبال",
  ],
  microphone: ["مايك", "ميكروفون", "mic", "wireless mic", "تسجيل"],
  memory: [
    "ذاكره",
    "ذاكرة",
    "ميموري",
    "memory",
    "micro sd",
    "sd card",
    "سان ديسك",
    "sandisk",
    "مومري",
  ],
  accessory: [
    "ملحق",
    "ملحقات",
    "اكسسوار",
    "اكسسوارات",
    "بطاريه",
    "بطارية",
    "فلتر",
    "فلاتر",
    "شنطه",
    "شنطة",
    "مراوح",
    "شاحن",
    "كيبل",
    "كفر",
    "حامل",
    "واقي",
    "حماية",
    "غطاء",
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

function normalizePhoneForCompare(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }
  let digits = normalizeDigits(String(value)).replace(/\D/g, "");
  if (digits.startsWith("00968")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("968")) {
    digits = digits.slice(3);
  }
  return digits.slice(-8);
}

function samePhone(storedPhone: unknown, submittedPhone: string) {
  const stored = normalizePhoneForCompare(storedPhone);
  const submitted = normalizePhoneForCompare(submittedPhone);
  return stored.length === 8 && stored === submitted;
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
  // إذا الاسم يحتوي كلمات ملحقات واضحة
  if (ACCESSORY_WORDS.some((word) => haystack.includes(normalizeText(word)))) {
    return true;
  }
  const knowledge = getCuratedKnowledge(product);
  if (knowledge && (knowledge.kind === "accessory" || knowledge.kind === "memory")) {
    return true;
  }
  return false;
}

function isDroneProduct(product: Product) {
  const knowledge = getCuratedKnowledge(product);
  if (knowledge?.kind === "drone") return true;
  const haystack = normalizeText(
    `${product.name} ${product.description || ""}`,
  );
  // تجنب اعتبار الفلاتر درون
  if (includesAny(haystack, ["فلتر", "فلاتر", "filter", "nd ", "مراوح", "بطارية", "شنطة", "شنطه"])) {
    return false;
  }
  return includesAny(haystack, [
    "درون",
    "mini",
    "ميني",
    "avata",
    "افاتا",
    "neo",
    "نيو",
    "air",
    "اير",
    "mavic",
    "مافيك",
    "combo",
    "كومبو",
  ]);
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

    if (normalizedQuery === normalizedAlias) best = Math.max(best, 130);
    if (compactQuery === compactAlias) best = Math.max(best, 125);

    if (
      normalizedQuery.includes(normalizedAlias) ||
      normalizedAlias.includes(normalizedQuery)
    ) {
      best = Math.max(best, 90);
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
        tokenHits * 20 + (tokenHits === aliasTokens.length ? 25 : 0),
      );
    }

    const fuzzy = similarity(compactQuery, compactAlias);
    if (fuzzy >= 0.72) {
      best = Math.max(best, fuzzy * 75);
    }
  }

  const description = normalizeText(product.description || "");
  for (const token of queryTokens) {
    if (description.includes(token)) best += 2;
  }

  // مكافأة إضافية إذا كان المنتج درون والسؤال عن درون
  if (detectRequestedCategory(query) === "drone" && isDroneProduct(product)) {
    best += 35;
  }

  // عقوبة قوية إذا كان السؤال عن درون والمنتج فلتر/ملحق
  if (detectRequestedCategory(query) === "drone" && isAccessory(product)) {
    best -= 55;
  }

  // إذا السؤال يحتوي "فلتر" أو "مراوح" نعطي أولوية للملحق
  if (
    includesAny(normalizedQuery, ["فلتر", "فلاتر", "filter", "مراوح", "بطارية", "شنطة"]) &&
    isAccessory(product)
  ) {
    best += 40;
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
          score += 30;
        } else {
          score -= 30;
        }
      }

      /**
       * إذا العميل يقول "الدرون" أو "Mini 4" بدون كلمة فلتر،
       * لا نختار فلتر أو بطارية تحمل نفس الاسم.
       */
      if (asksForDrone && isAccessory(product)) {
        score -= 50;
      }

      // تفضيل الدرون الحقيقي عند تطابق جزئي
      if (asksForDrone && isDroneProduct(product)) {
        score += 25;
      }

      if (product.quantity > 0) score += 4;

      return { product, score };
    })
    .filter((item) => item.score >= 15)
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
    if (found.length >= 5) break;
  }
  return found;
}

function inferContextText(history: ChatMessage[]) {
  return history
    .slice(-10)
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
    "رقم هاتفك",
    "رقمك",
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
      "سهولة",
    ]),
    travel: includesAny(normalized, [
      "سفر",
      "خفيف",
      "صغير",
      "رحلات",
      "تنقل",
      "حقيبة",
    ]),
    photography: includesAny(normalized, [
      "تصوير",
      "كاميرا",
      "جوده",
      "جودة",
      "فيديو",
      "صور",
      "احترافي",
      "سينما",
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
      "fpv",
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
    score += productLooksLikeCategory(product, category) ? 45 : -70;
  }

  // تفضيل الدرونات الحقيقية عند طلب درون
  if (category === "drone") {
    if (isDroneProduct(product)) score += 30;
    if (isAccessory(product)) score -= 60;
  }

  if (useCase.beginner) {
    score += (knowledge?.beginnerScore || 0) * 4;
    if (includesAny(haystack, ["مبتدئ", "سهل", "حساسات"])) score += 15;
  }
  if (useCase.travel) {
    score += (knowledge?.travelScore || 0) * 4;
    if (includesAny(haystack, ["خفيف", "سفر", "صغير", "249"])) score += 15;
  }
  if (useCase.photography) {
    score += (knowledge?.cameraScore || 0) * 4;
    if (includesAny(haystack, ["4k", "5.4k", "48mp", "تصوير", "كاميرا"])) {
      score += 15;
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

  if (budget.max !== null && budget.max > 0) {
    const ratio = Math.min(price / budget.max, 1);
    score += ratio * 12;
  }

  if (useCase.cheap) {
    score += Math.max(0, 25 - price / 15);
  }

  score += Math.min(product.quantity, 10) * 0.25;
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
      score: recommendationScore(product, text, budget, category),
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

function alternativeActions(currentProduct?: Product): AIAction[] {
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
    `**${product.name}**`,
    `السعر: ${formatPrice(product.price)}`,
    `الحالة: ${
      product.quantity > 0 ? "متوفر" : "غير متوفر حاليًا"
    }`,
  ];

  if (knowledge?.summary) {
    lines.push(`نبذة: ${knowledge.summary}`);
  }

  if (knowledge?.specs?.camera) {
    lines.push(`التصوير: ${knowledge.specs.camera}`);
  }
  if (knowledge?.specs?.flightTime) {
    lines.push(`البطارية / وقت الطيران: ${knowledge.specs.flightTime}`);
  }
  if (knowledge?.specs?.transmission) {
    lines.push(`المدى: ${knowledge.specs.transmission}`);
  }
  if (knowledge?.specs?.maxFlightAltitudeAGL) {
    lines.push(`أقصى ارتفاع من سطح الأرض: ${knowledge.specs.maxFlightAltitudeAGL}`);
  }
  if (knowledge?.specs?.weight) {
    lines.push(`الوزن: ${knowledge.specs.weight}`);
  }
  if (knowledge?.specs?.sensors) {
    lines.push(`الحساسات: ${knowledge.specs.sensors}`);
  }
  if (knowledge?.specs?.comboContents) {
    lines.push(`محتويات الكومبو: ${knowledge.specs.comboContents}`);
  }
  if (knowledge?.specs?.usage) {
    lines.push(`الاستخدام الأنسب: ${knowledge.specs.usage}`);
  }
  if (knowledge?.specs?.other) {
    lines.push(knowledge.specs.other);
  }

  // للمنتجات غير الموجودة في قاعدة المعرفة نعرض وصف المتجر مختصرًا
  if (!knowledge && product.description?.trim()) {
    const shortDescription =
      product.description.trim().length > 180
        ? `${product.description.trim().slice(0, 180)}...`
        : product.description.trim();
    lines.push(`نبذة: ${shortDescription}`);
  }

  if (!knowledge && !product.description?.trim()) {
    lines.push("لا يوجد وصف مختصر مضاف لهذا المنتج حاليًا. تقدر تفتح صفحة المنتج للتفاصيل.");
  }

  return lines.join("\n");
}

function formatRecommendationReason(product: Product, text: string) {
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
    if (knowledge?.summary) {
      reasons.push(knowledge.summary.slice(0, 80));
    } else if (product.description?.trim()) {
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

  if (currentCandidates[0]?.score >= 30) {
    return currentCandidates[0].product;
  }

  if (includesAny(message, INTENT_WORDS.previous)) {
    const historyProducts = extractProductsFromHistory(products, history);
    if (includesAny(message, INTENT_WORDS.second)) {
      return historyProducts[1] || historyProducts[0] || null;
    }
    if (includesAny(message, INTENT_WORDS.first)) {
      return historyProducts[0] || null;
    }
    if (detectRequestedCategory(message) === "drone") {
      return (
        historyProducts.find((product) => isDroneProduct(product)) ||
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


function getAccessoryTargets(knowledge: CuratedKnowledge | null) {
  return (knowledge?.isAccessoryFor || []).map(normalizeText);
}

function findCompatibleAccessories(
  products: Product[],
  mainProduct: Product,
) {
  const mainKnowledge = getCuratedKnowledge(mainProduct);
  const mainNames = [
    mainProduct.name,
    ...(mainKnowledge?.aliases || []),
  ].map(normalizeText);

  return products
    .filter((product) => {
      if (!product.is_active || product.quantity <= 0) return false;
      if (product.id === mainProduct.id || !isAccessory(product)) return false;

      const knowledge = getCuratedKnowledge(product);
      const targets = getAccessoryTargets(knowledge);
      const accessoryText = normalizeText(
        `${product.name} ${product.description || ''} ${(knowledge?.tags || []).join(' ')}`,
      );

      if (
        targets.some((target) =>
          mainNames.some(
            (name) => name.includes(target) || target.includes(name),
          ),
        )
      ) {
        return true;
      }

      return mainNames.some((name) => {
        const important = tokenize(name).filter(
          (token) =>
            token.length > 2 &&
            !['dji', 'combo', 'pro', 'كومبو', 'برو'].includes(token),
        );

        return important.length > 0 && important.every((token) => accessoryText.includes(token));
      });
    })
    .slice(0, 4);
}

function accessoryActions(
  products: Product[],
  mainProduct: Product,
): AIAction[] {
  return findCompatibleAccessories(products, mainProduct)
    .slice(0, 2)
    .map((product) => ({
      type: 'navigate' as const,
      label: `ملحق: ${product.name}`,
      path: productPath(product),
      style: 'secondary' as const,
    }));
}

function extractRentalDays(text: string) {
  const normalized = normalizeDigits(normalizeText(text));

  const dayMatch = normalized.match(/(\d+)\s*(?:يوم|ايام|أيام)/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    return Number.isFinite(days) && days > 0 ? Math.min(days, 365) : null;
  }

  const dateRange = normalized.match(
    /(20\d{2})[-\/]?(\d{1,2})[-\/]?(\d{1,2}).{0,12}(?:الى|إلى|-).{0,12}(20\d{2})[-\/]?(\d{1,2})[-\/]?(\d{1,2})/,
  );

  if (dateRange) {
    const start = new Date(
      Number(dateRange[1]),
      Number(dateRange[2]) - 1,
      Number(dateRange[3]),
    );
    const end = new Date(
      Number(dateRange[4]),
      Number(dateRange[5]) - 1,
      Number(dateRange[6]),
    );
    const difference = Math.floor(
      (end.getTime() - start.getTime()) / 86400000,
    );
    return difference >= 0 ? difference + 1 : null;
  }

  return null;
}

function findRentalDrone(rentals: RentalDrone[], text: string) {
  const query = normalizeText(text);

  return rentals
    .map((drone) => {
      const name = normalizeText(drone.name);
      let score = 0;

      if (query.includes(name) || name.includes(query)) score += 70;
      for (const token of tokenize(drone.name)) {
        if (query.includes(token)) score += 15;
      }

      return { drone, score };
    })
    .sort((a, b) => b.score - a.score)[0];
}

function auctionTitle(auction: AuctionRow) {
  return String(
    auction.title ||
      auction.product_name ||
      auction.name ||
      `مزاد #${auction.id || ''}`,
  );
}

function auctionPrice(auction: AuctionRow) {
  const value =
    auction.current_price ??
    auction.highest_bid ??
    auction.start_price ??
    auction.starting_price;

  return typeof value === 'number' ? value : Number(value || 0);
}

function isAuctionActive(auction: AuctionRow) {
  const status = normalizeText(String(auction.status || ''));
  return !includesAny(status, [
    'منتهي',
    'ملغي',
    'ملغى',
    'closed',
    'ended',
    'cancelled',
  ]);
}

function formatAuctionDate(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function compareProducts(first: Product, second: Product) {
  const firstKnowledge = getCuratedKnowledge(first);
  const secondKnowledge = getCuratedKnowledge(second);

  const lines = [
    `مقارنة سريعة:`,
    ``,
    `**${first.name}**`,
    `السعر: ${formatPrice(first.price)}`,
    `التوفر: ${
      first.quantity > 0 ? "متوفر" : "غير متوفر"
    }`,
    firstKnowledge?.summary || first.description || "لا يوجد وصف مضاف",
    ``,
    `**${second.name}**`,
    `السعر: ${formatPrice(second.price)}`,
    `التوفر: ${
      second.quantity > 0 ? "متوفر" : "غير متوفر"
    }`,
    secondKnowledge?.summary || second.description || "لا يوجد وصف مضاف",
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
        firstBeginner >= secondBeginner ? first.name : second.name
      }`,
    );
    lines.push(
      `للتصوير: ${
        firstCamera >= secondCamera ? first.name : second.name
      }`,
    );
    lines.push(
      `للأداء والحركة: ${
        firstPower >= secondPower ? first.name : second.name
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
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string",
          )
          .slice(-16)
      : [];

    if (!message) {
      return jsonResponse({
        message:
          "اكتب سؤالك، مثل: أريد درون للمبتدئ وميزانيتي 300 ريال، أو كم سعر Mini 4 Pro؟",
        actions: [],
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [
      productsResult,
      rentalsResult,
      settingsResult,
      auctionsResult,
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
      supabase
        .from("auctions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const products = (productsResult.data || []) as Product[];
    const rentals = (rentalsResult.data || []) as RentalDrone[];
    const settings = settingsResult.data || [];
    const auctions = (auctionsResult.data || []) as AuctionRow[];

    const normalizedMessage = normalizeText(message);
    const combinedContext = `${inferContextText(history)} ${message}`;
    const category = inferCategoryFromHistory(message, history);
    const budget = inferBudgetFromHistory(message, history);

    /**
     * 1) التحية
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.greeting)) {
      return jsonResponse({
        message:
          "أهلًا وسهلًا، أنا زليخة مساعدتك الذكية في مرقاب.\nأقدر أساعدك تختار درون أو كاميرا أو مايك حسب ميزانيتك، وأعطيك الأسعار والمواصفات، وأقارن بين المنتجات، وأتابع طلبك، وأوريك التأجير والورشة والمزاد.",
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
          {
            type: "navigate",
            label: "فتح المتجر",
            path: "/shop",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * شكر
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.thanks)) {
      return jsonResponse({
        message: "العفو، أي وقت تحتاج مساعدة أنا موجودة.",
        actions: [
          {
            type: "prompt",
            label: "ساعديني أختار",
            prompt: "ساعديني أختار منتج مناسب.",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 2) متابعة الطلبات
     * - عند الضغط على "أريد أتابع طلبي" أو كتابة مشترياتي/تتبع:
     *   نطلب رقم الهاتف.
     * - عندما يرسل الرقم (أو بعد أن طلبناه):
     *   نبحث في orders + rental_bookings + workshop_requests
     *   ونرجع ملخص + زر يفتح /my-orders?phone=XXXX حتى تُملأ الصفحة تلقائيًا.
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
            "أكيد. اكتب رقم الهاتف المستخدم في الطلب (مثال: 9XXXXXXX)، وأنا أبحث لك في طلبات المتجر والإيجار والورشة، ثم أفتح لك صفحة مشترياتي.",
          actions: [],
        });
      }

      const [ordersResult, bookingsResult, workshopResult] =
        await Promise.all([
          supabase
            .from("orders")
            .select(
              "id,phone,customer_name,product_name,total,status,payment_status,payment_method,shipping_method,created_at",
            )
            .order("created_at", { ascending: false })
            .limit(500),

          supabase
            .from("rental_bookings")
            .select(
              "id,phone,start_date,end_date,total_days,total_amount,status,created_at,rental_drones(name)",
            )
            .order("created_at", { ascending: false })
            .limit(500),

          supabase
            .from("workshop_requests")
            .select("id,phone,drone_model,status,created_at")
            .order("created_at", { ascending: false })
            .limit(500),
        ]);

      const orders = (ordersResult.data || [])
        .filter((row) => samePhone(row.phone, phone))
        .slice(0, 10);

      const bookings = (bookingsResult.data || [])
        .filter((row) => samePhone(row.phone, phone))
        .slice(0, 10);

      const workshop = (workshopResult.data || [])
        .filter((row) => samePhone(row.phone, phone))
        .slice(0, 10);

      const lines: string[] = [];

      for (const order of orders) {
        lines.push(
          `طلب متجر #${order.id}: ${order.product_name || "منتج"}
الحالة: ${order.status || order.payment_status || "غير محددة"}
الإجمالي: ${formatPrice(order.total)}`,
        );
      }

      for (const booking of bookings) {
        const droneName = Array.isArray(booking.rental_drones)
          ? booking.rental_drones[0]?.name
          : (booking.rental_drones as { name?: string } | null)?.name;
        lines.push(
          `حجز إيجار #${booking.id}: ${droneName || "درون"}
الحالة: ${booking.status || "غير محددة"}
الإجمالي: ${formatPrice(booking.total_amount)}`,
        );
      }

      for (const request of workshop) {
        lines.push(
          `طلب ورشة #${request.id}: ${request.drone_model || "درون"}
الحالة: ${request.status || "غير محددة"}`,
        );
      }

      // المسار مع رقم الهاتف حتى تُملأ صفحة مشترياتي تلقائيًا (إذا كان الفرونت يدعم query)
      const myOrdersPath = `/my-orders?phone=${encodeURIComponent(phone)}&search=1`;

      if (!lines.length) {
        return jsonResponse({
          message:
            "ما حصلت طلبات بهذا الرقم. تأكد أنك كتبت نفس الرقم المستخدم وقت الطلب.\nتقدر تفتح صفحة مشترياتي وتتحقق بنفسك.",
          actions: [
            {
              type: "navigate",
              label: "فتح مشترياتي",
              path: myOrdersPath,
              style: "primary",
            },
          ],
        });
      }

      return jsonResponse({
        message: `حصلت لك التالي:\n\n${lines.join(
          "\n\n",
        )}\n\nأضغط على الزر لفتح صفحة مشترياتي مع رقمك.`,
        actions: [
          {
            type: "navigate",
            label: "فتح مشترياتي",
            path: myOrdersPath,
            style: "primary",
          },
        ],
      });
    }

    /**
     * 3) التأجير
     * - يعرض المتاح.
     * - يحسب السعر إذا كتب العميل عدد الأيام.
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.rental)) {
      if (!rentals.length) {
        return jsonResponse({
          message: "حاليًا ما فيه درونات إيجار مفعلة في النظام.",
          actions: [
            {
              type: "navigate",
              label: "صفحة التأجير",
              path: "/rentals",
              style: "primary",
            },
          ],
        });
      }

      const days = extractRentalDays(message);
      const rentalMatch = findRentalDrone(rentals, message);

      if (days && rentalMatch && rentalMatch.score > 0) {
        const drone = rentalMatch.drone;
        const total = Number(drone.daily_price) * days;

        return jsonResponse({
          message:
            `${drone.name}
` +
            `السعر اليومي: ${formatPrice(drone.daily_price)}
` +
            `عدد الأيام: ${days}
` +
            `الإجمالي التقريبي: ${formatPrice(total)}` +
            (drone.deposit_amount
              ? `
التأمين: ${formatPrice(drone.deposit_amount)}`
              : ""),
          actions: [
            {
              type: "navigate",
              label: `حجز ${drone.name}`,
              path: rentalPath(drone),
              style: "primary",
            },
            {
              type: "navigate",
              label: "كل درونات التأجير",
              path: "/rentals",
              style: "secondary",
            },
          ],
        });
      }

      const list = rentals
        .slice(0, 8)
        .map(
          (drone) =>
            `${drone.name}: ${formatPrice(drone.daily_price)} لليوم` +
            (drone.deposit_amount
              ? ` (تأمين ${formatPrice(drone.deposit_amount)})`
              : ""),
        )
        .join("
");

      return jsonResponse({
        message:
          `الدرونات المتاحة للإيجار:

${list}

` +
          "تقدر تكتب مثلًا: أريد استئجار Mini 4 لمدة 3 أيام.",
        actions: [
          {
            type: "navigate",
            label: "فتح صفحة التأجير",
            path: "/rentals",
            style: "primary",
          },
          ...rentals.slice(0, 2).map((drone) => ({
            type: "navigate" as const,
            label: `حجز ${drone.name}`,
            path: rentalPath(drone),
            style: "secondary" as const,
          })),
        ],
      });
    }

    /**
     * 4) الورشة
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.workshop)) {
      return jsonResponse({
        message:
          "تقدر تدخل صفحة الورشة وتعبّي نموذج طلب صيانة أو فحص:\n• الاسم\n• رقم الهاتف / واتساب\n• نوع وموديل الدرون\n• تفاصيل المشكلة أو الكسر\n• صورة اختيارية للعطل\n\nفريق الصيانة بيتواصل معك في أقرب وقت.",
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
     * 5) المزاد — يعرض المزادات الفعلية من Supabase.
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.auction)) {
      const activeAuctions = auctions.filter(isAuctionActive).slice(0, 6);

      if (!activeAuctions.length) {
        return jsonResponse({
          message: "لا توجد مزادات نشطة حاليًا.",
          actions: [
            {
              type: "navigate",
              label: "فتح المزادات",
              path: "/auctions",
              style: "primary",
            },
          ],
        });
      }

      const lines = activeAuctions.map((auction) => {
        const price = auctionPrice(auction);
        const endDate = formatAuctionDate(
          auction.end_at || auction.end_date,
        );

        return (
          `${auctionTitle(auction)}` +
          (price > 0 ? ` — ${formatPrice(price)}` : "") +
          (endDate ? ` — ينتهي ${endDate}` : "")
        );
      });

      return jsonResponse({
        message: `المزادات النشطة:

${lines.join("
")}`,
        actions: [
          {
            type: "navigate",
            label: "فتح المزادات",
            path: "/auctions",
            style: "primary",
          },
        ],
      });
    }

    /**
     * 6) الدفع والشحن
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.payment)) {
      return jsonResponse({
        message:
          "طرق الدفع تظهر لك عند إتمام الطلب حسب إعدادات المتجر (تحويل، بطاقة، عند الاستلام...).\nأكمل الطلب من المتجر وستظهر الخيارات المتاحة.",
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
          "مدة التوصيل تعتمد على المنطقة وطريقة الشحن المختارة.\nبعد تقديم الطلب تقدر تتابع حالته من صفحة مشترياتي بكتابة رقم هاتفك.",
        actions: [
          {
            type: "prompt",
            label: "متابعة طلب",
            prompt: "أريد أتابع طلبي.",
            style: "primary",
          },
          {
            type: "navigate",
            label: "مشترياتي",
            path: "/my-orders",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * 7) المقارنة
     */
    if (includesAny(normalizedMessage, INTENT_WORDS.compare)) {
      const comparison = findComparisonProducts(products, message, history);
      if (comparison.length < 2) {
        return jsonResponse({
          message:
            "اكتب اسم المنتجين بوضوح، مثل:\nقارن بين Mini 4 Pro و Avata 2\nأو: الفرق بين Mini 5 Pro و Air 3S",
          actions: [],
        });
      }
      return jsonResponse({
        message: compareProducts(comparison[0], comparison[1]),
        actions: productActions(comparison),
      });
    }

    /**
     * 8) ربط السؤال بالسياق السابق
     */
    const contextualProduct = extractRequestedProductFromContext(
      products,
      message,
      history,
    );

    if (
      contextualProduct &&
      (includesAny(normalizedMessage, INTENT_WORDS.price) ||
        includesAny(normalizedMessage, INTENT_WORDS.specs) ||
        includesAny(normalizedMessage, INTENT_WORDS.availability) ||
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
          ...accessoryActions(products, contextualProduct),
          ...alternativeActions(contextualProduct),
        ].slice(0, 6),
      });
    }

    /**
     * 9) سؤال مباشر عن سعر أو مواصفات أو توفر
     */
    if (
      includesAny(normalizedMessage, INTENT_WORDS.price) ||
      includesAny(normalizedMessage, INTENT_WORDS.specs) ||
      includesAny(normalizedMessage, INTENT_WORDS.availability)
    ) {
      const candidates = findProductCandidates(products, message, category);

      if (!candidates.length) {
        return jsonResponse({
          message:
            "ما قدرت أحدد المنتج بدقة. اكتب الاسم أوضح، مثل:\n• كم سعر Mini 4 Pro؟\n• كم سعر فلاتر Mini 4؟\n• مواصفات Avata 2",
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

      // إذا أول نتيجتين متقاربتان نسأل للتوضيح
      if (
        candidates.length > 1 &&
        candidates[0].score - candidates[1].score < 8 &&
        candidates[0].product.id !== candidates[1].product.id
      ) {
        const options = candidates.slice(0, 3).map((item) => item.product);
        return jsonResponse({
          message: `تقصد أي منتج؟\n\n${options
            .map((product, index) => `${index + 1}. ${product.name}`)
            .join("\n")}`,
          actions: options.map((product, index) => ({
            type: "prompt" as const,
            label: product.name,
            prompt: `أقصد ${product.name}. أعطني السعر والمواصفات.`,
            style: (index === 0 ? "primary" : "secondary") as const,
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
          ...accessoryActions(products, product),
          ...alternativeActions(product),
        ].slice(0, 6),
      });
    }

    /**
     * 10) توصية بدون ميزانية → نسأل عن الميزانية
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
            prompt: "ميزانيتي حتى 100 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
          {
            type: "prompt",
            label: "100–250 ريال",
            prompt: "ميزانيتي من 100 إلى 250 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
          {
            type: "prompt",
            label: "250–600 ريال",
            prompt: "ميزانيتي من 250 إلى 600 ريال. اعرضي المنتجات المناسبة.",
            style: "secondary",
          },
          {
            type: "prompt",
            label: "أكثر من 600",
            prompt: "ميزانيتي أكثر من 600 ريال. اعرضي أفضل الدرونات.",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * 11) توصيات حسب الميزانية والفئة
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
              prompt: "أريد درون ضمن الميزانية التي ذكرتها.",
              style: "primary",
            },
            {
              type: "prompt",
              label: "كاميرا",
              prompt: "أريد كاميرا ضمن الميزانية التي ذكرتها.",
              style: "secondary",
            },
            {
              type: "prompt",
              label: "ملحقات",
              prompt: "أريد ملحقات ضمن الميزانية التي ذكرتها.",
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

      const requestsAlternative = includesAny(normalizedMessage, [
        "خيار ثاني",
        "منتج ثاني",
        "غيره",
        "غير هذا",
        "مختلف",
        ...INTENT_WORDS.cheaper,
        ...INTENT_WORDS.stronger,
      ]);

      if (requestsAlternative) {
        const previousProductIds = getPreviouslyMentionedProductIds(
          products,
          history,
        );
        const filtered = recommendations.filter(
          (product) => !previousProductIds.has(product.id),
        );
        if (filtered.length > 0) {
          recommendations = filtered;
        }
      }

      if (!recommendations.length) {
        return jsonResponse({
          message: `ما حصلت منتج متوفر ${formatBudget(
            budget,
          )} في الفئة المطلوبة. جرب ترفع الميزانية شوي أو تختار فئة ثانية.`,
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

      const lines = recommendations.slice(0, 3).map(
        (product, index) =>
          `${index + 1}. **${product.name}** — ${formatPrice(product.price)}\nالسبب: ${formatRecommendationReason(
            product,
            combinedContext,
          )}`,
      );

      return jsonResponse({
        message: `هذه أنسب الخيارات ${
          formatBudget(budget) ? `ضمن ميزانية ${formatBudget(budget)}` : ""
        }:\n\n${lines.join("\n\n")}`,
        actions: [
          ...productActions(recommendations),
          ...alternativeActions(recommendations[0]),
        ].slice(0, 6),
      });
    }

    /**
     * 12) كلمات مثل "الأول" أو "الثاني"
     */
    if (
      includesAny(normalizedMessage, INTENT_WORDS.first) ||
      includesAny(normalizedMessage, INTENT_WORDS.second)
    ) {
      const historicalProducts = extractProductsFromHistory(products, history);
      const selected = includesAny(normalizedMessage, INTENT_WORDS.second)
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
     * 13) بحث مباشر بالاسم حتى بدون "كم سعر"
     */
    const directCandidates = findProductCandidates(
      products,
      message,
      category,
    );

    if (directCandidates[0] && directCandidates[0].score >= 32) {
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
          ...accessoryActions(products, product),
          ...alternativeActions(product),
        ].slice(0, 6),
      });
    }

    /**
     * 14) عرض قائمة المنتجات
     */
    if (
      includesAny(normalizedMessage, [
        "شو عندكم",
        "ما المنتجات",
        "المنتجات",
        "اعرض المنتجات",
        "المتجر",
        "وش موجود",
      ])
    ) {
      const available = products.filter(
        (product) => product.is_active && product.quantity > 0,
      );
      const list = available
        .slice(0, 12)
        .map((product) => `${product.name} — ${formatPrice(product.price)}`)
        .join("\n");

      return jsonResponse({
        message: `بعض المنتجات المتوفرة حاليًا:\n\n${list}\n\nتقدر تطلب توصية حسب ميزانيتك أو تفتح المتجر كامل.`,
        actions: [
          {
            type: "navigate",
            label: "فتح المتجر",
            path: "/shop",
            style: "primary",
          },
          {
            type: "prompt",
            label: "ساعديني أختار",
            prompt: "ساعديني أختار درون حسب ميزانيتي.",
            style: "secondary",
          },
        ],
      });
    }

    /**
     * 15) الرد العام الذكي
     */
    return jsonResponse({
      message:
        "أقدر أساعدك في:\n• اختيار درون / كاميرا / مايك حسب الميزانية والاستخدام\n• الأسعار والمواصفات والمقارنة\n• التأجير اليومي\n• طلب صيانة في الورشة\n• المزادات\n• متابعة الطلبات برقم هاتفك\n\nاكتب سؤالك مباشرة، مثل:\n«أريد درون للمبتدئ وميزانيتي 300 ريال»\nأو «كم سعر Mini 4 Pro؟»\nأو «أريد أتابع طلبي»",
      actions: [
        {
          type: "prompt",
          label: "ساعديني أختار",
          prompt:
            "ساعديني أختار منتج مناسب. اسأليني عن الميزانية والاستخدام.",
          style: "primary",
        },
        {
          type: "prompt",
          label: "متابعة طلب",
          prompt: "أريد أتابع طلبي.",
          style: "secondary",
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
          "صار خطأ مؤقت في زليخة. جرّب مرة ثانية أو افتح المتجر مباشرة.",
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
