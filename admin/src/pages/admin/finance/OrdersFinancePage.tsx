import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/hooks/format-currency";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { cn } from "@/lib/utils";
import { safeText } from "@/utils/safe";
import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { CalendarIcon, Eye, Receipt, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface IUserLite {
  _id: string;
  full_name: string;
}

interface IProductLite {
  _id: string;
  name: string;
}

interface OrderFinance {
  _id: string;
  buyerId: IUserLite;
  sellerId: IUserLite;
  productId: IProductLite;

  totalAmount: number;
  sellerPayout: number;

  buyerCommission: number;
  sellerCommission: number;

  platformCommission: number;
  providerFee: number;
  netProfit: number;

  provider: string;
  createdAt: string;
}

interface TransResponse {
  finance: {
    gmv: number;
    buyerCommission: number;
    sellerCommission: number;
    providerFees: number;
    sellerPayout: number;
  };
  netProfit: number;
  platformRevenue: number;
  items: OrderFinance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function OrdersFinancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderFinance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const searchDebounce = useDebounce(searchQuery, 500);

  const { data } = useQuery<TransResponse>({
    queryKey: [
      "admin-payments",
      { searchDebounce, providerFilter, date, limit, page },
    ],
    queryFn: async () => {
      const res = await $api.get("/admin/payments", {
        params: {
          page,
          limit,
          search: searchDebounce || undefined,
          provider: providerFilter === "all" ? undefined : providerFilter,
          from: date?.from?.toISOString(),
          to: date?.to?.toISOString(),
        },
      });

      return res.data;
    },
  });

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

  const orders = data?.items || [];

  const getProviderBadge = (provider: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      click: {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Click",
      },
      payme: {
        className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        label: "Payme",
      },
      manual: {
        className: "bg-muted text-muted-foreground border-border",
        label: "Manual",
      },
    };
    const v = variants[provider] || variants.manual;
    return (
      <Badge variant="outline" className={v.className}>
        {v.label}
      </Badge>
    );
  };

  const openDetail = (order: OrderFinance) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="To'lovlar / Buyurtmalar tahlili"
        description="Barcha to'langan buyurtmalarning moliyaviy tahlili"
        actions={
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Receipt className="h-4 w-4 mr-1" />
            {data?.pagination?.total ?? 0} ta buyurtma
          </Badge>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Jami to'lovlar</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.finance?.gmv || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Sotuvchiga beriladigan
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.finance?.sellerPayout || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Sotuvchidan olingan komissiya
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.finance?.sellerCommission || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">
            Haridordan olingan komissiya
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(data?.finance?.buyerCommission || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Platforma komissiyasi</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(data?.platformRevenue || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Provider to'lovi</p>
          <p className="text-xl font-bold text-warning">
            {formatCurrency(data?.finance?.providerFees || 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Sof foyda</p>
          <p className="text-xl font-bold text-success">
            {formatCurrency(data?.netProfit || 0)}
          </p>
        </div>
      </div>

      {/* Date Period Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Professional Sana Tanlagich */}
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
                <CalendarIcon className="mr-2 h-4 w-4" />
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
                  <span>Barcha vaqtlar</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 flex bg-card border-border"
              align="start"
            >
              {/* Chap tomonda tayyor tugmalar (Presets) */}
              <div className="flex flex-col border-r border-border p-2 gap-1 min-w-[140px]">
                <p className="text-[10px] uppercase font-bold text-muted-foreground p-2 tracking-wider">
                  Tezkor tanlov
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setPreset("today")}
                >
                  Bugun
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setPreset("week")}
                >
                  Hafta
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setPreset("lastMonth")}
                >
                  O'tgan oy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => setPreset("year")}
                >
                  Shu yil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-destructive"
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
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buyurtma ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue placeholder="Provayder" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="click">Click</SelectItem>
            <SelectItem value="payme">Payme</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={[
          {
            key: "createdAt",
            header: "Sana",
            render: (order) => (
              <span className="text-muted-foreground">
                {formatDateTime(order.createdAt)}
              </span>
            ),
          },
          {
            key: "buyer",
            header: "Xaridor",
            render: (order) =>
              safeText(order?.buyerId?.full_name || "Noma'lum"),
          },
          {
            key: "seller",
            header: "Sotuvchi",
            render: (order) =>
              safeText(order?.sellerId?.full_name || "Noma'lum"),
          },
          {
            key: "totalAmount",
            header: "Xaridor to'lovi",
            render: (order) => (
              <span className="font-semibold">
                {formatCurrency(order.totalAmount)}
              </span>
            ),
          },
          {
            key: "sellerPayout",
            header: "Sotuvchi ulushi",
            render: (order) => (
              <span className="text-success">
                {formatCurrency(order.sellerPayout)}
              </span>
            ),
          },
          {
            key: "platformCommission",
            header: "Platforma komissiyasi",
            render: (order) => (
              <span className="text-primary">
                {formatCurrency(order.platformCommission)}
              </span>
            ),
          },
          {
            key: "providerFee",
            header: "Provider to'lovi",
            render: (order) =>
              order.providerFee > 0 ? (
                <span className="text-warning">
                  {formatCurrency(order.providerFee)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: "netProfit",
            header: "Sof foyda",
            render: (order) => (
              <span className="font-bold text-success">
                {formatCurrency(order.netProfit)}
              </span>
            ),
          },
          {
            key: "provider",
            header: "Provayder",
            render: (order) => getProviderBadge(order.provider),
          },
          {
            key: "actions",
            header: "",
            render: (order) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(order);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
        data={orders}
        keyExtractor={(order) => order._id}
        onRowClick={openDetail}
      />

      <Pagination
        page={page}
        totalPages={data?.pagination?.totalPages ?? 1}
        limit={limit}
        total={data?.pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Buyurtma tahlili — #{selectedOrder?._id.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Xaridor
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.buyerId?.full_name)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Sotuvchi
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.sellerId?.full_name)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Mahsulot
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.productId?.name)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Sana
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDateTime(selectedOrder?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Moliyaviy tahlil
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/20 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">
                      Xaridor to'lovi
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-success mb-1">Sotuvchi ulushi</p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(selectedOrder.sellerPayout)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary mb-1">
                      Platforma komissiyasi
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedOrder.platformCommission)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Xaridor: {formatCurrency(selectedOrder.buyerCommission)}{" "}
                      + Sotuvchi:{" "}
                      {formatCurrency(selectedOrder.sellerCommission)})
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning mb-1">
                      Provider to'lovi
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {selectedOrder.providerFee > 0
                        ? formatCurrency(selectedOrder.providerFee)
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-success mb-1">
                        Sof foyda (Net Profit)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Platforma komissiyasi - Provider to'lovi
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-success">
                      {formatCurrency(selectedOrder.netProfit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  To'lov provayderi
                </p>
                {getProviderBadge(selectedOrder.provider)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
