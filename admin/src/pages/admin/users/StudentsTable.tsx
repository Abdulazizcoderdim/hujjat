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
import { formatCurrency } from "@/hooks/format-currency";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { IUser, UserRole } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react";
import { useEffect, useState } from "react";

type SortField =
  | "full_name"
  | "login"
  | "productsCount"
  | "telegramId"
  | "createdAt"
  | "is_active";
type SortOrder = "asc" | "desc";

export function StudentsTable() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<IUser | null>(null);
  const [finance, setFinance] = useState({
    debit: 0,
    credit: 0,
    balance: 0,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "block" | "verify";
    user: IUser | null;
  }>({ open: false, type: "block", user: null });
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    login: "",
    telegramId: "",
  });

  useEffect(() => {
    if (editingUser) {
      setEditForm({
        full_name: editingUser.full_name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        password: "",
        login: editingUser.login || "",
        telegramId: editingUser.telegramId || "",
      });
    }
  }, [editingUser]);

  const studentsQuery = useQuery({
    queryKey: [
      "students",
      { debouncedSearch, page, limit, sortField, sortOrder },
    ],
    queryFn: async () => {
      const params: any = {
        role: UserRole.STUDENT,
        search: debouncedSearch,
        page,
        limit,
      };

      if (sortField) {
        params.sortBy = sortField;
        params.sortOrder = sortOrder;
      }

      const res = await $api.get(`/users/role/${UserRole.STUDENT}`, { params });
      return res.data;
    },
  });

  const students = studentsQuery.data?.items ?? [];
  const pagination = studentsQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortField, sortOrder]);

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Agar bir xil field bo'lsa, order'ni o'zgartirish
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Yangi field tanlansa, asc dan boshlash
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort icon komponenti
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sotuvchilar"
        description="Tizimga ro'yxatdan o'tgan sotuvchilar ro'yxati"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Input
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Main Sellers Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">№</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("full_name")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Ism
                    <SortIcon field="full_name" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("login")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Login
                    <SortIcon field="login" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("productsCount")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Mahsulotlar soni
                    <SortIcon field="productsCount" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("telegramId")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    TelegramID
                    <SortIcon field="telegramId" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Sana
                    <SortIcon field="createdAt" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("is_active")}
                    className="hover:bg-transparent p-0 h-auto font-semibold"
                  >
                    Holati
                    <SortIcon field="is_active" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((user: IUser, index: number) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {(pagination?.page - 1) * pagination?.limit + (index + 1)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.full_name?.charAt(0) || "?"}
                      </div>
                      <span>{user.full_name || "Noma'lum"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.login || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.products_count || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.telegramId || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge
                      status={user.is_active ? "active" : "blocked"}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSeller(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Studentn tafsilotlari dialog */}
      <Dialog
        open={!!selectedSeller}
        onOpenChange={() => setSelectedSeller(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student ma'lumotlari</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Sotuvchi profili */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  {selectedSeller.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedSeller.full_name || "Noma'lum"}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    ID: {selectedSeller.id || "—"}
                  </p>
                </div>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Balans</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(finance.balance)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Mahsulotlar (Umumiy)
                  </p>
                  <p className="text-2xl font-bold">{21}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge
                    status={selectedSeller.is_active ? "active" : "blocked"}
                  />
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Jami daromadi</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(finance.credit)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
