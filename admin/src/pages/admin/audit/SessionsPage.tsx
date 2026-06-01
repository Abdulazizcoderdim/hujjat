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
import { IReadingSessionAdmin } from "@/interface";
import { fetchSessions } from "@/service/audit";
import { exportToCsv } from "@/utils/csv";
import { useQuery } from "@tanstack/react-query";
import { Download, Info, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const LIMIT = 25;

const fmtDateTime = (msOrIso?: string | number | null) => {
  if (!msOrIso) return "—";
  const d = new Date(typeof msOrIso === "string" ? Number(msOrIso) || msOrIso : msOrIso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDuration = (sec: number) => {
  if (!sec || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}s ${m}d`;
  if (m > 0) return `${m}d ${s}s`;
  return `${s}s`;
};

export function SessionsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const open = params.get("open") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Number(params.get("page") ?? 1);
  const debounced = useDebounce(search, 350);
  const [detail, setDetail] = useState<IReadingSessionAdmin | null>(null);

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
      open: open === "" ? undefined : open === "true",
      from: from || undefined,
      to: to || undefined,
      page,
      limit: LIMIT,
    }),
    [debounced, open, from, to, page],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["audit", "sessions", filters],
    queryFn: () => fetchSessions(filters),
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleExport = () => {
    exportToCsv(
      items,
      [
        { header: "Boshlangan", value: (r) => fmtDateTime(r.startedAt) },
        { header: "Tugagan", value: (r) => fmtDateTime(r.endedAt) },
        {
          header: "Talaba",
          value: (r) => r.user?.full_name || r.user?.login || "",
        },
        {
          header: "Guruh",
          value: (r) => r.user?.group || "",
        },
        { header: "Kitob", value: (r) => r.product?.name || "" },
        { header: "Muallif", value: (r) => r.product?.author || "" },
        { header: "Boshlanish sah.", value: (r) => r.startPage },
        { header: "Yakuniy sah.", value: (r) => r.endPage },
        {
          header: "O'qigan sah.",
          value: (r) => Math.max(0, r.endPage - r.startPage),
        },
        { header: "Davomiyligi (sek)", value: (r) => r.durationSeconds },
      ],
      `sessiyalar-${new Date().toISOString().slice(0, 10)}`,
    );
  };

  return (
    <EntPage>
      <EntToolbar
        title="Audit · O'qish sessiyalari"
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
            placeholder="Talaba / kitob / shifr"
            style={{ width: 260 }}
          />
        </EntFilterField>
        <EntFilterField label="Holat">
          <EntSelect
            value={open}
            onChange={(e) => setParam("open", e.target.value)}
          >
            <option value="">Hammasi</option>
            <option value="true">Faol</option>
            <option value="false">Yakunlangan</option>
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
              <th style={{ width: 130 }}>Boshlangan</th>
              <th style={{ width: 200 }}>Talaba</th>
              <th>Kitob</th>
              <th style={{ width: 80 }}>Sah. dan</th>
              <th style={{ width: 80 }}>gacha</th>
              <th style={{ width: 80 }}>O'qigan</th>
              <th style={{ width: 100 }}>Davom.</th>
              <th style={{ width: 90 }}>Holat</th>
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
                  Sessiya topilmadi
                </td>
              </tr>
            ) : (
              items.map((r, idx) => {
                const isOpen = !r.endedAt;
                const pagesRead = Math.max(0, r.endPage - r.startPage);
                return (
                  <tr key={r.id}>
                    <td className="ent-cell--num ent-muted">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="ent-cell--code">
                      {fmtDateTime(r.startedAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {r.user?.full_name || r.user?.login || "—"}
                      </div>
                      {r.user?.group && (
                        <div className="ent-muted" style={{ fontSize: 11 }}>
                          {r.user.group}
                        </div>
                      )}
                    </td>
                    <td title={r.product?.name}>
                      <div style={{ fontWeight: 500 }}>{r.product?.name}</div>
                      {r.product?.author && (
                        <div className="ent-muted" style={{ fontSize: 11 }}>
                          {r.product.author}
                        </div>
                      )}
                    </td>
                    <td className="ent-cell--num">{r.startPage}</td>
                    <td className="ent-cell--num">{r.endPage}</td>
                    <td className="ent-cell--num">
                      {pagesRead > 0 ? (
                        pagesRead
                      ) : (
                        <span className="ent-muted">0</span>
                      )}
                    </td>
                    <td className="ent-cell--code">
                      {fmtDuration(r.durationSeconds)}
                    </td>
                    <td>
                      {isOpen ? (
                        <EntBadge variant="warn">Faol</EntBadge>
                      ) : (
                        <EntBadge variant="success">Yakunlangan</EntBadge>
                      )}
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

      <EntDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Sessiya tafsilotlari"
        width={580}
        footer={<EntButton onClick={() => setDetail(null)}>Yopish</EntButton>}
      >
        {detail && (
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12 }}>
            <div>
              {detail.product?.poster ? (
                <img
                  src={detail.product.poster}
                  alt=""
                  style={{
                    width: 100,
                    height: 140,
                    objectFit: "cover",
                    border: "1px solid var(--ent-border)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 140,
                    background: "var(--ent-bg)",
                    border: "1px solid var(--ent-border)",
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "3px 8px",
                fontSize: 12,
              }}
            >
              <div className="ent-muted">Kitob:</div>
              <div style={{ fontWeight: 600 }}>{detail.product?.name}</div>
              <div className="ent-muted">Muallif:</div>
              <div>{detail.product?.author || "—"}</div>

              <div className="ent-muted">Talaba:</div>
              <div style={{ fontWeight: 600 }}>
                {detail.user?.full_name || detail.user?.login}
              </div>
              <div className="ent-muted">Guruh / Talaba ID:</div>
              <div className="ent-cell--code">
                {detail.user?.group || "—"}{" "}
                {detail.user?.student_id_number
                  ? `· ${detail.user.student_id_number}`
                  : ""}
              </div>

              <div className="ent-muted">Boshlangan:</div>
              <div className="ent-cell--code">
                {fmtDateTime(detail.startedAt)}
              </div>
              <div className="ent-muted">Tugagan:</div>
              <div className="ent-cell--code">
                {detail.endedAt
                  ? fmtDateTime(detail.endedAt)
                  : "— (faol)"}
              </div>
              <div className="ent-muted">Davomiyligi:</div>
              <div className="ent-cell--code">
                {fmtDuration(detail.durationSeconds)}
              </div>
              <div className="ent-muted">Boshlanish sah.:</div>
              <div className="ent-cell--num">{detail.startPage}</div>
              <div className="ent-muted">Yakuniy sah.:</div>
              <div className="ent-cell--num">{detail.endPage}</div>
              <div className="ent-muted">O'qigan sah.:</div>
              <div className="ent-cell--num">
                {Math.max(0, detail.endPage - detail.startPage)}
              </div>
            </div>
          </div>
        )}
      </EntDialog>
    </EntPage>
  );
}

export default SessionsPage;
