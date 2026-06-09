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
import { useDebounce } from "@/hooks/use-debounce";
import { ICategory, ProductStatus } from "@/interface";
import { fetchMyUploads } from "@/service/operator";
import {
  deleteProduct,
  regeneratePoster,
  updateProduct,
} from "@/service/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, RefreshCw, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { EditProductModal } from "../products/EditProductModal";

const LIMIT = 25;

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

export function MyUploadsPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);
  const debounced = useDebounce(search, 350);
  const navigate = useNavigate();

  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ id: number; name: string } | null>(
    null,
  );

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({ search: debounced, page, limit: LIMIT }),
    [debounced, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["my-uploads", filters],
    queryFn: () => fetchMyUploads(page, LIMIT, debounced),
  });

  const updateMu = useMutation({
    mutationFn: (args: { id: number; data: FormData }) =>
      updateProduct(args.id, args.data),
    onSuccess: () => {
      toast.success("Yangilandi");
      qc.invalidateQueries({ queryKey: ["my-uploads"] });
      setEditId(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Yangilashda xato"),
  });

  const deleteMu = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("O'chirildi");
      qc.invalidateQueries({ queryKey: ["my-uploads"] });
      setConfirmDel(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "O'chirishda xato"),
  });

  const [regenIds, setRegenIds] = useState<Set<number>>(new Set());
  const regenMu = useMutation({
    mutationFn: regeneratePoster,
    onMutate: (id: number) =>
      setRegenIds((prev) => new Set(prev).add(id)),
    onSettled: (_, __, id) =>
      setRegenIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }),
    onSuccess: () => {
      toast.success("Poster qayta yaratildi");
      qc.invalidateQueries({ queryKey: ["my-uploads"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Yaratishda xato"),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Mening yuklaganlarim"
        actions={
          <>
            <EntButton onClick={() => refetch()}>
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton
              variant="primary"
              onClick={() => navigate("/products/upload")}
            >
              <Upload size={14} /> Yangi yuklash
            </EntButton>
          </>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="nom / muallif / UDK"
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
              <th style={{ width: 90 }}>UDK</th>
              <th style={{ width: 110 }}>Holat</th>
              <th style={{ width: 110 }}>Sana</th>
              <th style={{ width: 90 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="ent-empty">
                  Siz hali hech qanday kitob yuklamagansiz
                </td>
              </tr>
            ) : (
              items.map((p: any, idx) => {
                const cat = p.category as ICategory | undefined;
                return (
                  <tr key={p.id}>
                    <td className="ent-cell--num ent-muted">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td>
                      {p.poster ? (
                        <img
                          src={p.poster}
                          alt=""
                          style={{
                            width: 32,
                            height: 44,
                            objectFit: "cover",
                            border: "1px solid var(--ent-border)",
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
                    <td className="ent-muted">{cat?.name || "—"}</td>
                    <td className="ent-cell--code">
                      {p.shelfCode || <span className="ent-muted">—</span>}
                    </td>
                    <td className="ent-cell--code">
                      {p.udc || <span className="ent-muted">—</span>}
                    </td>
                    <td>
                      {p.status === ProductStatus.APPROVED ? (
                        <EntBadge variant="success">Tasdiqlangan</EntBadge>
                      ) : (
                        <EntBadge variant="danger">Rad etilgan</EntBadge>
                      )}
                    </td>
                    <td className="ent-cell--code ent-muted">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <EntButton
                          size="icon"
                          title={
                            p.poster
                              ? "Posterni qayta yaratish"
                              : "PDF'dan poster yaratish"
                          }
                          disabled={regenIds.has(p.id)}
                          onClick={() => regenMu.mutate(p.id)}
                        >
                          <ImagePlus size={14} />
                        </EntButton>
                        <EntButton
                          size="icon"
                          title="Tahrirlash"
                          onClick={() => setEditId(p.id)}
                        >
                          <Pencil size={14} />
                        </EntButton>
                        <EntButton
                          size="icon"
                          variant="danger"
                          title="O'chirish"
                          onClick={() =>
                            setConfirmDel({ id: p.id, name: p.name })
                          }
                        >
                          <Trash2 size={14} />
                        </EntButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </EntTable>
      </EntTableWrap>

      {pagination && (
        <EntPagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={LIMIT}
          onChange={(p) => setParam("page", String(p))}
        />
      )}

      <EditProductModal
        id={editId}
        isOpen={editId !== null}
        onClose={() => setEditId(null)}
        onSave={(data) => {
          if (editId !== null) updateMu.mutate({ id: editId, data });
        }}
      />

      <EntConfirmDialog
        open={!!confirmDel}
        title="Kitobni o'chirish"
        variant="danger"
        confirmLabel="O'chirish"
        busy={deleteMu.isPending}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && deleteMu.mutate(confirmDel.id)}
        message={
          <>
            <strong>{confirmDel?.name}</strong>ni o'chirishni xohlaysizmi? Bu
            amalni qaytarib bo'lmaydi.
          </>
        }
      />
    </EntPage>
  );
}

export default MyUploadsPage;
