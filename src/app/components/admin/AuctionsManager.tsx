import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../../lib/supabase";

type AuctionStatus = "upcoming" | "active" | "paused" | "ended";

interface Auction {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  starting_price: number;
  current_price: number;
  minimum_bid: number;
  starts_at: string | null;
  ends_at: string | null;
  status: AuctionStatus;
  is_active: boolean;
  is_visible: boolean;
  is_pinned?: boolean;
  views?: number;
  winner_bid_id?: string | null;
  winner_name?: string | null;
  winner_phone?: string | null;
  winner_amount?: number | null;
  ended_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Bid {
  id: string;
  auction_id: string;
  bidder_name: string;
  bidder_phone: string;
  bid_amount: number;
  created_at: string;
  is_blocked?: boolean;
}

interface AuctionForm {
  title: string;
  description: string;
  image_url: string;
  starting_price: string;
  minimum_bid: string;
  starts_at: string;
  ends_at: string;
  is_pinned: boolean;
  admin_notes: string;
}

const emptyForm: AuctionForm = {
  title: "",
  description: "",
  image_url: "",
  starting_price: "",
  minimum_bid: "",
  starts_at: "",
  ends_at: "",
  is_pinned: false,
  admin_notes: "",
};

function dateToInput(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function formatDate(value?: string | null) {
  if (!value) return "غير محدد";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "غير محدد";

  return new Intl.DateTimeFormat("ar-OM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value?: number | null) {
  return `${Number(value || 0).toFixed(3)} ر.ع`;
}

function getStatusLabel(status: AuctionStatus) {
  switch (status) {
    case "active":
      return "نشط";
    case "paused":
      return "موقوف مؤقتًا";
    case "ended":
      return "منتهي";
    default:
      return "قادم";
  }
}

function getStatusClass(status: AuctionStatus) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "paused":
      return "bg-yellow-100 text-yellow-700";
    case "ended":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function AuctionsManager() {
  const [activeTab, setActiveTab] = useState<"auctions" | "bids">(
    "auctions",
  );

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [bidSearch, setBidSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuction, setEditingAuction] =
    useState<Auction | null>(null);

  const [formData, setFormData] =
    useState<AuctionForm>(emptyForm);

  const fetchAuctions = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("auctions")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    setAuctions((data as Auction[]) || []);
  }, []);

  const fetchBids = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("bids")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    setBids((data as Bid[]) || []);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchAuctions(), fetchBids()]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء تحميل البيانات";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchAuctions, fetchBids]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredAuctions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return auctions;

    return auctions.filter((auction) =>
      auction.title.toLowerCase().includes(query),
    );
  }, [auctions, search]);

  const filteredBids = useMemo(() => {
    const query = bidSearch.trim().toLowerCase();

    if (!query) return bids;

    return bids.filter((bid) => {
      const auction = auctions.find(
        (item) => item.id === bid.auction_id,
      );

      return (
        bid.bidder_name.toLowerCase().includes(query) ||
        bid.bidder_phone.toLowerCase().includes(query) ||
        auction?.title.toLowerCase().includes(query)
      );
    });
  }, [bids, bidSearch, auctions]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openAddModal() {
    clearMessages();
    setEditingAuction(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(auction: Auction) {
    clearMessages();
    setEditingAuction(auction);

    setFormData({
      title: auction.title,
      description: auction.description || "",
      image_url: auction.image_url || "",
      starting_price: String(auction.starting_price || ""),
      minimum_bid: String(auction.minimum_bid || ""),
      starts_at: dateToInput(auction.starts_at),
      ends_at: dateToInput(auction.ends_at),
      is_pinned: Boolean(auction.is_pinned),
      admin_notes: auction.admin_notes || "",
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving || uploadingImage) return;

    setIsModalOpen(false);
    setEditingAuction(null);
    setFormData(emptyForm);
  }

  async function uploadAuctionImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const filePath = `auctions/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("auction-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("auction-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("اختر ملف صورة فقط.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 8 ميجابايت.");
      return;
    }

    clearMessages();
    setUploadingImage(true);

    try {
      const publicUrl = await uploadAuctionImage(file);

      setFormData((previous) => ({
        ...previous,
        image_url: publicUrl,
      }));

      setSuccess("تم رفع الصورة بنجاح.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء رفع الصورة",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleSaveAuction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessages();

    const startingPrice = Number(formData.starting_price);
    const minimumBid = Number(formData.minimum_bid);

    if (!formData.title.trim()) {
      setError("اكتب اسم المزاد.");
      return;
    }

    if (!Number.isFinite(startingPrice) || startingPrice < 0) {
      setError("اكتب سعر بداية صحيحًا.");
      return;
    }

    if (!Number.isFinite(minimumBid) || minimumBid <= 0) {
      setError("أقل زيادة يجب أن تكون أكبر من صفر.");
      return;
    }

    if (!formData.starts_at || !formData.ends_at) {
      setError("حدد وقت البداية ووقت النهاية.");
      return;
    }

    const startsAt = new Date(formData.starts_at);
    const endsAt = new Date(formData.ends_at);

    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime())
    ) {
      setError("تاريخ البداية أو النهاية غير صحيح.");
      return;
    }

    if (endsAt <= startsAt) {
      setError("وقت النهاية يجب أن يكون بعد وقت البداية.");
      return;
    }

    setSaving(true);

    try {
      if (editingAuction) {
        const updateData = {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          image_url: formData.image_url.trim() || null,
          starting_price: startingPrice,
          minimum_bid: minimumBid,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          is_pinned: formData.is_pinned,
          admin_notes: formData.admin_notes.trim() || null,
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("auctions")
          .update(updateData)
          .eq("id", editingAuction.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess("تم تعديل المزاد بنجاح.");
      } else {
        const insertData = {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          image_url: formData.image_url.trim() || null,
          starting_price: startingPrice,
          current_price: startingPrice,
          minimum_bid: minimumBid,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: "upcoming" as AuctionStatus,
          is_active: false,
          is_pinned: formData.is_pinned,
          views: 0,
          admin_notes: formData.admin_notes.trim() || null,
        };

        const { error: insertError } = await supabase
          .from("auctions")
          .insert(insertData);

        if (insertError) {
          throw insertError;
        }

        setSuccess("تمت إضافة المزاد بنجاح.");
      }

      await fetchAuctions();
      setIsModalOpen(false);
      setEditingAuction(null);
      setFormData(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر حفظ المزاد",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAuction(auction: Auction) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف مزاد "${auction.title}"؟ سيتم حذف مزايداته أيضًا.`,
    );

    if (!confirmed) return;

    clearMessages();

    try {
      const { error: deleteError } = await supabase
        .from("auctions")
        .delete()
        .eq("id", auction.id);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess("تم حذف المزاد.");
      await Promise.all([fetchAuctions(), fetchBids()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر حذف المزاد",
      );
    }
  }

  async function changeAuctionStatus(
    auction: Auction,
    status: AuctionStatus,
  ) {
    clearMessages();

    const isEnded = status === "ended";

    try {
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          status,
          is_active: status === "active",
          ended_at: isEnded
            ? new Date().toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", auction.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(`تم تغيير حالة المزاد إلى: ${getStatusLabel(status)}.`);
      await fetchAuctions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر تغيير حالة المزاد",
      );
    }
  }

  async function chooseWinner(auction: Auction, bid: Bid) {
    const confirmed = window.confirm(
      `هل تريد اختيار ${bid.bidder_name} فائزًا بمبلغ ${formatMoney(
        bid.bid_amount,
      )}؟`,
    );

    if (!confirmed) return;

    clearMessages();

    try {
      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          winner_bid_id: bid.id,
          winner_name: bid.bidder_name,
          winner_phone: bid.bidder_phone,
          winner_amount: bid.bid_amount,
          current_price: bid.bid_amount,
          status: "ended",
          is_active: false,
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", auction.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(`تم اختيار ${bid.bidder_name} فائزًا بالمزاد.`);
      await fetchAuctions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر اختيار الفائز",
      );
    }
  }

  async function toggleBidderBlock(bid: Bid) {
  clearMessages();

  const cleanPhone = bid.bidder_phone.replace(/\D/g, "");

  try {
    if (bid.is_blocked) {
      const { error: deleteBlockError } = await supabase
        .from("blocked_bidders")
        .delete()
        .eq("phone", cleanPhone);

      if (deleteBlockError) {
        throw deleteBlockError;
      }

      const { error: updateError } = await supabase
        .from("bids")
        .update({ is_blocked: false })
        .eq("bidder_phone", bid.bidder_phone);

      if (updateError) {
        throw updateError;
      }

      setSuccess("تم إلغاء حظر الرقم.");
    } else {
      const { error: blockError } = await supabase
        .from("blocked_bidders")
        .upsert(
          {
            phone: cleanPhone,
            reason: "محظور من لوحة إدارة المزادات",
          },
          {
            onConflict: "phone",
          },
        );

      if (blockError) {
        throw blockError;
      }

      const { error: updateError } = await supabase
        .from("bids")
        .update({ is_blocked: true })
        .eq("bidder_phone", bid.bidder_phone);

      if (updateError) {
        throw updateError;
      }

      setSuccess("تم حظر الرقم ولن يستطيع المزايدة مرة أخرى.");
    }

    await fetchBids();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "تعذر تغيير حالة الحظر",
    );
  }
}
async function toggleAuctionVisibility(auction: Auction) {
  clearMessages();

  try {
    const { error } = await supabase
      .from("auctions")
      .update({
        is_visible: !auction.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auction.id);

    if (error) throw error;

    setSuccess(
      auction.is_visible
        ? "تم إخفاء المزاد من الموقع."
        : "تم عرض المزاد في الموقع."
    );

    await fetchAuctions();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "تعذر تغيير ظهور المزاد"
    );
  }
}
  async function deleteBidAndRecalculate(bid: Bid) {
  const auction = auctions.find(
    (item) => item.id === bid.auction_id
  );

  if (!auction) return;

  const confirmed = window.confirm(
    `هل تريد حذف هذه المزايدة؟`
  );

  if (!confirmed) return;

  clearMessages();

  try {
    const { error: deleteError } = await supabase
      .from("bids")
      .delete()
      .eq("id", bid.id);

    if (deleteError) throw deleteError;

    const { data } = await supabase
      .from("bids")
      .select("bid_amount")
      .eq("auction_id", bid.auction_id)
      .order("bid_amount", { ascending: false })
      .limit(1);

    const newPrice =
      data && data.length
        ? Number(data[0].bid_amount)
        : auction.starting_price;

    await supabase
      .from("auctions")
      .update({
        current_price: newPrice,
      })
      .eq("id", auction.id);

    await Promise.all([
      fetchAuctions(),
      fetchBids(),
    ]);

    setSuccess("تم حذف المزايدة وتعديل السعر.");
  } catch (err) {
    setError("حدث خطأ.");
  }
}
  function exportBidsCsv() {
    const rows = [
      [
        "اسم المزاد",
        "اسم المزايد",
        "رقم الهاتف",
        "مبلغ المزايدة",
        "وقت المزايدة",
        "الحالة",
      ],
      ...filteredBids.map((bid) => {
        const auction = auctions.find(
          (item) => item.id === bid.auction_id,
        );

        return [
          auction?.title || "مزاد محذوف",
          bid.bidder_name,
          bid.bidder_phone,
          Number(bid.bid_amount).toFixed(3),
          formatDate(bid.created_at),
          bid.is_blocked ? "محظور" : "نشط",
        ];
      }),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `auction-bids-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-3xl border border-[#D8D2C5] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#0F3A2B]">
              إدارة المزادات
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              إضافة المزادات وتعديلها وإدارة المزايدين والفائزين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("auctions")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                activeTab === "auctions"
                  ? "bg-[#0F3A2B] text-white"
                  : "border border-[#0F3A2B] text-[#0F3A2B]"
              }`}
            >
              المزادات ({auctions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bids")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                activeTab === "bids"
                  ? "bg-[#0F3A2B] text-white"
                  : "border border-[#0F3A2B] text-[#0F3A2B]"
              }`}
            >
              المزايدون ({bids.length})
            </button>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-full border border-[#0F3A2B] px-5 py-2 text-sm font-semibold text-[#0F3A2B] disabled:opacity-50"
            >
              تحديث
            </button>

            {activeTab === "auctions" && (
              <button
                type="button"
                onClick={openAddModal}
                className="rounded-full bg-[#0F3A2B] px-5 py-2 text-sm font-semibold text-white"
              >
                + إضافة مزاد
              </button>
            )}

            {activeTab === "bids" && (
              <button
                type="button"
                onClick={exportBidsCsv}
                className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white"
              >
                تصدير Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center">
          جاري تحميل البيانات...
        </div>
      ) : activeTab === "auctions" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#D8D2C5] bg-white p-4">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن مزاد..."
              className="w-full rounded-xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 outline-none focus:border-[#0F3A2B]"
            />
          </div>

          {filteredAuctions.length === 0 ? (
            <div className="rounded-3xl border border-[#D8D2C5] bg-white p-12 text-center">
              لا توجد مزادات حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredAuctions.map((auction) => {
                const auctionBids = bids.filter(
                  (bid) => bid.auction_id === auction.id,
                );

                const highestBid =
                  auctionBids.length > 0
                    ? Math.max(
                        ...auctionBids.map((bid) =>
                          Number(bid.bid_amount),
                        ),
                      )
                    : Number(auction.current_price);

                return (
                  <div
                    key={auction.id}
                    className="overflow-hidden rounded-3xl border border-[#D8D2C5] bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
                      <div className="h-48 bg-gray-100 md:h-full">
                        {auction.image_url ? (
                          <img
                            src={auction.image_url}
                            alt={auction.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-48 items-center justify-center text-sm text-gray-400">
                            بدون صورة
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-[#0F3A2B]">
                              {auction.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {auction.description || "بدون وصف"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                              auction.status,
                            )}`}
                          >
                            {getStatusLabel(auction.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#F8F7F2] p-4 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">
                              سعر البداية
                            </div>
                            <div className="font-bold">
                              {formatMoney(auction.starting_price)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              أعلى مزايدة
                            </div>
                            <div className="font-bold text-green-700">
                              {formatMoney(highestBid)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              أقل زيادة
                            </div>
                            <div className="font-bold">
                              {formatMoney(auction.minimum_bid)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">
                              عدد المزايدات
                            </div>
                            <div className="font-bold">
                              {auctionBids.length}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-gray-500">
                          <div>
                            البداية: {formatDate(auction.starts_at)}
                          </div>
                          <div>
                            النهاية: {formatDate(auction.ends_at)}
                          </div>
                        </div>

                        {auction.winner_name && (
                          <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                            <div className="font-bold">
                              الفائز: {auction.winner_name}
                            </div>
                            <div>
                              الرقم: {auction.winner_phone || "غير موجود"}
                            </div>
                            <div>
                              المبلغ:{" "}
                              {formatMoney(auction.winner_amount)}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 border-t border-[#E8E3D9] pt-4">
                          {auction.status !== "active" && (
                            <button
                              type="button"
                              onClick={() =>
                                void changeAuctionStatus(
                                  auction,
                                  "active",
                                )
                              }
                              className="rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700"
                            >
                              تشغيل
                            </button>
                          )}

                          {auction.status === "active" && (
                            <button
                              type="button"
                              onClick={() =>
                                void changeAuctionStatus(
                                  auction,
                                  "paused",
                                )
                              }
                              className="rounded-xl bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                            >
                              إيقاف مؤقت
                            </button>
                          )}

                          {auction.status !== "ended" && (
                            <button
                              type="button"
                              onClick={() =>
                                void changeAuctionStatus(
                                  auction,
                                  "ended",
                                )
                              }
                              className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              إنهاء
                            </button>
                          )}
<button
  type="button"
  onClick={() => void toggleAuctionVisibility(auction)}
  className={`rounded-xl px-3 py-2 text-xs font-bold ${
    auction.is_visible
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700"
  }`}
>
  {auction.is_visible ? "إخفاء من الموقع" : "عرض في الموقع"}
</button>
                          <button
                            type="button"
                            onClick={() => openEditModal(auction)}
                            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700"
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteAuction(auction)
                            }
                            className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#D8D2C5] bg-white p-4">
            <input
              type="search"
              value={bidSearch}
              onChange={(event) =>
                setBidSearch(event.target.value)
              }
              placeholder="ابحث بالاسم أو الرقم أو اسم المزاد..."
              className="w-full rounded-xl border border-[#D8D2C5] bg-[#F8F7F2] px-4 py-3 outline-none focus:border-[#0F3A2B]"
            />
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#D8D2C5] bg-white shadow-sm">
            <table className="w-full min-w-[950px] text-right">
              <thead className="bg-[#0F3A2B] text-white">
                <tr>
                  <th className="p-4">المزاد</th>
                  <th className="p-4">اسم المزايد</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">الوقت</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {filteredBids.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-500"
                    >
                      لا توجد مزايدات.
                    </td>
                  </tr>
                ) : (
                  filteredBids.map((bid) => {
                    const auction = auctions.find(
                      (item) => item.id === bid.auction_id,
                    );

                    const whatsappNumber =
                      bid.bidder_phone.replace(/\D/g, "");

                    return (
                      <tr
                        key={bid.id}
                        className={`border-b border-[#E8E3D9] ${
                          bid.is_blocked ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="p-4 font-semibold">
                          {auction?.title || "مزاد محذوف"}
                        </td>

                        <td className="p-4">
                          {bid.bidder_name}
                        </td>

                        <td className="p-4" dir="ltr">
                          {bid.bidder_phone}
                        </td>

                        <td className="p-4 font-bold text-green-700">
                          {formatMoney(bid.bid_amount)}
                        </td>

                        <td className="p-4 text-sm text-gray-500">
                          {formatDate(bid.created_at)}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              bid.is_blocked
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {bid.is_blocked ? "محظور" : "نشط"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                `مرحبًا ${bid.bidder_name}، بخصوص مزاد ${auction?.title || ""}`,
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700"
                            >
                              واتساب
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                void navigator.clipboard.writeText(
                                  bid.bidder_phone,
                                )
                              }
                              className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700"
                            >
                              نسخ الرقم
                            </button>
<button
  type="button"
  onClick={() => void deleteBidAndRecalculate(bid)}
  className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700"
>
  حذف المزايدة
</button>
                            <button
                              type="button"
                              onClick={() =>
                                void toggleBidderBlock(bid)
                              }
                              className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              {bid.is_blocked
                                ? "إلغاء الحظر"
                                : "حظر"}
                            </button>

                            {auction &&
                              auction.status !== "ended" &&
                              !bid.is_blocked && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void chooseWinner(auction, bid)
                                  }
                                  className="rounded-xl bg-[#0F3A2B] px-3 py-2 text-xs font-bold text-white"
                                >
                                  اختيار كفائز
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0F3A2B]">
                {editingAuction
                  ? "تعديل المزاد"
                  : "إضافة مزاد جديد"}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm"
              >
                إغلاق
              </button>
            </div>

            <form
              onSubmit={(event) => void handleSaveAuction(event)}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-bold">
                  اسم المزاد
                </label>

                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                  placeholder="مثال: DJI Mini 5 Pro Combo Plus"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  الوصف
                </label>

                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                  placeholder="اكتب حالة المنتج ومحتويات العرض..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    سعر البداية
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.001"
                    value={formData.starting_price}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        starting_price: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    أقل زيادة
                  </label>

                  <input
                    type="number"
                    required
                    min="0.001"
                    step="0.001"
                    value={formData.minimum_bid}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        minimum_bid: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                    placeholder="1.000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    وقت البداية
                  </label>

                  <input
                    type="datetime-local"
                    required
                    value={formData.starts_at}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        starts_at: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    وقت النهاية
                  </label>

                  <input
                    type="datetime-local"
                    required
                    value={formData.ends_at}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        ends_at: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  صورة المزاد
                </label>

                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        image_url: event.target.value,
                      })
                    }
                    className="flex-1 rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                    placeholder="رابط الصورة أو ارفع صورة"
                  />

                  <label className="cursor-pointer rounded-xl bg-gray-100 px-5 py-3 text-center text-sm font-bold text-gray-700">
                    {uploadingImage
                      ? "جاري الرفع..."
                      : "رفع صورة"}

                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(event) =>
                        void handleImageChange(event)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="معاينة الصورة"
                    className="mt-3 h-32 w-32 rounded-2xl border object-cover"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  ملاحظات الأدمن
                </label>

                <textarea
                  rows={3}
                  value={formData.admin_notes}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      admin_notes: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#D8D2C5] px-4 py-3 outline-none focus:border-[#0F3A2B]"
                  placeholder="هذه الملاحظات لا تظهر للعميل."
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F8F7F2] p-4">
                <input
                  type="checkbox"
                  checked={formData.is_pinned}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      is_pinned: event.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-[#0F3A2B]"
                />

                <span className="text-sm font-bold text-[#0F3A2B]">
                  تثبيت المزاد
                </span>
              </label>

              <div className="flex justify-end gap-3 border-t border-[#E8E3D9] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploadingImage}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-bold text-gray-700 disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-xl bg-[#0F3A2B] px-7 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingAuction
                      ? "حفظ التعديلات"
                      : "إضافة المزاد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
