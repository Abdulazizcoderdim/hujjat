import {
  EntBadge,
  EntButton,
  EntCard,
  EntGrid,
  EntPage,
  EntStatCard,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import { AdminActionType, IAdminAction } from "@/interface";
import { ACTION_LABEL, fetchActions } from "@/service/audit";
import { fetchOperator, fetchOperatorChart } from "@/service/operator";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

export function OperatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const opId = Number(id);
  const navigate = useNavigate();

  const detailQ = useQuery({
    queryKey: ["operator-detail", opId],
    queryFn: () => fetchOperator(opId),
    enabled: !isNaN(opId),
  });

  const chartQ = useQuery({
    queryKey: ["operator-chart", opId],
    queryFn: () => fetchOperatorChart(opId, 30),
    enabled: !isNaN(opId),
  });

  const actionsQ = useQuery({
    queryKey: ["operator-actions", opId],
    queryFn: () =>
      fetchActions({
        actorId: opId,
        page: 1,
        limit: 50,
      }),
    enabled: !isNaN(opId),
  });

  const op = detailQ.data?.operator;
  const stats = detailQ.data?.stats;
  const actions = actionsQ.data?.items ?? [];

  return (
    <EntPage>
      <EntToolbar
        title={op ? `Operator: ${op.full_name || op.email}` : "Operator"}
        actions={
          <EntButton onClick={() => navigate("/monitoring")}>
            <ArrowLeft size={14} /> Orqaga
          </EntButton>
        }
      />

      <div style={{ padding: 6 }} className="ent-stack-y">
        {detailQ.isLoading ? (
          <div className="ent-empty" style={{ border: 0 }}>
            Yuklanmoqda...
          </div>
        ) : !op ? (
          <div className="ent-empty">Operator topilmadi</div>
        ) : (
          <>
            {/* Profile info */}
            <EntCard title="Profil ma'lumotlari">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gap: 12,
                }}
              >
                <div>
                  {op.image ? (
                    <img
                      src={op.image}
                      alt=""
                      style={{
                        width: 100,
                        height: 120,
                        objectFit: "cover",
                        border: "1px solid var(--ent-border)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 120,
                        background: "var(--ent-bg)",
                        border: "1px solid var(--ent-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--ent-text-faint)",
                        fontSize: 28,
                        fontWeight: 700,
                      }}
                    >
                      {(op.full_name || op.email || "?").charAt(0)}
                    </div>
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
                  <div className="ent-muted">FIO:</div>
                  <div style={{ fontWeight: 600 }}>{op.full_name || "—"}</div>
                  <div className="ent-muted">Email:</div>
                  <div>{op.email || "—"}</div>
                  <div className="ent-muted">Login:</div>
                  <div className="ent-cell--code">{op.login || "—"}</div>
                  <div className="ent-muted">Telefon:</div>
                  <div className="ent-cell--code">{op.phone || "—"}</div>
                  <div className="ent-muted">Holat:</div>
                  <div>
                    {op.is_blocked ? (
                      <EntBadge variant="danger">Bloklangan</EntBadge>
                    ) : op.is_active ? (
                      <EntBadge variant="success">Faol</EntBadge>
                    ) : (
                      <EntBadge variant="muted">Nofaol</EntBadge>
                    )}
                  </div>
                  <div className="ent-muted">Ro'yxatdan o'tgan:</div>
                  <div className="ent-cell--code">
                    {fmtDateTime(op.createdAt)}
                  </div>
                </div>
              </div>
            </EntCard>

            {/* Stats */}
            <EntGrid cols={4}>
              <EntStatCard
                label="Jami yuklangan"
                value={stats?.uploadedTotal ?? 0}
              />
              <EntStatCard
                label="So'nggi 7 kun"
                value={stats?.uploaded7Days ?? 0}
              />
              <EntStatCard
                label="So'nggi 30 kun"
                value={stats?.uploaded30Days ?? 0}
              />
              <EntStatCard
                label="Login soni"
                value={stats?.loginCount ?? 0}
                delta={
                  stats?.lastLoginAt
                    ? `so'nggi: ${fmtDateTime(stats.lastLoginAt)}`
                    : undefined
                }
              />
            </EntGrid>

            {/* Chart */}
            <EntCard title="Kunlik yuklash dinamikasi (30 kun)" noPadding>
              <div style={{ padding: 6, height: 220 }}>
                {chartQ.isLoading ? (
                  <div className="ent-empty" style={{ border: 0 }}>
                    Yuklanmoqda...
                  </div>
                ) : (chartQ.data ?? []).length === 0 ? (
                  <div className="ent-empty" style={{ border: 0 }}>
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartQ.data}
                      margin={{ top: 4, right: 12, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#e3e6ea"
                        strokeDasharray="2 2"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        axisLine={{ stroke: "#a0a4ab" }}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#5e6470" }}
                      />
                      <YAxis
                        axisLine={{ stroke: "#a0a4ab" }}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#5e6470" }}
                        width={26}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "1px solid #a0a4ab",
                          background: "#ffffff",
                          fontSize: 11,
                          padding: "3px 6px",
                          borderRadius: 2,
                        }}
                      />
                      <Line
                        name="Yuklangan"
                        type="monotone"
                        dataKey="count"
                        stroke="#2563a8"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </EntCard>

            {/* Actions history */}
            <EntCard
              title="Amallar tarixi (so'nggi 50)"
              noPadding
            >
              <EntTableWrap style={{ border: 0 }}>
                <EntTable compact>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th style={{ width: 130 }}>Sana</th>
                      <th style={{ width: 200 }}>Amal</th>
                      <th style={{ width: 110 }}>Maqsad</th>
                      <th>Tavsif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionsQ.isLoading ? (
                      <tr>
                        <td colSpan={5} className="ent-empty">
                          Yuklanmoqda...
                        </td>
                      </tr>
                    ) : actions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="ent-empty">
                          Amallar yo'q
                        </td>
                      </tr>
                    ) : (
                      actions.map((a: IAdminAction, idx) => (
                        <tr key={a.id}>
                          <td className="ent-cell--num ent-muted">{idx + 1}</td>
                          <td className="ent-cell--code">
                            {fmtDateTime(a.createdAt)}
                          </td>
                          <td>
                            <EntBadge variant="muted">
                              {ACTION_LABEL[a.action as AdminActionType] ??
                                a.action}
                            </EntBadge>
                          </td>
                          <td className="ent-cell--code ent-muted">
                            {a.targetType
                              ? `${a.targetType} #${a.targetId ?? ""}`
                              : "—"}
                          </td>
                          <td title={a.summary ?? ""}>{a.summary || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </EntTable>
              </EntTableWrap>
            </EntCard>
          </>
        )}
      </div>
    </EntPage>
  );
}

export default OperatorDetailPage;
