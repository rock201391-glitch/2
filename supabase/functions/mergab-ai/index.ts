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

type AIAction =
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

const PRODUCT_KNOWLEDGE = `
معلومات مختصرة تستخدم فقط عندما يطابق المنتج الموجود في المتجر:

- DJI Neo / Neo 2: مناسب جدًا للمبتدئ والتصوير السريع والسفر. خفيف وسهل الاستخدام.
- DJI Mini 4 Pro Combo Plus: مناسب للمبتدئ والسفر والتصوير الجوي، حساسات شاملة، تصوير عمودي، 4K، ارتفاع تشغيل حتى 500 متر من سطح الأرض حسب القوانين المحلية.
- DJI Mini 5 Pro: مناسب للسفر والتصوير المتقدم، حساسات متقدمة وتصوير عمودي، ارتفاع تشغيل حتى 500 متر من سطح الأرض حسب القوانين.
- DJI Air 3S: تصوير احترافي، كاميرتان، بطارية ومدى قويان، مناسب للسفر والإنتاج.
- DJI Mavic 4 Pro: للمحترفين والإنتاج السينمائي والتصوير عالي المستوى.
- DJI Avata 2 / Avata 360: تجربة FPV وحركة، ليست الخيار الأول للمبتدئ الذي يريد تصويرًا عاديًا.
- Osmo Pocket 3 / Pocket 4: فلوقات، سفر، يوتيوب وتصوير يومي بجيمبال.
- Osmo Action 4 / Action 6: أكشن، خوذة، رياضة، دراجة ومغامرات.
- Insta360: تصوير 360 ومحتوى إبداعي.
- DJI Mic Mini / Mic 2 / Mic 3: مايكات لاسلكية للمحتوى والمقابلات.
- الملحقات: لا تعتبر المنتج الأساسي. عند قول العميل "Mini 4" دون كلمة فلتر أو شنطة أو بطارية أو مراوح، يقصد الدرون نفسه.
`;

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
    .slice(-5)
    .map((item) => normalizeText(item.content))
    .join(" ");

  return [
    "اتابع طلبي",
    "متابعه الطلب",
    "تتبع الطلب",
    "مشترياتي",
    "اكتب رقم",
    "رقم الهاتف",
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

function formatPrice(value: number) {
  return `${Number(value || 0).toFixed(3)} ر.ع`;
}

function compactDescription(value: string | null) {
  if (!value) return "لا يوجد وصف إضافي.";
  return value.replace(/\s+/g, " ").trim().slice(0, 260);
}

function catalogText(products: Product[]) {
  return products
    .map(
      (product) =>
        [
          `ID: ${product.id}`,
          `الاسم: ${product.name}`,
          `السعر: ${formatPrice(product.price)}`,
          `الحالة: ${product.quantity > 0 ? "متوفر" : "غير متوفر"}`,
          `الوصف: ${compactDescription(product.description)}`,
          `الرابط: ${productPath(product)}`,
        ].join(" | "),
    )
    .join("\n");
}

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    actions: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: [
              "navigate",
              "open_product",
              "prompt",
              "request_phone",
              "restart_flow",
            ],
          },
          label: { type: "string" },
          path: { type: ["string", "null"] },
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
          "prompt",
          "purpose",
          "style",
        ],
      },
    },
  },
  required: ["message", "actions"],
};

function sanitizeActions(actions: unknown): AIAction[] {
  if (!Array.isArray(actions)) return [];

  const result: AIAction[] = [];

  for (const raw of actions.slice(0, 6)) {
    if (!raw || typeof raw !== "object") continue;
    const action = raw as Record<string, unknown>;
    const type = String(action.type || "");
    const label = String(action.label || "").trim().slice(0, 60);
    if (!label) continue;

    const style =
      action.style === "primary" || action.style === "secondary"
        ? action.style
        : undefined;

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
      const prompt = String(action.prompt || "").trim();
      if (prompt) result.push({ type, label, prompt, style });
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed", actions: [] }, 405);
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

  try {
    const body = await req.json();
    const message =
      typeof body?.message === "string"
        ? body.message.trim().slice(0, 2200)
        : "";

    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item: ChatMessage) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string",
          )
          .slice(-14)
      : [];

    if (!message) {
      return jsonResponse({
        message: "اكتب لي ما تبحث عنه وسأساعدك.",
        actions: [],
      });
    }

    const phone = extractPhone(message);
    if (phone && historyWantsTracking(history)) {
      return jsonResponse({
        message: "تمام، سأفتح مشترياتك وأبحث بهذا الرقم تلقائيًا.",
        actions: [
          {
            type: "navigate",
            label: "فتح مشترياتي",
            path: `/my-orders?phone=${encodeURIComponent(phone)}&search=1`,
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

    const [productsResult, rentalsResult, auctionsResult] =
      await Promise.all([
        supabase
          .from("products")
          .select(
            "id,name,slug,description,price,quantity,category_id,is_active",
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(250),

        supabase
          .from("rental_drones")
          .select(
            "id,name,description,daily_price,deposit_amount,is_active",
          )
          .eq("is_active", true)
          .limit(50),

        supabase
          .from("auctions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    const products = (productsResult.data || []) as Product[];

    const rentalsText = (rentalsResult.data || [])
      .map(
        (item: Record<string, unknown>) =>
          `${item.name} | اليومي: ${formatPrice(Number(item.daily_price || 0))} | الرابط: /rentals/${item.id}`,
      )
      .join("\n");

    const auctionsText = (auctionsResult.data || [])
      .map((item: Record<string, unknown>) => {
        const name =
          item.title || item.name || item.product_name || "مزاد";
        const price =
          item.current_price ||
          item.highest_bid ||
          item.start_price ||
          item.starting_price ||
          0;

        return `${name} | الحالة: ${item.status || "غير محددة"} | السعر الحالي: ${formatPrice(Number(price))} | الرابط: /auctions/${item.id}`;
      })
      .join("\n");

    const systemPrompt = `
أنتِ "زليخة"، موظفة مبيعات ذكية وودودة في متجر مرقاب العماني للدرونات والكاميرات والمايكات والإكسسوارات.

أسلوبك:
- تكلمي بالعربية الخليجية البسيطة والواضحة.
- الرد مختصر ومفيد، ولا تحولي الرد إلى صفحة مواصفات طويلة.
- اسألي سؤالًا واحدًا فقط في كل مرة عندما تحتاجين معلومات.
- تذكري سياق المحادثة السابقة.
- لا تذكري أنك نموذج أو OpenAI.
- لا تستخدمي إيموجي كثيرًا؛ واحد كحد أقصى عند الحاجة.

قواعد البيع:
1. استخدمي السعر والتوفر من قائمة المنتجات فقط. لا تخترعي سعرًا أو مخزونًا.
2. لا تذكري quantity أو عدد القطع للعميل؛ اكتفي بـ "متوفر" أو "غير متوفر".
3. لا تذكري سعر الشراء أو الربح أو أي بيانات داخلية.
4. إذا كان العميل مبتدئًا ولا تعرفين الميزانية أو الاستخدام، اسألي عنهما سؤالًا واحدًا في كل مرة.
5. عند اكتمال المعلومات، رشحي من 1 إلى 3 منتجات فقط، واشرحي سببًا قصيرًا لكل منتج.
6. إذا كتب "Mini 4" دون كلمة ملحق، فالمقصود الدرون، وليس الفلاتر أو البطارية.
7. إذا طلب مواصفات، اذكري فقط أهم 4 أو 5 نقاط: التصوير، البطارية، المدى، الارتفاع من سطح الأرض، وأهم محتويات الكومبو إن كانت مؤكدة.
8. ارتفاع الدرون يُذكر من سطح الأرض AGL، وليس عن سطح البحر.
9. إذا لم تكن المواصفة مؤكدة في البيانات المتاحة، قولي إن التفاصيل تحتاج تأكيدًا بدل اختراعها.
10. كل زر منتج يجب أن يستخدم الرابط الموجود في الكتالوج.
11. عند طلب متابعة الطلب: أعيدي action من نوع request_phone.
12. التأجير: استخدمي صفحة /rentals أو منتج إيجار حقيقي من القائمة.
13. الورشة: افتحي /workshop.
14. المزادات: استخدمي المزادات الفعلية أو افتحي /auctions.
15. تستطيعين إنشاء أزرار prompt لمتابعة الحوار، مثل: "ميزانيتي أقل من 200" أو "تصوير سفر".
16. اجعلي الزبون يشعر أنك تفهمين احتياجه، لا تعرضي كل المنتجات دفعة واحدة.

أنواع الإجراءات:
- open_product: لفتح منتج محدد.
- navigate: لفتح صفحة مثل /shop أو /rentals أو /workshop أو /auctions.
- prompt: زر يرسل إجابة طبيعية تساعد في متابعة الأسئلة.
- request_phone: لطلب رقم الهاتف ومتابعة الطلب.
- restart_flow: للبدء من جديد.

${PRODUCT_KNOWLEDGE}

منتجات المتجر الحالية:
${catalogText(products)}

درونات التأجير الحالية:
${rentalsText || "لا توجد بيانات تأجير متاحة الآن."}

المزادات الحالية:
${auctionsText || "لا توجد مزادات متاحة الآن."}
`;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: systemPrompt,
      input: [
        ...history.map((item) => ({
          role: item.role,
          content: item.content.slice(0, 1600),
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
          name: "zulekha_reply",
          strict: true,
          schema: outputSchema,
        },
      },
      max_output_tokens: 900,
    });

    const raw = response.output_text?.trim();
    if (!raw) throw new Error("OpenAI returned an empty response");

    const parsed = JSON.parse(raw);

    return jsonResponse({
      message:
        typeof parsed.message === "string"
          ? parsed.message.trim()
          : "كيف أقدر أساعدك؟",
      actions: sanitizeActions(parsed.actions),
    });
  } catch (error) {
    console.error("mergab-ai error:", error);

    return jsonResponse(
      {
        message:
          "صار خطأ مؤقت في زليخة. جرّب مرة ثانية بعد لحظات.",
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
