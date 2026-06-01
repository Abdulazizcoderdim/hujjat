import {
  EntBadge,
  EntButton,
  EntEmpty,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntSelect,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { PosterPreviewDialog } from "@/components/enterprise/PosterPreviewDialog";
import $api from "@/http/axios";
import { ICategory } from "@/interface";
import { fetchCatalog } from "@/service/library";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LendDialog } from "./LendDialog";

const LIMIT = 25;

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const shelfCode = params.get("shelfCode") ?? "";
  const udc = params.get("udc") ?? "";
  const availability =
    (params.get("availability") as "all" | "available" | "borrowed") ?? "all";
  const categoryParam = params.get("category") ?? "";
  const page = Number(params.get("page") ?? 1);

  const [lendTarget, setLendTarget] = useState<{
    id: number;
    name: string;
    author?: string;
    shelfCode?: string;
  } | null>(null);
  const [preview, setPreview] = useState<{
    poster: string;
    caption: string;
  } | null>(null);

  const setParam = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "" || value === "all") next.delete(key);
    else next.set(key, String(value));
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const { data: categories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () =>
      (await $api.get("/categories", { params: { limit: 100 } })).data,
  });

  const filters = useMemo(
    () => ({
      search,
      shelfCode,
      udc,
      availability,
      category: categoryParam ? Number(categoryParam) : undefined,
      page,
      limit: LIMIT,
    }),
    [search, shelfCode, udc, availability, categoryParam, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["library-catalog", filters],
    queryFn: () => fetchCatalog(filters),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Kutubxona katalogi"
        actions={
          <>
            <EntButton onClick={() => refetch()}>↻ Yangilash</EntButton>
          </>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="nom / muallif / shifr"
            style={{ width: 240 }}
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
        <EntFilterField label="Holat">
          <EntSelect
            value={availability}
            onChange={(e) => setParam("availability", e.target.value)}
          >
            <option value="all">Hammasi</option>
            <option value="available">Mavjud</option>
            <option value="borrowed">Olingan</option>
          </EntSelect>
        </EntFilterField>
        <EntFilterField label="Kategoriya">
          <EntSelect
            value={categoryParam}
            onChange={(e) => setParam("category", e.target.value)}
          >
            <option value="">Hammasi</option>
            {categories?.items?.map((c: ICategory) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </EntSelect>
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
              <th style={{ width: 110 }}>Shifr</th>
              <th style={{ width: 90 }}>UDK</th>
              <th style={{ width: 130 }}>Kategoriya</th>
              <th style={{ width: 70 }}>Yil</th>
              <th style={{ width: 110 }}>Holat</th>
              <th style={{ width: 160 }}>Amallar</th>
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
                  Yozuv topilmadi
                </td>
              </tr>
            ) : (
              items.map((p, idx) => {
                const num = (page - 1) * LIMIT + idx + 1;
                const cat = p.category as ICategory | undefined;
                const borrowed = !p.isAvailable && p.activeLoan;
                return (
                  <tr key={p.id}>
                    <td className="ent-cell--num ent-muted">{num}</td>
                    <td>
                      {p.poster ? (
                        <img
                          src={p.poster}
                          alt=""
                          title="Rasmni kattalashtirish uchun bosing"
                          onClick={() =>
                            setPreview({
                              poster: p.poster!,
                              caption: p.name,
                            })
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
                    <td title={p.name} style={{ fontWeight: 500 }}>
                      {p.name}
                    </td>
                    <td className="ent-muted">{p.author || "—"}</td>
                    <td className="ent-cell--code">
                      {p.shelfCode || (
                        <span className="ent-muted">—</span>
                      )}
                    </td>
                    <td className="ent-cell--code">
                      {(p as any).udc || (
                        <span className="ent-muted">—</span>
                      )}
                    </td>
                    <td className="ent-muted">{cat?.name || "—"}</td>
                    <td className="ent-cell--num">
                      {p.year || <span className="ent-muted">—</span>}
                    </td>
                    <td>
                      {p.isAvailable ? (
                        <EntBadge variant="success">Mavjud</EntBadge>
                      ) : (
                        <EntBadge
                          variant="danger"
                          title={
                            borrowed
                              ? `${p.activeLoan?.user?.full_name ?? ""}\n${formatDate(p.activeLoan?.dueAt)}`
                              : undefined
                          }
                        >
                          Olingan
                        </EntBadge>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <EntButton
                          size="xs"
                          variant={p.isAvailable ? "primary" : "default"}
                          disabled={!p.isAvailable}
                          onClick={() =>
                            setLendTarget({
                              id: p.id,
                              name: p.name,
                              author: p.author,
                              shelfCode: p.shelfCode,
                            })
                          }
                          title={
                            p.isAvailable
                              ? "Talabaga berish"
                              : "Hozir olingan"
                          }
                        >
                          Berish
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
          onChange={(p) => setParam("page", p)}
        />
      )}

      <LendDialog
        product={lendTarget}
        onClose={(success) => {
          setLendTarget(null);
          if (success) refetch();
        }}
      />

      <PosterPreviewDialog
        poster={preview?.poster ?? null}
        caption={preview?.caption}
        onClose={() => setPreview(null)}
      />
    </EntPage>
  );
}

export default CatalogPage;
