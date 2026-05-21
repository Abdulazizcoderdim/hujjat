import {
  EntBadge,
  EntButton,
  EntDialog,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntTab,
  EntTable,
  EntTableWrap,
  EntTabs,
  EntToolbar,
} from "@/components/enterprise";
import { PosterPreviewDialog } from "@/components/enterprise/PosterPreviewDialog";
import { useDebounce } from "@/hooks/use-debounce";
import { ILoan } from "@/interface";
import { fetchLoans, returnLoan } from "@/service/library";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const LIMIT = 25;
type Tab = "active" | "overdue" | "returned" | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "active", label: "Faol" },
  { value: "overdue", label: "Muddati o'tgan" },
  { value: "returned", label: "Qaytarilgan" },
  { value: "all", label: "Hammasi" },
];

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const daysLeft = (dueIso: string) => {
  const diff = new Date(dueIso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export function LoansPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "active";
  const search = params.get("search") ?? "";
  const debounced = useDebounce(search, 350);
  const page = Number(params.get("page") ?? 1);
  const qc = useQueryClient();
  const [noteLoan, setNoteLoan] = useState<ILoan | null>(null);
  const [preview, setPreview] = useState<{
    poster: string;
    caption: string;
  } | null>(null);

  const setParam = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({ status: tab, search: debounced, page, limit: LIMIT }),
    [tab, debounced, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["loans", filters],
    queryFn: () => fetchLoans(filters),
  });

  const returnMu = useMutation({
    mutationFn: returnLoan,
    onSuccess: () => {
      toast.success("Kitob qaytarib olindi");
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["library-catalog"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <EntPage>
      <EntToolbar
        title="Qarzlar"
        actions={<EntButton onClick={() => refetch()}>↻ Yangilash</EntButton>}
      />

      <EntTabs>
        {TABS.map((t) => (
          <EntTab
            key={t.value}
            active={tab === t.value}
            onClick={() => setParam("tab", t.value === "active" ? null : t.value)}
          >
            {t.label}
          </EntTab>
        ))}
      </EntTabs>

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="kitob / talaba / shifr / talabalik raq."
            style={{ width: 320 }}
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
              <th>Kitob</th>
              <th style={{ width: 110 }}>Shifr</th>
              <th style={{ width: 220 }}>Talaba</th>
              <th style={{ width: 100 }}>Berilgan</th>
              <th style={{ width: 100 }}>Qaytarish</th>
              <th style={{ width: 100 }}>Holat</th>
              <th style={{ width: 100 }}>Qaytarilgan</th>
              <th style={{ width: 140 }}>Kutubxonachi</th>
              <th style={{ width: 160 }}>Izoh</th>
              <th style={{ width: 110 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={11} className="ent-empty">
                  Yozuv yo'q
                </td>
              </tr>
            ) : (
              items.map((loan, idx) => {
                const num = (page - 1) * LIMIT + idx + 1;
                const isActive = loan.status === "active";
                const isReturned = loan.status === "returned";
                const days = daysLeft(loan.dueAt);
                let statusEl;
                if (isReturned) {
                  statusEl = <EntBadge variant="muted">Qaytarildi</EntBadge>;
                } else if (isActive && days < 0) {
                  statusEl = (
                    <EntBadge variant="danger">
                      Kechikkan ({Math.abs(days)} kun)
                    </EntBadge>
                  );
                } else if (isActive && days <= 3) {
                  statusEl = (
                    <EntBadge variant="warn">
                      {days === 0 ? "Bugun" : `${days} kun`}
                    </EntBadge>
                  );
                } else if (isActive) {
                  statusEl = (
                    <EntBadge variant="success">{days} kun</EntBadge>
                  );
                } else {
                  statusEl = <EntBadge>{loan.status}</EntBadge>;
                }
                return (
                  <tr key={loan.id}>
                    <td className="ent-cell--num ent-muted">{num}</td>
                    <td title={loan.product?.name}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {loan.product?.poster ? (
                          <img
                            src={loan.product.poster}
                            alt=""
                            title="Rasmni kattalashtirish uchun bosing"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreview({
                                poster: loan.product!.poster!,
                                caption: loan.product!.name,
                              });
                            }}
                            style={{
                              width: 28,
                              height: 38,
                              objectFit: "cover",
                              border: "1px solid var(--ent-border)",
                              cursor: "zoom-in",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 38,
                              background: "var(--ent-bg)",
                              border: "1px solid var(--ent-border)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {loan.product?.name}
                          </div>
                          {loan.product?.author && (
                            <div
                              className="ent-muted"
                              style={{
                                fontSize: 11,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {loan.product.author}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="ent-cell--code">
                      {loan.product?.shelfCode || (
                        <span className="ent-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {loan.user?.full_name}
                      </div>
                      <div
                        className="ent-muted"
                        style={{ fontSize: 11 }}
                      >
                        {loan.user?.student_id_number || loan.user?.login} ·{" "}
                        {loan.user?.group || "—"}
                      </div>
                    </td>
                    <td className="ent-cell--code">
                      {formatDate(loan.borrowedAt)}
                    </td>
                    <td className="ent-cell--code">
                      {formatDate(loan.dueAt)}
                    </td>
                    <td>{statusEl}</td>
                    <td className="ent-cell--code ent-muted">
                      {formatDate(loan.returnedAt)}
                    </td>
                    <td className="ent-muted">
                      {loan.librarian?.full_name || "—"}
                    </td>
                    <td>
                      {loan.notes ? (
                        <button
                          type="button"
                          onClick={() => setNoteLoan(loan)}
                          title={loan.notes}
                          style={{
                            background: "transparent",
                            border: 0,
                            padding: 0,
                            cursor: "pointer",
                            color: "var(--ent-accent)",
                            textAlign: "left",
                            font: "inherit",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          📝 {loan.notes}
                        </button>
                      ) : (
                        <span className="ent-muted">—</span>
                      )}
                    </td>
                    <td>
                      {isActive ? (
                        <EntButton
                          size="xs"
                          variant="primary"
                          disabled={returnMu.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `"${loan.product?.name}" qaytarib olinsinmi?`,
                              )
                            )
                              returnMu.mutate(loan.id);
                          }}
                        >
                          Qaytarildi
                        </EntButton>
                      ) : (
                        <span className="ent-muted">—</span>
                      )}
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

      <EntDialog
        open={!!noteLoan}
        onClose={() => setNoteLoan(null)}
        title="Qarz izohi"
        width={520}
        footer={
          <EntButton onClick={() => setNoteLoan(null)}>Yopish</EntButton>
        }
      >
        {noteLoan && (
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--ent-text-muted)",
                marginBottom: 6,
              }}
            >
              <strong>{noteLoan.product?.name}</strong>
              {noteLoan.user?.full_name && (
                <> · {noteLoan.user.full_name}</>
              )}
            </div>
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                border: "1px solid var(--ent-border)",
                background: "var(--ent-surface-alt)",
                padding: 10,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {noteLoan.notes}
            </div>
          </div>
        )}
      </EntDialog>

      <PosterPreviewDialog
        poster={preview?.poster ?? null}
        caption={preview?.caption}
        onClose={() => setPreview(null)}
      />
    </EntPage>
  );
}

export default LoansPage;
