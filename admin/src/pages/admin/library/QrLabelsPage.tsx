import {
  QrPreviewDialog,
  QrPreviewProduct,
} from "@/components/admin/QrPreviewDialog";
import {
  EntBadge,
  EntButton,
  EntCard,
  EntCheckbox,
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
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import $api from "@/http/axios";
import { ICategory } from "@/interface";
import { fetchCatalog } from "@/service/library";
import { downloadLabelsPdf } from "@/service/qr";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Printer, QrCode, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const LIMIT = 50;
const LABELS_PER_PAGE = 24; // A4: 3 × 8

export function QrLabelsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const categoryParam = params.get("category") ?? "";
  const pageParam = Number(params.get("page") ?? 1);
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1;
  const debounced = useDebounce(search, 350);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cutLines, setCutLines] = useState(true);
  const [busy, setBusy] = useState<"selected" | "all" | null>(null);
  const [qrProduct, setQrProduct] = useState<QrPreviewProduct | null>(null);

  const setParam = (k: string, v: string | number | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "") next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const { data: categories } = useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => (await $api.get("/categories/all")).data,
  });

  const filters = useMemo(
    () => ({
      search: debounced,
      category: categoryParam ? Number(categoryParam) : undefined,
      page,
      limit: LIMIT,
    }),
    [debounced, categoryParam, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["qr-labels-books", filters],
    queryFn: () => fetchCatalog(filters),
    placeholderData: (p) => p,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;

  const pageIds = items.map((p) => p.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const togglePage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };
  const toggleOne = (id: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });

  const download = async (mode: "selected" | "all") => {
    setBusy(mode);
    try {
      if (mode === "selected") {
        await downloadLabelsPdf({ ids: Array.from(selected), cutLines });
      } else {
        await downloadLabelsPdf({
          all: true,
          category: filters.category,
          search: filters.search,
          cutLines,
        });
      }
      toast({ title: "PDF tayyor — yuklab olindi" });
    } catch (err: any) {
      toast({
        title: "Xato",
        description:
          err?.response?.status === 400
            ? "Yorliq uchun kitob topilmadi"
            : "PDF yaratishda xato",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const sheets = (n: number) => Math.ceil(n / LABELS_PER_PAGE);

  return (
    <EntPage>
      <EntToolbar
        title="QR yorliqlar"
        actions={
          <>
            <EntButton onClick={() => refetch()}>
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton
              disabled={selected.size === 0 || busy !== null}
              onClick={() => download("selected")}
              title="Belgilangan kitoblar uchun A4 yorliqlar PDF"
            >
              <FileDown size={14} />
              {busy === "selected"
                ? "Tayyorlanmoqda..."
                : `Tanlanganlar PDF (${selected.size})`}
            </EntButton>
            <EntButton
              variant="primary"
              disabled={total === 0 || busy !== null}
              onClick={() => download("all")}
              title="Filtrga mos barcha kitoblar (maks. 500 ta)"
            >
              <Printer size={14} />
              {busy === "all"
                ? "Tayyorlanmoqda..."
                : `Filtrdagi hammasi PDF (${Math.min(total, 500)})`}
            </EntButton>
          </>
        }
      />

      <div style={{ padding: "0 6px" }}>
        <EntCard
          title={
            <span
              style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
            >
              <QrCode size={13} /> Qanday ishlaydi
            </span>
          }
        >
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            Har kitob uchun QR-kod yasaladi; skanerlanganda talaba saytida
            kitobning elektron ko'rinishi ochiladi. PDF — <b>A4, 3 × 8 = 24
            yorliq/varaq</b> (70 × 37 mm sticker qog'oziga mos). Kitoblarni
            belgilab yoki filtr bo'yicha hammasini bir PDF qilib chiqaring,
            chop etib kitobga yopishtiring.
            <div style={{ marginTop: 6 }}>
              <EntCheckbox
                checked={cutLines}
                onChange={setCutLines}
                label="Kesish chiziqlarini chizish (sticker qog'ozida o'chiring)"
              />
            </div>
          </div>
        </EntCard>
      </div>

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="nom / muallif / shifr"
            style={{ width: 260 }}
          />
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
        <div
          style={{ marginLeft: "auto", display: "flex", gap: 10, fontSize: 12 }}
          className="ent-muted"
        >
          {selected.size > 0 && (
            <span>
              Tanlangan: <b>{selected.size}</b> ta → {sheets(selected.size)}{" "}
              varaq
              {" · "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setSelected(new Set());
                }}
                style={{ color: "var(--ent-accent)" }}
              >
                tozalash
              </a>
            </span>
          )}
          <span>
            Filtrda: <b>{total}</b> ta → {sheets(Math.min(total, 500))} varaq
          </span>
          {isFetching && <span>yuklanmoqda...</span>}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <EntCheckbox
                  checked={allOnPageSelected}
                  onChange={togglePage}
                />
              </th>
              <th style={{ width: 60 }}>ID</th>
              <th style={{ width: 50 }}>Poster</th>
              <th>Nom</th>
              <th style={{ width: 180 }}>Muallif</th>
              <th style={{ width: 130 }}>Kategoriya</th>
              <th style={{ width: 100 }}>Shifr</th>
              <th style={{ width: 90 }}>UDK</th>
              <th style={{ width: 70 }}>QR</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="ent-empty">
                  Kitob topilmadi
                </td>
              </tr>
            ) : (
              items.map((p) => {
                const cat = p.category as ICategory | undefined;
                const checked = selected.has(p.id);
                return (
                  <tr
                    key={p.id}
                    style={checked ? { background: "var(--ent-accent-soft)" } : undefined}
                  >
                    <td>
                      <EntCheckbox
                        checked={checked}
                        onChange={(v) => toggleOne(p.id, v)}
                      />
                    </td>
                    <td className="ent-cell--code ent-muted">#{p.id}</td>
                    <td>
                      {p.poster ? (
                        <img
                          src={p.poster}
                          alt=""
                          style={{
                            width: 28,
                            height: 38,
                            objectFit: "cover",
                            border: "1px solid var(--ent-border)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 28,
                            height: 38,
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
                    <td>
                      <EntButton
                        size="icon"
                        title="QR-kodni ko'rish"
                        onClick={() =>
                          setQrProduct({
                            id: p.id,
                            name: p.name,
                            author: p.author,
                            shelfCode: p.shelfCode,
                            udc: (p as any).udc,
                            qrScanCount: (p as any).qrScanCount,
                          })
                        }
                      >
                        <QrCode size={14} />
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

      {selected.size > 0 && (
        <div style={{ padding: "0 6px 6px" }}>
          <EntBadge variant="muted">
            Tanlov sahifalar bo'ylab saqlanadi — keyingi sahifadan ham qo'shishingiz
            mumkin
          </EntBadge>
        </div>
      )}

      <QrPreviewDialog product={qrProduct} onClose={() => setQrProduct(null)} />
    </EntPage>
  );
}

export default QrLabelsPage;
