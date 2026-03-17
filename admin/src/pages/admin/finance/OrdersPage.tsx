import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { ICategory, IOrder, IPagination, IProduct, IUser } from "@/interface";
import { safeText } from "@/utils/safe";
import { safeValue } from "@/utils/safeValue";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface OrdersResponse {
  items: IOrder<IProduct<ICategory, IUser>, IUser>[];
  pagination: IPagination;
}

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrder<
    IProduct<ICategory, IUser>,
    IUser
  > | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const searchDebounce = useDebounce(searchQuery, 500);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data } = useQuery<OrdersResponse>({
    queryKey: [
      "orders",
      {
        page,
        limit,
        search: searchDebounce,
        status: statusFilter,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      },
    ],
    queryFn: async () => {
      const { data } = await $api.get("/orders", {
        params: {
          page,
          limit,
          search: searchDebounce,
          status: statusFilter === "all" ? undefined : statusFilter,
          sortBy: sortBy || undefined,
          sortOrder: sortBy ? sortOrder : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      return data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  useEffect(() => {
    setPage(1);
  }, [searchDebounce]);

  const openDetail = (order: IOrder<IProduct<ICategory, IUser>, IUser>) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyurtmalar"
        description="Platformadagi barcha buyurtmalar (faqat ko'rish)"
      />
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Haridor ismi, sotuvchi ismi, mahsulot nomi yoki order ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Holat bo'yicha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="paid">To'langan</SelectItem>
            <SelectItem value="canceled">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input (Mavjud kod) */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40 bg-card border-border"
            />
            <span className="text-muted-foreground hidden sm:inline">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-40 bg-card border-border"
            />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Tozalash
              </Button>
            )}
          </div>
        </div>
      </div>

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
            key: "buyer",
            header: "Xaridor",
            render: (o) => safeValue(o?.buyerId?.full_name),
          },
          {
            key: "product",
            header: (
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent font-bold"
                onClick={() => {
                  const order =
                    sortBy === "productId.name" && sortOrder === "asc"
                      ? "desc"
                      : "asc";
                  setSortBy("productId.name");
                  setSortOrder(order);
                }}
              >
                Mahsulot
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            render: (o) => (
              <div className="flex flex-col">
                <span className="font-medium">
                  {safeValue(o?.productId?.name)}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {o?._id.slice(-6)}
                </span>
              </div>
            ),
          },
          {
            key: "seller",
            header: "Sotuvchi",
            render: (o) => safeValue(o?.sellerId?.full_name),
          },
          {
            key: "amount",
            header: (
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent font-bold"
                onClick={() => {
                  const order =
                    sortBy === "totalAmount" && sortOrder === "asc"
                      ? "desc"
                      : "asc";
                  setSortBy("totalAmount");
                  setSortOrder(order);
                }}
              >
                Summa
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            render: (o) =>
              o?.totalAmount ? formatCurrency(o.totalAmount) : "--",
          },
          {
            key: "status",
            header: "Holati",
            render: (o) =>
              o?.status ? <StatusBadge status={o.status} /> : "--",
          },
          {
            key: "createdAt",
            header: (
              <Button
                variant="ghost"
                className="p-0 hover:bg-transparent font-bold"
                onClick={() => {
                  const order =
                    sortBy === "createdAt" && sortOrder === "asc"
                      ? "desc"
                      : "asc";
                  setSortBy("createdAt");
                  setSortOrder(order);
                }}
              >
                Sana
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            render: (o) => (o?.createdAt ? formatDateTime(o.createdAt) : "--"),
          },
          {
            key: "actions",
            header: "",
            render: (o) => (
              <Button
                variant="ghost"
                size="icon"
                disabled={!o?._id}
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(o);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
        data={data.items}
        keyExtractor={(o) => o?._id ?? Math.random().toString()}
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
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Buyurtma ma'lumotlari
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Buyurtma ID</p>
                  <p className="text-sm font-semibold text-foreground">
                    {safeText(selectedOrder?._id)}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  {selectedOrder?.status ? (
                    <StatusBadge status={selectedOrder.status} />
                  ) : (
                    "--"
                  )}
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Xaridor</p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.buyerId?.full_name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {safeText(selectedOrder?.buyerId?._id)}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Sotuvchi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.sellerId?.full_name)}
                  </p>
                </div>

                <div className="stat-card col-span-2">
                  <p className="text-sm text-muted-foreground">Mahsulot</p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeText(selectedOrder?.productId?.name)}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Summa</p>
                  <p className="text-lg font-semibold text-success">
                    {selectedOrder?.totalAmount
                      ? formatCurrency(selectedOrder.totalAmount)
                      : "--"}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Sana</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDateTime(selectedOrder?.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                ⚠️ Buyurtma holati faqat o‘qish uchun. Tahrirlash mumkin emas.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
