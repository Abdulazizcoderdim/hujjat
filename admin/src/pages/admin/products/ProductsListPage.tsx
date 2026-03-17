import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { Pagination } from "@/components/common/Pagination";
import { RenderPreview } from "@/components/RenderPreview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/hooks/format-currency";
import { formatFileSize } from "@/hooks/format-size";
import { formatDateTime } from "@/hooks/formatDateTime";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import {
  ICategory,
  IPagination,
  IProduct,
  IUser,
  ProductStatus,
} from "@/interface";
import { safeText } from "@/utils/safe";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Check,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EditProductDialog } from "./EditProductDialog";

interface ProductsListPageProps {
  status: ProductStatus;
  title: string;
  description: string;
}

interface ProductResponse {
  items: IProduct<ICategory, IUser>[];
  pagination: IPagination;
}

export function ProductsListPage({
  status,
  title,
  description,
}: ProductsListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<IProduct<
    ICategory,
    IUser
  > | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveLoad, setApproveLoad] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [productToAction, setProductToAction] = useState<IProduct<
    ICategory,
    IUser
  > | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [bulkAction, setBulkAction] = useState<
    "approve" | "reject" | "delete" | "preview" | null
  >(null);
  const queryClient = useQueryClient();
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct<
    ICategory,
    IUser
  > | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<IProduct<
    ICategory,
    IUser
  > | null>(null);

  useEffect(() => {
    setSignedUrl(null);
  }, [selectedProduct?._id]);

  const fetchSignedUrl = async () => {
    if (!selectedProduct) return;

    try {
      setLoadingFile(true);
      const { data } = await $api.get<{ url: string }>(
        `/products/${selectedProduct?._id}/download`,
      );
      setSignedUrl(data.url);
      return data.url;
    } finally {
      setLoadingFile(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [page, status, debouncedSearch]);

  const { data: authorsData } = useQuery<IUser[]>({
    queryKey: ["authors/list"],
    queryFn: async () => {
      const { data } = await $api.get("/users/authors/list");
      return data;
    },
  });

  const { data } = useQuery<ProductResponse>({
    queryKey: [
      "products/all",
      {
        status,
        page,
        limit,
        debouncedSearch,
        selectedAuthor,
        sortBy,
        sortOrder,
      },
    ],
    queryFn: async () => {
      const params: any = {
        page,
        limit,
        search: debouncedSearch || undefined,
        authorId: selectedAuthor !== "all" ? selectedAuthor : undefined,
      };

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

      const response = await $api.get(`/products/all/${status}`, { params });
      return response.data;
    },
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const products = data?.items || [];
  const pagination = data?.pagination;

  const openDetail = (product: IProduct<ICategory, IUser>) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id));
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      await $api.delete(`/products/${productToDelete._id}`);

      toast({
        title: "O'chirildi",
        description: "Mahsulot muvaffaqiyatli o'chirib tashlandi",
      });

      // Ro'yxatni yangilash
      queryClient.invalidateQueries({ queryKey: ["products/all"] });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleRegeneratePreview = async (id: string) => {
    try {
      setRegenerateLoading(true);
      await $api.post(`/products/${id}/regenerate-preview`);

      toast({
        title: "Navbatga qo'shildi",
        description: "Preview qayta generatsiya qilish uchun navbatga olindi.",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Preview generatsiyasini boshlashda xatolik",
        variant: "destructive",
      });
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleRegenerateProduct = async (id: string) => {
    try {
      setRegenerateLoading(true);
      await $api.post(`/products/${id}/regenerate-product`);

      toast({
        title: "Navbatga qo'shildi",
        description:
          "Mahsulot ma'lumotlarini qayta generatsiya qilish boshlandi.",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Qayta ishlashni boshlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleBulkRegenerate = async (type: "preview" | "product") => {
    try {
      setRegenerateLoading(true);
      const endpoint =
        type === "preview"
          ? "/products/bulk-regenerate-preview"
          : "/products/bulk-regenerate-product";

      await $api.post(endpoint, { productIds: selectedIds });

      toast({
        title: "Jarayon boshlandi",
        description: `${selectedIds.length} ta mahsulot navbatga qo'shildi.`,
      });

      setSelectedIds([]);
    } catch (error) {
      toast({
        title: "Xatolik",
        variant: "destructive",
      });
    } finally {
      setRegenerateLoading(false);
    }
  };

  const approveProduct = async (status: ProductStatus, reason?: string) => {
    if (!productToAction) return;

    try {
      setApproveLoad(true);

      await $api.patch(`/products/${productToAction._id}/approve`, {
        status,
        rejectReason: reason,
      });

      toast({
        title:
          status === ProductStatus.APPROVED
            ? "Mahsulot tasdiqlandi"
            : "Mahsulot rad etildi",
        description: `"${productToAction.name}" muvaffaqiyatli yangilandi.`,
      });
    } catch {
      toast({
        title: "Xatolik",
        description: "Amalni bajarishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setApproveLoad(false);
      setConfirmApproveOpen(false);
      setRejectDialogOpen(false);
      setRejectReason("");
      setProductToAction(null);
    }
  };

  const handleBulkConfirm = async () => {
    try {
      setBulkLoading(true);

      // Agar o'chirish bo'lsa
      if (bulkAction === "delete") {
        await $api.delete("/products/bulk/delete", {
          data: { ids: selectedIds },
        });
      } else if (bulkAction === "preview") {
        await $api.patch("/products/bulk/preview", {
          productIds: selectedIds,
        });
      } else {
        await $api.patch("/products/bulk/approve", {
          productIds: selectedIds,
          status:
            bulkAction === "approve"
              ? ProductStatus.APPROVED
              : ProductStatus.REJECTED,
          rejectReason: bulkAction === "reject" ? bulkRejectReason : undefined,
        });
      }

      toast({
        title: "Muvaffaqiyatli",
        description: `${selectedIds.length} ta mahsulot ${
          bulkAction === "delete" ? "o'chirildi" : "yangilandi"
        }`,
      });

      queryClient.invalidateQueries({ queryKey: ["products/all"] });

      setSelectedIds([]);
      setBulkModalOpen(false);
      setBulkRejectReason("");
      setBulkAction(null);
    } catch {
      toast({
        title: "Xatolik",
        description: "Amalni bajarishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const allChecked =
    products.length > 0 && selectedIds.length === products.length;

  const someChecked =
    selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mahsulot nomi yoki ID bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Muallif bo'yicha saralash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha mualliflar</SelectItem>
              {authorsData?.map((author) => (
                <SelectItem key={author._id} value={author._id}>
                  {author.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            className="bg-success"
            onClick={() => {
              setBulkAction("approve");
              setBulkModalOpen(true);
            }}
          >
            {selectedIds.length} ta tasdiqlash
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              setBulkAction("reject");
              setBulkModalOpen(true);
            }}
          >
            {selectedIds.length} ta rad etish
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setBulkAction("preview");
              setBulkModalOpen(true);
            }}
          >
            {selectedIds.length} ta qayta preview qilish
          </Button>

          <Button
            variant="secondary"
            disabled={regenerateLoading}
            onClick={() => handleBulkRegenerate("preview")}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${regenerateLoading ? "animate-spin" : ""}`}
            />
            Qayta preview ({selectedIds.length})
          </Button>

          <Button
            variant="secondary"
            disabled={regenerateLoading}
            onClick={() => handleBulkRegenerate("product")}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${regenerateLoading ? "animate-spin" : ""}`}
            />
            Qayta generatsiya ({selectedIds.length})
          </Button>

          <Button
            variant="destructive"
            className="bg-red-800 hover:bg-red-900"
            onClick={() => {
              setBulkAction("delete");
              setBulkModalOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            {selectedIds.length} ta o'chirish
          </Button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable
          columns={[
            {
              key: "select",
              header: (
                <Checkbox
                  checked={
                    allChecked ? true : someChecked ? "indeterminate" : false
                  }
                  onCheckedChange={() => toggleAll()}
                  aria-label="Select all"
                />
              ),
              render: (product) => (
                <Checkbox
                  checked={selectedIds.includes(product._id)}
                  onCheckedChange={() => toggleOne(product._id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Select row"
                />
              ),
            },
            {
              key: "index",
              header: "№",
              render: (_o, index) =>
                (data?.pagination?.page - 1) * data?.pagination?.limit +
                (index + 1),
            },
            {
              key: "isLegal",
              header: "Holati",
              render: (product) =>
                product.isLegal === false ? (
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      Noqonuniy
                    </span>
                    <div className="p-1 rounded-md border border-red-200 bg-red-50">
                      <p className="text-sm text-red-500 font-medium">
                        Sababi:
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {product.illegalReason || "Sabab ko'rsatilmagan"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    Qonuniy
                  </span>
                ),
            },
            {
              key: "name",
              header: (
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-bold"
                  onClick={() => {
                    if (sortBy === "name") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("name");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Mahsulot
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ),
              render: (product) => (
                <div className="flex items-center gap-3">
                  {product?.poster ? (
                    <img
                      src={product?.poster}
                      alt={product?.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-foreground">
                      {product?.name}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {product?.fileExt.toUpperCase()}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "author",
              header: "Muallif",
              render: (product) => safeText(product.authorId?.full_name),
            },
            {
              key: "price",
              header: (
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-bold"
                  onClick={() => {
                    if (sortBy === "price") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("price");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Narxi
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ),
              render: (product) => formatCurrency(product.price),
            },
            status === ProductStatus.APPROVED && {
              key: "sotuv",
              header: (
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-bold"
                  onClick={() => {
                    if (sortBy === "soldCount") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("soldCount");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Sotuv
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ),
              render: (product) => safeText(product.soldCount),
            },
            {
              key: "fileSize",
              header: (
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-bold"
                  onClick={() => {
                    if (sortBy === "fileSize") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("fileSize");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Hajmi
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ),
              render: (product) => formatFileSize(product.fileSize || 0),
            },
            {
              key: "status",
              header: "Holati",
              render: (product) => <ProductStatusBadge status={product.status} />,
            },
            {
              key: "createdAt",
              header: (
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent font-bold"
                  onClick={() => {
                    if (sortBy === "createdAt") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("createdAt");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Yuklangan
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ),
              render: (product) => formatDateTime(product.createdAt),
            },
            {
              key: "actions",
              header: "Amallar",
              render: (product) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menyu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Amallar</DropdownMenuLabel>

                    <DropdownMenuItem
                      disabled={approveLoad}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(product);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ko'rish
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={regenerateLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegeneratePreview(product._id);
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Qayta preview
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={regenerateLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerateProduct(product._id);
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Qayta generatsiya
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToEdit(product);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Tahrirlash
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={approveLoad}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToAction(product);
                        setConfirmApproveOpen(true);
                      }}
                      className="text-green-600 focus:text-green-600 cursor-pointer"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Tasdiqlash
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      disabled={approveLoad}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToAction(product);
                        setRejectDialogOpen(true);
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Bekor qilish
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={approveLoad || deleteLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductToDelete(product);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          data={products}
          keyExtractor={(product) => product._id}
          emptyMessage="Mahsulotlar topilmadi"
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Mahsulotlar topilmadi</p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="stat-card space-y-3 cursor-pointer"
              onClick={() => openDetail(product)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(product._id)}
                  onCheckedChange={() => toggleOne(product._id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
                {product.poster ? (
                  <img
                    src={product.poster}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.fileExt.toUpperCase()} · {formatFileSize(product.fileSize || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {safeText(product.authorId?.full_name)}
                  </p>
                </div>
                <div className="shrink-0">
                  <ProductStatusBadge status={product.status} />
                </div>
              </div>

              {product.isLegal === false && (
                <div className="p-2 rounded-md border border-red-200 bg-red-50">
                  <p className="text-xs text-red-700 font-medium">Noqonuniy: {product.illegalReason || "Sabab ko'rsatilmagan"}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
                <span className="text-muted-foreground">{formatDateTime(product.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1 pt-2 border-t border-border/50 flex-wrap">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(product); }}>
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button variant="ghost" size="sm" className="text-green-600" onClick={(e) => { e.stopPropagation(); setProductToAction(product); setConfirmApproveOpen(true); }}>
                  <Check className="h-4 w-4 mr-1" /> Tasdiq
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setProductToAction(product); setRejectDialogOpen(true); }}>
                  <X className="h-4 w-4 mr-1" /> Rad
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setProductToEdit(product); setEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRegeneratePreview(product._id); }}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Qayta preview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setProductToDelete(product); setDeleteDialogOpen(true); }}>
                      <Trash className="mr-2 h-4 w-4" /> O'chirish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-7xl overflow-y-auto h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Mahsulot ma'lumotlari
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-start flex-col gap-4">
                {selectedProduct.fileKey ? (
                  <RenderPreview
                    product={selectedProduct}
                    signedUrl={signedUrl}
                    fetchSignedUrl={fetchSignedUrl}
                    loadingFile={loadingFile}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProduct.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ProductStatusBadge status={selectedProduct.status} />
                  </div>
                </div>
              </div>

              {selectedProduct.rejectionReason && (
                <div className="stat-card">
                  <p className="text-sm text-red-700 text-muted-foreground">
                    Rad etilish sababi
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedProduct.rejectionReason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Muallif</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedProduct.authorId.full_name}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Narxi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Fayl formati</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedProduct.fileExt.toUpperCase()}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Fayl hajmi</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatFileSize(selectedProduct.fileSize || 0)}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">
                    Sahifalar soni
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedProduct.pages || "—"}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="text-sm text-muted-foreground">Ko'rishlar</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedProduct.viewCount}
                  </p>
                </div>
              </div>

              {selectedProduct.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Teglar</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md bg-muted text-sm text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {status === ProductStatus.PENDING && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    disabled={approveLoad}
                    variant="outline"
                    onClick={() => {
                      setDetailOpen(false);
                      setProductToAction(selectedProduct);
                      setRejectDialogOpen(true);
                    }}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rad etish
                  </Button>
                  <Button
                    disabled={approveLoad}
                    onClick={() => {
                      setDetailOpen(false);
                      setProductToAction(selectedProduct);
                      setConfirmApproveOpen(true);
                    }}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Tasdiqlash
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <ConfirmDialog
        open={confirmApproveOpen}
        onOpenChange={setConfirmApproveOpen}
        title="Mahsulotni tasdiqlash"
        description={`"${productToAction?.name}" mahsulotini tasdiqlaysizmi?`}
        confirmLabel="Tasdiqlash"
        onConfirm={() => approveProduct(ProductStatus.APPROVED)}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Mahsulotni rad etish
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              "{productToAction?.name}" mahsulotini rad etish uchun sabab
              kiriting.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-foreground">
                Rad etish sababi *
              </Label>
              <Textarea
                id="reason"
                placeholder="Rad etish sababini yozing..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-background border-border min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              disabled={!rejectReason.trim() || approveLoad}
              variant="destructive"
              onClick={() =>
                approveProduct(ProductStatus.REJECTED, rejectReason)
              }
            >
              Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "approve" && "Mahsulotlarni tasdiqlash"}
              {bulkAction === "reject" && "Mahsulotlarni rad etish"}
              {bulkAction === "delete" && "Mahsulotlarni o'chirish"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            {selectedIds.length} ta mahsulot bilan amal bajarilmoqda.
            {bulkAction === "delete" && (
              <span className="block mt-2 text-red-500 font-medium">
                Diqqat! Bu amalni ortga qaytarib bo'lmaydi.
              </span>
            )}
          </p>

          {bulkAction === "reject" && (
            <div className="space-y-2">
              <Label>Rad etish sababi *</Label>
              <Textarea
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                placeholder="Admin uchun sababni yozing..."
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkModalOpen(false);
                setBulkRejectReason("");
                setBulkAction(null);
              }}
            >
              Bekor qilish
            </Button>

            <Button
              variant={bulkAction === "approve" ? "default" : "destructive"}
              disabled={
                bulkLoading ||
                (bulkAction === "reject" && !bulkRejectReason.trim())
              }
              onClick={handleBulkConfirm}
            >
              {bulkAction === "delete"
                ? "O'chirish"
                : bulkAction === "preview"
                  ? "Qayta preview qilish"
                  : bulkAction === "reject"
                    ? "Rad etish"
                    : "Tasdiqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Mahsulotni o'chirish"
        description={`Haqiqatan ham "${productToDelete?.name}" mahsulotini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`}
        confirmLabel={deleteLoading ? "O'chirilmoqda..." : "O'chirish"}
        onConfirm={deleteProduct}
        variant="destructive"
      />

      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={productToEdit}
      />
    </div>
  );
}
