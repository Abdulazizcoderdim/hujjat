import {
  EntBadge,
  EntButton,
  EntCard,
  EntGrid,
  EntPage,
  EntPagination,
  EntStatCard,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { HemisSyncStatus, IHemisSyncJob } from "@/interface";
import {
  fetchHemisSyncCurrent,
  fetchHemisSyncHistory,
  startHemisSync,
} from "@/service/hemisSync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const durationMin = (start?: string | null, end?: string | null) => {
  if (!start) return "—";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  if (isNaN(s) || isNaN(e)) return "—";
  const sec = Math.max(0, Math.floor((e - s) / 1000));
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m} daq ${r} s`;
};

const statusBadge = (s: HemisSyncStatus) => {
  switch (s) {
    case "running":
      return (
        <EntBadge variant="warn">
          <RefreshCw size={11} className="animate-spin" /> Bajarilmoqda
        </EntBadge>
      );
    case "completed":
      return <EntBadge variant="success">Yakunlangan</EntBadge>;
    case "failed":
      return <EntBadge variant="danger">Xato</EntBadge>;
    case "cancelled":
      return <EntBadge variant="muted">Bekor</EntBadge>;
    case "pending":
    default:
      return <EntBadge variant="muted">Kutilmoqda</EntBadge>;
  }
};

const HISTORY_LIMIT = 20;

export function SyncPage() {
  const qc = useQueryClient();
  const [historyPage, setHistoryPage] = useState(1);

  const currentQ = useQuery<IHemisSyncJob | null>({
    queryKey: ["hemis-sync", "current"],
    queryFn: fetchHemisSyncCurrent,
    refetchInterval: (q) => {
      const d = q.state.data;
      return d && d.status === "running" ? 2000 : false;
    },
  });

  const historyQ = useQuery({
    queryKey: ["hemis-sync", "history", historyPage],
    queryFn: () => fetchHemisSyncHistory(historyPage, HISTORY_LIMIT),
    refetchInterval: () => {
      const d = currentQ.data;
      return d && d.status === "running" ? 5000 : false;
    },
  });

  const startMu = useMutation({
    mutationFn: startHemisSync,
    onSuccess: (job) => {
      if (job.status === "running") {
        toast.info("Sinxronizatsiya allaqachon bajarilmoqda");
      } else {
        toast.success("Sinxronizatsiya boshlandi");
      }
      qc.invalidateQueries({ queryKey: ["hemis-sync"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Xato yuz berdi"),
  });

  const current = currentQ.data;
  const isRunning = current?.status === "running";
  const progressPct =
    current && current.totalPages > 0
      ? Math.min(
          100,
          Math.round((current.currentPage / current.totalPages) * 100),
        )
      : 0;

  return (
    <EntPage>
      <EntToolbar
        title="HEMIS sinxronizatsiya"
        actions={
          <>
            <EntButton
              onClick={() => {
                currentQ.refetch();
                historyQ.refetch();
              }}
            >
              <RefreshCw size={14} /> Yangilash
            </EntButton>
            <EntButton
              variant="primary"
              onClick={() => startMu.mutate()}
              disabled={isRunning || startMu.isPending}
              title={
                isRunning
                  ? "Hozir sinxronizatsiya bajarilmoqda"
                  : "Yangi sinxronizatsiyani boshlash"
              }
            >
              <Play size={14} />
              {isRunning ? "Bajarilmoqda..." : "Sinxronlashni boshlash"}
            </EntButton>
          </>
        }
      />

      <div style={{ padding: 6 }} className="ent-stack-y">
        {/* Current status */}
        <EntCard
          title={
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              Joriy holat
              {current && statusBadge(current.status)}
            </span>
          }
        >
          {!current ? (
            <div className="ent-muted" style={{ fontSize: 12 }}>
              Hali biror sinxronizatsiya bajarilmagan. "Sinxronlashni boshlash"
              tugmasini bosing.
            </div>
          ) : (
            <>
              <EntGrid cols={4}>
                <EntStatCard
                  label="Sahifa"
                  value={
                    <span className="ent-cell--code">
                      {current.currentPage} / {current.totalPages || "—"}
                    </span>
                  }
                  delta={`${progressPct}%`}
                />
                <EntStatCard
                  label="Qayta ishlandi"
                  value={
                    <span className="ent-cell--code">
                      {current.processedRecords.toLocaleString()} /{" "}
                      {current.totalRecords.toLocaleString()}
                    </span>
                  }
                />
                <EntStatCard
                  label="Yangi / yangilangan"
                  value={
                    <span className="ent-cell--code">
                      <span style={{ color: "var(--ent-success)" }}>
                        +{current.createdCount}
                      </span>
                      {" / "}
                      <span style={{ color: "var(--ent-accent)" }}>
                        ~{current.updatedCount}
                      </span>
                    </span>
                  }
                />
                <EntStatCard
                  label="Xato"
                  value={
                    <span
                      style={{
                        color:
                          current.errorCount > 0
                            ? "var(--ent-danger)"
                            : "var(--ent-text)",
                      }}
                    >
                      {current.errorCount}
                    </span>
                  }
                />
              </EntGrid>

              {/* Progress bar */}
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    height: 8,
                    border: "1px solid var(--ent-border)",
                    background: "var(--ent-bg)",
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: "100%",
                      background:
                        current.status === "failed"
                          ? "var(--ent-danger)"
                          : current.status === "completed"
                            ? "var(--ent-success)"
                            : "var(--ent-accent)",
                      transition: "width 300ms",
                    }}
                  />
                </div>
              </div>

              {/* Meta row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: "3px 8px",
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                <div className="ent-muted">Boshlangan:</div>
                <div className="ent-cell--code">
                  {fmtDateTime(current.startedAt)}
                </div>
                <div className="ent-muted">Yakunlangan:</div>
                <div className="ent-cell--code">
                  {fmtDateTime(current.finishedAt)}
                </div>
                <div className="ent-muted">Davomiyligi:</div>
                <div className="ent-cell--code">
                  {durationMin(current.startedAt, current.finishedAt)}
                </div>
                <div className="ent-muted">Trigger qilgan:</div>
                <div>
                  {current.triggeredBy?.full_name ||
                    current.triggeredBy?.login ||
                    "—"}
                </div>
              </div>

              {current.error && (
                <div
                  style={{
                    marginTop: 8,
                    border: "1px solid var(--ent-danger)",
                    background: "var(--ent-danger-bg)",
                    color: "var(--ent-danger)",
                    padding: "6px 8px",
                    fontSize: 12,
                    display: "flex",
                    gap: 6,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ whiteSpace: "pre-wrap" }}>{current.error}</span>
                </div>
              )}
            </>
          )}
        </EntCard>

        {/* History */}
        <EntCard title="Tarix" noPadding>
          <EntTableWrap style={{ border: 0 }}>
            <EntTable>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th style={{ width: 70 }}>ID</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 130 }}>Boshlangan</th>
                  <th style={{ width: 130 }}>Yakunlangan</th>
                  <th style={{ width: 90 }}>Davom.</th>
                  <th style={{ width: 100 }}>Sahifa</th>
                  <th style={{ width: 110 }}>Yozuvlar</th>
                  <th style={{ width: 110 }}>Yangi / Yangi.</th>
                  <th style={{ width: 70 }}>Xato</th>
                  <th>Trigger qilgan</th>
                </tr>
              </thead>
              <tbody>
                {historyQ.isLoading ? (
                  <tr>
                    <td colSpan={11} className="ent-empty">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : (historyQ.data?.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={11} className="ent-empty">
                      Tarix yo'q
                    </td>
                  </tr>
                ) : (
                  historyQ.data!.items.map((j, idx) => (
                    <tr key={j.id}>
                      <td className="ent-cell--num ent-muted">
                        {(historyPage - 1) * HISTORY_LIMIT + idx + 1}
                      </td>
                      <td className="ent-cell--code">#{j.id}</td>
                      <td>{statusBadge(j.status)}</td>
                      <td className="ent-cell--code">
                        {fmtDateTime(j.startedAt)}
                      </td>
                      <td className="ent-cell--code">
                        {fmtDateTime(j.finishedAt)}
                      </td>
                      <td className="ent-cell--code ent-muted">
                        {durationMin(j.startedAt, j.finishedAt)}
                      </td>
                      <td className="ent-cell--code">
                        {j.currentPage}/{j.totalPages || "—"}
                      </td>
                      <td className="ent-cell--code">
                        {j.processedRecords}/{j.totalRecords}
                      </td>
                      <td className="ent-cell--code">
                        <span style={{ color: "var(--ent-success)" }}>
                          +{j.createdCount}
                        </span>{" "}
                        /{" "}
                        <span style={{ color: "var(--ent-accent)" }}>
                          ~{j.updatedCount}
                        </span>
                      </td>
                      <td className="ent-cell--code">
                        {j.errorCount > 0 ? (
                          <span style={{ color: "var(--ent-danger)" }}>
                            {j.errorCount}
                          </span>
                        ) : (
                          <span className="ent-muted">0</span>
                        )}
                      </td>
                      <td>
                        {j.triggeredBy?.full_name ||
                          j.triggeredBy?.login || (
                            <span className="ent-muted">—</span>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </EntTable>
          </EntTableWrap>
        </EntCard>

        {historyQ.data?.pagination && (
          <EntPagination
            page={historyPage}
            totalPages={historyQ.data.pagination.totalPages}
            total={historyQ.data.pagination.total}
            limit={HISTORY_LIMIT}
            onChange={setHistoryPage}
          />
        )}
      </div>
    </EntPage>
  );
}

export default SyncPage;
