import {
  EntBadge,
  EntButton,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { ICategory } from "@/interface";
import { fetchCatalog } from "@/service/library";
import { updateProduct } from "@/service/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { EditProductModal } from "../products/EditProductModal";

const LIMIT = 25;

export function AllBooksPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const shelfCode = params.get("shelfCode") ?? "";
  const udc = params.get("udc") ?? "";
  const pageParam = Number(params.get("page") ?? 1);
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;

  const [editId, setEditId] = useState<number | null>(null);

  const setParam = (k: string, v: string | number | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "" || v === 0) next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({ search, shelfCode, udc, page, limit: LIMIT }),
    [search, shelfCode, udc, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["all-books", filters],
    queryFn: () => fetchCatalog(filters),
  });

  const updateMu = useMutation({
    mutationFn: (args: { id: number; data: FormData }) =>
      updateProduct(args.id, args.data),
    onSuccess: () => {
      toast.success("Yangilandi");
      qc.invalidateQueries({ queryKey: ["all-books"] });
      setEditId(null);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Yangilashda xato"),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Barcha kitoblar"
        actions={
          <EntButton onClick={() => refetch()}>
            <RefreshCw size={14} /> Yangilash
          </EntButton>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="nom / muallif / shifr"
            style={{ width: 280 }}
          />
        </EntFilterField>
        <EntFilterField label="Javon raqami">
          <EntInput
            mono
            value={shelfCode}
            onChange={(e) => setParam("shelfCode", e.target.value)}
            placeholder="728.4"
            style={{ width: 140 }}
          />
        </EntFilterField>
        <EntFilterField label="UDK">
          <EntInput
            mono
            value={udc}
            onChange={(e) => setParam("udc", e.target.value)}
            placeholder="04.34"
            style={{ width: 120 }}
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
              <th style={{ width: 70 }}>Yil</th>
              <th style={{ width: 110 }}>Holat</th>
              <th style={{ width: 70 }}>Amallar</th>
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
                  Kitob topilmadi
                </td>
              </tr>
            ) : (
              items.map((p, idx) => {
                const num = (page - 1) * LIMIT + idx + 1;
                const cat = p.category as ICategory | undefined;
                return (
                  <tr key={p.id}>
                    <td className="ent-cell--num ent-muted">{num}</td>
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
                    <td title={p.name} style={{ fontWeight: 500 }}>
                      {p.name}
                    </td>
                    <td className="ent-muted">{p.author || "—"}</td>
                    <td className="ent-muted">{cat?.name || "—"}</td>
                    <td className="ent-cell--code">
                      {p.shelfCode || <span className="ent-muted">—</span>}
                    </td>
                    <td className="ent-cell--code">
                      {(p as any).udc || <span className="ent-muted">—</span>}
                    </td>
                    <td className="ent-cell--num">
                      {p.year || <span className="ent-muted">—</span>}
                    </td>
                    <td>
                      {p.isAvailable ? (
                        <EntBadge variant="success">Mavjud</EntBadge>
                      ) : (
                        <EntBadge variant="danger">Olingan</EntBadge>
                      )}
                    </td>
                    <td>
                      <EntButton
                        size="icon"
                        title="Tahrirlash (o'quv reja qo'shish)"
                        onClick={() => setEditId(p.id)}
                      >
                        <Pencil size={14} />
                      </EntButton>
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
          onChange={(p) => setParam("page", p)}
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
    </EntPage>
  );
}

export default AllBooksPage;
