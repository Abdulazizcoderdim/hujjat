import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IPagination, IUser, UserRole } from "@/interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle,
  Eye,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface ModeratorResponse {
  items: IUser[];
  pagination: IPagination;
}

interface CreateUserDto {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

interface UpdateUserDto {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

interface BlockUserDto {
  is_active: boolean;
}

export function ModeratorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<IUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading } = useQuery<ModeratorResponse>({
    queryKey: ["moderators", { page, limit, search: debouncedSearch }],
    queryFn: async () => {
      const res = await $api.get("/users", {
        params: {
          role: UserRole.MODERATOR,
          page,
          limit,
          search: debouncedSearch,
        },
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const res = await $api.post("/users", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      toast({
        title: "Moderator qo'shildi",
        description: `${data.full_name} moderator sifatida qo'shildi.`,
      });
      setFormOpen(false);
      setFormData({ full_name: "", email: "", password: "", phone: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message ||
          "Moderator qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  // Update moderator mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const res = await $api.patch(`/users/update/${id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      toast({
        title: "Moderator yangilandi",
        description: `${data.full_name} ma'lumotlari yangilandi.`,
      });
      setFormOpen(false);
      setEditingUser(null);
      setFormData({ full_name: "", email: "", password: "", phone: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message ||
          "Moderatorni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string; block: boolean }) => {
      return $api.patch(`/users/${id}/${block}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.block
          ? "Moderator bloklandi"
          : "Moderator faollashtirildi",
      });

      queryClient.invalidateQueries({ queryKey: ["moderators"] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Amalni bajarishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await $api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      toast({
        title: "Moderator o'chirildi",
        description: "Moderator muvaffaqiyatli o'chirildi.",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message ||
          "Moderatorni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const pagination = data?.pagination;
  const moderators = data?.items || [];

  const handleBlock = (user: IUser) => {
    setUserToBlock(user);
    setBlockDialogOpen(true);
  };

  const confirmBlock = () => {
    if (!userToBlock) return;

    blockMutation.mutate({
      id: userToBlock._id,
      block: userToBlock.is_active,
    });

    setBlockDialogOpen(false);
    setUserToBlock(null);
  };

  const handleDelete = (user: IUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  const openDetail = (user: IUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData({ full_name: "", email: "", password: "", phone: "" });
    setFormOpen(true);
  };

  const openEditForm = (user: IUser) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast({
        title: "Xatolik",
        description: "Ism va email to'ldirilishi shart",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast({
        title: "Xatolik",
        description: "Yangi moderator uchun parol kiritish shart",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      const updateData: UpdateUserDto = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      updateMutation.mutate({
        id: editingUser._id,
        data: updateData,
      });
    } else {
      const createData: CreateUserDto = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: UserRole.MODERATOR,
      };

      createMutation.mutate(createData);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderatorlar"
        description="Platformadagi moderatorlarni boshqarish"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Button onClick={openCreateForm} className="gap-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Moderator qo'shish
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <DataTable
          columns={[
            {
              key: "full_name",
              header: "Ism",
              render: (user) => (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
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
              header: "Qo'shilgan sana",
              render: (user) =>
                new Date(user.createdAt).toLocaleDateString("uz-UZ"),
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
                      openDetail(user);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(user);
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
                      handleBlock(user);
                    }}
                    className={`h-8 w-8 ${
                      user.is_active
                        ? "text-destructive hover:text-destructive/80"
                        : "text-success hover:text-success/80"
                    }`}
                  >
                    {user.is_active ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
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
          data={moderators || []}
          keyExtractor={(user) => user._id}
          onRowClick={openDetail}
          emptyMessage="Moderatorlar topilmadi"
        />
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {moderators.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Moderatorlar topilmadi</p>
        ) : (
          moderators.map((user) => (
            <div
              key={user._id}
              className="stat-card space-y-3 cursor-pointer"
              onClick={() => openDetail(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.full_name || "Noma'lum"}</p>
                    <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
                  </div>
                </div>
                <StatusBadge status={user.is_active ? "active" : "blocked"} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{user.phone || "Telefon yo'q"}</span>
                <span className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("uz-UZ")}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(user); }}>
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditForm(user); }}>
                  <Pencil className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleBlock(user); }}
                  className={user.is_active ? "text-destructive" : "text-success"}
                >
                  {user.is_active ? <Ban className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  {user.is_active ? "Blok" : "Faol"}
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(user); }} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> O'chirish
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* User Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Moderator ma'lumotlari
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedUser.full_name || "Noma'lum"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge
                    status={selectedUser.is_active ? "active" : "blocked"}
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedUser.phone || "—"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Qo'shilgan sana
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "uz-UZ",
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Oxirgi yangilanish
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(selectedUser.updatedAt).toLocaleDateString(
                      "uz-UZ",
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingUser
                ? "Moderatorni tahrirlash"
                : "Yangi moderator qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">To'liq ism *</Label>
              <Input
                id="full_name"
                placeholder="Ism kiriting"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email kiriting"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Parol {editingUser ? "(O'zgartirish uchun)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  editingUser ? "Yangi parol (ixtiyoriy)" : "Parol kiriting"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon (ixtiyoriy)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+998901234567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Yuklanmoqda..."
                : editingUser
                  ? "Saqlash"
                  : "Qo'shish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation */}
      <ConfirmDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title={
          userToBlock?.is_active
            ? "Moderatorni bloklash"
            : "Moderatorni faollashtirish"
        }
        description={
          userToBlock?.is_active
            ? `${userToBlock?.full_name} moderatorini bloklashni xohlaysizmi?`
            : `${userToBlock?.full_name} moderatorini faollashtirishni xohlaysizmi?`
        }
        confirmLabel={userToBlock?.is_active ? "Bloklash" : "Faollashtirish"}
        onConfirm={confirmBlock}
        variant={userToBlock?.is_active ? "destructive" : "default"}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Moderatorni o'chirish"
        description={`${userToDelete?.full_name} moderatorini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
