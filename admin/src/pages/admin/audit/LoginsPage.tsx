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
import {
  ILoginEvent,
  LoginEventMethod,
  LoginEventStatus,
} from "@/interface";
import {
  fetchLogins,
  LOGIN_METHOD_LABEL,
  LOGIN_REASON_LABEL,
} from "@/service/audit";
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

export function LoginsPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as LoginEventStatus) || "";
  const method = (params.get("method") as LoginEventMethod) || "";
  const search = params.get("search") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Number(params.get("page") ?? 1);
  const debounced = useDebounce(search, 350);
  const [detail, setDetail] = useState<ILoginEvent | null>(null);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v) next.delete(k);
    else next.set(k, v);
    if (k !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const filters = useMemo(
    () => ({
      status: (status || undefined) as LoginEventStatus | undefined,
      method: (method || undefined) as LoginEventMethod | undefined,
      search: debounced,
      from: from || undefined,
      to: to || undefined,
      page,
      limit: LIMIT,
    }),
    [status, method, debounced, from, to, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit", "logins", filters],
    queryFn: () => fetchLogins(filters),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleExport = () => {
    exportToCsv(
      items,
      [
        { header: "Sana", value: (r) => fmtDateTime(r.createdAt) },
        {
          header: "Foydalanuvchi",
          value: (r) =>
            r.user?.full_name || r.user?.login || r.user?.email || "",
        },
        { header: "Kiritilgan", value: (r) => r.attemptedLogin ?? "" },
        {
          header: "Method",
          value: (r) => LOGIN_METHOD_LABEL[r.method] ?? r.method,
        },
        { header: "Status", value: (r) => r.status },
        { header: "Sabab", value: (r) => r.reason ?? "" },
        { header: "IP", value: (r) => r.ip ?? "" },
        { header: "User-Agent", value: (r) => r.userAgent ?? "" },
      ],
      `loginlar-${new Date().toISOString().slice(0, 10)}`,
    );
  };

  return (
    <EntPage>
      <EntToolbar
        title="Audit · Loginlar"
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
            placeholder="FIO / login / email / IP"
            style={{ width: 260 }}
          />
        </EntFilterField>
        <EntFilterField label="Status">
          <EntSelect
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
          >
            <option value="">Hammasi</option>
            <option value="success">Muvaffaqiyatli</option>
            <option value="failed">Xato</option>
          </EntSelect>
        </EntFilterField>
        <EntFilterField label="Method">
          <EntSelect
            value={method}
            onChange={(e) => setParam("method", e.target.value)}
          >
            <option value="">Hammasi</option>
            <option value="admin_password">Admin</option>
            <option value="hemis">HEMIS</option>
            <option value="google">Google</option>
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
              <th style={{ width: 220 }}>Foydalanuvchi</th>
              <th style={{ width: 180 }}>Kiritilgan login</th>
              <th style={{ width: 120 }}>Method</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 140 }}>Sabab</th>
              <th style={{ width: 130 }}>IP</th>
              <th>User-Agent</th>
              <th style={{ width: 50 }}></th>
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
              items.map((r, idx) => (
                <tr key={r.id}>
                  <td className="ent-cell--num ent-muted">
                    {(page - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="ent-cell--code">
                    {fmtDateTime(r.createdAt)}
                  </td>
                  <td>
                    {r.user ? (
                      <>
                        <div style={{ fontWeight: 500 }}>
                          {r.user.full_name ||
                            r.user.login ||
                            r.user.email ||
                            "—"}
                        </div>
                        {r.user.email && (
                          <div className="ent-muted" style={{ fontSize: 11 }}>
                            {r.user.email}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="ent-muted">— anonim —</span>
                    )}
                  </td>
                  <td className="ent-cell--code">
                    {r.attemptedLogin || <span className="ent-muted">—</span>}
                  </td>
                  <td>
                    <EntBadge variant="muted">
                      {LOGIN_METHOD_LABEL[r.method] ?? r.method}
                    </EntBadge>
                  </td>
                  <td>
                    {r.status === "success" ? (
                      <EntBadge variant="success">Muvaffaqiyatli</EntBadge>
                    ) : (
                      <EntBadge variant="danger">Xato</EntBadge>
                    )}
                  </td>
                  <td className="ent-muted">
                    {r.reason
                      ? LOGIN_REASON_LABEL[r.reason] ?? r.reason
                      : "—"}
                  </td>
                  <td className="ent-cell--code">{r.ip || "—"}</td>
                  <td
                    title={r.userAgent || ""}
                    style={{
                      maxWidth: 250,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 11,
                    }}
                    className="ent-muted"
                  >
                    {r.userAgent || "—"}
                  </td>
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
        title="Login tafsilotlari"
        width={560}
        footer={<EntButton onClick={() => setDetail(null)}>Yopish</EntButton>}
      >
        {detail && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr",
              gap: "3px 8px",
              fontSize: 12,
            }}
          >
            <div className="ent-muted">Sana:</div>
            <div className="ent-cell--code">{fmtDateTime(detail.createdAt)}</div>
            <div className="ent-muted">Foydalanuvchi:</div>
            <div>
              {detail.user
                ? `${detail.user.full_name || detail.user.login || ""} (id #${detail.user.id})`
                : "anonim"}
            </div>
            <div className="ent-muted">Kiritilgan:</div>
            <div className="ent-cell--code">{detail.attemptedLogin || "—"}</div>
            <div className="ent-muted">Method:</div>
            <div>{LOGIN_METHOD_LABEL[detail.method] ?? detail.method}</div>
            <div className="ent-muted">Status:</div>
            <div>
              {detail.status === "success" ? (
                <EntBadge variant="success">Muvaffaqiyatli</EntBadge>
              ) : (
                <EntBadge variant="danger">Xato</EntBadge>
              )}
            </div>
            <div className="ent-muted">Sabab:</div>
            <div>
              {detail.reason
                ? LOGIN_REASON_LABEL[detail.reason] ?? detail.reason
                : "—"}
            </div>
            <div className="ent-muted">IP:</div>
            <div className="ent-cell--code">{detail.ip || "—"}</div>
            <div className="ent-muted">User-Agent:</div>
            <div
              style={{
                wordBreak: "break-all",
                fontSize: 11,
                fontFamily: "var(--ent-font-mono)",
              }}
            >
              {detail.userAgent || "—"}
            </div>
          </div>
        )}
      </EntDialog>
    </EntPage>
  );
}

export default LoginsPage;
