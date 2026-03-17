import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { SendMessageModal } from "@/components/admin/SendMessageModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Ban,
  CheckCircle,
  Eye,
  MessageSquare,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
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
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<IUser | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipients, setMessageRecipients] = useState<IUser[]>([]);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

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

  const broadcastByRoleMutation = useMutation({
    mutationFn: async (payload: {
      role: UserRole.BUYER;
      title: string;
      message: string;
      channel: string;
    }) => {
      return $api.post("/admin/notifications/broadcast-by-role", payload);
    },
    onSuccess: () => {
      toast({
        title: "Xabar yuborildi ✅",
        description: "Barcha xaridorlarga yuborildi",
      });
      setBroadcastModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message || "Broadcast yuborishda xatolik",
        variant: "destructive",
      });
    },
  });

  const { data: buyerProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["buyer-products", selectedUser?._id],
    queryFn: async () => {
      const res = await $api.get(`/users/buyer/products/${selectedUser?._id}`);
      return res.data;
    },
    enabled: !!selectedUser && detailOpen,
  });

  const handleBroadcastBuyers = (dataForm: {
    title: string;
    message: string;
    channel: string;
  }) => {
    broadcastByRoleMutation.mutate({
      role: UserRole.BUYER,
      title: dataForm.title,
      message: dataForm.message,
      channel: dataForm.channel,
    });
  };

  const isObjectId = /^[a-f\d]{24}$/i.test(debouncedSearch);

  const { data } = useQuery<BuyerResponse>({
    queryKey: ["buyers", { page, debouncedSearch, limit }],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        limit,
        search: debouncedSearch,
      };
      // ID bo'yicha qidirganda barcha role'dagi userlarni ko'rsatish (admin ham xaridor bo'lishi mumkin)
      if (!isObjectId) {
        params.role = UserRole.BUYER;
      }
      const res = await $api.get("/users", { params });
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
    mutationFn: (data: any) => $api.post(`/users/${editingUser?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
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

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string; block: boolean }) => {
      return $api.patch(`/users/${id}/${block}`);
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.block
          ? "Foydalanuvchi bloklandi"
          : "Foydalanuvchi faollashtirildi",
      });

      queryClient.invalidateQueries({ queryKey: ["buyers"] });
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
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      toast({
        title: "Haridor o'chirildi",
        description: "Haridor muvaffaqiyatli o'chirildi.",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message ||
          "Haridor o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

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

  const openDetail = (user: IUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const pageUsers = data?.items || [];

    if (selectedUsers.size === pageUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(pageUsers.map((u) => u._id)));
    }
  };

  const clearSelection = () => setSelectedUsers(new Set());

  const openSendMessageSingle = (user: IUser) => {
    setMessageRecipients([user]);
    setMessageModalOpen(true);
  };

  const openSendMessageBulk = () => {
    const pageUsers = data?.items || [];
    const recipients = pageUsers.filter((u) => selectedUsers.has(u._id));
    setMessageRecipients(recipients);
    setMessageModalOpen(true);
  };

  const sendNotificationMutation = useMutation({
    mutationFn: async (payload: {
      userIds: string[];
      title: string;
      message: string;
      channel: string;
    }) => {
      return $api.post("/admin/notifications/send-to-users", payload);
    },
    onSuccess: () => {
      toast({
        title: "Xabar yuborildi ✅",
        description: `${messageRecipients.length} ta userga yuborildi`,
      });
      setMessageModalOpen(false);
      setMessageRecipients([]);
      clearSelection();
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description:
          error.response?.data?.message || "Xabar yuborishda xatolik",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (dataForm: {
    title: string;
    message: string;
    channel: string;
  }) => {
    sendNotificationMutation.mutate({
      userIds: messageRecipients.map((u) => u._id),
      title: dataForm.title,
      message: dataForm.message,
      channel: dataForm.channel,
    });
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
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <Button
          disabled={broadcastByRoleMutation.isPending}
          onClick={() => setBroadcastModalOpen(true)}
          className="bg-primary hover:bg-primary/90 whitespace-nowrap"
        >
          <Send className="mr-2 h-4 w-4" />
          {broadcastByRoleMutation.isPending
            ? "Yuborilmoqda..."
            : "Barchaga yuborish"}
        </Button>

        {selectedUsers.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg mt-4">
            <span className="text-sm font-medium text-foreground">
              {selectedUsers.size} ta tanlangan
            </span>

            <Button
              size="sm"
              onClick={openSendMessageBulk}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Tanlanganlarga yuborish ({selectedUsers.size})
            </Button>

            <Button size="sm" variant="outline" onClick={clearSelection}>
              <X className="mr-2 h-4 w-4" />
              Tozalash
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: "checkbox",
            header: (
              <Checkbox
                checked={
                  (data?.items?.length || 0) > 0 &&
                  selectedUsers.size === (data?.items?.length || 0)
                }
                onCheckedChange={toggleSelectAll}
                aria-label="Hammasini tanlash"
              />
            ) as unknown as string,
            render: (user) => (
              <Checkbox
                checked={selectedUsers.has(user._id)}
                onCheckedChange={() => toggleUserSelection(user._id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${user.full_name} ni tanlash`}
              />
            ),
            className: "w-[50px]",
          },
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
          // {
          //   key: "balance",
          //   header: "Balans",
          //   render: (user) => formatCurrency(user.balance),
          // },
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
                    openSendMessageSingle(user);
                  }}
                  className="h-8 w-8 text-primary hover:text-primary/80"
                  title="Xabar yuborish"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
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
                    setEditingUser(user);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  disabled={blockMutation.isPending}
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlock(user);
                  }}
                  className={`h-8 w-8 ${
                    user.is_blocked
                      ? "text-destructive hover:text-destructive/80"
                      : "text-success hover:text-success/80"
                  }`}
                >
                  {user.is_blocked ? (
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
        data={data.items || []}
        keyExtractor={(user) => user._id}
        onRowClick={openDetail}
      />

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Foydalanuvchi ma'lumotlari
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedUser.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedUser.full_name || "Noma'lum"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge
                    status={selectedUser.is_active ? "active" : "blocked"}
                  />
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Telegram ID</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedUser.telegramId || "—"}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">
                    Ro'yxatdan o'tgan
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatDateTime(selectedUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dialog ichidagi mavjud grid'dan keyin qo'shing */}
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
              Sotib olingan mahsulotlar
              {isProductsLoading && (
                <span className="text-xs font-normal animate-pulse text-muted-foreground">
                  (Yuklanmoqda...)
                </span>
              )}
            </h4>

            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
              {buyerProducts?.length > 0
                ? buyerProducts.map((order: any) => (
                    <div
                      key={order._id}
                      className="p-3 border border-border rounded-lg bg-muted/30 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {order.productId?.name || "O'chirilgan mahsulot"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sotuvchi: {order.sellerId?.full_name || "Noma'lum"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {order.productId?.price?.toLocaleString()} so'm
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                : !isProductsLoading && (
                    <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                      Sotib olingan mahsulotlar mavjud emas
                    </div>
                  )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xaridorni tahrirlash</DialogTitle>
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
                minLength={6}
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
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title={
          userToBlock?.is_blocked
            ? "Foydalanuvchini bloklash"
            : "Foydalanuvchini faollashtirish"
        }
        description={
          userToBlock?.is_blocked
            ? `${userToBlock?.full_name} foydalanuvchisini bloklashni xohlaysizmi?`
            : `${userToBlock?.full_name} foydalanuvchisini faollashtirishni xohlaysizmi?`
        }
        confirmLabel={userToBlock?.is_blocked ? "Bloklash" : "Faollashtirish"}
        onConfirm={confirmBlock}
        variant={userToBlock?.is_blocked ? "destructive" : "default"}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Haridorni o'chirish"
        description={`${userToDelete?.full_name} haridorni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <SendMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        recipientCount={messageRecipients.length}
        onSend={handleSendMessage}
      />

      <SendMessageModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        recipientCount={pagination?.total || 0}
        onSend={handleBroadcastBuyers}
      />
    </div>
  );
}
