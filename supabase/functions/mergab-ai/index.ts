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

const PRODUCT_KNOWLEDGE = `
معلومات مختصرة تستخدم فقط عندما يطابق المنتج الموجود في المتجر:

- DJI Neo / Neo 2: مناسب جدًا للمبتدئ والتصوير السريع والسفر. خفيف وسهل الاستخدام.
- DJI Mini 4 Pro Combo Plus: مناسب للمبتدئ والسفر والتصوير الجوي، حساسات شاملة، تصوير عمودي، 4K، ارتفاع تشغيل حتى 500 متر من سطح الأرض حسب القوانين المحلية.
- DJI Mini 5 Pro: مناسب للسفر والتصوير المتقدم، حساسات متقدمة وتصوير عمودي، ارتفاع تشغيل حتى 500 متر من سطح الأرض حسب القوانين.
- DJI Air 3S: تصوير احترافي، كاميرتان، بطارية ومدى قويان، مناسب للسفر والإنتاج.
- DJI Mavic 4 Pro: للمحترفين والإنتاج السينمائي والتصوير عالي المستوى.
- DJI Avata 2 / Avata 360: تجربة FPV وحركة، وليست الخيار الأول للمبتدئ الذي يريد تصويرًا عاديًا.
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

function messageIsExperienceQuestion(message: string) {
  const normalized = normalizeText(message);

  return (
    normalized.includes("مبتدئ") &&
    (
      normalized.includes("خبره") ||
      normalized.includes("محترف") ||
      normalized.includes("اول مره") ||
      normalized.includes("سبق")
    )
  );
}

function sanitizeActions(
  actions: unknown,
  assistantMessage: string,
): AIAction[] {
  if (!Array.isArray(actions)) return [];

  const result: AIAction[] = [];
  const allowExperienceButtons = messageIsExperienceQuestion(assistantMessage);

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

    if (type === "auto_open_product") {
      const path = String(action.path || "");
      const productName = String(action.productName || "").trim().slice(0, 120);
      const productPrice = String(action.productPrice || "").trim().slice(0, 50);

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
        normalizedLabel.includes("اول مره");

      if (!isExperienceChoice) continue;

      const prompt = String(action.prompt || "").trim();

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
        ? body.message.trim().slice(0, 2200)
        : "";

    const language = body?.language === "en" ? "en" : "ar";
    isEnglish = language === "en";

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
        message: isEnglish ? "Tell me what you are looking for and I’ll help you." : "اكتب لي شو تدور عليه وبساعدك.",
        actions: [],
      });
    }

    const phone = extractPhone(message);

    if (phone && historyWantsTracking(history)) {
      return jsonResponse({
        message: isEnglish ? "Done. I’ll open your orders and search using this number." : "تمام، بفتح مشترياتك وببحث بهذا الرقم تلقائي.",
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
${isEnglish
  ? `You are "Nour", a smart and friendly sales assistant at Mergab Store in Oman.

Language rules:
- Reply only in clear, natural English.
- Keep responses short and useful.
- Ask only one question at a time.
- Remember the customer’s previous answers.
- Do not mention OpenAI or that you are a model.
- Do not overuse emojis.

Conversation flow:
1. When the customer wants help choosing a drone, first ask whether they are a beginner or experienced.
2. Only for that first experience question, you may return two prompt buttons.
3. After that, do not return preset options. Ask the customer to type their use case.
4. Then ask them to type their budget in OMR.
5. Apply the same approach to cameras, microphones, accessories, and other products.
6. Once enough information is available, recommend one to three products only.

Sales rules:
- Use prices and availability only from the store catalog below.
- Never expose quantity, purchase cost, profit, or internal data.
- If the customer writes "Mini 4" without saying filter, bag, battery, or propellers, interpret it as the drone.
- When specifications are requested, mention only the most important four or five details.
- Drone altitude must be described as AGL (above ground level), not above sea level.
- If a detail is uncertain, say it needs confirmation instead of inventing it.
- When a product is confidently selected, return exactly one auto_open_product action using the real path, product name, and price.
- If the customer asks for something better, choose a stronger and normally more expensive product.
- If the customer asks for something cheaper, choose a cheaper suitable option.
- If the customer asks for an alternative, do not repeat the same product.
- For order tracking, return request_phone.
- Rentals use /rentals, workshop uses /workshop, and auctions use /auctions.
`
  : `أنتِ "نور"، مستشارة مبيعات ذكية وودودة في متجر مرقاب العماني للدرونات والكاميرات والمايكات والإكسسوارات.`
}

${isEnglish ? "Ignore the Arabic-only instructions below and follow the English instructions above." : `
أسلوبك:
- تكلمي بلهجة عمانية خفيفة وطبيعية، مفهومة لكل الناس.
- استخدمي كلمات عمانية بسيطة مثل: "شو"، "زين"، "تمام"، "بساعدك"، "على حسب"، "تدور".
- لا تبالغي في اللهجة ولا تستخدمي كلمات صعبة أو محلية جدًا.
- الرد يكون قصير وواضح.
- اسألي سؤالًا واحدًا فقط في كل مرة.
- تذكري كلام الزبون السابق.
- لا تذكري أنك نموذج أو OpenAI.
- لا تكثري إيموجي.

طريقة الحوار:
1. إذا اختار الزبون "أريد درون مناسب"، اسأليه أولًا فقط:
    "زين، أول مرة تستخدم درون ولا عندك خبرة؟"
2. في سؤال الخبرة الأول فقط، تقدرين تعرضين خيارين:
    - مبتدئ / أول مرة
    - عندي خبرة
3. بعد ما يحدد خبرته، لا تعرضي أي خيارات جاهزة.
4. بعدها قولي له يكتب بنفسه استخدامه، مثل:
    "تمام، اكتب لي شو أكثر استخدام تريده للدرون؟"
5. بعد ما يكتب الاستخدام، اسأليه يكتب الميزانية بنفسه:
    "زين، كم ميزانيتك بالريال العماني؟"
6. لا تعرضي أزرار ميزانيات ولا استخدامات ولا أنواع تصوير بعد سؤال الخبرة.
7. إذا احتجت معلومة ثانية، اطلبي منه يكتبها بنفسه بدون أزرار.
8. نفس الطريقة في الكاميرات والمايكات والإكسسوارات:
    - اسألي عن الاستخدام كتابة.
    - بعدها الميزانية كتابة.
    - لا تعرضي خيارات جاهزة.
9. إذا كان سؤاله واضحًا من البداية، لا تعيدي أسئلة يعرف جوابها من كلامه.
10. بعد اكتمال المعلومات، رشحي من 1 إلى 3 منتجات فقط.

قواعد البيع:
1. استخدمي السعر والتوفر من قائمة المنتجات فقط. لا تخترعي سعرًا أو مخزونًا.
2. لا تذكري quantity أو عدد القطع؛ اكتفي بـ "متوفر" أو "غير متوفر".
3. لا تذكري سعر الشراء أو الربح أو أي بيانات داخلية.
4. إذا كتب "Mini 4" بدون كلمة فلتر أو شنطة أو بطارية أو مراوح، فالمقصود الدرون نفسه.
5. إذا طلب مواصفات، اذكري أهم 4 أو 5 نقاط فقط.
6. ارتفاع الدرون يكون من سطح الأرض AGL وليس عن سطح البحر.
7. إذا المعلومة غير مؤكدة، قولي له تحتاج تأكيد بدل ما تخترعين.
8. كل زر منتج يستخدم الرابط الحقيقي الموجود في الكتالوج.
9. عند طلب متابعة الطلب، أعيدي action من نوع request_phone.
10. التأجير يفتح /rentals أو منتج تأجير حقيقي.
11. الورشة تفتح /workshop.
12. المزادات تفتح /auctions أو المزاد الحقيقي.
13. لا تعرضي أزرار prompt إلا في سؤال الخبرة الأول، أو بعد أن يرجع الزبون من صفحة منتج ويسأل هل مناسب له.
14. إذا توصلتِ إلى منتج محدد ومناسب وواثقة من الاختيار، لا تعرضي زر فتح المنتج.
15. بدل ذلك أعيدي إجراء واحد فقط من نوع auto_open_product، وسيتم فتح صفحة المنتج تلقائيًا وإغلاق نور.
16. ضعي في auto_open_product:
    - path: رابط المنتج الحقيقي.
    - productName: اسم المنتج الحقيقي.
    - productPrice: السعر الظاهر في الكتالوج.
17. لا تستخدمي auto_open_product إذا ما زلتِ تحتاجين معلومة من الزبون.
18. عند قول الزبون "أريد أفضل" بعد رجوعه، اختاري منتجًا أعلى وأقوى وأغلى من السابق إن كان مناسبًا، ثم افتحيه تلقائيًا.
19. عند قول الزبون "أريد أرخص"، اختاري بديلًا أقل سعرًا قدر الإمكان مع بقاءه مناسبًا، ثم افتحيه تلقائيًا.
20. عند قول الزبون "أريد بديل"، لا تعيدي نفس المنتج السابق، واختاري منتجًا مختلفًا ثم افتحيه تلقائيًا.
21. هذه القاعدة تنطبق على الدرونات والكاميرات والمايكات والإكسسوارات وجميع المنتجات.

أنواع الإجراءات:
- auto_open_product: فتح صفحة المنتج تلقائيًا وإغلاق نور عندما يكون الاختيار جاهزًا.
- open_product: زر يدوي، استخدميه فقط إذا طلب الزبون رابطًا أو أراد عدة خيارات.
- navigate: فتح صفحة عامة.
- prompt: مسموح فقط لخيار الخبرة الأول.
- request_phone: طلب رقم الهاتف لمتابعة الطلب.
- restart_flow: بدء من جديد.
`}

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
          name: "nour_reply",
          strict: true,
          schema: outputSchema,
        },
      },
      max_output_tokens: 900,
    });

    const raw = response.output_text?.trim();

    if (!raw) {
      throw new Error("OpenAI returned an empty response");
    }

    const parsed = JSON.parse(raw);

    const assistantMessage =
      typeof parsed.message === "string"
        ? parsed.message.trim()
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
