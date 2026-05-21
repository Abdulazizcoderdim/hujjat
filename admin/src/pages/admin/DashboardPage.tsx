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
import ProductAnalyticsChart from "@/components/ProductAnalyticsChart";
import $api from "@/http/axios";
import { ICategory, IProduct, ProductStatus } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface UsersStats {
  totalUsers?: string;
  totalStudents?: string;
  totalAdmins?: string;
  totalProducts?: string;
  growth?: {
    users?: string;
    students?: string;
    admins?: string;
    products?: string;
  };
}

interface ProductByStatus {
  items: IProduct<ICategory>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const fmtNum = (v?: string | number) => {
  if (v === undefined || v === null) return "—";
  const n = typeof v === "string" ? Number(v) : v;
  if (isNaN(n)) return String(v);
  return n.toLocaleString("uz-UZ");
};

const fmtPct = (raw?: string) => {
  if (!raw) return null;
  const n = Number(raw);
  if (isNaN(n) || n === 0) return null;
  const sign = n > 0 ? "▲" : "▼";
  return `${sign} ${Math.abs(n).toFixed(1)}%`;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<UsersStats>({
    queryKey: ["users-stats"],
    queryFn: async () => (await $api.get(`/users/stats`)).data,
  });

  const { data: approved, isLoading: approvedLoading } =
    useQuery<ProductByStatus>({
      queryKey: ["dashboard-recent", ProductStatus.APPROVED],
      queryFn: async () =>
        (
          await $api.get(
            `/products?status=${ProductStatus.APPROVED}&page=1&limit=8`,
          )
        ).data,
    });

  return (
    <EntPage>
      <EntToolbar title="Boshqaruv paneli" />

      <div style={{ padding: 6 }}>
        {/* Stat row */}
        <EntGrid cols={4}>
          <EntStatCard
            label="Jami foydalanuvchi"
            value={statsLoading ? "…" : fmtNum(stats?.totalUsers)}
            delta={fmtPct(stats?.growth?.users) ?? undefined}
            deltaDir={
              fmtPct(stats?.growth?.users)?.startsWith("▲")
                ? "up"
                : fmtPct(stats?.growth?.users)?.startsWith("▼")
                  ? "down"
                  : undefined
            }
          />
          <EntStatCard
            label="Talabalar"
            value={statsLoading ? "…" : fmtNum(stats?.totalStudents)}
            delta={fmtPct(stats?.growth?.students) ?? undefined}
            deltaDir={
              fmtPct(stats?.growth?.students)?.startsWith("▲")
                ? "up"
                : fmtPct(stats?.growth?.students)?.startsWith("▼")
                  ? "down"
                  : undefined
            }
          />
          <EntStatCard
            label="Adminlar"
            value={statsLoading ? "…" : fmtNum(stats?.totalAdmins)}
            delta={fmtPct(stats?.growth?.admins) ?? undefined}
            deltaDir={
              fmtPct(stats?.growth?.admins)?.startsWith("▲")
                ? "up"
                : fmtPct(stats?.growth?.admins)?.startsWith("▼")
                  ? "down"
                  : undefined
            }
          />
          <EntStatCard
            label="Kitoblar"
            value={statsLoading ? "…" : fmtNum(stats?.totalProducts)}
            delta={fmtPct(stats?.growth?.products) ?? undefined}
            deltaDir={
              fmtPct(stats?.growth?.products)?.startsWith("▲")
                ? "up"
                : fmtPct(stats?.growth?.products)?.startsWith("▼")
                  ? "down"
                  : undefined
            }
          />
        </EntGrid>

        {/* Chart */}
        <div style={{ marginTop: 8 }}>
          <EntCard
            title="Kitoblar dinamikasi · so'nggi 7 kun"
            noPadding
            actions={
              <EntButton
                size="xs"
                onClick={() => navigate("/products/approved")}
              >
                Barchasi →
              </EntButton>
            }
          >
            <ProductAnalyticsChart />
          </EntCard>
        </div>

        {/* Recent uploaded */}
        <div style={{ marginTop: 8 }}>
          <EntCard
            title="So'nggi yuklangan hujjatlar"
            noPadding
            actions={
              <EntButton
                size="xs"
                onClick={() => navigate("/products/approved")}
              >
                Barchasi →
              </EntButton>
            }
          >
            <EntTableWrap style={{ borderTop: 0, border: 0 }}>
              <EntTable>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 50 }}>Poster</th>
                    <th>Nom</th>
                    <th style={{ width: 180 }}>Muallif</th>
                    <th style={{ width: 110 }}>Shifr</th>
                    <th style={{ width: 80 }}>Til</th>
                    <th style={{ width: 100 }}>Holat</th>
                    <th style={{ width: 110 }}>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLoading ? (
                    <tr>
                      <td colSpan={8} className="ent-empty">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : (approved?.items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="ent-empty">
                        Hozircha yozuv yo'q
                      </td>
                    </tr>
                  ) : (
                    approved!.items.map((p, idx) => {
                      const anyP = p as any;
                      return (
                        <tr
                          key={p.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/products/approved`)}
                          title="Mahsulot ro'yxatiga o'tish"
                        >
                          <td className="ent-cell--num ent-muted">{idx + 1}</td>
                          <td>
                            {p.poster ? (
                              <img
                                src={p.poster}
                                alt=""
                                style={{
                                  width: 32,
                                  height: 44,
                                  objectFit: "cover",
                                  border: "1px solid var(--ent-border)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 32,
                                  height: 44,
                                  background: "var(--ent-bg)",
                                  border: "1px solid var(--ent-border)",
                                }}
                              />
                            )}
                          </td>
                          <td style={{ fontWeight: 500 }}>{p.name}</td>
                          <td className="ent-muted">{p.author || "—"}</td>
                          <td className="ent-cell--code">
                            {anyP.shelfCode || (
                              <span className="ent-muted">—</span>
                            )}
                          </td>
                          <td className="ent-muted">{p.language || "—"}</td>
                          <td>
                            <EntBadge
                              variant={
                                p.status === ProductStatus.APPROVED
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {p.status === ProductStatus.APPROVED
                                ? "Tasdiqlangan"
                                : "Rad etilgan"}
                            </EntBadge>
                          </td>
                          <td className="ent-cell--code ent-muted">
                            {fmtDate(p.createdAt)}
                          </td>
                        </tr>
                      );
                    })
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
