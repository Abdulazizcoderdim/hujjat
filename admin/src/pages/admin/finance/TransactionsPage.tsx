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
import {
  IPagination,
  IUser,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/interface";
import { safeValue } from "@/utils/safeValue";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Eye, Search } from "lucide-react";
import { useState } from "react";

interface TransResponse {
  items: Transaction<IUser>[];
  pagination: IPagination;
}

export function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction<IUser> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const searchDebounce = useDebounce(searchQuery, 500);

  const { data } = useQuery<TransResponse>({
    queryKey: [
      "transactions",
      { page, limit, search: searchDebounce, type: typeFilter },
    ],
    queryFn: async () => {
      const res = await $api.get("/transactions/all", {
        params: {
          page,
          limit,
          search: searchDebounce || undefined,
          type: typeFilter === "all" ? undefined : typeFilter,
        },
      });

      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const pagination = data?.pagination;
  const transactions = data?.items || [];

  const openDetail = (tx: Transaction<IUser>) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tranzaksiyalar"
        description="Barcha moliyaviy tranzaksiyalar (faqat ko'rish)"
      />

      {/* Warning Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <p className="text-sm text-warning">
          Tranzaksiyalarni o'chirish yoki tahrirlash mumkin emas. Barcha pul
          harakatlari faqat tranzaksiyalar orqali amalga oshiriladi.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tranzaksiya ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as any)}
        >
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue placeholder="Turi" />
          </SelectTrigger>

          <SelectContent className="bg-card border-border">
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value={TransactionType.CREDIT}>Kirim</SelectItem>
            <SelectItem value={TransactionType.DEBIT}>Chiqim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          {
            key: "index",
            header: "№",
            render: (_o, index) =>
              (pagination?.page - 1) * pagination?.limit + (index + 1),
          },
          {
            key: "user",
            header: "Foydalanuvchi",
            render: (tx) => safeValue(tx?.userId?.full_name),
          },
          {
            key: "amount",
            header: "Summa",
            render: (tx) => (
              <span
                className={
                  tx.type === TransactionType.CREDIT
                    ? "text-success"
                    : "text-warning"
                }
              >
                {tx.type === TransactionType.CREDIT ? "+" : "-"}
                {formatCurrency(tx?.amount)}
              </span>
            ),
          },
          {
            key: "type",
            header: "Turi",
            render: (tx) => <StatusBadge status={tx.type as TransactionType} />,
          },
          {
            key: "status",
            header: "Holati",
            render: (tx) => (
              <StatusBadge status={tx.status as TransactionStatus} />
            ),
          },
          {
            key: "provider",
            header: "Provayder",
            render: (tx) => tx.provider || "—",
          },
          {
            key: "createdAt",
            header: "Sana",
            render: (tx) => formatDateTime(tx.createdAt),
          },
          {
            key: "actions",
            header: "",
            render: (tx) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(tx);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
            ),
          },
        ]}
        data={transactions}
        keyExtractor={(tx) => tx._id}
        onRowClick={openDetail}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Transaction Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Tranzaksiya ma'lumotlari
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">
                    Tranzaksiya ID
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedTransaction._id.toUpperCase()}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge
                    status={selectedTransaction.status as "success" | "failed"}
                  />
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Foydalanuvchi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {safeValue(selectedTransaction?.userId?.full_name)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Turi</p>
                  <StatusBadge
                    status={selectedTransaction.type as "credit" | "debit"}
                  />
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Summa</p>
                  <p
                    className={`text-lg font-semibold ${
                      selectedTransaction.type === "credit"
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {selectedTransaction.type === "credit" ? "+" : "-"}
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Provayder</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedTransaction.provider || "—"}
                  </p>
                </div>
                {selectedTransaction.orderId && (
                  <div className="stat-card col-span-2">
                    <p className="text-sm text-muted-foreground">Buyurtma ID</p>
                    <p className="text-lg font-semibold text-foreground">
                      {selectedTransaction.orderId.toUpperCase()}
                    </p>
                  </div>
                )}
                <div className="stat-card col-span-2">
                  <p className="text-sm text-muted-foreground">Sana va vaqt</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(selectedTransaction.createdAt).toLocaleString(
                      "uz-UZ",
                    )}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
                🔒 Tranzaksiyalarni o'chirish yoki tahrirlash mumkin emas.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
