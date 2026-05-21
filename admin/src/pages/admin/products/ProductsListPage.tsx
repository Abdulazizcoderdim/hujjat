import {
  EntBadge,
  EntButton,
  EntConfirmDialog,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { PosterPreviewDialog } from "@/components/enterprise/PosterPreviewDialog";
import { ICategory, IPagination, IProduct, ProductStatus } from "@/interface";
import {
  changeProductStatus,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/service/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Edit, Eye, GraduationCap, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditProductModal } from "./EditProductModal";
import { ViewProductModal } from "./ViewProductModal";

interface Props {
  status: ProductStatus;
  title: string;
  description: string;
}

interface ProductResponse {
  items: IProduct<ICategory>[];
  pagination: IPagination;
}

const LIMIT_DEFAULT = 25;

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function ProductsListPage({ status, title }: Props) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(LIMIT_DEFAULT);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [confirmDel, setConfirmDel] = useState<IProduct<ICategory> | null>(
    null,
  );
  const [preview, setPreview] = useState<{
    poster: string;
    caption: string;
  } | null>(null);

  const { data, isLoading, isFetching } = useQuery<ProductResponse>({
    queryKey: ["products", { status, page, limit }],
    queryFn: () => getProducts({ status, page, limit }),
    placeholderData: (prev) =>
      prev ?? {
        items: [],
        pagination: { total: 0, page: 1, limit, totalPages: 1 },
      },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  // Local client-side filter for search (server doesn't have it for this endpoint)
  const filtered = search.trim()
    ? items.filter((p) => {
        const q = search.trim().toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          (p as any).shelfCode?.toLowerCase().includes(q)
        );
      })
    : items;

  const updateMu = useMutation({
    mutationFn: (args: { id: number; data: FormData }) =>
      updateProduct(args.id, args.data),
    onSuccess: () => {
      toast.success("Yangilandi");
      qc.invalidateQueries({ queryKey: ["products"] });
      setIsEditOpen(false);
      setSelectedId(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Yangilashda xato"),
  });

  const deleteMu = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("O'chirildi");
      qc.invalidateQueries({ queryKey: ["products"] });
      setConfirmDel(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "O'chirishda xato"),
  });

  const statusMu = useMutation({
    mutationFn: (args: { id: number; s: string }) =>
      changeProductStatus(args.id, args.s),
    onSuccess: () => {
      toast.success("Status o'zgardi");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  return (
    <EntPage>
      <EntToolbar title={title} />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="nom / muallif / shifr"
            style={{ width: 280 }}
          />
        </EntFilterField>
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {isFetching && "yuklanmoqda..."}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th style={{ width: 50 }}>Poster</th>
              <th>Nom</th>
              <th style={{ width: 180 }}>Muallif</th>
              <th style={{ width: 130 }}>Kategoriya</th>
              <th style={{ width: 110 }}>Shifr</th>
              <th style={{ width: 90 }}>O'quv reja</th>
              <th style={{ width: 100 }}>Sana</th>
              <th style={{ width: 150 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Yozuv topilmadi
                </td>
              </tr>
            ) : (
              filtered.map((p: any, idx) => (
                <tr key={p.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td>
                    {p.poster ? (
                      <img
                        src={p.poster}
                        alt=""
                        title="Rasmni kattalashtirish"
                        onClick={() =>
                          setPreview({ poster: p.poster, caption: p.name })
                        }
                        style={{
                          width: 32,
                          height: 44,
                          objectFit: "cover",
                          border: "1px solid var(--ent-border)",
                          cursor: "zoom-in",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 44,
                          background: "var(--ent-bg)",
                          border: "1px solid var(--ent-border)",
                        }}
                      />
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td className="ent-muted">{p.author || "—"}</td>
                  <td className="ent-muted">{p.category?.name || "—"}</td>
                  <td className="ent-cell--code">
                    {p.shelfCode || <span className="ent-muted">—</span>}
                  </td>
                  <td>
                    {p.isCurriculumBook ? (
                      <EntBadge variant="success">
                        <GraduationCap size={11} /> Ha
                      </EntBadge>
                    ) : (
                      <span className="ent-muted">—</span>
                    )}
                  </td>
                  <td className="ent-cell--code ent-muted">
                    {fmtDate(p.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EntButton
                        size="icon"
                        title="Ko'rish"
                        onClick={() => {
                          setSelectedId(p.id);
                          setSelectedProduct(p);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye size={14} />
                      </EntButton>
                      <EntButton
                        size="icon"
                        title="Tahrirlash"
                        onClick={() => {
                          setSelectedId(p.id);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit size={14} />
                      </EntButton>
                      {status === ProductStatus.REJECTED ? (
                        <EntButton
                          size="icon"
                          title="Tasdiqlash"
                          onClick={() =>
                            statusMu.mutate({
                              id: p.id,
                              s: ProductStatus.APPROVED,
                            })
                          }
                        >
                          <CheckCircle
                            size={14}
                            style={{ color: "var(--ent-success)" }}
                          />
                        </EntButton>
                      ) : (
                        <EntButton
                          size="icon"
                          title="Rad etish"
                          onClick={() =>
                            statusMu.mutate({
                              id: p.id,
                              s: ProductStatus.REJECTED,
                            })
                          }
                        >
                          <XCircle
                            size={14}
                            style={{ color: "var(--ent-warn)" }}
                          />
                        </EntButton>
                      )}
                      <EntButton
                        size="icon"
                        variant="danger"
                        title="O'chirish"
                        onClick={() => setConfirmDel(p)}
                      >
                        <Trash2 size={14} />
                      </EntButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </EntTable>
      </EntTableWrap>

      {pagination && (
        <EntPagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onChange={setPage}
        />
      )}

      <EditProductModal
        id={selectedId}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedId(null);
        }}
        onSave={(data: FormData) => {
          if (selectedId) updateMu.mutate({ id: selectedId, data });
        }}
      />

      <ViewProductModal
        product={selectedProduct}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
      />

      <PosterPreviewDialog
        poster={preview?.poster ?? null}
        caption={preview?.caption}
        onClose={() => setPreview(null)}
      />

      <EntConfirmDialog
        open={!!confirmDel}
        title="Mahsulotni o'chirish"
        variant="danger"
        confirmLabel="O'chirish"
        busy={deleteMu.isPending}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && deleteMu.mutate(confirmDel.id as any)}
        message={
          <>
            <strong>"{confirmDel?.name}"</strong> mahsulotini o'chirishni
            xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
          </>
        }
      />
    </EntPage>
  );
}
