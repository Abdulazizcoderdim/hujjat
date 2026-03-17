import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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

type SortField =
  | "full_name"
  | "login"
  | "productsCount"
  | "telegramId"
  | "createdAt"
  | "is_active";
type SortOrder = "asc" | "desc";

export function StudentsTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
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

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageRecipients, setMessageRecipients] = useState<IUser[]>([]);
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
    queryKey: [
      "sellers",
      { debouncedSearch, page, limit, sortField, sortOrder },
    ],
    queryFn: async () => {
      const params: any = {
        role: UserRole.SELLER,
        search: debouncedSearch,
        page,
        limit,
      };

      if (sortField) {
        params.sortBy = sortField;
        params.sortOrder = sortOrder;
      }

      const res = await $api.get("/users", { params });
      return res.data;
    },
  });

  const sellers = sellersQuery.data?.items ?? [];
  const pagination = sellersQuery.data?.pagination;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortField, sortOrder]);

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
      toast({ title: "Hech qanday o'zgarish yo'q" });
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
        <Button
          onClick={() => setBroadcastModalOpen(true)}
          className="bg-primary hover:bg-primary/90 whitespace-nowrap"
        >
          <Send className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Hamma sotuvchilarga yuborish</span>
          <span className="sm:hidden">Barchaga yuborish</span>
        </Button>
      </div>

      {selectedUsers.size > 0 && (
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">
            {selectedUsers.size} ta tanlangan
          </span>
          <div className="flex gap-2">
            <Button
              onClick={openSendMessageBulk}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Tanlanganlarga yuborish ({selectedUsers.size})
            </Button>
            <Button onClick={clearSelection} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Tozalash
            </Button>
          </div>
        </div>
      )}

      {/* Main Sellers Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold w-[50px]">
                  <Checkbox
                    checked={
                      selectedUsers.size > 0 &&
                      selectedUsers.size === sellers.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Hammasini tanlash"
                  />
                </th>
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
              {sellers.map((user: IUser, index: number) => (
                <tr
                  key={user._id}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    <Checkbox
                      checked={selectedUsers.has(user._id)}
                      onCheckedChange={() => toggleUserSelection(user._id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`${user.full_name} ni tanlash`}
                    />
                  </td>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          openSendMessageSingle(user);
                        }}
                        className="text-primary hover:text-primary/80"
                        title="Xabar yuborish"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSeller(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setConfirmDialog({
                            open: true,
                            type: "block",
                            user,
                          })
                        }
                      >
                        {user.is_active ? (
                          <Ban className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
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

      {/* Sotuvchi tafsilotlari dialog */}
      <Dialog
        open={!!selectedSeller}
        onOpenChange={() => setSelectedSeller(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sotuvchi ma'lumotlari</DialogTitle>
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
                  <p className="text-sm text-muted-foreground">
                    TelegramID: {selectedSeller.telegramId || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedSeller._id || "—"}
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
                  <p className="text-2xl font-bold">{totalProducts}</p>
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

              {/* Tabs */}
              <Tabs defaultValue="products" className="w-full">
                <TabsList>
                  <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
                  <TabsTrigger value="withdrawals">Pul yechish</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Nomi
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Narxi
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Holati
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Sotilgan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product: any) => (
                            <tr
                              key={product._id}
                              className="border-t hover:bg-muted/50"
                            >
                              <td className="px-4 py-3 text-sm">
                                {product.name}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(product.price)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <ProductStatusBadge status={product.status} />
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {product.soldCount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div ref={loadMoreRef} className="h-4" />
                  {productsQuery.isFetchingNextPage && (
                    <div className="text-center py-4 text-muted-foreground">
                      Yuklanmoqda...
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="withdrawals" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Summa
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Karta
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Holati
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">
                              Sana
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((withdrawal: any) => (
                            <tr
                              key={withdrawal._id}
                              className="border-t hover:bg-muted/50"
                            >
                              <td className="px-4 py-3 text-sm">
                                {formatCurrency(withdrawal.amount)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {withdrawal.cardNumber}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {withdrawal.status}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(
                                  withdrawal.createdAt,
                                ).toLocaleDateString("uz-UZ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {withdrawalsQuery.isFetchingNextPage && (
                    <div className="text-center py-4 text-muted-foreground">
                      Yuklanmoqda...
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tahrirlash Dialogi */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sotuvchini tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
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
            <div>
              <label className="text-sm font-medium">TelegramID</label>
              <Input
                value={editForm.telegramId}
                onChange={(e) =>
                  setEditForm({ ...editForm, telegramId: e.target.value })
                }
                placeholder="1234567"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+998..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Login</label>
              <Input
                value={editForm.login}
                onChange={(e) =>
                  setEditForm({ ...editForm, login: e.target.value })
                }
                placeholder="Login"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Yangi parol{" "}
                <span className="text-muted-foreground">(ixtiyoriy)</span>
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
            <div className="flex justify-end gap-2">
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
        description="Bu sotuvchini o'chirishni tasdiqlaysizmi?"
        onConfirm={confirmDelete}
      />

      <SendMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        recipients={messageRecipients}
        onSend={handleSendMessage}
      />

      <SendMessageModal
        open={broadcastModalOpen}
        onOpenChange={setBroadcastModalOpen}
        recipients={[]}
        onSend={handleBroadcastSellers}
        isBroadcast
      />
    </div>
  );
}
