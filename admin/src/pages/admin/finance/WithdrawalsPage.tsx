import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/hooks/format-currency";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IPagination, IUser, Withdrawal, WithdrawalStatus } from "@/interface";
import { cn } from "@/lib/utils";
import { safeText } from "@/utils/safe";
import { safeValue } from "@/utils/safeValue";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import {
  AlertTriangle,
  ArrowUpDown,
  CalendarIcon,
  Check,
  Eye,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface WithdrawResponse {
  howMuchWithdrawn: number;
  howMuchWithdrawnPending: number;
  finance: { sellerPayout: number };
  items: Withdrawal<IUser>[];
  pagination: IPagination;
  counts: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
}

interface ISellerFinance {
  _id: string;
  full_name: string;
  email: string;
  balance: number;
  totalEarnings: number;
  withdrawalsCount: number;
}

export function WithdrawalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal<IUser> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [withdrawalToAction, setWithdrawalToAction] =
    useState<Withdrawal<IUser> | null>(null);
  const { toast } = useToast();
  const [approveOpen, setApproveOpen] = useState(false);
  const [proofKey, setProofKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sellersPage, setSellersPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery<WithdrawResponse>({
    queryKey: [
      "withdrawals",
      { page, limit, statusFilter, searchQuery, date, sortBy, sortOrder },
    ],
    queryFn: async () => {
      const res = await $api.get("/withdrawals", {
        params: {
          page,
          limit,
          status: statusFilter,
          search: searchQuery || undefined,
          from: date?.from?.toISOString(),
          to: date?.to?.toISOString(),
          sortBy,
          sortOrder,
        },
      });
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        counts: {
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0,
        },
        howMuchWithdrawn: 0,
        howMuchWithdrawnPending: 0,
        finance: { sellerPayout: 0 },
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const exportWithdrawals = async (params) => {
    return $api.get("/withdrawals/export", {
      params,
      responseType: "blob",
    });
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      // 1. API'ga so'rov yuborish
      const response = await exportWithdrawals({
        status: statusFilter,
        search: searchQuery || undefined,
        from: date?.from?.toISOString(),
        to: date?.to?.toISOString(),
        sortBy,
        sortOrder,
      });

      // 2. Blob obyektini yaratish
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // 3. Vaqtinchalik link yaratib, uni avtomatik bosish (Yuklab olish uchun)
      const link = document.createElement("a");
      link.href = url;

      const fileName = `withdrawals-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      // 4. Tozalash
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Eksport qilishda xatolik:", error);
      alert("Faylni yuklab olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  async function uploadProof(file: File) {
    setUploading(true);

    const { data } = await $api.post("/storage/upload-url", {
      filename: file.name,
      contentType: file.type,
    });

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    setProofKey(data.key);
    setUploading(false);
  }

  async function loadPaymentProof(key: string) {
    setLoadingProof(true);

    const { data } = await $api.post("/storage/download-url", {
      key,
      expiresIn: 300,
    });

    setProofUrl(data.url);
    setLoadingProof(false);
  }

  const handleApprove = (withdrawal: Withdrawal<IUser>) => {
    setWithdrawalToAction(withdrawal);
    setProofKey(null); // oldingi upload qolmasin
    setAdminNote("");
    setApproveOpen(true); // ✅ TO‘G‘RI
  };

  const handleReject = (withdrawal: Withdrawal<IUser>) => {
    setWithdrawalToAction(withdrawal);
    setRejectReason("");
    setRejectOpen(true); // ✅ TO‘G‘RI
  };

  const confirmApprove = async () => {
    if (!withdrawalToAction || !proofKey) {
      toast({
        variant: "destructive",
        title: "Screenshot majburiy",
      });
      return;
    }

    await $api.post(`/withdrawals/${withdrawalToAction._id}/approve`, {
      adminNote: "Pul o'tkazildi",
      paymentProofKey: proofKey,
    });

    toast({ title: "Tasdiqlandi" });
    setApproveOpen(false);
    setWithdrawalToAction(null);
    setProofKey(null);
    setAdminNote("");
    await queryClient.invalidateQueries({
      queryKey: ["withdrawals"],
    });
  };

  const confirmReject = async () => {
    if (!withdrawalToAction) return;

    if (!rejectReason.trim()) {
      toast({
        title: "Xatolik",
        description: "Rad etish sababi majburiy",
        variant: "destructive",
      });
      return;
    }

    await $api.post(`/withdrawals/${withdrawalToAction._id}/reject`, {
      adminNote: rejectReason,
    });

    toast({
      title: "Rad etildi",
      description: "Pul yechish so‘rovi rad etildi",
    });

    setRejectOpen(false);
    setWithdrawalToAction(null);
    setRejectReason("");
    await queryClient.invalidateQueries({
      queryKey: ["withdrawals"],
    });
  };

  const { data: sellersData, isLoading: isSellersLoading } = useQuery<{
    items: ISellerFinance[];
    pagination: IPagination;
  }>({
    queryKey: ["sellers-finance", sellersPage, limit],
    queryFn: async () => {
      const res = await $api.get("/withdrawals/sellers-finance", {
        params: { page: sellersPage, limit },
      });
      return res.data;
    },
    enabled: statusFilter === "sellers",
  });

  if (isLoading) return <div>Loading...</div>;

  const withdrawals = data?.items || [];

  const openDetail = (withdrawal: Withdrawal<IUser>) => {
    setSelectedWithdrawal(withdrawal);
    setDetailOpen(true);

    if (
      withdrawal.status === WithdrawalStatus.APPROVED &&
      withdrawal.paymentProofKey
    ) {
      loadPaymentProof(withdrawal.paymentProofKey);
    } else {
      setProofUrl(null);
    }
  };

  const setPreset = (preset: string) => {
    const today = new Date();

    switch (preset) {
      case "today": {
        setDate({ from: today, to: today });
        break;
      }
      case "week": {
        setDate({ from: subDays(today, 7), to: today });
        break;
      }
      case "lastMonth": {
        const lastMonth = subMonths(today, 1);
        setDate({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      }
      case "year": {
        setDate({ from: startOfYear(today), to: today });
        break;
      }
      case "all": {
        setDate(undefined);
        break;
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pul yechish so'rovlari"
        description="Sotuvchilarning pul yechish so'rovlarini boshqarish"
      />

      <Button onClick={handleExport} disabled={loading} className="btn-export">
        {loading ? "Yuklanmoqda..." : "Excelga eksport qilish"}
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Jami Sotuvchilar balance
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.finance?.sellerPayout) || 0}
          </p>
        </div>

        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Sotuvchilar kutayotgan pul
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.howMuchWithdrawnPending) || 0}
          </p>
        </div>

        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Qancha berilgan sotuvchilarga
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.howMuchWithdrawn) || 0}
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <p className="text-sm text-warning">
          Balansni qo'lda tahrirlash mumkin emas. Pul yechish faqat mavjud
          balansdan amalga oshiriladi.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal bg-card border-border",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  "Barcha vaqtlar"
                )}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto p-0 flex flex-col sm:flex-row bg-card border-border max-w-[calc(100vw-2rem)]"
            align="start"
          >
            {/* Chap tomonda tayyor tugmalar (Presets) */}
            <div className="flex sm:flex-col border-b sm:border-b-0 sm:border-r border-border p-2 gap-1 sm:min-w-[140px] overflow-x-auto">
              <p className="hidden sm:block text-[10px] uppercase font-bold text-muted-foreground p-2 tracking-wider">
                Tezkor tanlov
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => setPreset("today")}
              >
                Bugun
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => setPreset("week")}
              >
                Hafta
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => setPreset("lastMonth")}
              >
                O'tgan oy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start whitespace-nowrap"
                onClick={() => setPreset("year")}
              >
                Shu yil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-destructive whitespace-nowrap"
                onClick={() => setPreset("all")}
              >
                Tozalash
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger
              value="pending"
              className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-warning/20 data-[state=active]:text-warning"
            >
              Kutilmoqda ({data?.counts?.pending ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-success/20 data-[state=active]:text-success"
            >
              Tasdiqlangan ({data?.counts?.approved ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive"
            >
              Rad etilgan ({data?.counts?.rejected ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Barchasi ({data?.counts?.total ?? 0})
            </TabsTrigger>
            <TabsTrigger
              value="sellers"
              className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sotuvchilar Balansi
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Karta raqami bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {statusFilter === "sellers" ? (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <DataTable
              columns={[
                {
                  key: "index",
                  header: "№",
                  render: (_, index) => (sellersPage - 1) * 10 + (index + 1),
                },
                {
                  key: "seller",
                  header: "Sotuvchi",
                  render: (s) => (
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {s.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.email}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "balance",
                  header: "Joriy Balans",
                  render: (s) => (
                    <span className="font-bold text-primary">
                      {formatCurrency(s.balance)}
                    </span>
                  ),
                },
                {
                  key: "totalEarnings",
                  header: "Jami Daromad",
                  render: (s) => (
                    <span className="text-success font-medium">
                      {formatCurrency(s.totalEarnings)}
                    </span>
                  ),
                },
                {
                  key: "withdrawals",
                  header: "Yechishlar soni",
                  render: (s) => s.withdrawalsCount + " ta",
                },
              ]}
              data={sellersData?.items || []}
              keyExtractor={(s) => s._id}
            />
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {(sellersData?.items || []).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Ma'lumot topilmadi</div>
            ) : (
              (sellersData?.items || []).map((s, index) => (
                <div key={s._id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">#{(sellersPage - 1) * 10 + index + 1}</span>
                      <p className="font-medium text-foreground">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.withdrawalsCount} ta yechish</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Balans</p>
                      <p className="font-bold text-primary">{formatCurrency(s.balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Jami daromad</p>
                      <p className="text-success font-medium">{formatCurrency(s.totalEarnings)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <DataTable
              columns={[
                {
                  key: "index",
                  header: "№",
                  render: (_o, index) =>
                    (data?.pagination?.page - 1) * data?.pagination?.limit +
                    (index + 1),
                },
                {
                  key: "seller",
                  header: "Sotuvchi",
                  render: (w) => safeValue(w.sellerId?.full_name),
                },
                {
                  key: "amount",
                  header: (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        setSortBy("amount");
                      }}
                    >
                      Summa <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ),
                  render: (w) => formatCurrency(w.amount),
                },
                { key: "cardNumber", header: "Karta raqami" },
                {
                  key: "status",
                  header: "Holati",
                  render: (w) => <StatusBadge status={w.status} />,
                },
                {
                  key: "createdAt",
                  header: "Sana",
                  render: (w) => new Date(w.createdAt).toLocaleDateString("uz-UZ"),
                },
                {
                  key: "actions",
                  header: "Amallar",
                  render: (w) => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(w);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {w.status === WithdrawalStatus.PENDING && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(w);
                            }}
                            className="h-8 w-8 text-success hover:text-success/80"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(w);
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ),
                },
              ]}
              data={withdrawals}
              keyExtractor={(w) => w._id}
              onRowClick={openDetail}
              emptyMessage="So'rovlar topilmadi"
            />
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">So'rovlar topilmadi</div>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w._id}
                  onClick={() => openDetail(w)}
                  className="rounded-xl border bg-card p-4 space-y-3 cursor-pointer active:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">
                      {safeValue(w.sellerId?.full_name)}
                    </p>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{formatCurrency(w.amount)}</span>
                    <span className="font-mono text-xs text-muted-foreground">{w.cardNumber}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                    {w.status === WithdrawalStatus.PENDING && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(w);
                          }}
                          className="h-8 w-8 text-success hover:text-success/80"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(w);
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Pagination
        page={statusFilter === "sellers" ? sellersPage : page}
        totalPages={
          statusFilter === "sellers"
            ? (sellersData?.pagination?.totalPages ?? 1)
            : (data?.pagination?.totalPages ?? 1)
        }
        limit={limit}
        total={
          statusFilter === "sellers"
            ? sellersData?.pagination?.total
            : data?.pagination?.total
        }
        onPageChange={(p) => {
          if (statusFilter === "sellers") {
            setSellersPage(p);
          } else {
            setPage(p);
          }
        }}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Withdrawal Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[95vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Pul yechish ma'lumotlari
            </DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">So'rov ID</p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedWithdrawal._id}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge status={selectedWithdrawal.status} />
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Sotuvchi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedWithdrawal.sellerId?.full_name)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Summa</p>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div className="stat-card col-span-2">
                  <p className="text-sm text-muted-foreground">Karta raqami</p>
                  <p className="text-lg font-semibold text-foreground font-mono">
                    {selectedWithdrawal.cardNumber}
                  </p>
                </div>
                <div className="stat-card col-span-2">
                  <p className="text-sm text-muted-foreground">So'rov sanasi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(selectedWithdrawal.createdAt).toLocaleString(
                      "uz-UZ",
                    )}
                  </p>
                </div>
                {selectedWithdrawal.adminNote && (
                  <div className="stat-card col-span-2">
                    <p className="text-sm text-muted-foreground">Admin izohi</p>
                    <p className="text-foreground">
                      {selectedWithdrawal.adminNote}
                    </p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.status === WithdrawalStatus.PENDING && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailOpen(false);
                      handleReject(selectedWithdrawal);
                    }}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rad etish
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailOpen(false);
                      handleApprove(selectedWithdrawal);
                    }}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Tasdiqlash
                  </Button>
                </div>
              )}

              {selectedWithdrawal.status === WithdrawalStatus.APPROVED &&
                selectedWithdrawal.paymentProofKey && (
                  <div className="stat-card col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      To‘lov tasdig‘i (screenshot)
                    </p>

                    {loadingProof ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin" size={16} />
                        Yuklanmoqda...
                      </div>
                    ) : proofUrl ? (
                      <img
                        src={proofUrl}
                        alt="Payment proof"
                        className="rounded-xl border max-h-[300px] object-contain"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Rasm topilmadi
                      </p>
                    )}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pul yechishni tasdiqlash</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Screenshot uploader */}
            <div className="space-y-2">
              <Label className="text-sm">To‘lov screenshot’i *</Label>

              <label
                className={cn(
                  "flex flex-col items-center justify-center gap-2",
                  "border-2 border-dashed rounded-xl p-6 cursor-pointer",
                  "hover:bg-muted transition",
                  uploading && "opacity-50 pointer-events-none",
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadProof(file);
                  }}
                />

                {!proofKey ? (
                  <>
                    <Eye className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Screenshot yuklash uchun bosing <br />
                      <span className="text-xs">PNG / JPG</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-success font-medium">
                    ✅ Screenshot yuklandi
                  </p>
                )}
              </label>

              {uploading && (
                <p className="text-xs text-muted-foreground">Yuklanmoqda...</p>
              )}
            </div>

            {/* Admin note */}
            <div className="space-y-2">
              <Label>Admin izohi</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Masalan: 2026-01-28 soat 14:30 o‘tkazildi"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              disabled={!proofKey || uploading}
              onClick={confirmApprove}
              className="bg-success"
            >
              Tasdiqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pul yechishni rad etish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(withdrawalToAction?.amount || 0)} summali so‘rovni
              rad etish sababini kiriting
            </p>

            <div className="space-y-2">
              <Label>Rad etish sababi *</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masalan: karta rekvizitlari noto‘g‘ri"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={confirmReject}
              className="bg-destructive text-destructive-foreground"
            >
              Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
