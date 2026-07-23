import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Gavel,
  Loader2,
  Phone,
  User,
  RefreshCw,
  Award,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Auction {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  starting_price: number;
  current_price: number;
  highest_bidder_name?: string | null;
  minimum_bid: number;
  starts_at: string | null;
  ends_at: string | null;
  status: "upcoming" | "active" | "paused" | "ended" | "cancelled" | "draft";
  is_active: boolean;
  winner_name?: string | null;
  winner_phone?: string | null;
  winner_amount?: number | null;
  buy_now_enabled?: boolean;
  buy_now_price?: number | null;
  created_at: string;
}

interface BidForm {
  bidder_name: string;
  bidder_phone: string;
  bid_amount: string;
}

const initialBidForm: BidForm = {
  bidder_name: "",
  bidder_phone: "",
  bid_amount: "",
};

const BIDDER_STORAGE_KEY = "mergab_bidder_details";

function getSavedBidderDetails() {
  try {
    const savedDetails = localStorage.getItem(BIDDER_STORAGE_KEY);

    if (!savedDetails) {
      return {
        bidder_name: "",
        bidder_phone: "",
      };
    }

    const parsedDetails = JSON.parse(savedDetails);

    return {
      bidder_name:
        typeof parsedDetails.bidder_name === "string"
          ? parsedDetails.bidder_name
          : "",
      bidder_phone:
        typeof parsedDetails.bidder_phone === "string"
          ? parsedDetails.bidder_phone
          : "",
    };
  } catch {
    return {
      bidder_name: "",
      bidder_phone: "",
    };
  }
}

function getRemainingTime(endDate: string | null) {
  if (!endDate) {
    return { expired: false, text: "مستمر" };
  }

  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      expired: true,
      text: "انتهى المزاد",
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    expired: false,
    text:
      days > 0
        ? `${days} يوم ${hours} ساعة ${minutes} دقيقة`
        : `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  };
}

function getTimeUntilStart(startDate: string | null) {
  if (!startDate) {
    return {
      started: false,
      text: "سيتم تحديد وقت البداية قريبًا",
    };
  }

  const difference = new Date(startDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      started: true,
      text: "بدأ المزاد",
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) / (1000 * 60),
  );

  const seconds = Math.floor(
    (difference % (1000 * 60)) / 1000,
  );

  return {
    started: false,
    text:
      days > 0
        ? `${days} يوم ${hours} ساعة ${minutes} دقيقة`
        : `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`,
  };
}

function getAuctionStatus(auction: Auction) {
  if (auction.winner_name) {
    return {
      text: "تم إعلان الفائز",
      className: "bg-purple-100 text-purple-700",
    };
  }

  if (
    auction.status === "ended" ||
    (auction.ends_at &&
      new Date(auction.ends_at).getTime() <= Date.now())
  ) {
    return {
      text: "انتهى هذا المزاد",
      className: "bg-red-100 text-red-700",
    };
  }

  if (auction.status === "paused") {
    return {
      text: "موقوف مؤقتًا",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  if (auction.status === "active" && auction.is_active) {
    return {
      text: "مباشر الآن",
      className: "bg-green-100 text-green-700",
    };
  }

  return {
    text: "قادم",
    className: "bg-blue-100 text-blue-700",
  };
}

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] =
    useState<Auction | null>(null);

  const [bidForm, setBidForm] = useState<BidForm>(initialBidForm);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [message, setMessage] = useState("");
  const [, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchAuctions();

    const channel = supabase
      .channel("public-auctions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auctions",
        },
        () => {
          fetchAuctions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  async function fetchAuctions() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch auctions error:", error);
      setMessage("حدث خطأ أثناء تحميل المزادات");
      setAuctions([]);
    } else {
      const loadedAuctions = (data as Auction[]) || [];
      setAuctions(loadedAuctions);
      setSelectedAuction((currentAuction) => {
        if (!currentAuction) return null;

        return (
          loadedAuctions.find(
            (auction) => auction.id === currentAuction.id,
          ) || null
        );
      });
    }

    setLoading(false);
  }

  function openAuction(auction: Auction) {
    const minimumAmount =
      Number(auction.current_price || auction.starting_price || 0) +
      Number(auction.minimum_bid || 0);

    const savedBidder = getSavedBidderDetails();

    setSelectedAuction(auction);
    setBidForm({
      bidder_name: savedBidder.bidder_name,
      bidder_phone: savedBidder.bidder_phone,
      bid_amount: minimumAmount.toFixed(3),
    });
    setMessage("");
  }

  function closeAuction() {
    if (submittingBid) return;

    setSelectedAuction(null);
    setBidForm(initialBidForm);
    setMessage("");
  }

  function handleBuyNow(auction: Auction) {
    if (
      !auction.buy_now_enabled ||
      !auction.buy_now_price ||
      Number(auction.buy_now_price) <= 0
    ) {
      setMessage("الشراء المباشر غير متاح لهذا المزاد");
      return;
    }

    localStorage.setItem(
      "mergab_buy_now_item",
      JSON.stringify({
        id: `auction-${auction.id}`,
        auction_id: auction.id,
        name: auction.title,
        price: Number(auction.buy_now_price),
        quantity: 1,
        image: auction.image_url || "",
      }),
    );

    window.dispatchEvent(new Event("navigate-to-checkout"));
  }

  async function handleSubmitBid(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedAuction) return;

    if (
      selectedAuction.status !== "active" ||
      !selectedAuction.is_active ||
      selectedAuction.winner_name
    ) {
      setMessage(
        selectedAuction.winner_name
          ? "تم إعلان الفائز في هذا المزاد"
          : selectedAuction.status === "paused"
            ? "المزاد موقوف مؤقتًا"
            : "هذا المزاد غير متاح للمزايدة",
      );
      return;
    }

    const bidderName = bidForm.bidder_name.trim();
    const bidderPhone = bidForm.bidder_phone.trim();
    const cleanPhone = bidderPhone.replace(/\D/g, "");
    const bidAmount = Number(bidForm.bid_amount);

    const currentPrice = Number(
      selectedAuction.current_price || selectedAuction.starting_price || 0
    );

    const minimumBidAmount =
      currentPrice + Number(selectedAuction.minimum_bid || 0);

    if (!bidderName) {
      setMessage("اكتب اسم المزايد");
      return;
    }
    const fullName = bidderName.trim().split(/\s+/);
    if (fullName.length < 2) {
      setMessage("يرجى كتابة الاسم الثنائي (الاسم الأول واسم العائلة)");
      return;
    }

    if (/\d/.test(bidderName)) {
      setMessage("الاسم لا يجب أن يحتوي على أرقام");
      return;
    }

    if (!/^[\p{L}\s]+$/u.test(bidderName)) {
      setMessage("الاسم يحتوي على أحرف غير مسموحة");
      return;
    }

    const formattedName = bidderName
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase(),
      )
      .join(" ");

    if (!cleanPhone) {
      setMessage("اكتب رقم الهاتف");
      return;
    }

    if (cleanPhone.length < 8) {
      setMessage("رقم الهاتف يجب أن يكون 8 أرقام على الأقل");
      return;
    }

    const { data: blockedPhone, error: blockedPhoneError } =
      await supabase
        .from("blocked_bidders")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();

    if (blockedPhoneError) {
      console.error(blockedPhoneError);
      setMessage("تعذر التحقق من رقم الهاتف");
      return;
    }

    if (blockedPhone) {
      setMessage("هذا الرقم محظور من المشاركة في المزادات");
      return;
    }

    if (!Number.isFinite(bidAmount) || bidAmount < minimumBidAmount) {
      setMessage(
        `يجب أن تكون المزايدة ${minimumBidAmount.toFixed(3)} ر.ع أو أكثر`
      );
      return;
    }

    const remaining = getRemainingTime(selectedAuction.ends_at);

    if (remaining.expired) {
      setMessage("انتهى وقت هذا المزاد");
      return;
    }

    setSubmittingBid(true);
    setMessage("");

    const { data, error } = await supabase.rpc("place_bid", {
      p_auction_id: selectedAuction.id,
      p_bidder_name: formattedName,
      p_bidder_phone: cleanPhone,
      p_bid_amount: bidAmount,
    });

    if (error) {
      console.error("Place bid error:", error);
      setMessage(error.message || "لم يتم تسجيل المزايدة");
      setSubmittingBid(false);
      return;
    }

    const updatedPrice =
      typeof data === "number"
        ? data
        : Number(data?.current_price || bidAmount);

    setAuctions((currentAuctions) =>
      currentAuctions.map((auction) =>
        auction.id === selectedAuction.id
          ? {
              ...auction,
              current_price: updatedPrice,
              highest_bidder_name: formattedName,
            }
          : auction
      )
    );

    setSelectedAuction((currentAuction) =>
      currentAuction
        ? {
            ...currentAuction,
            current_price: updatedPrice,
            highest_bidder_name: formattedName,
          }
        : currentAuction
    );

    setBidForm((currentForm) => ({
      ...currentForm,
      bid_amount: (
        updatedPrice + Number(selectedAuction.minimum_bid || 0)
      ).toFixed(3),
    }));

    localStorage.setItem(
      BIDDER_STORAGE_KEY,
      JSON.stringify({
        bidder_name: formattedName,
        bidder_phone: cleanPhone,
      }),
    );

    setMessage("تم تسجيل مزايدتك بنجاح");
    setSubmittingBid(false);
  }

  const visibleAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      return auction.status !== "cancelled" && auction.status !== "draft";
    });
  }, [auctions]);

  return (
    <div
      className="min-h-screen bg-[#F8F7F2] px-4 py-10 text-[#0F3A2B]"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 rounded-[2rem] bg-[#0F3A2B] p-7 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Gavel className="h-7 w-7" />
              <span className="text-sm font-bold">مزادات مرقاب</span>
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              زايد واربح المنتج
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
              اختر المزاد المناسب، أدخل بياناتك، ثم ضع مبلغًا أعلى من السعر
              الحالي والحد الأدنى للزيادة.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAuctions}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-[#0F3A2B] transition hover:opacity-90 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            تحديث المزادات
          </button>
        </div>

        {message && !selectedAuction && (
          <div className="mb-6 rounded-2xl border border-[#D8D2C5] bg-white p-4 text-center font-semibold">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[2rem] border border-[#D8D2C5] bg-white shadow-sm">
            <div className="flex items-center gap-3 font-bold">
              <Loader2 className="h-6 w-6 animate-spin" />
              جاري تحميل المزادات...
            </div>
          </div>
        ) : visibleAuctions.length === 0 ? (
          <div className="rounded-[2rem] border border-[#D8D2C5] bg-white p-14 text-center shadow-sm">
            <Gavel className="mx-auto mb-4 h-12 w-12 opacity-40" />
            <h2 className="text-xl font-black">لا توجد مزادات حالياً</h2>
            <p className="mt-2 text-sm text-gray-500">
              ستظهر المزادات الجديدة هنا عند إضافتها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleAuctions.map((auction) => {
              const remaining = getRemainingTime(auction.ends_at);
              const timeUntilStart = getTimeUntilStart(auction.starts_at);
              const isUpcoming =
                auction.status === "upcoming" ||
                Boolean(
                  auction.starts_at &&
                    new Date(auction.starts_at).getTime() > Date.now(),
                );
              const statusInfo = getAuctionStatus(auction);
              const currentPrice = Number(
                auction.current_price || auction.starting_price || 0
              );

              const canBid =
                auction.status === "active" &&
                auction.is_active &&
                !isUpcoming &&
                !remaining.expired &&
                !auction.winner_name;

              return (
                <article
                  key={auction.id}
                  className="overflow-hidden rounded-[2rem] border border-[#D8D2C5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-[#FBF7EF]">
                      {auction.image_url ? (
                        <img
                          src={auction.image_url}
                          alt={auction.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Gavel className="h-20 w-20 opacity-20" />
                        </div>
                      )}

                      <span
                        className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-black shadow ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="p-6">
                      <h2 className="line-clamp-2 min-h-14 text-xl font-black">
                        {auction.title}
                      </h2>

                      {auction.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                          {auction.description}
                        </p>
                      )}

                      <div className="mt-5 rounded-2xl bg-[#F8F7F2] p-4">
                        <p className="text-xs font-semibold text-gray-500">
                          أعلى مزايدة
                        </p>

                        <p className="mt-1 text-2xl font-black">
                          {currentPrice.toFixed(3)}
                          <span className="mr-1 text-sm">ر.ع</span>
                        </p>

                        {auction.highest_bidder_name && (
                          <p className="mt-2 text-sm font-bold text-[#0F3A2B]">
                            بواسطة: {auction.highest_bidder_name}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-gray-500">
                          أقل زيادة:{" "}
                          {Number(auction.minimum_bid || 0).toFixed(3)} ر.ع
                        </p>
                      </div>

                      {auction.winner_name && (
                        <div className="mt-3 rounded-2xl border border-purple-200 bg-purple-50 p-3">
                          <div className="text-sm font-bold text-purple-800 flex items-center gap-1.5">
                            <Award className="h-4 w-4" />
                            الفائز: {auction.winner_name}
                          </div>

                          <div className="mt-1 text-xs text-purple-700">
                            المبلغ الفائز:{" "}
                            {Number(auction.winner_amount || auction.current_price).toFixed(3)} ر.ع
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#D8D2C5] px-4 py-3">
                        <Clock3 className="h-5 w-5 shrink-0" />

                        <div>
                          <p className="text-xs text-gray-500">
                            {isUpcoming ? "يبدأ المزاد بعد" : "الوقت المتبقي"}
                          </p>

                          <p className="font-black">
                            {isUpcoming ? timeUntilStart.text : remaining.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      type="button"
                      disabled={!canBid}
                      onClick={() => openAuction(auction)}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 font-black transition ${
                        canBid
                          ? "bg-[#0F3A2B] text-white hover:opacity-90"
                          : "cursor-not-allowed bg-gray-200 text-gray-500"
                      }`}
                    >
                      <Gavel className="h-5 w-5" />
                      {canBid
                        ? "زايد الآن"
                        : auction.winner_name
                          ? "تم إعلان الفائز"
                          : isUpcoming
                            ? "المزاد لم يبدأ بعد"
                            : auction.status === "paused"
                              ? "المزاد موقوف مؤقتًا"
                              : "انتهى المزاد"}
                    </button>

                    {auction.buy_now_enabled &&
                      auction.buy_now_price &&
                      Number(auction.buy_now_price) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBuyNow(auction)}
                          className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-[#0F3A2B] px-5 py-3.5 font-black text-[#0F3A2B] transition hover:bg-[#0F3A2B] hover:text-white"
                        >
                          اشتري الآن • {Number(auction.buy_now_price).toFixed(3)} ر.ع
                        </button>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedAuction && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
            <button
              type="button"
              onClick={closeAuction}
              disabled={submittingBid}
              className="absolute left-6 top-5 text-3xl font-light transition hover:opacity-50"
              aria-label="إغلاق"
            >
              ×
            </button>

            <div className="pl-10">
              <p className="text-xs font-bold text-gray-500">المزايدة على</p>
              <h2 className="mt-1 text-2xl font-black">
                {selectedAuction.title}
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#F8F7F2] p-4">
                <p className="text-xs text-gray-500">السعر الحالي</p>
                <p className="mt-1 text-xl font-black">
                  {Number(
                    selectedAuction.current_price ||
                      selectedAuction.starting_price ||
                      0
                  ).toFixed(3)}{" "}
                  ر.ع
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F7F2] p-4">
                <p className="text-xs text-gray-500">الحد الأدنى للزيادة</p>
                <p className="mt-1 text-xl font-black">
                  {Number(selectedAuction.minimum_bid || 0).toFixed(3)} ر.ع
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBid} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  الاسم الثلاثي
                </label>

                <div className="flex items-center gap-2 rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4">
                  <User className="h-5 w-5 shrink-0 opacity-60" />

                  <input
                    type="text"
                    minLength={5}
                    maxLength={50}
                    value={bidForm.bidder_name}
                    onChange={(event) =>
                      setBidForm((current) => ({
                        ...current,
                        bidder_name: event.target.value.replace(/\s+/g, " "),
                      }))
                    }
                    placeholder="مثال: حمد عبدالله"
                    className="w-full bg-transparent py-4 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  رقم الهاتف
                </label>

                <div
                  className="flex items-center gap-2 rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4"
                  dir="ltr"
                >
                  <Phone className="h-5 w-5 shrink-0 opacity-60" />

                  <input
                    type="tel"
                    minLength={8}
                    value={bidForm.bidder_phone}
                    onChange={(event) =>
                      setBidForm((current) => ({
                        ...current,
                        bidder_phone: event.target.value,
                      }))
                    }
                    placeholder="968XXXXXXXX"
                    className="w-full bg-transparent py-4 text-left outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  مبلغ المزايدة
                </label>

                <div className="flex items-center rounded-2xl border border-[#D8D2C5] bg-[#F8F7F2] px-4">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={bidForm.bid_amount}
                    onChange={(event) =>
                      setBidForm((current) => ({
                        ...current,
                        bid_amount: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent py-4 text-lg font-black outline-none"
                  />

                  <span className="shrink-0 font-bold">ر.ع</span>
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-2xl p-4 text-center text-sm font-bold ${
                    message.includes("بنجاح")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingBid}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F3A2B] px-6 py-4 font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingBid ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري تسجيل المزايدة...
                  </>
                ) : (
                  <>
                    <Gavel className="h-5 w-5" />
                    تأكيد المزايدة
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
