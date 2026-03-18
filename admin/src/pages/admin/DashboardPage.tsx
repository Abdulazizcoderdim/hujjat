import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import ProductAnalyticsChart from "@/components/ProductAnalyticsChart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/hooks/format-currency";
import $api from "@/http/axios";
import { ICategory, IProduct, ProductStatus } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Package, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductChartPoint {
  name: string;
  total: number;
  approved: number;
  pending: number;
  disabled: number;
  rejected: number;
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

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: usersStats, isLoading: usersStatsLoading } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    studentUsers: number;
    totalProducts: number;
  }>({
    queryKey: ["users-stats"],
    queryFn: async () => {
      const res = await $api.get(`/users/stats`);
      return res.data;
    },
  });

  const { data: approvedProducts, isLoading: approvedProductsLoading } =
    useQuery<ProductByStatus>({
      queryKey: ["products-by-status", ProductStatus.APPROVED],
      queryFn: async () => {
        const res = await $api.get(
          `/products?status=${ProductStatus.APPROVED}&page=1&limit=5`,
        );
        return res.data;
      },
    });

  return (
    <div className="space-y-8 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="bg-blue-500 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
        <PageHeader
          isBlue={true}
          title="Boshqaruv paneli"
          description="Doclab Marketplace statistikasi va umumiy ko'rinishi"
          // actions={}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Jami studentlar",
            value: usersStats?.studentUsers,
            icon: Users,
            trend: 12,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/40",
          },
          {
            title: "Jami mahsulotlar",
            value: usersStats?.totalUsers,
            icon: Package,
            trend: 15,
            color: "text-sky-600 dark:text-sky-400",
            bg: "bg-sky-100 dark:bg-sky-900/40",
          },
          {
            title: "Jami adminlar",
            value: usersStats?.adminUsers,
            icon: Users,
            trend: 15,
            color: "text-sky-600 dark:text-sky-400",
            bg: "bg-sky-100 dark:bg-sky-900/40",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-blue-100 dark:border-slate-800 shadow-lg transition-all hover:shadow-md hover:-translate-y-1"
          >
            <StatCard
              title={item.title}
              value={item.value?.toLocaleString() || "0"}
              icon={item.icon}
              trend={{ value: item.trend, isPositive: true }}
            />
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${item.bg} opacity-20 dark:opacity-10 group-hover:scale-150 transition-transform duration-500`}
            />
          </div>
        ))}
      </div>

      <ProductAnalyticsChart />

      {/* Tables Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-50 dark:border-slate-800 bg-blue-500 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white dark:text-slate-100">
                Oxirgi yuklangan hujjatlar
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products/pending")}
              className="text-xs sm:text-sm"
            >
              Barchasi <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-2">
            {approvedProductsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : approvedProducts.items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Kutilayotgan mahsulot yo'q
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden sm:block">
                  <DataTable
                    columns={[
                      {
                        key: "name",
                        header: "Nomi",
                        className:
                          "text-slate-500 dark:text-slate-400 font-medium",
                      },
                      {
                        key: "price",
                        header: "Narxi",
                        className:
                          "text-slate-500 dark:text-slate-400 font-medium",
                        render: (p) => (
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatCurrency(p.price)}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Holati",
                        className:
                          "text-slate-500 dark:text-slate-400 font-medium",
                        render: (p) => <ProductStatusBadge status={p.status} />,
                      },
                    ]}
                    data={approvedProducts.items}
                    keyExtractor={(p) => p.id.toString()}
                    emptyMessage="Kutilayotgan mahsulot yo'q"
                  />
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {approvedProducts.items.map((p) => (
                    <div key={p.id} className="p-3 space-y-2">
                      <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatCurrency(p.price)}
                        </span>
                        <ProductStatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
