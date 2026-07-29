import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  CircleDollarSign,
  Ban,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface Order {
  id: string | number;
  customer_name?: string;
  phone?: string;
  product_name?: string;
  total?: number | string;
  status?: string;
  created_at?: string;
}

interface Product {
  id: string | number;
  name?: string;
  price?: number | string;
  cost_price?: number | string;
  purchase_price?: number | string;
  buying_price?: number | string;
  wholesale_price?: number | string;
}

interface OrderCalculation {
  cost: number;
  profit: number;
  matched: boolean;
}

interface MonthSummary {
  key: string;
  year: number;
  month: number;
  label: string;
  orders: Order[];
  activeOrders: Order[];
  cancelledOrders: Order[];
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  calculatedOrdersCount: number;
}

const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export default function StoreAccountsManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [ordersResult, productsResult] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase.from("products").select("*"),
    ]);

    if (ordersResult.error) {
      console.error("خطأ في تحميل الطلبات:", ordersResult.error);
      alert(`تعذر تحميل الطلبات: ${ordersResult.error.message}`);
    } else {
      setOrders(ordersResult.data || []);
    }

    if (productsResult.error) {
      console.error("خطأ في تحميل المنتجات:", productsResult.error);
      alert(`تعذر تحميل المنتجات: ${productsResult.error.message}`);
    } else {
      setProducts(productsResult.data || []);
    }

    setLoading(false);
  }

  function toNumber(value: unknown): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  function normalizeText(value?: string): string {
    return (value || "")
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ")
      .replace(/[^\u0600-\u06FFa-z0-9\s]/gi, "");
  }

  function isCancelledOrder(order: Order): boolean {
    const status = (order.status || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    return [
      "ملغي",
      "ملغى",
      "ملغية",
      "تم الإلغاء",
      "تم الالغاء",
      "تم إلغاء الطلب",
      "تم الغاء الطلب",
      "cancelled",
      "canceled",
    ].includes(status);
  }

  function getProductCost(product: Product): number {
    return toNumber(
      product.cost_price ??
        product.purchase_price ??
        product.buying_price ??
        product.wholesale_price ??
        0
    );
  }

  function splitOrderProducts(productName?: string): string[] {
    if (!productName) return [];

    return productName
      .split(/[,،|\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function extractQuantity(itemText: string): number {
    const quantityPatterns = [
      /(?:×|x)\s*(\d+)/i,
      /(\d+)\s*(?:×|x)/i,
    ];

    for (const pattern of quantityPatterns) {
      const match = itemText.match(pattern);

      if (match) {
        const quantity = Number(match[1]);

        if (Number.isFinite(quantity) && quantity > 0) {
          return quantity;
        }
      }
    }

    return 1;
  }

  function removeQuantityFromItem(itemText: string): string {
    return itemText
      .replace(/(?:×|x)\s*\d+/gi, "")
      .replace(/\d+\s*(?:×|x)/gi, "")
      .trim();
  }

  function findMatchingProduct(itemText: string): Product | undefined {
    const cleanItemName = normalizeText(removeQuantityFromItem(itemText));

    if (!cleanItemName) return undefined;

    const exactMatch = products.find(
      (product) => normalizeText(product.name) === cleanItemName
    );

    if (exactMatch) return exactMatch;

    return products
      .filter((product) => {
        const productName = normalizeText(product.name);

        if (!productName) return false;

        return (
          cleanItemName.includes(productName) ||
          productName.includes(cleanItemName)
        );
      })
      .sort((firstProduct, secondProduct) => {
        return (
          normalizeText(secondProduct.name).length -
          normalizeText(firstProduct.name).length
        );
      })[0];
  }

  function calculateOrder(order: Order): OrderCalculation {
    const orderItems = splitOrderProducts(order.product_name);

    if (orderItems.length === 0) {
      return {
        cost: 0,
        profit: 0,
        matched: false,
      };
    }

    let totalCost = 0;
    let matchedItems = 0;

    for (const item of orderItems) {
      const quantity = extractQuantity(item);
      const matchingProduct = findMatchingProduct(item);

      if (!matchingProduct) continue;

      const productCost = getProductCost(matchingProduct);

      if (productCost <= 0) continue;

      totalCost += productCost * quantity;
      matchedItems += 1;
    }

    const matched = matchedItems === orderItems.length;
    const orderTotal = toNumber(order.total);

    return {
      cost: totalCost,
      profit: matched ? orderTotal - totalCost : 0,
      matched,
    };
  }

  const calculationsByOrder = useMemo(() => {
    const result = new Map<string, OrderCalculation>();

    orders.forEach((order) => {
      result.set(String(order.id), calculateOrder(order));
    });

    return result;
  }, [orders, products]);

  const monthlySummaries = useMemo(() => {
    const monthGroups = new Map<string, Order[]>();

    orders.forEach((order) => {
      if (!order.created_at) return;

      const date = new Date(order.created_at);

      if (Number.isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      const existingOrders = monthGroups.get(key) || [];
      existingOrders.push(order);
      monthGroups.set(key, existingOrders);
    });

    const summaries: MonthSummary[] = [];

    monthGroups.forEach((monthOrders, key) => {
      const firstDate = new Date(monthOrders[0].created_at || "");
      const year = firstDate.getFullYear();
      const month = firstDate.getMonth();

      const activeOrders = monthOrders.filter(
        (order) => !isCancelledOrder(order)
      );

      const cancelledOrders = monthOrders.filter((order) =>
        isCancelledOrder(order)
      );

      const totalSales = activeOrders.reduce(
        (sum, order) => sum + toNumber(order.total),
        0
      );

      const totalCost = activeOrders.reduce((sum, order) => {
        const calculation = calculationsByOrder.get(String(order.id));

        if (!calculation?.matched) return sum;

        return sum + calculation.cost;
      }, 0);

      const totalProfit = activeOrders.reduce((sum, order) => {
        const calculation = calculationsByOrder.get(String(order.id));

        if (!calculation?.matched) return sum;

        return sum + calculation.profit;
      }, 0);

      const calculatedOrdersCount = activeOrders.filter((order) => {
        return calculationsByOrder.get(String(order.id))?.matched;
      }).length;

      summaries.push({
        key,
        year,
        month,
        label: `${ARABIC_MONTHS[month]} ${year}`,
        orders: monthOrders,
        activeOrders,
        cancelledOrders,
        totalSales,
        totalCost,
        totalProfit,
        calculatedOrdersCount,
      });
    });

    return summaries.sort((a, b) => b.key.localeCompare(a.key));
  }, [orders, calculationsByOrder]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center text-lg font-bold">
        جاري تحميل حسابات المتجر...
      </div>
    );
  }

  return (
    <div className="text-[#0F3A2B]" dir="rtl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black">حسابات المتجر</h2>

          <p className="mt-1 text-sm text-gray-500">
            المبيعات والأرباح مقسمة تلقائيًا حسب كل شهر
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F3A2B] px-5 py-2.5 text-sm font-bold text-white"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث الحسابات
        </button>
      </div>

      {monthlySummaries.length === 0 ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center">
          لا توجد حسابات شهرية حتى الآن
        </div>
      ) : (
        <div className="space-y-5">
          {monthlySummaries.map((summary) => {
            const isOpen = openMonth === summary.key;

            return (
              <div
                key={summary.key}
                className="overflow-hidden rounded-[28px] border border-[#D8D2C5] bg-white shadow-md"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenMonth(isOpen ? null : summary.key)
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right sm:px-7"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
                      <CalendarDays className="h-6 w-6" />
                    </span>

                    <div>
                      <h3 className="text-xl font-black">
                        حسابات شهر {summary.label}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        اضغط لعرض جميع طلبات الشهر
                      </p>
                    </div>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="h-6 w-6" />
                  ) : (
                    <ChevronDown className="h-6 w-6" />
                  )}
                </button>

                <div className="grid grid-cols-1 gap-3 border-t border-[#E8E3D9] bg-[#F8F7F2] p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="إجمالي المبيعات"
                    value={`${summary.totalSales.toFixed(3)} ر.ع`}
                    icon={CircleDollarSign}
                  />

                  <StatCard
                    title="إجمالي الأرباح"
                    value={`${summary.totalProfit.toFixed(3)} ر.ع`}
                    icon={TrendingUp}
                  />

                  <StatCard
                    title="الطلبات المكتملة بالحساب"
                    value={`${summary.activeOrders.length}`}
                    icon={ShoppingBag}
                  />

                  <StatCard
                    title="الطلبات الملغية"
                    value={`${summary.cancelledOrders.length}`}
                    icon={Ban}
                  />
                </div>

                {isOpen && (
                  <div className="border-t border-[#E8E3D9] p-4 sm:p-6">
                    <div className="mb-4 rounded-2xl border border-[#D8D2C5] bg-[#FFFDF8] p-4 text-sm">
                      تم حساب أرباح{" "}
                      <b>{summary.calculatedOrdersCount}</b> طلب من أصل{" "}
                      <b>{summary.activeOrders.length}</b> طلب غير ملغي.
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#D8D2C5]">
                      <table className="w-full min-w-[1100px] border-collapse text-right text-sm">
                        <thead className="bg-[#0F3A2B] text-white">
                          <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">الاسم</th>
                            <th className="p-4">الهاتف</th>
                            <th className="p-4">المنتج</th>
                            <th className="p-4">المبيعات</th>
                            <th className="p-4">التكلفة</th>
                            <th className="p-4">الربح</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">التاريخ</th>
                          </tr>
                        </thead>

                        <tbody>
                          {summary.orders.map((order) => {
                            const calculation =
                              calculationsByOrder.get(String(order.id));

                            const cancelled = isCancelledOrder(order);

                            return (
                              <tr
                                key={order.id}
                                className="border-b border-[#E8E3D9]"
                              >
                                <td className="p-4 font-bold">
                                  {order.id}
                                </td>

                                <td className="p-4">
                                  {order.customer_name || "-"}
                                </td>

                                <td className="p-4" dir="ltr">
                                  {order.phone || "-"}
                                </td>

                                <td className="min-w-[260px] p-4">
                                  {order.product_name || "-"}
                                </td>

                                <td className="whitespace-nowrap p-4 font-bold">
                                  {toNumber(order.total).toFixed(3)} ر.ع
                                </td>

                                <td className="whitespace-nowrap p-4 font-bold text-blue-700">
                                  {cancelled
                                    ? "-"
                                    : calculation?.matched
                                    ? `${calculation.cost.toFixed(3)} ر.ع`
                                    : "غير محسوبة"}
                                </td>

                                <td className="whitespace-nowrap p-4 font-bold">
                                  {cancelled ? (
                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                                      ملغي
                                    </span>
                                  ) : calculation?.matched ? (
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                                      {calculation.profit.toFixed(3)} ر.ع
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                                      يحتاج مطابقة
                                    </span>
                                  )}
                                </td>

                                <td className="p-4">
                                  {order.status || "قيد المراجعة"}
                                </td>

                                <td className="whitespace-nowrap p-4 text-xs text-gray-500">
                                  {order.created_at
                                    ? new Date(
                                        order.created_at
                                      ).toLocaleDateString("ar-OM")
                                    : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-[#DED8CC] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500">{title}</span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3A2B]/10 text-[#0F3A2B]">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
