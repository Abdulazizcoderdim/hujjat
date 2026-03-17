import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { OrderRefundStatus } from "@/interface";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export function RefundRequestsPage() {
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // <--- Loading state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <--- Submit loading
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();

  // 1. DATA FETCHING
  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const { data } = await $api.get("/refunds");
      setRefundRequests(data);
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const pendingRequests = refundRequests.filter(
    (r) => r.status === OrderRefundStatus.PENDING,
  );
  const historyRequests = refundRequests.filter(
    (r) => r.status !== OrderRefundStatus.PENDING,
  );

  // 2. SEARCH FILTER (Updated for Populated Data)
  const filterRequests = (requests: any[]) => {
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter((request) => {
      // Backend populate qilgani uchun to'g'ridan-to'g'ri object ichiga kiramiz
      const buyerName = request.buyerId?.full_name?.toLowerCase() || "";
      const email = request.buyerId?.email?.toLowerCase() || "";
      const productName = request.orderId?.productId?.name?.toLowerCase() || "";
      const reason = request.reason.toLowerCase();
      const orderId =
        request.orderId?._id?.toString() || request.orderId?.toString(); // ID qanday kelishiga qarab

      return (
        orderId.includes(query) ||
        buyerName.includes(query) ||
        email.includes(query) ||
        productName.includes(query) ||
        reason.includes(query)
      );
    });
  };

  const handleOpenResolveModal = (refund: any) => {
    setSelectedRefund(refund);
    setAdminNote("");
    setIsResolveModalOpen(true);
  };

  // 3. RESOLVE LOGIC (Unified)
  const handleResolve = async (approve: boolean) => {
    if (!selectedRefund) return;

    if (!approve && !adminNote.trim()) {
      toast({
        title: "Xatolik",
        description: "Rad etish uchun izoh kiritish majburiy.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await $api.post(`/refunds/${selectedRefund._id}/resolve`, {
        approve,
        note: adminNote,
      });

      setRefundRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRefund._id
            ? {
                ...r,
                status: approve
                  ? OrderRefundStatus.APPROVED
                  : OrderRefundStatus.REJECTED,
                adminNote: adminNote || undefined,
                resolvedAt: new Date().toISOString(),
              }
            : r,
        ),
      );

      toast({
        title: approve ? "Tasdiqlandi" : "Rad etildi",
        description: approve
          ? "Mablag' qaytarish uchun yuborildi."
          : "So'rov rad etildi.",
        variant: approve ? "default" : "destructive", // Yashil varianti bo'lsa o'shani ishlating
      });

      setIsResolveModalOpen(false);
      setSelectedRefund(null);
      setAdminNote("");
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.response?.data?.message || "Xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    // Enum qiymatlarini tekshirish kerak, backend kichik harfda qaytarishi mumkin
    switch (status) {
      case "pending":
      case OrderRefundStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/30"
          >
            Kutilmoqda
          </Badge>
        );
      case "approved":
      case OrderRefundStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            Tasdiqlangan
          </Badge>
        );
      case "rejected":
      case OrderRefundStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/30"
          >
            Rad etilgan
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 4. COLUMNS (Updated for Populated Data)
  const columns = [
    {
      key: "orderId",
      header: "Buyurtma ID",
      render: (item: any) => (
        <button className="flex items-center gap-1 text-primary hover:underline font-medium">
          #{item.orderId?._id?.slice(-6) || "ID"} {/* Qisqa ID */}
          <ExternalLink className="h-3 w-3" />
        </button>
      ),
    },
    {
      key: "buyer",
      header: "Xaridor",
      render: (item: any) => (
        <div>
          {/* Backend buyerId ni object qilib qaytaradi */}
          <p className="font-medium text-foreground">
            {item.buyerId?.full_name || "Noma'lum"}
          </p>
          <p className="text-xs text-muted-foreground">{item.buyerId?.email}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Mahsulot",
      render: (item: any) => (
        <div>
          <p className="font-medium text-foreground truncate max-w-[200px]">
            {item.orderId?.productId?.name || "Noma'lum maxsulot"}
          </p>
          <p className="text-xs text-muted-foreground">
            {/* Backendda orderId.productPrice deb keladi */}
            {item.orderId?.productPrice?.toLocaleString()} so'm
          </p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Sabab",
      render: (item: any) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-sm text-muted-foreground truncate max-w-[200px] cursor-help">
              {item.reason}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p className="text-sm">{item.reason}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      key: "createdAt",
      header: "Sana",
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.createdAt), "dd.MM.yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Holat",
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      header: "Amallar",
      render: (item: any) =>
        item.status === OrderRefundStatus.PENDING ? (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenResolveModal(item);
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Hal qilish
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {item.updatedAt
              ? format(new Date(item.updatedAt), "dd.MM.yyyy")
              : "-"}
          </span>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Qaytarish so'rovlari"
        description="Xaridorlarning qaytarish so'rovlarini boshqarish"
        actions={
          <Badge variant="secondary" className="text-base px-3 py-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {pendingRequests.length} ta kutilmoqda
          </Badge>
        }
      />

      {/* SEARCH INPUT - O'zgarmadi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Kutilmoqda
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Tarix</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable
            columns={columns}
            data={filterRequests(pendingRequests)}
            keyExtractor={(item) => item._id}
            emptyMessage="Kutilayotgan so'rovlar yo'q"
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            columns={columns}
            data={filterRequests(historyRequests)}
            keyExtractor={(item) => item._id}
            emptyMessage="Tarix bo'sh"
          />
        </TabsContent>
      </Tabs>

      {/* Resolve Modal */}
      <Dialog open={isResolveModalOpen} onOpenChange={setIsResolveModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Qaytarish so'rovini hal qilish</DialogTitle>
          </DialogHeader>

          {selectedRefund && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Left Side - Context */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                {/* MA'LUMOTLARNI POPULATED DATA ORQALI OLISH */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Xaridor
                    </p>
                    <p className="font-medium">
                      {selectedRefund.buyerId?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRefund.buyerId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Mahsulot
                    </p>
                    <p className="font-medium">
                      {selectedRefund.orderId?.productId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Summa
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {selectedRefund.orderId?.productPrice?.toLocaleString()}{" "}
                      so'm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Sabab
                    </p>
                    <p className="text-sm bg-background p-3 rounded-md border mt-1">
                      {selectedRefund.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Decision */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Qaror qabul qilish
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="adminNote">
                    Admin izohi
                    <span className="text-xs text-muted-foreground ml-1">
                      (Rad etish uchun majburiy)
                    </span>
                  </Label>
                  <Textarea
                    id="adminNote"
                    placeholder="Qaror bo'yicha izoh yozing..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleResolve(false)} // Reject
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    So'rovni rad etish
                  </Button>
                  <Button
                    onClick={() => handleResolve(true)} // Approve
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Qaytarishni tasdiqlash
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
