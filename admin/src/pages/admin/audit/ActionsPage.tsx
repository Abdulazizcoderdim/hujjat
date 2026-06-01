import {
  EntBadge,
  EntButton,
  EntDialog,
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
import { AdminActionType, IAdminAction } from "@/interface";
import { ACTION_LABEL, fetchActions } from "@/service/audit";
import { exportToCsv } from "@/utils/csv";
import { useQuery } from "@tanstack/react-query";
import { Download, Info, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

const ACTION_OPTIONS: { value: AdminActionType | ""; label: string }[] = [
  { value: "", label: "Hammasi" },
  { value: "product_created", label: ACTION_LABEL.product_created },
  { value: "product_updated", label: ACTION_LABEL.product_updated },
  { value: "product_deleted", label: ACTION_LABEL.product_deleted },
  {
    value: "product_status_changed",
    label: ACTION_LABEL.product_status_changed,
  },
  { value: "user_created", label: ACTION_LABEL.user_created },
  { value: "user_updated", label: ACTION_LABEL.user_updated },
  { value: "user_deleted", label: ACTION_LABEL.user_deleted },
  { value: "user_blocked", label: ACTION_LABEL.user_blocked },
  { value: "user_unblocked", label: ACTION_LABEL.user_unblocked },
  { value: "category_created", label: ACTION_LABEL.category_created },
  { value: "category_updated", label: ACTION_LABEL.category_updated },
  { value: "category_deleted", label: ACTION_LABEL.category_deleted },
  { value: "loan_created", label: ACTION_LABEL.loan_created },
  { value: "loan_returned", label: ACTION_LABEL.loan_returned },
  { value: "hemis_sync_started", label: ACTION_LABEL.hemis_sync_started },
];

const actionVariant = (a: AdminActionType) => {
  if (a.endsWith("_deleted") || a === "user_blocked") return "danger";
  if (a.endsWith("_created") || a === "user_unblocked") return "success";
  return "muted";
};

export function ActionsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const action = (params.get("action") as AdminActionType) || "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Number(params.get("page") ?? 1);
  const debounced = useDebounce(search, 350);
  const [detail, setDetail] = useState<IAdminAction | null>(null);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({
      search: debounced,
      action: (action || undefined) as AdminActionType | undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: LIMIT,
    }),
    [debounced, action, from, to, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit", "actions", filters],
    queryFn: () => fetchActions(filters),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleExport = () => {
    exportToCsv(
      items,
      [
        { header: "Sana", value: (r) => fmtDateTime(r.createdAt) },
        {
          header: "Admin",
          value: (r) => r.actor?.full_name || r.actor?.email || "",
        },
        { header: "Amal", value: (r) => ACTION_LABEL[r.action] ?? r.action },
        { header: "Maqsad", value: (r) => `${r.targetType || ""} #${r.targetId || ""}` },
        { header: "Tavsif", value: (r) => r.summary ?? "" },
        { header: "IP", value: (r) => r.ip ?? "" },
      ],
      `admin-amallar-${new Date().toISOString().slice(0, 10)}`,
    );
  };

  return (
    <EntPage>
      <EntToolbar
        title="Audit · Admin amallari"
        actions={
          <>
            <EntButton onClick={() => refetch()}>
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton onClick={handleExport} disabled={items.length === 0}>
              <Download size={14} /> CSV
            </EntButton>
          </>
        }
      />

      <EntFilterBar>
        <EntFilterField label="Qidiruv">
          <EntInput
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
            placeholder="Admin / tavsif"
            style={{ width: 240 }}
          />
        </EntFilterField>
        <EntFilterField label="Amal turi">
          <EntSelect
            value={action}
            onChange={(e) => setParam("action", e.target.value)}
            style={{ minWidth: 200 }}
          >
            {ACTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </EntSelect>
        </EntFilterField>
        <EntFilterField label="Dan">
          <EntInput
            type="date"
            value={from}
            onChange={(e) => setParam("from", e.target.value)}
            style={{ width: 140 }}
          />
        </EntFilterField>
        <EntFilterField label="Gacha">
          <EntInput
            type="date"
            value={to}
            onChange={(e) => setParam("to", e.target.value)}
            style={{ width: 140 }}
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
              <th style={{ width: 130 }}>Sana</th>
              <th style={{ width: 200 }}>Admin</th>
              <th style={{ width: 180 }}>Amal</th>
              <th style={{ width: 110 }}>Maqsad</th>
              <th>Tavsif</th>
              <th style={{ width: 120 }}>IP</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="ent-empty">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="ent-empty">
                  Yozuv topilmadi
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
                    {r.actor ? (
                      <>
                        <div style={{ fontWeight: 500 }}>
                          {r.actor.full_name || r.actor.login || "—"}
                        </div>
                        {r.actor.email && (
                          <div className="ent-muted" style={{ fontSize: 11 }}>
                            {r.actor.email}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="ent-muted">— tizim —</span>
                    )}
                  </td>
                  <td>
                    <EntBadge variant={actionVariant(r.action)}>
                      {ACTION_LABEL[r.action] ?? r.action}
                    </EntBadge>
                  </td>
                  <td className="ent-cell--code ent-muted">
                    {r.targetType ? `${r.targetType} #${r.targetId ?? ""}` : "—"}
                  </td>
                  <td title={r.summary ?? ""}>{r.summary || "—"}</td>
                  <td className="ent-cell--code">{r.ip || "—"}</td>
                  <td>
                    <EntButton
                      size="icon"
                      title="Tafsilot"
                      onClick={() => setDetail(r)}
                    >
                      <Info size={13} />
                    </EntButton>
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

      <EntDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Amal tafsilotlari"
        width={560}
        footer={<EntButton onClick={() => setDetail(null)}>Yopish</EntButton>}
      >
        {detail && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr",
              gap: "3px 8px",
              fontSize: 12,
            }}
          >
            <div className="ent-muted">Sana:</div>
            <div className="ent-cell--code">{fmtDateTime(detail.createdAt)}</div>
            <div className="ent-muted">Admin:</div>
            <div>
              {detail.actor
                ? `${detail.actor.full_name || detail.actor.email || ""} (#${detail.actor.id})`
                : "tizim"}
            </div>
            <div className="ent-muted">Amal:</div>
            <div>
              <EntBadge variant={actionVariant(detail.action)}>
                {ACTION_LABEL[detail.action] ?? detail.action}
              </EntBadge>
            </div>
            <div className="ent-muted">Maqsad:</div>
            <div className="ent-cell--code">
              {detail.targetType
                ? `${detail.targetType} #${detail.targetId ?? ""}`
                : "—"}
            </div>
            <div className="ent-muted">IP:</div>
            <div className="ent-cell--code">{detail.ip || "—"}</div>
            <div className="ent-muted">Tavsif:</div>
            <div>{detail.summary || "—"}</div>
            <div className="ent-muted" style={{ alignSelf: "flex-start" }}>
              Payload:
            </div>
            <pre
              style={{
                fontSize: 11,
                margin: 0,
                background: "var(--ent-bg)",
                border: "1px solid var(--ent-border)",
                padding: 6,
                overflow: "auto",
                maxHeight: 200,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "var(--ent-font-mono)",
              }}
            >
              {detail.payload
                ? JSON.stringify(detail.payload, null, 2)
                : "—"}
            </pre>
          </div>
        )}
      </EntDialog>
    </EntPage>
  );
}

export default ActionsPage;
