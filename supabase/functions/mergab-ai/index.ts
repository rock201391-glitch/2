import { createClient } from "npm:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").service_role;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatMessage = {
  role: "assistant" | "user";
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

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function sanitizeActions(actions: unknown): AIAction[] {
  if (!Array.isArray(actions)) return [];

  return actions
    .filter((action) => action && typeof action === "object")
    .map((action: Record<string, unknown>) => {
      if (
        action.type === "navigate" &&
        typeof action.label === "string" &&
        typeof action.path === "string" &&
        action.path.startsWith("/")
      ) {
        return {
          type: "navigate" as const,
          label: action.label.slice(0, 40),
          path: action.path.slice(0, 250),
          style: action.style === "primary" ? "primary" : "secondary",
        };
      }

      if (
        action.type === "prompt" &&
        typeof action.label === "string" &&
        typeof action.prompt === "string"
      ) {
        return {
          type: "prompt" as const,
          label: action.label.slice(0, 40),
          prompt: action.prompt.slice(0, 400),
          style: action.style === "primary" ? "primary" : "secondary",
        };
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 6) as AIAction[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  if (!OPENAI_API_KEY) {
    return jsonResponse(
      {
        message:
          "مفتاح الذكاء الاصطناعي غير مضاف في Supabase. أضف OPENAI_API_KEY في Edge Function Secrets.",
        actions: [{ type: "navigate", label: "فتح المتجر", path: "/shop" }],
      },
      503,
    );
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ message: "Supabase server key is missing." }, 500);
  }

  try {
    const body = await req.json();
    const message =
      typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item: ChatMessage) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string",
          )
          .slice(-12)
      : [];
    const currentPath =
      typeof body?.current_path === "string" ? body.current_path : "/";

    if (!message) {
      return jsonResponse({ message: "اكتب سؤالك أولًا." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [productsResult, rentalsResult, settingsResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,name,slug,description,price,image_url,quantity,category_id,colors,is_active,created_at",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(120),

      supabase
        .from("rental_drones")
        .select(
          "id,name,description,image_url,daily_price,deposit_amount,is_active",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50),

      supabase.from("site_settings").select("*").limit(20),
    ]);

    const products = (productsResult.data || []).map((product) => ({
      ...product,
      product_path: `/product/${product.id}/${slugify(product.name || "product")}`,
    }));

    const rentalDrones = (rentalsResult.data || []).map((drone) => ({
      ...drone,
      rental_path: `/rentals/${drone.id}/${slugify(drone.name || "drone")}`,
    }));

    let customerData: Record<string, unknown> | null = null;
    const phone = extractPhone(message);

    if (phone) {
      const filter = phoneFilter(phone);

      const [orders, bookings, workshop] = await Promise.all([
        supabase
          .from("orders")
          .select("id,product_name,total,status,payment_method,delivery_method,created_at")
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

      customerData = {
        phone_last_four: phone.slice(-4),
        store_orders: orders.data || [],
        rental_bookings: bookings.data || [],
        workshop_requests: workshop.data || [],
        privacy_note:
          "لا تعرض الاسم الكامل أو العنوان أو الصور أو المستندات أو بيانات حساسة. اعرض رقم الطلب والحالة والمبلغ أو المنتج فقط.",
      };
    }

    const storeContext = {
      current_path: currentPath,
      products,
      rental_drones: rentalDrones,
      site_settings: settingsResult.data || [],
      customer_lookup: customerData,
      fixed_pages: {
        home: "/",
        shop: "/shop",
        rentals: "/rentals",
        auctions: "/auctions",
        workshop: "/workshop",
        my_orders: "/my-orders",
        cart: "/cart",
        checkout: "/checkout",
      },
    };

    const instructions = `
أنت "زليخة"، المساعدة الذكية لمتجر MERGAB في سلطنة عُمان. أنت مستشارة مبيعات وخدمة عملاء لكل منتجات المتجر، وليس للدرونات فقط.

أسلوبك:
- تحدث بالعربية الخليجية/العُمانية البسيطة والمحترمة.
- كن مختصرًا وواضحًا، لكن اسأل سؤالًا واحدًا أو سؤالين عند نقص المعلومات.
- لا تدّعي وجود سعر أو مواصفات أو مخزون غير موجودة في STORE_CONTEXT.
- أسعار المتجر والتوفر مصدرها STORE_CONTEXT وهي المصدر النهائي.
- تستطيع إعطاء معرفة عامة عن الدرونات، لكن وضّح أنها معلومات عامة إذا لم تكن موجودة ضمن بيانات المنتج.
- لا تخترع ضمانًا أو مدة شحن أو سياسة دفع. استخدم site_settings فقط، وإلا قل للعميل يتأكد من المتجر.
- عند التوصية، رشّحي فقط منتجات is_active=true وquantity>0.
- اعتبري جميع فئات المتجر: الدرونات، الكاميرات، المايكات، الذاكرة، الإكسسوارات، الملحقات، وأي منتج آخر موجود في جدول products.
- لا تحصري التوصيات في الدرونات إلا إذا طلب العميل درونًا صراحة.
- ضع حدًا أقصى 3 توصيات، واذكر سببًا عمليًا لكل توصية.
- إذا سأل عن منتج بالاسم، ابحث عنه بمرونة حتى لو كانت الكتابة غير دقيقة.
- إذا سأل عن السعر أو التوفر أو الوصف، أجب من بيانات المنتجات فقط.
- إذا طلب المساعدة في الاختيار، اسألي عن الميزانية والاستخدام والفئة المطلوبة قبل التوصية، إلا إذا ذكرها.
- إذا كتب ميزانية فقط، ابحثي في جميع المنتجات المتاحة ضمن الميزانية واقترحي الأنسب حسب ما يسأله، واسألي سؤال متابعة إذا لم يحدد الاستخدام.
- إذا رفض اقتراحًا، اسأليه هل يريد أرخص، أقوى، أصغر، جودة أعلى، أو فئة مختلفة.
- إذا سأل عن الطلب ولم يكتب رقم هاتف، اطلب منه رقم الهاتف المستخدم في الطلب.
- إذا customer_lookup موجود، اعرض حالة الطلبات دون بيانات حساسة.
- لا تعرض البطاقة الشخصية أو الإيصالات أو العنوان أو رقم الهاتف كاملًا.
- في الأسئلة القانونية أو تصاريح الطيران، لا تعطِ ضمانًا قانونيًا؛ اطلب التحقق من الجهات الرسمية.
- لا تقولي إنك إنسانة أو موظفة حقيقية.
- استخدمي اسمك "زليخة" عندما ترحبين أو إذا سألك العميل عن اسمك.
- خاطبي العميل بصيغة بسيطة وطبيعية، ولا تفرضي عليه قائمة طويلة من الخيارات؛ دعيه يكتب سؤاله بحرية.

أزرار actions:
- استخدم type="navigate" لفتح منتج أو صفحة.
- استخدم type="prompt" للأسئلة المتابعة مثل "أرخص" أو "خيار أقوى".
- مسار المنتج موجود في product_path.
- مسار التأجير موجود في rental_path.
- عندما توصي بمنتج، أضف زر فتح المنتج.
- بعد التوصية أضف زري prompt: "ناسبني" و"أريد خيارًا ثانيًا" عند الحاجة.

أعد JSON فقط بالشكل:
{
  "message": "الإجابة",
  "actions": [
    {
      "type": "navigate أو prompt",
      "label": "نص الزر",
      "path": "/مسار عند navigate",
      "prompt": "رسالة عند prompt",
      "style": "primary أو secondary"
    }
  ]
}
لا تضف markdown خارج JSON.
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions,
        input: [
          ...history.map((item) => ({
            role: item.role,
            content: [{ type: "input_text", text: item.content.slice(0, 2000) }],
          })),
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `STORE_CONTEXT:\n${JSON.stringify(storeContext)}\n\nCUSTOMER_MESSAGE:\n${message}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "mergab_ai_reply",
            strict: true,
            schema: {
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
                      type: { type: "string", enum: ["navigate", "prompt"] },
                      label: { type: "string" },
                      path: { type: "string" },
                      prompt: { type: "string" },
                      style: {
                        type: "string",
                        enum: ["primary", "secondary"],
                      },
                    },
                    required: ["type", "label", "path", "prompt", "style"],
                  },
                },
              },
              required: ["message", "actions"],
            },
          },
        },
        max_output_tokens: 900,
      }),
    });

    const openAIData = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", openAIData);
      return jsonResponse(
        {
          message:
            "المساعد مشغول حاليًا. جرّب بعد قليل، أو افتح المتجر من الزر.",
          actions: [
            {
              type: "navigate",
              label: "فتح المتجر",
              path: "/shop",
              style: "primary",
            },
          ],
        },
        502,
      );
    }

    const outputText =
      typeof openAIData.output_text === "string"
        ? openAIData.output_text
        : openAIData.output
            ?.flatMap((item: Record<string, unknown>) =>
              Array.isArray(item.content) ? item.content : [],
            )
            ?.find(
              (item: Record<string, unknown>) =>
                item.type === "output_text" && typeof item.text === "string",
            )?.text;

    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(outputText || "{}");
    } catch {
      parsed = {
        message:
          outputText || "ما قدرت أجهز الإجابة الآن. جرّب سؤالًا أقصر.",
        actions: [],
      };
    }

    return jsonResponse({
      message:
        typeof parsed.message === "string"
          ? parsed.message.slice(0, 5000)
          : "ما قدرت أجهز الإجابة الآن.",
      actions: sanitizeActions(parsed.actions),
    });
  } catch (error) {
    console.error("mergab-ai function error:", error);

    return jsonResponse(
      {
        message:
          "صار خطأ مؤقت في المساعد. جرّب مرة ثانية أو افتح صفحة مشترياتي لمتابعة طلبك.",
        actions: [
          {
            type: "navigate",
            label: "مشترياتي",
            path: "/my-orders",
            style: "primary",
          },
          {
            type: "navigate",
            label: "المتجر",
            path: "/shop",
            style: "secondary",
          },
        ],
      },
      500,
    );
  }
});
