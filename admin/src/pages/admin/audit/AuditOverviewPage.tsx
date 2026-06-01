import {
  EntButton,
  EntCard,
  EntGrid,
  EntPage,
  EntStatCard,
  EntTable,
  EntTableWrap,
  EntToolbar,
} from "@/components/enterprise";
import {
  fetchActionStats,
  fetchLoginStats,
  fetchSessionChart,
  fetchSessionStats,
} from "@/service/audit";
import { fetchBookRequestStats } from "@/service/bookRequests";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmtDuration = (sec: number) => {
  if (!sec || sec <= 0) return "0 daq";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h} soat ${m} daq`;
  return `${m} daq`;
};

const fmtNum = (n: number) => (n || 0).toLocaleString("uz-UZ");

export function AuditOverviewPage() {
  const navigate = useNavigate();

  const sessionStatsQ = useQuery({
    queryKey: ["audit", "session-stats"],
    queryFn: () => fetchSessionStats(),
  });
  const loginStatsQ = useQuery({
    queryKey: ["audit", "login-stats"],
    queryFn: () => fetchLoginStats(),
  });
  const actionStatsQ = useQuery({
    queryKey: ["audit", "action-stats"],
    queryFn: () => fetchActionStats(),
  });
  const chartQ = useQuery({
    queryKey: ["audit", "chart", 30],
    queryFn: () => fetchSessionChart(30),
  });
  const requestsQ = useQuery({
    queryKey: ["audit", "book-requests-stats"],
    queryFn: fetchBookRequestStats,
  });

  const refetchAll = () => {
    sessionStatsQ.refetch();
    loginStatsQ.refetch();
    actionStatsQ.refetch();
    chartQ.refetch();
    requestsQ.refetch();
  };

  const ss = sessionStatsQ.data;
  const ls = loginStatsQ.data;
  const as = actionStatsQ.data;
  const rs = requestsQ.data;

  // Method label
  const methodLabel = (m: string) =>
    m === "admin_password"
      ? "Admin"
      : m === "hemis"
        ? "HEMIS"
        : m === "google"
          ? "Google"
          : m;

  const methodChart =
    ls?.byMethod?.map((m) => ({
      name: methodLabel(m.method),
      count: m.count,
    })) ?? [];

  return (
    <EntPage>
      <EntToolbar
        title="Audit — umumiy ko'rinish"
        actions={
          <EntButton onClick={refetchAll}>
            <RefreshCw size={14} /> Yangilash
          </EntButton>
        }
      />

      <div style={{ padding: 6 }} className="ent-stack-y">
        {/* KPIs */}
        <EntGrid cols={4}>
          <EntStatCard
            label="Kutilayotgan so'rovlar"
            value={fmtNum(rs?.byStatus?.pending ?? 0)}
            delta={
              rs?.recentCount
                ? `+${rs.recentCount} so'nggi 7 kun`
                : undefined
            }
            deltaDir={
              rs && rs.byStatus.pending > 0 ? "up" : undefined
            }
          />
          <EntStatCard
            label="Loginlar (7 kun)"
            value={fmtNum(ls?.total ?? 0)}
            delta={
              ls && ls.total > 0
                ? `${Math.round((ls.success / ls.total) * 100)}% muvaffaqiyatli`
                : undefined
            }
            deltaDir={ls && ls.success > ls.failed ? "up" : "down"}
          />
          <EntStatCard
            label="O'qish sessiyalari (30 kun)"
            value={fmtNum(ss?.totalSessions ?? 0)}
            delta={
              ss?.openSessions
                ? `${ss.openSessions} ta hozir faol`
                : undefined
            }
          />
          <EntStatCard
            label="Jami o'qish vaqti"
            value={fmtDuration(ss?.totalSeconds ?? 0)}
            delta={
              ss?.avgSeconds
                ? `o'rtacha ${fmtDuration(ss.avgSeconds)}/sessiya`
                : undefined
            }
          />
          <EntStatCard
            label="Admin amallari (7 kun)"
            value={fmtNum(as?.total ?? 0)}
            delta={
              as?.topActors?.[0]?.full_name
                ? `top: ${as.topActors[0].full_name}`
                : undefined
            }
          />
        </EntGrid>

        {/* Charts row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 6,
          }}
        >
          <EntCard
            title="Kunlik o'qish dinamikasi (30 kun)"
            noPadding
            actions={
              <EntButton size="xs" onClick={() => navigate("/audit/sessions")}>
                Sessiyalar →
              </EntButton>
            }
          >
            <div style={{ padding: 6, height: 200 }}>
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
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="square"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 10, paddingBottom: 4 }}
                    />
                    <Line
                      name="Sessiyalar"
                      type="monotone"
                      dataKey="sessions"
                      stroke="#2563a8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      name="Foydalanuvchilar"
                      type="monotone"
                      dataKey="uniqueUsers"
                      stroke="#2e7d32"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </EntCard>

          <EntCard
            title="Login usullari (7 kun)"
            noPadding
            actions={
              <EntButton size="xs" onClick={() => navigate("/audit/logins")}>
                Loginlar →
              </EntButton>
            }
          >
            <div style={{ padding: 6, height: 200 }}>
              {loginStatsQ.isLoading ? (
                <div className="ent-empty" style={{ border: 0 }}>
                  Yuklanmoqda...
                </div>
              ) : methodChart.length === 0 ? (
                <div className="ent-empty" style={{ border: 0 }}>
                  Ma'lumot yo'q
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={methodChart}
                    margin={{ top: 4, right: 12, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#e3e6ea"
                      strokeDasharray="2 2"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
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
                    <Bar
                      dataKey="count"
                      fill="#2563a8"
                      name="Loginlar"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </EntCard>
        </div>

        {/* Top tables row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          <EntCard title="Top o'qiladigan kitoblar (30 kun)" noPadding>
            <EntTableWrap style={{ border: 0 }}>
              <EntTable compact>
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>#</th>
                    <th>Kitob</th>
                    <th style={{ width: 70 }}>Sess.</th>
                    <th style={{ width: 110 }}>Vaqt</th>
                  </tr>
                </thead>
                <tbody>
                  {(ss?.topBooks ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="ent-empty">
                        Ma'lumot yo'q
                      </td>
                    </tr>
                  ) : (
                    ss!.topBooks.map((b, i) => (
                      <tr key={b.productId}>
                        <td className="ent-cell--num ent-muted">{i + 1}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{b.name}</div>
                          {b.author && (
                            <div className="ent-muted" style={{ fontSize: 11 }}>
                              {b.author}
                            </div>
                          )}
                        </td>
                        <td className="ent-cell--num">{fmtNum(b.sessions)}</td>
                        <td className="ent-cell--code">
                          {fmtDuration(b.seconds)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </EntTable>
            </EntTableWrap>
          </EntCard>

          <EntCard title="Top faol talabalar (30 kun)" noPadding>
            <EntTableWrap style={{ border: 0 }}>
              <EntTable compact>
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>#</th>
                    <th>Talaba</th>
                    <th style={{ width: 70 }}>Sess.</th>
                    <th style={{ width: 110 }}>Vaqt</th>
                  </tr>
                </thead>
                <tbody>
                  {(ss?.topReaders ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="ent-empty">
                        Ma'lumot yo'q
                      </td>
                    </tr>
                  ) : (
                    ss!.topReaders.map((u, i) => (
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
                        <td className="ent-cell--num">{fmtNum(u.sessions)}</td>
                        <td className="ent-cell--code">
                          {fmtDuration(u.seconds)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </EntTable>
            </EntTableWrap>
          </EntCard>
        </div>
      </div>
    </EntPage>
  );
}

export default AuditOverviewPage;
