import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

interface Auction {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starting_price: number;
  current_price: number;
  minimum_bid: number;
  starts_at: string;
  ends_at: string;
  status: string;
  is_active: boolean;
}

export default function AuctionsManager() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuctions();
  }, []);

  async function fetchAuctions() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setAuctions([]);
    } else {
      setAuctions((data as Auction[]) || []);
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
  <h2 className="text-2xl font-bold">إدارة المزادات</h2>

  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => alert("بنضيف النموذج في الخطوة الجاية")}
      className="rounded-full bg-[#0F3A2B] px-5 py-2 text-sm font-semibold text-white"
    >
      + إضافة مزاد
    </button>

    <button
      type="button"
      onClick={fetchAuctions}
      className="rounded-full border border-[#0F3A2B] px-5 py-2 text-sm font-semibold text-[#0F3A2B]"
    >
      تحديث
    </button>
  </div>
</div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center">
          جاري تحميل المزادات...
        </div>
      ) : auctions.length === 0 ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center">
          لا توجد مزادات حتى الآن.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-[#D8D2C5] bg-white shadow">
          <table className="w-full text-right">
            <thead className="bg-[#0F3A2B] text-white">
              <tr>
                <th className="p-4">الصورة</th>
                <th className="p-4">اسم المزاد</th>
                <th className="p-4">سعر البداية</th>
                <th className="p-4">السعر الحالي</th>
                <th className="p-4">أقل زيادة</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>

            <tbody>
              {auctions.map((auction) => (
                <tr
                  key={auction.id}
                  className="border-b border-[#E8E3D9]"
                >
                  <td className="p-4">
                    {auction.image_url ? (
                      <img
                        src={auction.image_url}
                        alt={auction.title}
                        className="h-14 w-14 rounded-xl border object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">بدون صورة</span>
                    )}
                  </td>

                  <td className="p-4 font-semibold">{auction.title}</td>

                  <td className="p-4">
                    {Number(auction.starting_price).toFixed(3)} ر.ع
                  </td>

                  <td className="p-4 font-bold">
                    {Number(auction.current_price).toFixed(3)} ر.ع
                  </td>

                  <td className="p-4">
                    {Number(auction.minimum_bid).toFixed(3)} ر.ع
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        auction.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {auction.is_active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
