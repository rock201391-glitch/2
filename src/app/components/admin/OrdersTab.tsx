import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface Order {
  id: string | number;
  customer_name?: string;
  phone?: string;
  product_name?: string;
  total?: number;
  governorate?: string;
  city?: string;
  shipping_method?: string;
  payment_status?: string;
  payment_method?: string;
  status?: string;
  notes?: string;
  receipt_url?: string;
  created_at?: string;
}

interface Product {
  id: string | number;
  name?: string;
  price?: number | string;

  // يدعم أكثر من اسم محتمل لعمود سعر الشراء
  cost_price?: number | string;
  purchase_price?: number | string;
  buying_price?: number | string;
  wholesale_price?: number | string;

  [key: string]: unknown;
}

interface OrderCalculation {
  cost: number;
  profit: number;
  matched: boolean;
  matchedItems: number;
  totalItems: number;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  async function handleUpdateStatus(
    orderId: string | number,
    newStatus: string
  ) {
    setUpdatingStatus(true);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (!error) {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setSelectedOrder((previousOrder) =>
        previousOrder
          ? {
              ...previousOrder,
              status: newStatus,
            }
          : previousOrder
      );
    } else {
      alert(error.message || JSON.stringify(error));
      console.error(error);
    }

    setUpdatingStatus(false);
  }

  async function handleDeleteOrder(orderId: string | number) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن العملية."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      alert(error.message);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  }

  function toNumber(value: unknown): number {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return 0;
    }

    return parsedValue;
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
        const firstLength = normalizeText(firstProduct.name).length;
        const secondLength = normalizeText(secondProduct.name).length;

        return secondLength - firstLength;
      })[0];
  }

  function calculateOrder(order: Order): OrderCalculation {
    const orderTotal = toNumber(order.total);
    const orderItems = splitOrderProducts(order.product_name);

    if (orderItems.length === 0) {
      return {
        cost: 0,
        profit: 0,
        matched: false,
        matchedItems: 0,
        totalItems: 0,
      };
    }

    let totalCost = 0;
    let matchedItems = 0;

    for (const item of orderItems) {
      const quantity = extractQuantity(item);
      const matchingProduct = findMatchingProduct(item);

      if (!matchingProduct) {
        continue;
      }

      const productCost = getProductCost(matchingProduct);

      if (productCost <= 0) {
        continue;
      }

      totalCost += productCost * quantity;
      matchedItems += 1;
    }

    const matched = matchedItems === orderItems.length;

    return {
      cost: totalCost,
      profit: matched ? orderTotal - totalCost : 0,
      matched,
      matchedItems,
      totalItems: orderItems.length,
    };
  }

  const calculationsByOrder = useMemo(() => {
    const result = new Map<string, OrderCalculation>();

    orders.forEach((order) => {
      result.set(String(order.id), calculateOrder(order));
    });

    return result;
  }, [orders, products]);

  function isCancelledOrder(order: Order): boolean {
    const status = (order.status || "").trim();

    return [
      "ملغي",
      "ملغى",
      "تم الإلغاء",
      "تم الغاء الطلب",
      "تم إلغاء الطلب",
    ].includes(status);
  }

  const dashboardStats = useMemo(() => {
    const activeOrders = orders.filter((order) => {
      const status = (order.status || "").trim();

      return ![
        "ملغي",
        "ملغى",
        "تم الإلغاء",
        "تم الغاء الطلب",
        "تم إلغاء الطلب",
      ].includes(status);
    });

    const totalSales = activeOrders.reduce(
      (sum, order) => sum + toNumber(order.total),
      0
    );

    const totalProfit = activeOrders.reduce((sum, order) => {
      const calculation = calculationsByOrder.get(String(order.id));

      if (!calculation?.matched) {
        return sum;
      }

      return sum + calculation.profit;
    }, 0);

    const calculatedOrdersCount = activeOrders.filter((order) => {
      const calculation = calculationsByOrder.get(String(order.id));
      return calculation?.matched;
    }).length;

    return {
      totalOrders: activeOrders.length,
      totalProducts: products.length,
      totalSales,
      totalProfit,
      calculatedOrdersCount,
    };
  }, [orders, products, calculationsByOrder]);

  const selectedOrderCalculation = selectedOrder
    ? calculationsByOrder.get(String(selectedOrder.id))
    : undefined;

  const getShippingText = (method?: string) => {
    if (method === "home") return "توصيل للمنزل";
    if (method === "office") return "استلام من المكتب";

    return method || "-";
  };

  const getPaymentText = (method?: string) => {
    if (method === "bank_transfer") return "تحويل بنكي";
    if (method === "cash_on_delivery") return "الدفع عند الاستلام";

    return method || "-";
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "قيد المراجعة":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";

      case "تم تأكيد الطلب":
        return "bg-blue-100 text-blue-800 border border-blue-300";

      case "جاري التحضير":
        return "bg-orange-100 text-orange-800 border border-orange-300";

      case "قيد التوصيل":
        return "bg-purple-100 text-purple-800 border border-purple-300";

      case "تم الاستلام":
        return "bg-green-100 text-green-800 border border-green-300";

      case "ملغي":
      case "ملغى":
      case "تم الإلغاء":
      case "تم الغاء الطلب":
      case "تم إلغاء الطلب":
        return "bg-red-100 text-red-800 border border-red-300";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <div className="text-[#0F3A2B]">
      {/* بطاقات الإحصائيات */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-6 shadow-md">
          <p className="mb-2 text-sm text-gray-500">إجمالي المنتجات</p>

          <p className="text-3xl font-black">
            {dashboardStats.totalProducts}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            المنتجات المسجلة في المتجر
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-6 shadow-md">
          <p className="mb-2 text-sm text-gray-500">إجمالي المبيعات</p>

          <p className="text-3xl font-black">
            {dashboardStats.totalSales.toFixed(3)} ر.ع
          </p>

          <p className="mt-2 text-xs text-gray-400">
            باستثناء الطلبات الملغية
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-6 shadow-md">
          <p className="mb-2 text-sm text-gray-500">
            الأرباح التقديرية
          </p>

          <p className="text-3xl font-black text-emerald-700">
            {dashboardStats.totalProfit.toFixed(3)} ر.ع
          </p>

          <p className="mt-2 text-xs text-gray-400">
            تم حساب {dashboardStats.calculatedOrdersCount} طلب
          </p>
        </div>

        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-6 shadow-md">
          <p className="mb-2 text-sm text-gray-500">إجمالي الطلبات</p>

          <p className="text-3xl font-black">
            {dashboardStats.totalOrders}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            باستثناء الطلبات الملغية
          </p>
        </div>
      </div>

      {/* شريط الأدوات */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold">الطلبات</h2>

        <button
          type="button"
          onClick={fetchData}
          className="rounded-full bg-[#0F3A2B] px-5 py-2 text-sm font-semibold text-white shadow transition-all hover:opacity-90"
        >
          تحديث
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center text-lg font-medium shadow-md">
          جاري تحميل الطلبات...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center text-lg font-medium shadow-md">
          لا توجد طلبات حالياً
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#D8D2C5] bg-white shadow-xl">
          <table className="w-full min-w-[1750px] border-collapse text-right text-sm">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-5 text-sm font-bold">ID</th>
                <th className="p-5 text-sm font-bold">الاسم</th>
                <th className="p-5 text-sm font-bold">الهاتف</th>
                <th className="p-5 text-sm font-bold">المنتج</th>
                <th className="p-5 text-sm font-bold">الإجمالي</th>
                <th className="p-5 text-sm font-bold">التكلفة</th>
                <th className="p-5 text-sm font-bold">الربح</th>
                <th className="p-5 text-sm font-bold">المحافظة</th>
                <th className="p-5 text-sm font-bold">الولاية</th>
                <th className="p-5 text-sm font-bold">التوصيل</th>
                <th className="p-5 text-sm font-bold">طريقة الدفع</th>
                <th className="p-5 text-sm font-bold">الحالة</th>
                <th className="p-5 text-sm font-bold">التاريخ</th>
                <th className="p-5 text-sm font-bold">التفاصيل</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const calculation = calculationsByOrder.get(
                  String(order.id)
                );

                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E3D9] transition-colors hover:bg-[#F8F7F2]/60 align-middle"
                  >
                    <td className="p-5 font-bold">{order.id}</td>

                    <td className="p-5 font-medium">
                      {order.customer_name || "-"}
                    </td>

                    <td className="p-5 text-sm" dir="ltr">
                      {order.phone || "-"}
                    </td>

                    <td className="min-w-[260px] max-w-[320px] p-4 text-sm leading-6">
                      {order.product_name || "-"}
                    </td>

                    <td className="p-5 font-bold">
                      {toNumber(order.total).toFixed(3)} ر.ع
                    </td>

                    <td className="p-5 font-bold text-blue-700">
                      {calculation?.matched
                        ? `${calculation.cost.toFixed(3)} ر.ع`
                        : "غير محسوبة"}
                    </td>

                    <td className="p-5">
                      {isCancelledOrder(order) ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          ملغي
                        </span>
                      ) : calculation?.matched ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            calculation.profit >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {calculation.profit.toFixed(3)} ر.ع
                        </span>
                      ) : (
                        <span
                          className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800"
                          title="تأكد أن اسم المنتج في الطلب مطابق لاسمه في إدارة المنتجات وأن سعر الشراء مسجل"
                        >
                          يحتاج مطابقة
                        </span>
                      )}
                    </td>

                    <td className="p-5 text-sm">
                      {order.governorate || "-"}
                    </td>

                    <td className="p-5 text-sm">
                      {order.city || "-"}
                    </td>

                    <td className="p-4 min-w-[130px] whitespace-normal leading-6 text-sm">
                      {getShippingText(order.shipping_method)}
                    </td>

                    <td className="p-4 min-w-[145px] whitespace-nowrap text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          order.payment_method === "bank_transfer"
                            ? "border border-blue-300 bg-blue-100 text-blue-800"
                            : order.payment_method === "cash_on_delivery"
                            ? "border border-orange-300 bg-orange-100 text-orange-800"
                            : "border border-gray-300 bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getPaymentText(order.payment_method)}
                      </span>
                    </td>

                    <td className="p-4 min-w-[145px] whitespace-nowrap">
                      <span
                        className={`rounded-full px-4 py-1 text-xs font-bold shadow-sm ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status || "قيد المراجعة"}
                      </span>
                    </td>

                    <td className="p-5 text-xs text-gray-400">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(
                            "ar-OM"
                          )
                        : "-"}
                    </td>

                    <td className="p-5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-full bg-[#0F3A2B] px-5 py-1.5 text-xs font-semibold text-white shadow transition-all hover:opacity-90"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة تفاصيل الطلب */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#D8D2C5] bg-white p-6 text-[#0F3A2B] shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute left-6 top-6 text-2xl font-light transition-opacity hover:opacity-60"
              aria-label="إغلاق"
            >
              ×
            </button>

            <h2 className="mb-6 pl-8 text-right text-2xl font-bold">
              تفاصيل الطلب #{selectedOrder.id}
            </h2>

            <hr className="mb-6 border-[#E8E3D9]" />

            <div
              className="mb-6 grid grid-cols-1 gap-x-6 gap-y-4 text-right text-sm sm:grid-cols-2"
              style={{ direction: "rtl" }}
            >
              <p>
                <b>الاسم:</b> {selectedOrder.customer_name || "-"}
              </p>

              <p dir="ltr" className="text-right">
                <b>الهاتف:</b> {selectedOrder.phone || "-"}
              </p>

              <p className="sm:col-span-2">
                <b>المنتج:</b> {selectedOrder.product_name || "-"}
              </p>

              <p>
                <b>إجمالي البيع:</b>{" "}
                {toNumber(selectedOrder.total).toFixed(3)} ر.ع
              </p>

              <p>
                <b>تكلفة المنتجات:</b>{" "}
                {selectedOrderCalculation?.matched
                  ? `${selectedOrderCalculation.cost.toFixed(3)} ر.ع`
                  : "غير محسوبة"}
              </p>

              <p>
                <b>ربح الطلب:</b>{" "}
                {isCancelledOrder(selectedOrder)
                  ? "الطلب ملغي"
                  : selectedOrderCalculation?.matched
                  ? `${selectedOrderCalculation.profit.toFixed(3)} ر.ع`
                  : "يحتاج مطابقة المنتجات"}
              </p>

              <p>
                <b>المحافظة:</b> {selectedOrder.governorate || "-"}
              </p>

              <p>
                <b>الولاية:</b> {selectedOrder.city || "-"}
              </p>

              <p>
                <b>طريقة التوصيل:</b>{" "}
                {getShippingText(selectedOrder.shipping_method)}
              </p>

              <p>
                <b>طريقة الدفع:</b>{" "}
                {getPaymentText(selectedOrder.payment_method)}
              </p>

              <div className="flex items-center gap-2">
                <b className="shrink-0">الحالة:</b>

                <select
                  value={selectedOrder.status || "قيد المراجعة"}
                  disabled={updatingStatus}
                  onChange={(event) =>
                    handleUpdateStatus(
                      selectedOrder.id,
                      event.target.value
                    )
                  }
                  className="cursor-pointer rounded-xl border border-[#D8D2C5] bg-[#F8F7F2] px-3 py-1 text-xs font-bold text-[#0F3A2B] shadow-sm outline-none transition-all focus:border-[#0F3A2B]"
                >
                  <option value="قيد المراجعة">قيد المراجعة</option>
                  <option value="تم تأكيد الطلب">
                    تم تأكيد الطلب
                  </option>
                  <option value="جاري التحضير">جاري التحضير</option>
                  <option value="قيد التوصيل">قيد التوصيل</option>
                  <option value="تم الاستلام">تم الاستلام</option>
                  <option value="ملغي">ملغي</option>
                </select>
              </div>

              <p className="sm:col-span-2">
                <b>الملاحظات:</b>{" "}
                {selectedOrder.notes || "لا توجد ملاحظات"}
              </p>
            </div>

            {!selectedOrderCalculation?.matched &&
              !isCancelledOrder(selectedOrder) && (
                <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-right text-xs font-semibold leading-6 text-yellow-800">
                  تعذر حساب ربح هذا الطلب. تأكد أن اسم المنتج داخل
                  الطلب مطابق لاسمه في إدارة المنتجات، وأن سعر الشراء
                  مسجل للمنتج.
                </div>
              )}

            <hr className="my-6 border-[#E8E3D9]" />

            <div className="text-right">
              <div className="mb-4 flex flex-row-reverse items-center justify-between">
                <h3 className="text-sm font-bold">صورة الإيصال</h3>

                {selectedOrder.receipt_url && (
                  <a
                    href={selectedOrder.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#0F3A2B] px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:opacity-95"
                  >
                    فتح الصورة
                  </a>
                )}
              </div>

              {selectedOrder.receipt_url ? (
                <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] p-2">
                  <img
                    src={selectedOrder.receipt_url}
                    alt="إيصال التحويل"
                    className="max-h-[350px] w-full rounded-xl object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  لا توجد صورة إيصال مرفقة لهذا الطلب
                </p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  handleDeleteOrder(selectedOrder.id)
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow transition-all hover:bg-red-700"
              >
                🗑️ حذف الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
