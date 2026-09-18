import {
  EntBadge,
  EntButton,
  EntDialog,
  EntFilterBar,
  EntFilterField,
  EntInput,
  EntPage,
  EntPagination,
  EntStatCard,
  EntTab,
  EntTabs,
  EntTable,
  EntTableWrap,
  EntTextarea,
  EntToolbar,
} from "@/components/enterprise";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { IAdminBookReview, ReviewStatus } from "@/interface";
import {
  approveReview,
  deleteReview,
  fetchAdminReviews,
  fetchReviewStats,
  rejectReview,
} from "@/service/bookReviews";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const LIMIT = 20;

type TabKey = "pending" | "approved" | "rejected" | "all";

const fmtDate = (iso?: string | Date | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Stars = ({ value }: { value: number }) => (
  <span
    className="inline-flex items-center gap-0.5"
    aria-label={`${value} yulduz`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={
          i < value ? "text-amber-500 fill-amber-500" : "text-amber-300/50"
        }
        strokeWidth={1.5}
      />
    ))}
  </span>
);

const statusBadge = (s: ReviewStatus) => {
  switch (s) {
    case ReviewStatus.PENDING:
      return <EntBadge variant="default">Kutilmoqda</EntBadge>;
    case ReviewStatus.APPROVED:
      return <EntBadge variant="success">Tasdiqlangan</EntBadge>;
    case ReviewStatus.REJECTED:
      return <EntBadge variant="danger">Rad etilgan</EntBadge>;
  }
};

export function ReviewsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = ((): TabKey => {
    const t = params.get("tab");
    if (
      t === "pending" ||
      t === "approved" ||
      t === "rejected" ||
      t === "all"
    )
      return t;
    return "pending";
  })();
  const search = params.get("search") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const debounced = useDebounce(search, 350);

  const [viewing, setViewing] = useState<IAdminBookReview | null>(null);
  const [rejecting, setRejecting] = useState<IAdminBookReview | null>(null);
  const [confirmDel, setConfirmDel] = useState<IAdminBookReview | null>(null);
  const [modNote, setModNote] = useState("");

  const setParam = (k: string, v: string | number | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === "") next.delete(k);
    else next.set(k, String(v));
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const status: ReviewStatus | "all" =
    tab === "all" ? "all" : (tab as ReviewStatus);

  const filters = useMemo(
    () => ({ status, search: debounced, page, limit: LIMIT }),
    [status, debounced, page],
  );

  const statsQ = useQuery({
    queryKey: ["reviews-stats"],
    queryFn: fetchReviewStats,
    staleTime: 30_000,
  });

  const listQ = useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () => fetchAdminReviews(filters),
    placeholderData: (p) => p,
  });

  const items = listQ.data?.items ?? [];
  const pagination = listQ.data?.pagination;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews-stats"] });
    qc.invalidateQueries({ queryKey: ["reviews-pending-count"] });
  };

  const approveMu = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      toast({ title: "Tasdiqlandi" });
      invalidate();
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Tasdiqlashda xato",
        variant: "destructive",
      }),
  });

  const rejectMu = useMutation({
    mutationFn: (args: { id: number; modNote: string }) =>
      rejectReview(args.id, args.modNote),
    onSuccess: () => {
      toast({ title: "Rad etildi" });
      setRejecting(null);
      setModNote("");
      invalidate();
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "Rad etishda xato",
        variant: "destructive",
      }),
  });

  const deleteMu = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast({ title: "O'chirildi" });
      setConfirmDel(null);
      invalidate();
    },
    onError: (err: any) =>
      toast({
        title: "Xato",
        description: err?.response?.data?.message || "O'chirishda xato",
        variant: "destructive",
      }),
  });

  return (
    <EntPage>
      <EntToolbar
        title="Kitob sharhlari"
        actions={
          <EntButton onClick={() => listQ.refetch()}>
            <RefreshCw size={14} /> Yangilash
          </EntButton>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
          padding: "0 6px",
        }}
      >
        <EntStatCard label="Jami" value={statsQ.data?.total ?? 0} />
        <EntStatCard label="Kutilmoqda" value={statsQ.data?.pending ?? 0} />
        <EntStatCard
          label="Tasdiqlangan"
          value={statsQ.data?.approved ?? 0}
        />
        <EntStatCard label="Rad etilgan" value={statsQ.data?.rejected ?? 0} />
      </div>

      <EntTabs>
        <EntTab
          active={tab === "pending"}
          onClick={() => setParam("tab", "pending")}
        >
          Kutilmoqda
        </EntTab>
        <EntTab
          active={tab === "approved"}
          onClick={() => setParam("tab", "approved")}
        >
          Tasdiqlangan
        </EntTab>
        <EntTab
          active={tab === "rejected"}
          onClick={() => setParam("tab", "rejected")}
        >
          Rad etilgan
        </EntTab>
        <EntTab active={tab === "all"} onClick={() => setParam("tab", "all")}>
          Hammasi
        </EntTab>
      </EntTabs>

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="kitob nomi, talaba ismi, matn"
            style={{ width: 320 }}
          />
        </EntFilterField>
        <div style={{ marginLeft: "auto" }} className="ent-muted">
          {listQ.isFetching && "yuklanmoqda..."}
        </div>
      </EntFilterBar>

      <EntTableWrap style={{ flex: 1, minHeight: 0 }}>
        <EntTable>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th style={{ width: 240 }}>Kitob</th>
              <th style={{ width: 180 }}>Talaba</th>
              <th style={{ width: 100 }}>Ball</th>
              <th>Sharh</th>
              <th style={{ width: 110 }}>Sana</th>
              <th style={{ width: 110 }}>Holat</th>
              <th style={{ width: 140 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {listQ.isLoading ? (
              <tr>
                <td colSpan={8} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="ent-empty">
                  Sharh topilmadi
                </td>
              </tr>
            ) : (
              items.map((r, idx) => (
                <tr key={r.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      {r.product?.poster ? (
                        <img
                          src={r.product.poster}
                          alt=""
                          style={{
                            width: 24,
                            height: 32,
                            objectFit: "cover",
                            border: "1px solid var(--ent-border)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 24,
                            height: 32,
                            background: "var(--ent-bg)",
                            border: "1px solid var(--ent-border)",
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
                          title={r.product?.name}
                        >
                          {r.product?.name ?? "—"}
                        </div>
                        {r.product?.author && (
                          <div className="ent-muted" style={{ fontSize: 11 }}>
                            {r.product.author}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>
                      {r.reviewer?.full_name ?? (
                        <span className="ent-muted">O'chirilgan</span>
                      )}
                    </div>
                    {r.reviewer?.email && (
                      <div className="ent-muted" style={{ fontSize: 11 }}>
                        {r.reviewer.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <Stars value={r.rating} />
                  </td>
                  <td
                    title={r.comment}
                    style={{
                      maxWidth: 360,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 12,
                    }}
                  >
                    {r.comment}
                  </td>
                  <td className="ent-cell--code ent-muted">
                    {fmtDate(r.createdAt)}
                  </td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EntButton
                        size="icon"
                        title="To'liq ko'rish"
                        onClick={() => setViewing(r)}
                      >
                        <Eye size={14} />
                      </EntButton>
                      {r.status !== ReviewStatus.APPROVED && (
                        <EntButton
                          size="icon"
                          variant="primary"
                          title="Tasdiqlash"
                          disabled={approveMu.isPending}
                          onClick={() => approveMu.mutate(r.id)}
                        >
                          <CheckCircle2 size={14} />
                        </EntButton>
                      )}
                      {r.status !== ReviewStatus.REJECTED && (
                        <EntButton
                          size="icon"
                          variant="default"
                          title="Rad etish"
                          onClick={() => {
                            setRejecting(r);
                            setModNote(r.modNote ?? "");
                          }}
                        >
                          <XCircle size={14} />
                        </EntButton>
                      )}
                      <EntButton
                        size="icon"
                        variant="danger"
                        title="O'chirish"
                        onClick={() => setConfirmDel(r)}
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
          limit={LIMIT}
          onChange={(p) => setParam("page", p)}
        />
      )}

      {/* View dialog */}
      <EntDialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Sharh"
        width={520}
      >
        {viewing && (
          <div className="ent-stack-y" style={{ fontSize: 13 }}>
            <div>
              <div className="ent-muted" style={{ fontSize: 11 }}>
                Kitob
              </div>
              <div style={{ fontWeight: 600 }}>{viewing.product.name}</div>
            </div>
            <div>
              <div className="ent-muted" style={{ fontSize: 11 }}>
                Talaba
              </div>
              <div>{viewing.reviewer?.full_name ?? "—"}</div>
              {viewing.reviewer?.email && (
                <div className="ent-muted" style={{ fontSize: 11 }}>
                  {viewing.reviewer.email}
                </div>
              )}
            </div>
            <div>
              <div className="ent-muted" style={{ fontSize: 11 }}>
                Ball
              </div>
              <Stars value={viewing.rating} />
            </div>
            <div>
              <div className="ent-muted" style={{ fontSize: 11 }}>
                Sharh matni
              </div>
              <div
                style={{
                  whiteSpace: "pre-line",
                  padding: 8,
                  border: "1px solid var(--ent-border)",
                  background: "var(--ent-bg)",
                  marginTop: 4,
                }}
              >
                {viewing.comment}
              </div>
            </div>
            {viewing.modNote && (
              <div>
                <div className="ent-muted" style={{ fontSize: 11 }}>
                  Admin izohi
                </div>
                <div>{viewing.modNote}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
              <span className="ent-muted">Sana: {fmtDate(viewing.createdAt)}</span>
              {viewing.moderatedAt && (
                <span className="ent-muted">
                  Moderatsiya: {fmtDate(viewing.moderatedAt)}
                </span>
              )}
            </div>
          </div>
        )}
      </EntDialog>

      {/* Reject dialog */}
      <EntDialog
        open={!!rejecting}
        onClose={() => !rejectMu.isPending && setRejecting(null)}
        title="Sharhni rad etish"
        width={460}
        footer={
          <>
            <EntButton
              disabled={rejectMu.isPending}
              onClick={() => setRejecting(null)}
            >
              Bekor qilish
            </EntButton>
            <EntButton
              variant="default"
              disabled={rejectMu.isPending || modNote.trim().length < 3}
              onClick={() =>
                rejecting &&
                rejectMu.mutate({ id: rejecting.id, modNote: modNote.trim() })
              }
            >
              {rejectMu.isPending ? "Saqlanmoqda..." : "Rad etish"}
            </EntButton>
          </>
        }
      >
        <div className="ent-stack-y">
          <div style={{ fontSize: 12, display: "flex", gap: 6 }}>
            <AlertCircle size={14} style={{ color: "var(--ent-warn)" }} />
            <span>
              Talabaga rad etish sababini yozing. U buni o'z profilida ko'radi.
            </span>
          </div>
          <EntTextarea
            rows={4}
            value={modNote}
            onChange={(e) => setModNote(e.target.value)}
            placeholder="So'kinish, spam, mavzuga aloqasiz..."
            disabled={rejectMu.isPending}
            maxLength={500}
          />
        </div>
      </EntDialog>

      {/* Delete confirm */}
      <EntDialog
        open={!!confirmDel}
        onClose={() => !deleteMu.isPending && setConfirmDel(null)}
        title="Sharhni o'chirish"
        width={420}
        footer={
          <>
            <EntButton
              disabled={deleteMu.isPending}
              onClick={() => setConfirmDel(null)}
            >
              Bekor qilish
            </EntButton>
            <EntButton
              variant="danger"
              disabled={deleteMu.isPending}
              onClick={() => confirmDel && deleteMu.mutate(confirmDel.id)}
            >
              {deleteMu.isPending ? "O'chirilmoqda..." : "O'chirish"}
            </EntButton>
          </>
        }
      >
        <div style={{ fontSize: 13 }}>
          <p>
            <strong>{confirmDel?.reviewer?.full_name ?? "Talaba"}</strong>{" "}
            tomonidan yozilgan sharhni butunlay o'chirishni xohlaysizmi?
          </p>
          <p className="ent-muted" style={{ fontSize: 12, marginTop: 4 }}>
            Bu amalni qaytarib bo'lmaydi.
          </p>
        </div>
      </EntDialog>
    </EntPage>
  );
}

export default ReviewsPage;
