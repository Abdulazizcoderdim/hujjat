import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICategory, IPagination, IProduct, ProductStatus } from "@/interface";
import {
  changeProductStatus,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/service/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Edit, Eye, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditProductModal } from "./EditProductModal";
import { ViewProductModal } from "./ViewProductModal";
import { Pagination } from "@/components/common/Pagination";

interface Props {
  status: ProductStatus;
  title: string;
  description: string;
}

interface ProductResponse {
  items: IProduct<ICategory>[];
  pagination: IPagination;
}

export function ProductsListPage({ status, title, description }: Props) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useQuery<ProductResponse>({
    queryKey: ["products", { status, page, limit }],
    queryFn: () => getProducts({ status, page, limit }),
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const pagination = data?.pagination;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateProduct(id, data),
    onSuccess: () => {
      toast.success("Muvaffaqiyatli yangilandi ✅");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditOpen(false);
      setSelectedId(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Yangilashda xatolik yuz berdi",
      );
    },
  });

  const deleteMutate = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("O'chirildi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const statusMutate = useMutation({
    mutationFn: ({ id, s }: { id: number; s: string }) =>
      changeProductStatus(id, s),
    onSuccess: () => {
      toast.success("Status o'zgardi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (isLoading) return <div>Yuklanmoqda...</div>;

  return (
    <>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poster</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.poster}
                      className="w-10 h-14 object-cover rounded"
                      alt=""
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedId(product.id);
                          setSelectedProduct(product);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedId(product.id);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>

                      {status === ProductStatus.REJECTED ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            statusMutate.mutate({
                              id: product.id,
                              s: ProductStatus.APPROVED,
                            })
                          }
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            statusMutate.mutate({
                              id: product.id,
                              s: ProductStatus.REJECTED,
                            })
                          }
                        >
                          <XCircle className="w-4 h-4 text-orange-500" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("O'chirilsinmi?"))
                            deleteMutate.mutate(product.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <EditProductModal
          id={selectedId}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedId(null);
          }}
          onSave={(data: FormData) => {
            if (selectedId) {
              updateMutation.mutate({ id: selectedId, data });
            }
          }}
        />

        <ViewProductModal
          product={selectedProduct}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
      />
    </>
  );
}
