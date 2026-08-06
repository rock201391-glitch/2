ChatGPT Plus






Pasted text(20260805-220302).txt
Document
هذا المشروع أنا سويته في ChatGPT لكن في ملف ثاني. أريدك, أريد أكمل المشروع في الملف هذا، تمام؟ افهم المشروع كامل. نحن وصلنا إلى الآن هذه الأشياء. عدنا قاعدة بيانات في Supabase، ونحن نستعمل GitHub. وهذه كامل الملفات اللي يستعملها. بعدها راح أقول لك شو أريد.

d986e7eb-b9f7-4f96-bcdb-6d3f8d533f34.png
9cf51756-b854-45fa-b320-e0aa961613c6.png
f819404d-b3e6-4cb7-a9b4-1c88e1952d3e.png
87ebbef3-87a3-4543-b5bf-094f8de51415.png
fbad5b64-1e49-47b6-91a2-15a0264fbc8e.png
5e069da1-e80f-4d8c-8aca-9319da136701.png

53c77b2a-a4d3-447f-ab5a-563fae1bd2a5.png

اريد اشيل تتبع الطلب اخلي كل شي من قائمة مشترياتي يعني لما تضغط على قائمة مشترياتي، تحط رقمك، رح تطلع لك كل الطلبيات اللي أنت سويتها. حتى الطلبيات القديمة وكذا، وحتى تطلع تفاصيل الشحنة، يعني مثلا تم الاستلام، قيد التوصيل وكذا.
fa3e9107-9c25-4032-84c5-dcd3814ef7f0.png
13acabe1-c856-40eb-8e03-59edc44f9e1a.png
24912295-7d2c-453e-9ea6-606617b375fd.png
e0c418c6-fae8-4631-98d6-a0ea67e634c6.png
أريد هذه كذا في مشترياتي يعني لما تضغط تسوي يعني مثلا رقمك، تطلع كذا هذه، وإذا أنت طالب شي قبل، تطلع تحت يعني نفس الصفحة كذا تطلع إنه تم التوصيل أو ملغي أو كذا كل الطلبات تطلع كذا في صفحة مشترياتي، صفحة تتبع الطلب أريد ألغيها. فأنت قولي شو الأكواد اللي أرسلها لك عشان نضبط اللي أريده أنا.


MyOrders.tsx
TypeScript

TrackOrder(1).tsx
TypeScript

Header(6).tsx
TypeScript

App(5).tsx
TypeScript

OrdersTab(1).tsx
TypeScript
اي ملف تريد اعدله ارسله كامل و بجطه

1c45b8f8-978b-4b7e-be4d-feb066bb1c67.png
c9c3deda-1b01-4c9e-b5cf-ca875cdd9ed6.png

ProductsManager.tsx
TypeScript

supabase_schema(2).sql
File

20260705000000_admin_phase1.sql
File

20260705000001_admin_phase1_settings.sql
File

AdminDashboard (1).tsx
TypeScript

AdminDashboard(1).tsx
TypeScript

HomePage.tsx
TypeScript

App(7).tsx
TypeScript

Header(8).tsx
TypeScript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "بيانات Supabase غير موجودة. تأكد من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

ارسل كل المفات بعد التعديل 

b45de410-300d-4ffa-ab4a-6111c233f12e.png
d37eba63-86dd-4d3a-bdd4-fc3193453ada.png
شوف، صورة، صورة الدرون أنا حاططها كاملة، الصورة كاملة بس طالعة شوي كذا، الخمسة مو باينة وكذا. أنا أريد صورة تطلع كلها كذا. وأريد مثلا أضغط على، أختار الحجز، لما أضغط على مثلا رقم أريد يوم ستة مثلا، أضغط على يوم ستة. مثلا أضغط على يوم ستة، السعر ما يطلع على اليسار. لازم أضغط عليه مرتين، مرتين على الستة، يطلع لي. أنا أريد لما أضغط مرة واحدة على الستة، تطلع لي السعر على اليسار تحت. مثلا أضغط ضغطة واحدة بس، السعر يطلع لي يسار تحت. أضغط على الستة، السعر يطلع لي. أضغط على مثلا تسعة، السعر يطلع لي كذا، أربعة أيام، ثمانين ريال كذا. بس في البداية خليها ضغطة واحدة. وفوق مكتوب الأحد، الاثنين، الثلاثاء، الخميس، الجمعة، السبت كذا. أريد هذول تكتب كاملة كذا. اليوم كامل مو فقط الاختصار. وأريد بيانات الحجز، تكتب الاسم وتكتب رقمك. وشيل الملاحظة، الملاحظة شيلها. تكتب الاسم ورقمك. بدل الملاحظة، سوي ارفق إيصال التحويل يعني يرفق إيصال التحويل هنا. ثم إرسال الحجز. والرقم أريد أقل عن ثمان أرقام ما يصير. قولي أي كود أرسلك عشان تسوي كل هذا.


Pasted text(20260805-230146).txt
Document
ارسل الكود كامل بعد التعديل 

8756fcbe-d9dc-413b-8ec3-f915ec08bea8.png
54d912b9-57d1-4cab-8321-cc5e7c1f5b5a.png
أريد أضيف هنا. شوف، أريد أسوي شيء. مثلا، أول شيء لما تضغط على اختر وأحجز. لما تضغط على اختر وأحجز، تحجز، تحط التاريخ وكل شيء. أريد صفحة الدفع يكون اللي بعدها. يعني، شيل بيانات الحجز اللي على اليمين شيلها، تمام؟ بيانات الحجز هذه شيلها. أريد بعد ما يختار من تاريخ عشرة مثلا إلى ثمانية عشر، يطلع 171 ريال، تمام؟ يضغط أذهب إلى الدفع أو إتمام الدفع أو كذا. تمام؟ يروح لصفحة الدفع. كذا، ينتقل لصفحة الدفع. هذه صفحة الدفع تكون مختلفة عن صفحة الدفع اللي في المتجر، حق المتجر المنتجات العادية. صفحة الدفع هنا راح تكون اكتب اسمك بالكامل. وأريد كذا تحط إنه ما يصير يكتب أقل من، ما يصير يكتب أقل من اسمين. لازم تكتب هنا الاسم الثلاثي. ما يصير أقل من كلمتين أو اسمين، تمام؟ وتحط الرقم، طبعا هذه بعد ما يضغط على إتمام الطلب. تحط الرقم، رقم الهاتف. بعدين تحت، ترفق الإيصال، ترفق الإيصال. قبل لا ترفق الإيصال، تختار الشحن وين مثلا. الشحن وين مثلا تختار. مثلا محافظات عمان، بعدين أول شيء تختار المحافظات، محافظات عمان، بعدين تختار الولاية وين بالضبط. بعدين تحت، في ثلاثة أشياء. البطاقة الشخصية، يرسل البطاقة الشخصية، ويرسل التحويل. إضافة التحويل. يعني إضافة إيصال التحويل أول شيء أكتب أو إضافة أرفق إيصال التحويل. بعدين أرفق صورة من البطاقة الشخصية كذا. بعدين إتمام الطلب، خلاص. أنت شوف شو الأكواد اللي تريدها وبرسلها لك.


Rentals(2).tsx
TypeScript

App(9).tsx
TypeScript

Checkout(1).tsx
TypeScript

RentalManager(1).tsx
TypeScript

33164f41-e946-4262-836e-16358f9b487e.png
 اي كود اعدل الصفحه ذي

4927889b-12d3-4e85-b353-92a083de968e.png

c137b90f-447e-4f7c-8d2a-f358e90ab4b2.png
d02ac809-2f11-48db-8bc0-7dbc295e33f5.png

Pasted text(20260805-235720).txt
Document
في الصفحة هذي، اختيار المدينة كذا، أريده يكون أفخم، نفس الصورة الثانية. المحافظة والولاية وكذا، أريد أفخم. ارسل لي الكود بعد التعديل. أرفق إيصال التحويل. أريد فقط يكتب "أرفق إيصال التحويل". واللوغو اللي جنبه كذا يعني كأنه فلوس أو كذا، يعني يكون مبين. أرفق صورة بطاقة شخصية، وأريد كذا، اللوجو اللي جنبي يبين كأنه أرفق البطاقة الشخصية. وال... بس. والأسماء الثلاثي، كذا ضبط، خلاص خلي، باقي كل شي خليه. وأرسل لي الكود.

f23f7534-e9b2-425d-a866-0a6072669ca7.png
الحين أريد بعد ما يكتب اسمه الثلاثي ويرفق البطاقة الشخصية، لما يضغط على إتمام طلب الإيجار، تطلع له صفحة كذا. هذه الصفحة تعهد، إني أتعهد كذا كذا، بالاسم الفلاني، وتطلع بطاقته الشخصية كذا تحت تمام. الصورة اللي هو حاطها تطلع كذا تحت، ورقم تلفونه، والمحافظة والولاية وكل شي، وإيصال التحويل وكذا مكتوب تحت. يعني تعهد إني راح أرجع الدرون نفس ما كانت، وإني أرجعها خلال الفترة اللي متفق عليها، والاستخدام اللي متفق عليها. أنت اكتب الكلام من عندك. سوي كذا شي، واكتب كلام من عندك، بعد ما يضغط إتمام طلب الإيجار، تطلع له الصفحة هذه. يضغط تحت كذا علامة صح. أو ما يحتاج علامة صح، فقط كذا يطلع له هوش تنبيه على الأشياء اللي قلت لك، بعدين يضغط موافق أو إتمام الطلب، خلاص. تروح الطلب عندي في الآدمن، وفيه كل التفاصيل هذه اللي قلتها لك.


RentalCheckout(1).tsx
TypeScript

RentalManager(3).tsx
TypeScript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "بيانات Supabase غير موجودة. تأكد من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


تمام يا حمد، جهزت لك صفحة التعهد والتوقيع كاملة مع ظهور التوقيع وجميع التفاصيل في الأدمن.

تحميل الملفات كاملة
تحميل جميع ملفات التعهد والتوقيع ZIP

أو كل ملف وحده:

RentalCheckout.tsx

RentalManager.tsx

20260806000003_rental_signature_terms.sql

أماكن الملفات
استبدل:

src/app/pages/RentalCheckout.tsx
واستبدل:

src/app/components/admin/RentalManager.tsx
ملف supabase.ts لا يحتاج أي تعديل.

طريقة العمل الجديدة
بعد أن يكتب الزبون بياناته ويرفع البطاقة والإيصال، يضغط:

مراجعة التعهد
ثم تظهر له صفحة كاملة فيها:

الاسم الثلاثي.

الهاتف.

المحافظة والولاية.

اسم الدرون.

تاريخ البداية والنهاية.

السعر الإجمالي.

صورة البطاقة الشخصية.

صورة إيصال التحويل.

نص التعهد كاملًا.

خانة توقيع بالرسم بالإصبع أو الماوس.

زر مسح التوقيع وإعادة التوقيع.

زر أوافق على التعهد وإتمام الطلب.

لن يُرسل الطلب إلا بعد وجود توقيع.

وفي الأدمن، عند الضغط على عرض، سيظهر:

جميع بيانات المستأجر.

نص التعهد الذي وافق عليه.

تاريخ ووقت الموافقة.

إيصال التحويل.

البطاقة الشخصية.

صورة توقيع المستأجر.

المطلوب في Supabase
افتح:

Supabase → SQL Editor → New query
ثم شغّل محتوى هذا الملف:

20260806000003_rental_signature_terms.sql

سيضيف إلى جدول rental_bookings:

signature_url
terms_text
terms_accepted
terms_accepted_at
وسينشئ Bucket جديدًا:

rental-signatures
بعد تشغيل SQL، تأكد من ظهوره في:

Storage → rental-signatures
اسم Commit مناسب:

Add rental undertaking and customer signature



RentalCheckout.tsx
Code


RentalManager.tsx
Code


20260806000003_rental_signature_terms.sql
Code


bfe77044-98c6-4abe-8536-9e10928a9c16.png

ممتاز، من الصورة واضح أن كل شيء نجح.

✅ تم إنشاء Bucket باسم:

rental-signatures

✅ وتم تنفيذ ملف SQL بنجاح، ويظهر في الأسفل:

Success. No rows returned.
وهذا يعني أن:

تمت إضافة أعمدة التعهد والتوقيع إلى جدول rental_bookings.

تم إنشاء سياسات رفع وعرض التوقيع.

تم إضافة جدول الحجوزات إلى Realtime (إذا لم يكن مضافًا).

الآن بقي فقط:

استبدل ملف:

RentalCheckout.tsx

استبدل ملف:

RentalManager.tsx

شغّل المشروع.

بعدها جرّب بنفسك:

املأ البيانات.

ارفع البطاقة.

ارفع الإيصال.

اضغط مراجعة التعهد.

وقّع.

اضغط أوافق على التعهد وإتمام الطلب.

إذا وصل الطلب للأدمن وظهر:

✅ البطاقة الشخصية

✅ إيصال التحويل

✅ صورة التوقيع

✅ نص التعهد

✅ المحافظة والولاية

فكل شيء انتهى.

إذا ظهر أي خطأ بعد استبدال الملفات (سواء في Vite أو React أو Supabase)، أرسل لي صورة الخطأ أو انسخ الرسالة، وسأصلحه معك مباشرة.


4fc98acb-e551-4eae-80f2-4d3fa49ea7a9.png
أريد التعهد يكون يعني أنا أتعهد صاحب، أنا أتعهد، ويكون بنص التعهد فيه أسمه. والتعهد أريده يكون شكله كذا قانوني أكثر يعني كذا أحلى يعني. ويكون كذا فيه لون أحمر كذا يعني تنبيه وكذا يعني. أرسل لي كود صفحة التعهد كامل بعد التعديل.

تمام يا حمد، عدّلت صفحة التعهد كاملة وخليتها بشكل أقوى وأقرب للصياغة القانونية.

RentalCheckout-legal-undertaking.tsx

استبدله في:

src/app/pages/RentalCheckout.tsx
التعديل يشمل:

اسم العميل يظهر داخل نص التعهد نفسه.

يظهر اسم الدرون وتاريخ بداية ونهاية الإيجار داخل التعهد.

صياغة أوضح وأكثر رسمية.

إضافة عنوان أحمر:

تعهد وإقرار قانوني ملزم
إضافة تنبيه أحمر قبل التوقيع.

النص مقسم إلى فقرات ليسهل قراءته.

التعهد المحفوظ في Supabase سيكون بنفس اسم العميل وبيانات حجزه.

عندما تفتح الحجز في الأدمن يظهر لك نفس نص التعهد الذي وافق عليه العميل.

لا تحتاج أي تعديل جديد في Supabase لهذا التغيير. 


RentalCheckout-legal-undertaking.tsx
Code


Library
/
RentalCheckout-legal-undertaking.tsx


import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eraser,
  FileCheck2,
  IdCard,
  Loader2,
  MapPin,
  PenLine,
  Phone,
  ShieldCheck,
  UploadCloud,
  User,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { RentalCheckoutData } from "./Rentals";

interface RentalCheckoutProps {
  booking: RentalCheckoutData;
  onBack: () => void;
  onSuccess: () => void;
}

const GOVERNORATE_TO_WILAYAT: Record<string, string[]> = {
  مسقط: ["مسقط", "مطرح", "بوشر", "السيب", "العامرات", "قريات"],
  ظفار: [
    "صلالة",
    "طاقة",
    "مرباط",
    "رخيوت",
    "ثمريت",
    "ضلكوت",
    "المزيونة",
    "مقشن",
    "شليم وجزر الحلانيات",
    "سدح",
  ],
  مسندم: ["خصب", "دبا", "بخاء", "مدحاء"],
  البريمي: ["البريمي", "محضة", "السنينة"],
  الداخلية: [
    "نزوى",
    "بهلا",
    "منح",
    "الحمراء",
    "آدم",
    "إزكي",
    "سمائل",
    "بدبد",
    "الجبل الأخضر",
  ],
  "شمال الباطنة": ["صحار", "شناص", "لوى", "صحم", "الخابورة", "السويق"],
  "جنوب الباطنة": ["الرستاق", "العوابي", "نخل", "وادي المعاول", "بركاء", "المصنعة"],
  "جنوب الشرقية": ["صور", "الكامل والوافي", "جعلان بني بوحسن", "جعلان بني بو علي", "مصيرة"],
  "شمال الشرقية": ["إبراء", "المضيبي", "بدية", "القابل", "وادي بني خالد", "دماء والطائيين", "سناو"],
  الظاهرة: ["عبري", "ينقل", "ضنك"],
  الوسطى: ["هيما", "محوت", "الدقم", "الجازر"],
};

const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

function buildTermsText(
  customerName: string,
  droneName: string,
  startDate: string,
  endDate: string,
) {
  return `أنا الموقع أدناه/ ${customerName}، أقر وأنا بكامل أهليتي المعتبرة بأن جميع البيانات والمستندات والمرفقات المقدمة ضمن طلب استئجار الدرون صحيحة وتخصني، وأتحمل كامل المسؤولية عن صحتها.

وأتعهد باستلام واستخدام الدرون (${droneName}) وجميع ملحقاته خلال مدة الإيجار من ${formatDate(
    startDate,
  )} إلى ${formatDate(
    endDate,
  )} استخدامًا مشروعًا وآمنًا، ووفق الغرض المتفق عليه وتعليمات التشغيل والسلامة والأنظمة المعمول بها في سلطنة عُمان.

كما أتعهد بالمحافظة على الدرون وملحقاته وعدم تسليمه أو تأجيره أو إعارته أو تمكين أي شخص آخر من تشغيله أو التصرف فيه دون موافقة خطية أو صريحة من متجر مرقاب، وعدم استخدامه في الأماكن المحظورة أو في أي نشاط مخالف للقانون أو للأنظمة والتعليمات الرسمية.

وألتزم بإعادة الدرون وجميع ملحقاته في التاريخ والوقت المتفق عليهما، وبالحالة ذاتها التي استلمتها عليها، مع مراعاة الاستهلاك الطبيعي المقبول. وأتحمل كامل المسؤولية المالية والقانونية عن أي تلف أو كسر أو فقدان أو نقص أو سرقة أو سوء استخدام أو تأخير في الإرجاع خلال فترة وجود الدرون في حيازتي.

وأوافق على سداد قيمة الإصلاح أو الاستبدال أو النقص أو رسوم التأخير وأي تكاليف مترتبة، وفق الفحص والتقييم الذي يجريه متجر مرقاب، كما أقر بأن توقيعي الإلكتروني أدناه يعد موافقة صريحة ونهائية على هذا التعهد وعلى جميع البيانات والمرفقات الواردة في الطلب.`; 
}

function normalizePhoneNumber(value: string) {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  return value
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/\D/g, "");
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function validFullName(value: string) {
  return normalizeName(value).split(" ").filter(Boolean).length >= 3;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value: string) {
  return parseDate(value).toLocaleDateString("ar-OM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function validateImage(file: File | null, label: string) {
  if (!file) return `أرفق ${label}`;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return `${label} يجب أن يكون JPG أو PNG أو WEBP`;
  }

  if (file.size > 5 * 1024 * 1024) {
    return `حجم ${label} يجب ألا يتجاوز 5 ميجابايت`;
  }

  return "";
}

async function uploadFile(
  bucket: string,
  folder: string,
  file: Blob,
  extension: string,
) {
  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType:
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function getFileExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function RentalCheckout({
  booking,
  onBack,
  onSuccess,
}: RentalCheckoutProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [wilayat, setWilayat] = useState("");

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const [step, setStep] = useState<"details" | "undertaking">("details");
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  const [signatureVersion, setSignatureVersion] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);

  const [receiptPreview, setReceiptPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");

  const wilayatOptions = useMemo(
    () => GOVERNORATE_TO_WILAYAT[governorate] || [],
    [governorate],
  );

  const undertakingText = useMemo(
    () =>
      buildTermsText(
        normalizeName(fullName) || "صاحب الطلب",
        booking.drone.name,
        booking.startDate,
        booking.endDate,
      ),
    [
      fullName,
      booking.drone.name,
      booking.startDate,
      booking.endDate,
    ],
  );

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview("");
      return;
    }

    const url = URL.createObjectURL(receiptFile);
    setReceiptPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  useEffect(() => {
    if (!idCardFile) {
      setIdCardPreview("");
      return;
    }

    const url = URL.createObjectURL(idCardFile);
    setIdCardPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idCardFile]);

  function validateDetails() {
    if (!validFullName(fullName)) {
      return "اكتب الاسم الثلاثي كاملًا، ثلاثة أسماء على الأقل";
    }

    if (normalizePhoneNumber(phone).length < 8) {
      return "رقم الهاتف يجب ألا يقل عن 8 أرقام";
    }

    if (!governorate) return "اختر المحافظة";
    if (!wilayat) return "اختر الولاية";

    const receiptError = validateImage(receiptFile, "إيصال التحويل");
    if (receiptError) return receiptError;

    const idCardError = validateImage(idCardFile, "صورة البطاقة الشخصية");
    if (idCardError) return idCardError;

    return "";
  }

  function openUndertaking(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep("undertaking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finishBooking() {
    if (submitting) return;

    if (!signatureBlob) {
      setError("يجب توقيع التعهد قبل إرسال الطلب");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data: conflicts, error: conflictError } = await supabase
        .from("rental_bookings")
        .select("id")
        .eq("rental_drone_id", booking.drone.id)
        .in("status", BLOCKING_STATUSES)
        .lte("start_date", booking.endDate)
        .gte("end_date", booking.startDate);

      if (conflictError) throw conflictError;

      if ((conflicts || []).length > 0) {
        setError("هذه المدة أصبحت محجوزة قبل إتمام الطلب، ارجع واختر مدة أخرى");
        setSubmitting(false);
        return;
      }

      const [receiptUrl, idCardUrl, signatureUrl] = await Promise.all([
        uploadFile(
          "rental-receipts",
          "receipts",
          receiptFile as File,
          getFileExtension(receiptFile as File),
        ),
        uploadFile(
          "rental-id-cards",
          "id-cards",
          idCardFile as File,
          getFileExtension(idCardFile as File),
        ),
        uploadFile(
          "rental-signatures",
          "signatures",
          signatureBlob,
          "png",
        ),
      ]);

      const normalizedPhone = normalizePhoneNumber(phone);
      const formattedPhone = normalizedPhone.startsWith("968")
        ? normalizedPhone
        : `968${normalizedPhone}`;

      const payload = {
        rental_drone_id: booking.drone.id,
        customer_name: normalizeName(fullName),
        phone: formattedPhone,
        governorate,
        wilayat,
        start_date: booking.startDate,
        end_date: booking.endDate,
        total_days: booking.totalDays,
        daily_price: Number(booking.drone.daily_price),
        total_amount: Number(booking.totalAmount),
        status: "pending",
        receipt_url: receiptUrl,
        id_card_url: idCardUrl,
        signature_url: signatureUrl,
        terms_text: undertakingText,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("rental_bookings")
        .insert(payload)
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccessId(Number(data.id));
    } catch (submitError) {
      console.error(submitError);
      setError("تعذر إتمام طلب الإيجار. تأكد من المرفقات وحاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId !== null) {
    return (
      <div
        className="min-h-screen bg-[#FDFBF7] px-4 py-12 text-[#0F3A2B]"
        dir="rtl"
      >
        <div className="mx-auto max-w-xl rounded-[36px] border border-[#E7E2D3] bg-white p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h1 className="mt-6 text-3xl font-black">تم إرسال طلب الإيجار</h1>

          <p className="mt-3 text-lg leading-7 text-gray-600">
            رقم الحجز <b>#{successId}</b>. ظهر الطلب الآن في لوحة الإدارة
            مع التعهد والتوقيع وجميع المرفقات.
          </p>

          <button
            type="button"
            onClick={onSuccess}
            className="mt-8 h-14 w-full rounded-2xl bg-[#0F3A2B] font-black text-white"
          >
            العودة إلى صفحة التأجير
          </button>
        </div>
      </div>
    );
  }

  if (step === "undertaking") {
    return (
      <div
        className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-[#0F3A2B]"
        dir="rtl"
      >
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setStep("details");
              setError("");
            }}
            className="mb-7 flex items-center gap-2 rounded-2xl border bg-white px-5 py-3 font-bold"
          >
            <ChevronRight className="h-5 w-5" />
            العودة لتعديل البيانات
          </button>

          <div className="rounded-[36px] border border-[#E7E2D3] bg-white p-6 shadow-xl sm:p-9">
            <div className="mb-8 flex items-center gap-4 border-b pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-3xl font-black">تعهد استئجار الدرون</h1>
                <p className="mt-1 text-sm text-gray-500">
                  راجع البيانات، اقرأ التعهد، ثم وقّع في الخانة أسفل الصفحة.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="الاسم الثلاثي" value={normalizeName(fullName)} />
              <Detail label="رقم الهاتف" value={normalizePhoneNumber(phone)} />
              <Detail label="المحافظة" value={governorate} />
              <Detail label="الولاية" value={wilayat} />
              <Detail label="الدرون" value={booking.drone.name} />
              <Detail label="من" value={formatDate(booking.startDate)} />
              <Detail label="إلى" value={formatDate(booking.endDate)} />
              <Detail
                label="الإجمالي"
                value={`${booking.totalAmount.toFixed(3)} ر.ع`}
              />
            </div>

            <div className="mt-7 overflow-hidden rounded-3xl border border-[#E7D8D3] bg-white">
              <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-red-800">
                    تعهد وإقرار قانوني ملزم
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-red-700">
                    يرجى قراءة جميع البنود بعناية قبل التوقيع وإتمام الطلب.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="mb-5 rounded-2xl border border-[#E7E2D3] bg-[#FAF8F5] px-5 py-4">
                  <p className="text-sm text-gray-500">اسم صاحب التعهد</p>
                  <p className="mt-1 text-lg font-black text-[#0F3A2B]">
                    {normalizeName(fullName)}
                  </p>
                </div>

                <div className="whitespace-pre-line text-justify text-[15px] font-medium leading-9 text-gray-700">
                  {undertakingText}
                </div>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" />

                    <p className="text-sm font-bold leading-7 text-red-800">
                      تنبيه مهم: بتوقيعك في الخانة أدناه والضغط على
                      «أوافق على التعهد وإتمام الطلب»، فإنك تقر بمراجعة
                      جميع البيانات والصور والبنود، وتوافق على تحمل
                      المسؤولية عن الدرون وملحقاته طوال مدة الإيجار.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <PreviewCard
                title="صورة البطاقة الشخصية"
                imageUrl={idCardPreview}
                icon={<IdCard className="h-6 w-6" />}
              />

              <PreviewCard
                title="إيصال التحويل"
                imageUrl={receiptPreview}
                icon={<Banknote className="h-6 w-6" />}
              />
            </div>

            <div className="mt-7 rounded-3xl border border-[#E7E2D3] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PenLine className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-black">توقيع المستأجر</h2>
                    <p className="text-sm text-gray-500">
                      وقّع بإصبعك على الهاتف أو باستخدام الماوس.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSignatureBlob(null);
                    setSignatureVersion((value) => value + 1);
                    setError("");
                  }}
                  className="flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 font-bold text-red-700"
                >
                  <Eraser className="h-4 w-4" />
                  مسح التوقيع
                </button>
              </div>

              <SignaturePad
                key={signatureVersion}
                onChange={setSignatureBlob}
              />
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-bold text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => void finishBooking()}
              className="mt-7 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#0F3A2B] text-lg font-black text-white disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  جاري رفع المرفقات وإرسال الطلب...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-6 w-6" />
                  أوافق على التعهد وإتمام الطلب
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={openUndertaking}
      className="min-h-screen bg-[#FDFBF7] px-4 py-10 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex w-fit items-center gap-2 rounded-2xl border bg-white px-5 py-2.5 font-bold"
        >
          <ChevronRight className="h-5 w-5" />
          العودة لاختيار التاريخ
        </button>

        <h1 className="mb-10 text-center text-4xl font-black">
          إتمام حجز الدرون
        </h1>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <Section title="بيانات المستأجر" icon={<User className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    الاسم الثلاثي
                  </label>

                  <input
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setError("");
                    }}
                    placeholder="مثال: حمد محمد البلوشي"
                    className="h-14 w-full rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 font-bold outline-none focus:border-[#0F3A2B]"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    يجب كتابة ثلاثة أسماء على الأقل
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    رقم الهاتف
                  </label>

                  <div
                    className="flex h-14 items-center gap-3 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] px-5 focus-within:border-[#0F3A2B]"
                    dir="ltr"
                  >
                    <Phone className="h-5 w-5 text-gray-400" />

                    <input
                      value={phone}
                      onChange={(event) => {
                        setPhone(normalizePhoneNumber(event.target.value));
                        setError("");
                      }}
                      placeholder="968XXXXXXXX"
                      inputMode="numeric"
                      className="h-full w-full bg-transparent text-left font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="موقع الاستلام" icon={<MapPin className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <FancySelect
                  label="المحافظة"
                  placeholder="اختر المحافظة"
                  value={governorate}
                  options={Object.keys(GOVERNORATE_TO_WILAYAT)}
                  onChange={(value) => {
                    setGovernorate(value);
                    setWilayat("");
                    setError("");
                  }}
                />

                <FancySelect
                  label="الولاية"
                  placeholder="اختر الولاية"
                  value={wilayat}
                  options={wilayatOptions}
                  disabled={!governorate}
                  onChange={(value) => {
                    setWilayat(value);
                    setError("");
                  }}
                />
              </div>
            </Section>

            <Section title="المرفقات" icon={<CreditCard className="h-6 w-6" />}>
              <div className="grid gap-5 md:grid-cols-2">
                <FileUpload
                  label="أرفق إيصال التحويل"
                  icon="receipt"
                  file={receiptFile}
                  onChange={(file) => {
                    setReceiptFile(file);
                    setError("");
                  }}
                />

                <FileUpload
                  label="أرفق صورة البطاقة الشخصية"
                  icon="id-card"
                  file={idCardFile}
                  onChange={(file) => {
                    setIdCardFile(file);
                    setError("");
                  }}
                />
              </div>
            </Section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-bold text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="space-y-6 rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm lg:sticky lg:top-28">
            {booking.drone.image_url && (
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#FAF8F5] p-3">
                <img
                  src={booking.drone.image_url}
                  alt={booking.drone.name}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <h2 className="text-2xl font-black">{booking.drone.name}</h2>

            <div className="space-y-3 rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] p-5 text-sm">
              <SummaryRow label="من" value={formatDate(booking.startDate)} />
              <SummaryRow label="إلى" value={formatDate(booking.endDate)} />
              <SummaryRow
                label="عدد الأيام"
                value={`${booking.totalDays} يوم`}
              />
              <SummaryRow
                label="السعر اليومي"
                value={`${Number(booking.drone.daily_price).toFixed(3)} ر.ع`}
              />

              <div className="flex justify-between gap-3 border-t pt-4 text-lg">
                <span className="font-bold">الإجمالي</span>
                <b>{booking.totalAmount.toFixed(3)} ر.ع</b>
              </div>
            </div>

            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0F3A2B] font-black text-white"
            >
              <ShieldCheck className="h-5 w-5" />
              مراجعة التعهد
            </button>
          </aside>
        </div>
      </div>
    </form>
  );
}

function SignaturePad({
  onChange,
}: {
  onChange: (blob: Blob | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasSignatureRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);

      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      const context = canvas.getContext("2d");
      if (!context) return;

      context.scale(ratio, ratio);
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#0F3A2B";
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, rect.width, rect.height);
    };

    resize();
  }, []);

  function pointFromEvent(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;

    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    hasSignatureRef.current = true;
  }

  function stopDrawing(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current;

    drawingRef.current = false;

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (!canvas || !hasSignatureRef.current) {
      onChange(null);
      return;
    }

    canvas.toBlob((blob) => onChange(blob), "image/png");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        className="h-56 w-full touch-none rounded-2xl border-2 border-dashed border-[#BDB5A5] bg-white shadow-inner"
      />

      <p className="mt-2 text-center text-xs text-gray-400">
        التوقيع داخل الإطار أعلاه
      </p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-[#E7E2D3] bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3 border-b border-[#F0EBE1] pb-4">
        <div className="rounded-2xl border border-[#EFECE6] bg-[#FAF8F5] p-2.5">
          {icon}
        </div>
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FAF8F5] p-4">
      <small className="text-gray-500">{label}</small>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function PreviewCard({
  title,
  imageUrl,
  icon,
}: {
  title: string;
  imageUrl: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E7E2D3] bg-[#FAF8F5] p-4">
      <div className="mb-3 flex items-center gap-2 font-black">
        {icon}
        {title}
      </div>

      <img
        src={imageUrl}
        alt={title}
        className="h-64 w-full rounded-2xl bg-white object-contain"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3 text-gray-600">
      <span>{label}</span>
      <b className="text-left text-[#0F3A2B]">{value}</b>
    </div>
  );
}

function FancySelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-14 w-full items-center justify-between rounded-2xl border px-5 text-right font-bold transition ${
          open
            ? "border-[#0F3A2B] bg-white shadow-lg"
            : "border-[#EFECE6] bg-[#FAF8F5]"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        <span className={value ? "" : "text-gray-400"}>
          {value || placeholder}
        </span>

        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[22px] border border-[#E7E2D3] bg-white p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`mb-1 w-full rounded-xl px-4 py-3 text-right text-sm font-bold ${
                !value
                  ? "bg-[#0F3A2B] text-white"
                  : "hover:bg-[#F8F7F2]"
              }`}
            >
              {placeholder}
            </button>

            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`mb-1 w-full rounded-xl px-4 py-3 text-right text-sm font-bold ${
                  value === option
                    ? "bg-[#0F3A2B] text-white"
                    : "hover:bg-[#F8F7F2]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FileUpload({
  label,
  icon,
  file,
  onChange,
}: {
  label: string;
  icon: "receipt" | "id-card";
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const EmptyIcon = icon === "receipt" ? Banknote : IdCard;

  return (
    <label className="group block cursor-pointer rounded-2xl border-2 border-dashed border-[#DED7C5] bg-[#FAF8F5] p-5 hover:border-[#0F3A2B]">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) =>
          onChange(event.target.files?.[0] || null)
        }
      />

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border bg-white">
          {file ? (
            <FileCheck2 className="h-7 w-7 text-emerald-600" />
          ) : (
            <EmptyIcon className="h-7 w-7" />
          )}
        </div>

        <div className="min-w-0 overflow-hidden">
          <p className="font-black">{label}</p>
          {file && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {file.name}
            </p>
          )}
        </div>
      </div>
    </label>
  );
}
