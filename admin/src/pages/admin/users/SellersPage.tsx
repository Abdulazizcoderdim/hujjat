import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/hooks/format-currency";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { IUser, UserRole } from "@/interface";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Ban,
  CheckCircle,
  Eye,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SellersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<IUser | null>(null);
  const [finance, setFinance] = useState({ debit: 0, credit: 0, balance: 0 });
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
  // Selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortByProducts, setSortByProducts] = useState<string>("default"); // Yangi state
  // Send message
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipients, setMessageRecipients] = useState<IUser[]>([]);

  // Broadcast (role = SELLER)
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedSeller?._id) return;

    (async () => {
      const { data } = await $api.get(
        `/transactions/balance/${selectedSeller._id}`,
      );

      setFinance(data);
    })();
  }, [selectedSeller?._id]);

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

  const sellersQuery = useQuery({
    queryKey: ["sellers", { debouncedSearch, page, limit, sortByProducts }],
    queryFn: async () => {
      const res = await $api.get("/users", {
        params: {
          role: UserRole.SELLER,
          search: debouncedSearch,
          page,
          limit,
          sortByProducts:
            sortByProducts !== "default" ? sortByProducts : undefined,
        },
      });
      return res.data;
    },
  });

  const sellers = sellersQuery.data?.items ?? [];
  const pagination = sellersQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const productsQuery = useInfiniteQuery({
    enabled: !!selectedSeller,
    queryKey: ["seller-products", selectedSeller?._id],
    queryFn: async ({ pageParam }) => {
      const res = await $api.get("/products/by-seller", {
        params: {
          sellerId: selectedSeller?._id,
          cursor: pageParam,
          limit: 10,
        },
      });
      return res.data;
    },
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: null,
  });

  const products = productsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const totalProducts = productsQuery.data?.pages?.[0]?.total ?? 0;

  // Infinite scroll for products
  useEffect(() => {
    if (!productsQuery.hasNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          productsQuery.fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [productsQuery.hasNextPage, productsQuery.fetchNextPage]);

  // Pul yechish tarixi (infinite scroll bilan)
  const withdrawalsQuery = useInfiniteQuery({
    enabled: !!selectedSeller,
    queryKey: ["seller-withdrawals", selectedSeller?._id],
    queryFn: async ({ pageParam }) => {
      const res = await $api.get("/transactions", {
        params: {
          userId: selectedSeller?._id,
          type: "debit",
          cursor: pageParam,
          limit: 10,
        },
      });
      return res.data;
    },
    getNextPageParam: (last) => last.nextCursor,
    initialPageParam: null,
  });

  const withdrawals =
    withdrawalsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  // Block/Unblock mutation
  const blockMutation = useMutation({
    mutationFn: ({ id, block }: { id: string; block: boolean }) =>
      $api.patch(`/users/${id}/${block}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Holat muvaffaqiyatli yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: (id: string) => $api.patch(`/users/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast({ title: "Sotuvchi tasdiqlandi" });
    },
    onError: () => {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    },
  });

  // Confirm action handler
  const handleConfirm = () => {
    const { type, user } = confirmDialog;
    if (!user) return;

    if (type === "block") {
      blockMutation.mutate({ id: user._id, block: user.is_active });
    } else {
      verifyMutation.mutate(user._id);
    }

    setConfirmDialog({ open: false, type: "block", user: null });
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      $api.patch(`/users/update/${editingUser?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "sellers",
      });
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

    const payload: any = {};

    if (editForm.full_name !== editingUser.full_name) {
      payload.full_name = editForm.full_name;
    }

    if (editForm.phone !== editingUser.phone) {
      payload.phone = editForm.phone;
    }

    if (editForm.login !== editingUser.login) {
      payload.login = editForm.login;
    }

    if (editForm.telegramId !== editingUser.telegramId) {
      payload.telegramId = editForm.telegramId;
    }

    if (editForm.password && editForm.password.length >= 4) {
      payload.password = editForm.password;
    }

    if (Object.keys(payload).length === 0) {
      toast({ title: "Hech qanday o‘zgarish yo‘q" });
      return;
    }

    updateMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await $api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
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
        description: `${messageRecipients.length} ta sotuvchiga yuborildi`,
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

  const broadcastByRoleMutation = useMutation({
    mutationFn: async (payload: {
      role: UserRole.SELLER;
      title: string;
      message: string;
      channel: string;
    }) => {
      return $api.post("/admin/notifications/broadcast-by-role", payload);
    },
    onSuccess: () => {
      toast({
        title: "Xabar yuborildi ✅",
        description: "Barcha sotuvchilarga yuborildi",
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

  const handleBroadcastSellers = (dataForm: {
    title: string;
    message: string;
    channel: string;
  }) => {
    broadcastByRoleMutation.mutate({
      role: UserRole.SELLER,
      title: dataForm.title,
      message: dataForm.message,
      channel: dataForm.channel,
    });
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
    if (selectedUsers.size === sellers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sellers.map((u) => u._id)));
    }
  };

  const clearSelection = () => setSelectedUsers(new Set());

  const openSendMessageSingle = (user: IUser) => {
    setMessageRecipients([user]);
    setMessageModalOpen(true);
  };

  const openSendMessageBulk = () => {
    const recipients = sellers.filter((u) => selectedUsers.has(u._id));
    setMessageRecipients(recipients);
    setMessageModalOpen(true);
  };

  const sellerColumns = [
    {
      key: "checkbox",
      header: (
        <Checkbox
          checked={sellers.length > 0 && selectedUsers.size === sellers.length}
          onCheckedChange={toggleSelectAll}
          aria-label="Hammasini tanlash"
        />
      ),
      render: (user: IUser) => (
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
      render: (_o: IUser, index: number) =>
        (pagination?.page - 1) * pagination?.limit + (index + 1),
    },
    {
      key: "full_name",
      header: "Ism",
      render: (user: IUser) => (
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
      key: "login",
      header: "login",
      render: (user: IUser) => user.login || "—",
    },
    {
      key: "products_count",
      header: "Mahsulotlar soni",
      render: (user: any) => user.productsCount || "—",
    },
    {
      key: "telegramId",
      header: "TelegramID",
      render: (user: IUser) => user.telegramId || "—",
    },
    {
      key: "createdAt",
      header: "Sana",
      render: (user: IUser) => formatDateTime(user.createdAt),
    },
    {
      key: "is_active",
      header: "Holati",
      render: (user: IUser) => (
        <StatusBadge status={user.is_active ? "active" : "blocked"} />
      ),
    },
    {
      key: "actions",
      header: "Amallar",
      render: (user: IUser) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openSendMessageSingle(user)}
            className="text-primary hover:text-primary/80"
            title="Xabar yuborish"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSelectedSeller(user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditingUser(user)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setConfirmDialog({ open: true, type: "block", user })
            }
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sotuvchilar"
        description="Platformadagi barcha sotuvchilar"
      />

      <div className="flex items-center gap-4 flex-wrap justify-between">
        <Input
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <Button
          onClick={() => setBroadcastModalOpen(true)}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          <Send className="mr-2 h-4 w-4" />
          Barchaga yuborish
        </Button>
      </div>
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg mt-4">
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

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable
          data={sellers}
          keyExtractor={(u) => u._id}
          columns={sellerColumns}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sellers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Sotuvchilar topilmadi</p>
        ) : (
          sellers.map((user, index) => (
            <div
              key={user._id}
              className="stat-card space-y-3 cursor-pointer"
              onClick={() => setSelectedSeller(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedUsers.has(user._id)}
                    onCheckedChange={() => toggleUserSelection(user._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.full_name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.full_name || "Noma'lum"}</p>
                    <p className="text-xs text-muted-foreground">Login: {user.login || "—"}</p>
                  </div>
                </div>
                <StatusBadge status={user.is_active ? "active" : "blocked"} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">TelegramID: </span>
                  <span className="text-foreground">{user.telegramId || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mahsulotlar: </span>
                  <span className="text-foreground">{(user as any).productsCount || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-2 border-t border-border/50 flex-wrap">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openSendMessageSingle(user); }} className="text-primary">
                  <MessageSquare className="h-4 w-4 mr-1" /> Xabar
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSeller(user); }}>
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}>
                  <Pencil className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setConfirmDialog({ open: true, type: "block", user }); }}
                  className={user.is_active ? "text-destructive" : "text-success"}
                >
                  {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(user); }} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
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

      {/* Sotuvchi tafsilotlari dialog */}
      <Dialog
        open={!!selectedSeller}
        onOpenChange={() => setSelectedSeller(null)}
      >
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sotuvchi ma'lumotlari</DialogTitle>
          </DialogHeader>

          {selectedSeller && (
            <div className="space-y-6">
              {/* Sotuvchi profili */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {selectedSeller.full_name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedSeller.full_name || "Noma'lum"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    TelegramID: {selectedSeller.telegramId || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedSeller._id || "—"}
                  </p>
                </div>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Balans</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(finance.balance)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Mahsulotlar</p>
                  <p className="text-lg font-semibold">{totalProducts}</p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Holati</p>
                  <StatusBadge
                    status={selectedSeller.is_active ? "active" : "blocked"}
                  />
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Jami daromadi</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(finance.credit)}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="products">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
                  <TabsTrigger value="withdrawals">Pul yechish</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="mt-4 space-y-4">
                  <DataTable
                    data={products}
                    keyExtractor={(p) => p._id}
                    columns={[
                      { key: "name", header: "Nomi" },
                      {
                        key: "price",
                        header: "Narxi",
                        render: (p) => formatCurrency(p.price),
                      },
                      {
                        key: "status",
                        header: "Holati",
                        render: (p) => <ProductStatusBadge status={p.status} />,
                      },
                      { key: "soldCount", header: "Sotilgan" },
                    ]}
                  />
                  <div ref={loadMoreRef} />
                  {productsQuery.isFetchingNextPage && (
                    <p className="text-center text-muted-foreground">
                      Yuklanmoqda...
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4 space-y-4">
                  <DataTable
                    data={withdrawals}
                    keyExtractor={(w) => w._id}
                    columns={[
                      {
                        key: "amount",
                        header: "Summa",
                        render: (w) => formatCurrency(w.amount),
                      },
                      { key: "cardNumber", header: "Karta" },
                      { key: "status", header: "Holati" },
                      {
                        key: "createdAt",
                        header: "Sana",
                        render: (w) =>
                          new Date(w.createdAt).toLocaleDateString("uz-UZ"),
                      },
                    ]}
                  />
                  <div ref={loadMoreRef} />
                  {withdrawalsQuery.isFetchingNextPage && (
                    <p className="text-center text-muted-foreground">
                      Yuklanmoqda...
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* YANGI: Tahrirlash Dialogi */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sotuvchini tahrirlash</DialogTitle>
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

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">TelegramID</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="example@mail.com"
              />
            </div> */}
            <div className="space-y-2">
              <label className="text-sm font-medium">TelegramID</label>
              <Input
                type="text"
                value={editForm.telegramId}
                onChange={(e) =>
                  setEditForm({ ...editForm, telegramId: e.target.value })
                }
                placeholder="1234567"
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
              <label className="text-sm font-medium">Login</label>
              <Input
                value={editForm.login}
                onChange={(e) =>
                  setEditForm({ ...editForm, login: e.target.value })
                }
                placeholder="Login"
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
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, type: "block", user: null })
        }
        title="Amalni tasdiqlash"
        description="Davom etishni xohlaysizmi?"
        onConfirm={handleConfirm}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Sotuvchini o'chirish"
        description={`${userToDelete?.full_name} sotuvchini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Send selected / single */}
      <SendMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        recipientCount={messageRecipients.length}
        onSend={handleSendMessage}
      />

      {/* Broadcast all sellers */}
      <SendMessageModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        recipientCount={pagination?.total || 0}
        onSend={handleBroadcastSellers}
      />
    </div>
  );
}
