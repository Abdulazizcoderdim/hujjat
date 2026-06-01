import {
  EntBadge,
  EntButton,
  EntCard,
  EntDialog,
  EntField,
  EntFilterBar,
  EntFilterField,
  EntGrid,
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
import { SearchableSelect } from "@/components/SearchableSelect";
import { useDebounce } from "@/hooks/use-debounce";
import $api from "@/http/axios";
import { BookRequestStatus, IBookRequest, IProduct, ICategory } from "@/interface";
import {
  approveRequest,
  fetchBookRequests,
  fetchBookRequestStats,
  fulfillRequest,
  rejectRequest,
} from "@/service/bookRequests";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Info,
  PackageCheck,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const LIMIT = 25;

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadge = (s: BookRequestStatus) => {
  switch (s) {
    case "pending":
      return <EntBadge variant="warn">Kutilmoqda</EntBadge>;
    case "approved":
      return <EntBadge variant="success">Tasdiqlangan</EntBadge>;
    case "rejected":
      return <EntBadge variant="danger">Rad etilgan</EntBadge>;
    case "fulfilled":
      return (
        <EntBadge variant="success">
          <PackageCheck size={11} /> Bajarilgan
        </EntBadge>
      );
  }
};

type DialogMode = "approve" | "reject" | "fulfill" | null;

export function RequestsPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as BookRequestStatus | "all") || "all";
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);
  const debounced = useDebounce(search, 350);
  const [detail, setDetail] = useState<IBookRequest | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [adminNote, setAdminNote] = useState("");
  const [productId, setProductId] = useState("");

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      search: debounced,
      page,
      limit: LIMIT,
    }),
    [status, debounced, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["book-requests", "list", filters],
    queryFn: () => fetchBookRequests(filters),
  });

  const statsQ = useQuery({
    queryKey: ["book-requests", "stats"],
    queryFn: fetchBookRequestStats,
  });

  // Search products for fulfill action
  const { data: productsList = [] } = useQuery<IProduct<ICategory>[]>({
    queryKey: ["product-suggestions", detail?.title],
    queryFn: async () => {
      const { data } = await $api.get("/products/books/search", {
        params: { q: detail?.title || "" },
      });
      return data;
    },
    enabled: !!detail?.title && dialogMode === "fulfill",
  });

  const refetchAll = () => {
    refetch();
    statsQ.refetch();
    qc.invalidateQueries({ queryKey: ["book-requests"] });
  };

  const approveMu = useMutation({
    mutationFn: (id: number) => approveRequest(id, adminNote || undefined),
    onSuccess: () => {
      toast.success("So'rov tasdiqlandi");
      closeDialog();
      refetchAll();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const rejectMu = useMutation({
    mutationFn: (id: number) => rejectRequest(id, adminNote),
    onSuccess: () => {
      toast.success("So'rov rad etildi");
      closeDialog();
      refetchAll();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const fulfillMu = useMutation({
    mutationFn: (id: number) =>
      fulfillRequest(id, Number(productId), adminNote || undefined),
    onSuccess: () => {
      toast.success("So'rov bajarilgan deb belgilandi");
      closeDialog();
      refetchAll();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const openDialog = (r: IBookRequest, mode: DialogMode) => {
    setDetail(r);
    setDialogMode(mode);
    setAdminNote("");
    setProductId("");
  };

  const closeDialog = () => {
    setDialogMode(null);
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const stats = statsQ.data;

  return (
    <EntPage>
      <EntToolbar
        title="Kitob so'rovlari"
        actions={
          <EntButton onClick={refetchAll}>
            <RefreshCw size={14} /> Yangilash
          </EntButton>
        }
      />

      <div style={{ padding: 6 }} className="ent-stack-y">
        {/* Stats */}
        <EntGrid cols={4}>
          <EntStatCard
            label="Kutilmoqda"
            value={stats?.byStatus.pending ?? 0}
            delta={
              stats?.recentCount
                ? `+${stats.recentCount} so'nggi 7 kun`
                : undefined
            }
            deltaDir="up"
          />
          <EntStatCard
            label="Tasdiqlangan"
            value={stats?.byStatus.approved ?? 0}
          />
          <EntStatCard label="Rad etilgan" value={stats?.byStatus.rejected ?? 0} />
          <EntStatCard
            label="Bajarilgan"
            value={stats?.byStatus.fulfilled ?? 0}
          />
        </EntGrid>

        {/* Tabs */}
        <EntTabs>
          {(["all", "pending", "approved", "rejected", "fulfilled"] as const).map(
            (s) => (
              <EntTab
                key={s}
                active={status === s}
                onClick={() => setParam("status", s === "all" ? "" : s)}
              >
                {s === "all"
                  ? "Hammasi"
                  : s === "pending"
                    ? "Kutilmoqda"
                    : s === "approved"
                      ? "Tasdiqlangan"
                      : s === "rejected"
                        ? "Rad etilgan"
                        : "Bajarilgan"}
              </EntTab>
            ),
          )}
        </EntTabs>

        <EntFilterBar>
          <EntFilterField label="Qidiruv">
            <EntInput
              value={search}
              onChange={(e) => setParam("search", e.target.value)}
              placeholder="kitob / muallif / talaba"
              style={{ width: 280 }}
            />
          </EntFilterField>
          <div style={{ marginLeft: "auto" }} className="ent-muted">
            {isFetching && "yuklanmoqda..."}
          </div>
        </EntFilterBar>

        <EntTableWrap>
          <EntTable>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th style={{ width: 130 }}>Sana</th>
                <th style={{ width: 220 }}>Talaba</th>
                <th>Kitob</th>
                <th style={{ width: 180 }}>Muallif</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 170 }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="ent-empty">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ent-empty">
                    So'rov topilmadi
                  </td>
                </tr>
              ) : (
                items.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="ent-cell--num ent-muted">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="ent-cell--code">
                      {fmtDateTime(r.createdAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {r.requestedBy?.full_name ||
                          r.requestedBy?.login ||
                          "—"}
                      </div>
                      <div className="ent-muted" style={{ fontSize: 11 }}>
                        {r.requestedBy?.group || "—"}
                        {r.requestedBy?.student_id_number
                          ? ` · ${r.requestedBy.student_id_number}`
                          : ""}
                      </div>
                    </td>
                    <td title={r.title} style={{ fontWeight: 500 }}>
                      {r.title}
                      {r.reason && (
                        <div
                          className="ent-muted"
                          style={{
                            fontSize: 11,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 360,
                          }}
                          title={r.reason}
                        >
                          {r.reason}
                        </div>
                      )}
                    </td>
                    <td className="ent-muted">{r.author || "—"}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <EntButton
                          size="icon"
                          title="Tafsilot"
                          onClick={() => {
                            setDetail(r);
                            setDialogMode("approve");
                            setAdminNote("");
                          }}
                        >
                          <Info size={13} />
                        </EntButton>
                        {r.status === "pending" && (
                          <>
                            <EntButton
                              size="icon"
                              title="Tasdiqlash"
                              onClick={() => openDialog(r, "approve")}
                            >
                              <CheckCircle
                                size={13}
                                style={{ color: "var(--ent-success)" }}
                              />
                            </EntButton>
                            <EntButton
                              size="icon"
                              variant="danger"
                              title="Rad etish"
                              onClick={() => openDialog(r, "reject")}
                            >
                              <XCircle size={13} />
                            </EntButton>
                          </>
                        )}
                        {(r.status === "approved" || r.status === "pending") && (
                          <EntButton
                            size="icon"
                            title="Bajarilgan (kitob qo'shildi)"
                            onClick={() => openDialog(r, "fulfill")}
                          >
                            <PackageCheck
                              size={13}
                              style={{ color: "var(--ent-accent)" }}
                            />
                          </EntButton>
                        )}
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
            onChange={(p) => setParam("page", String(p))}
          />
        )}

        {/* Top tables */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
            }}
          >
            <EntCard title="Top so'ralgan kitoblar" noPadding>
              <EntTableWrap style={{ border: 0 }}>
                <EntTable compact>
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Kitob nomi</th>
                      <th style={{ width: 60 }}>Soni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topRequested.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="ent-empty">
                          Ma'lumot yo'q
                        </td>
                      </tr>
                    ) : (
                      stats.topRequested.map((t, i) => (
                        <tr key={t.titleKey}>
                          <td className="ent-cell--num ent-muted">{i + 1}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{t.title}</div>
                            {t.author && (
                              <div className="ent-muted" style={{ fontSize: 11 }}>
                                {t.author}
                              </div>
                            )}
                          </td>
                          <td className="ent-cell--num">{t.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </EntTable>
              </EntTableWrap>
            </EntCard>

            <EntCard title="Top so'rovchilar" noPadding>
              <EntTableWrap style={{ border: 0 }}>
                <EntTable compact>
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Talaba</th>
                      <th style={{ width: 60 }}>Soni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topRequesters.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="ent-empty">
                          Ma'lumot yo'q
                        </td>
                      </tr>
                    ) : (
                      stats.topRequesters.map((u, i) => (
                        <tr key={u.userId}>
                          <td className="ent-cell--num ent-muted">{i + 1}</td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {u.full_name || u.login}
                            </div>
                            {u.group && (
                              <div className="ent-muted" style={{ fontSize: 11 }}>
                                {u.group}
                              </div>
                            )}
                          </td>
                          <td className="ent-cell--num">{u.count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </EntTable>
              </EntTableWrap>
            </EntCard>
          </div>
        )}
      </div>

      {/* Review dialog */}
      <EntDialog
        open={!!detail && !!dialogMode}
        onClose={closeDialog}
        width={560}
        title={
          dialogMode === "approve"
            ? "So'rovni tasdiqlash"
            : dialogMode === "reject"
              ? "So'rovni rad etish"
              : dialogMode === "fulfill"
                ? "Bajarilgan deb belgilash"
                : "So'rov tafsilotlari"
        }
        footer={
          <>
            <EntButton onClick={closeDialog}>Yopish</EntButton>
            {detail && dialogMode === "approve" && (
              <EntButton
                variant="primary"
                disabled={approveMu.isPending}
                onClick={() => approveMu.mutate(detail.id)}
              >
                {approveMu.isPending ? "Saqlanmoqda..." : "Tasdiqlash"}
              </EntButton>
            )}
            {detail && dialogMode === "reject" && (
              <EntButton
                variant="danger"
                disabled={rejectMu.isPending || !adminNote.trim()}
                onClick={() => rejectMu.mutate(detail.id)}
              >
                {rejectMu.isPending ? "Saqlanmoqda..." : "Rad etish"}
              </EntButton>
            )}
            {detail && dialogMode === "fulfill" && (
              <EntButton
                variant="primary"
                disabled={fulfillMu.isPending || !productId}
                onClick={() => fulfillMu.mutate(detail.id)}
              >
                {fulfillMu.isPending
                  ? "Saqlanmoqda..."
                  : "Bajarilgan deb belgilash"}
              </EntButton>
            )}
          </>
        }
      >
        {detail && (
          <div className="ent-stack-y">
            {/* Request info */}
            <div
              style={{
                background: "var(--ent-bg)",
                border: "1px solid var(--ent-border)",
                padding: 8,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {detail.title}
              </div>
              {detail.author && (
                <div className="ent-muted" style={{ fontSize: 12 }}>
                  {detail.author}
                </div>
              )}
              {detail.description && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {detail.description}
                </div>
              )}
              {detail.reason && (
                <div
                  className="ent-muted"
                  style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}
                >
                  Maqsad: {detail.reason}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 6,
                  fontSize: 11,
                }}
                className="ent-muted"
              >
                <span>
                  Talaba:{" "}
                  <b style={{ color: "var(--ent-text)" }}>
                    {detail.requestedBy?.full_name ||
                      detail.requestedBy?.login}
                  </b>
                </span>
                <span>Sana: {fmtDateTime(detail.createdAt)}</span>
                <span>Status: {statusBadge(detail.status)}</span>
              </div>
              {detail.adminNote && (
                <div
                  style={{
                    marginTop: 6,
                    padding: 6,
                    background: "var(--ent-surface)",
                    border: "1px solid var(--ent-border)",
                    fontSize: 12,
                  }}
                >
                  <div
                    className="ent-muted"
                    style={{ fontSize: 11, marginBottom: 2 }}
                  >
                    Avvalgi admin sharhi:
                  </div>
                  {detail.adminNote}
                </div>
              )}
            </div>

            {/* Action-specific form */}
            {dialogMode === "approve" && (
              <EntField label="Izoh (ixtiyoriy)">
                <EntTextarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Tasdiqlash sababi yoki qo'shimcha izoh"
                />
              </EntField>
            )}
            {dialogMode === "reject" && (
              <EntField
                label="Rad etish sababi"
                required
                error={!adminNote.trim() ? "Sabab majburiy" : undefined}
              >
                <EntTextarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Talabaga ko'rinadi"
                />
              </EntField>
            )}
            {dialogMode === "fulfill" && (
              <>
                <EntField label="Qo'shilgan kitob" required>
                  <SearchableSelect
                    value={productId}
                    onChange={setProductId}
                    options={productsList.map((p) => ({
                      value: String(p.id),
                      label: `${p.name}${p.author ? " — " + p.author : ""}`,
                    }))}
                    placeholder="Kitobni tanlang"
                    searchPlaceholder="Kitob nomi yoki muallif..."
                    emptyText="Bu nom bo'yicha kitob topilmadi"
                  />
                </EntField>
                <EntField label="Izoh (ixtiyoriy)">
                  <EntTextarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Talabaga xabar"
                  />
                </EntField>
                <div
                  className="ent-muted"
                  style={{ fontSize: 11, lineHeight: 1.4 }}
                >
                  Eslatma: kitob hali kutubxonada bo'lmasa, avval{" "}
                  <a href="/products/upload" style={{ color: "var(--ent-accent)" }}>
                    yuklab oling
                  </a>{" "}
                  va keyin shu sahifada tanlang.
                </div>
              </>
            )}
          </div>
        )}
      </EntDialog>
    </EntPage>
  );
}

export default RequestsPage;
