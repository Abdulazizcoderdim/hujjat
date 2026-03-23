import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IPagination, IUser, UserRole } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BuyerResponse {
  items: IUser[];
  pagination: IPagination;
}

export function AdminsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setEditForm({
        full_name: editingUser.full_name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        password: "",
      });
    }
  }, [editingUser]);

  const { data } = useQuery<BuyerResponse>({
    queryKey: ["admins", { page, debouncedSearch, limit }],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        limit,
        search: debouncedSearch,
      };

      // params.role = UserRole.STUDENT;

      const res = await $api.get(`/users/role/${UserRole.ADMIN}`, { params });
      return res.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const pagination = data?.pagination;

  const updateMutation = useMutation({
    mutationFn: (data: any) => $api.patch(`/users/${editingUser?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Ma'lumotlar muvaffaqiyatli yangilandi" });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message || "Yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => $api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Admin muvaffaqiyatli o'chirildi" });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message || "O'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload: any = {
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone,
    };

    if (editForm.password && editForm.password.length >= 6) {
      payload.password = editForm.password;
    }

    updateMutation.mutate(payload);
  };

  const handleDelete = (user: IUser) => {
    setDeleteDialogOpen(true);
    setUserToDelete(user);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xaridorlar"
        description="Platformadagi barcha xaridorlar ro'yxati"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ism bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
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
            key: "full_name",
            header: "Ism",
            render: (user) => (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {user.full_name || "Noma'lum"}
                </span>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (user) => user.email || "—",
          },
          {
            key: "phone",
            header: "Telefon",
            render: (user) => user.phone || "—",
          },
          {
            key: "is_active",
            header: "Holati",
            render: (user) => (
              <StatusBadge status={user.is_active ? "active" : "blocked"} />
            ),
          },
          {
            key: "createdAt",
            header: "Ro'yxatdan o'tgan",
            render: (user) => formatDateTime(user.createdAt),
          },
          {
            key: "actions",
            header: "Amallar",
            render: (user) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingUser(user);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(user);
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={data.items || []}
        keyExtractor={(user) => user.id.toString()}
      />

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin tahrirlash</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To'liq ism</label>
              <Input
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                placeholder="F.I.O"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+998..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Yangi parol{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (ixtiyoriy)
                </span>
              </label>
              <Input
                type="password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                placeholder="O'zgartirish uchun kiriting"
                minLength={4}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Admin o'chirish"
        description={`${userToDelete?.full_name} adminni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={() => {
          if (userToDelete) {
            deleteMutation.mutate(userToDelete.id.toString());
          }
        }}
        variant="destructive"
      />
    </div>
  );
}
