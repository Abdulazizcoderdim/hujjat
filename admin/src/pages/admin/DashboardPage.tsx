import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductStatusBadge } from "@/components/admin/ProductStatusBadge";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/hooks/format-currency";
import $api from "@/http/axios";
import { ICategory, IOrder, IProduct, IUser, Withdrawal } from "@/interface";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Package,
  Percent,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductChartPoint {
  name: string;
  total: number;
  approved: number;
  pending: number;
  disabled: number;
  rejected: number;
}

type TimePeriod = "year" | "month" | "days" | "today" | "week";

interface DashboardStats {
  users: {
    total: number;
    sellers: number;
  };
  products: {
    total: number;
    pending: number;
  };
  orders: {
    total: number;
    paid: number;
  };
  finance: {
    gmv: number;
    buyerCommission: number;
    sellerCommission: number;
    platformRevenue: number;
    sellerPayout: number;
    providerFees: number;
    netProfit: number;
  };
  withdrawals: {
    pending: number;
  };
}

interface ChartDataPoint {
  name: string;
  orders: number;
  revenue: number;
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState<TimePeriod>("week");
  const [days, setDays] = useState<number>(7);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState<string>(defaultMonth);
  const [year, setYear] = useState<string>(String(now.getFullYear()));

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("period", period);

    if (period === "days") {
      params.set("days", String(days));
    }

    if (period === "month") {
      params.set("month", month);
    }

    if (period === "year") {
      params.set("year", year);
    }

    return `?${params.toString()}`;
  }, [period, days, month, year]);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", queryString],
    queryFn: async () => {
      const response = await $api.get(`/admin/dashboard${queryString}`);
      return response.data;
    },
  });

  const { data: pendingProducts = [], isLoading: productsLoading } = useQuery<
    IProduct<ICategory, IUser>[]
  >({
    queryKey: ["pending-products"],
    queryFn: async () => {
      const response = await $api.get(
        "/admin/dashboard/pending-products?limit=5",
      );
      return response.data;
    },
  });

  const { data: pendingWithdrawals = [], isLoading: withdrawalsLoading } =
    useQuery<Withdrawal<IUser>[]>({
      queryKey: ["pending-withdrawals"],
      queryFn: async () => {
        const response = await $api.get(
          "/admin/dashboard/pending-withdrawals?limit=5",
        );
        return response.data;
      },
    });

  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery<
    IOrder<IProduct<ICategory, IUser>, IUser>[]
  >({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const response = await $api.get("/admin/dashboard/recent-orders?limit=5");
      return response.data;
    },
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery<
    ChartDataPoint[]
  >({
    queryKey: ["chart-data", queryString],
    queryFn: async () => {
      const response = await $api.get(
        `/admin/dashboard/chart-data${queryString}`,
      );
      return response.data;
    },
  });

  const { data: productsChartData = [], isLoading: productsChartLoading } =
    useQuery<ProductChartPoint[]>({
      queryKey: ["products-chart-data", queryString],
      queryFn: async () => {
        const res = await $api.get(
          `/admin/dashboard/products-chart-data${queryString}`,
        );
        return res.data;
      },
    });

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formattedProductsChartData = productsChartData.map((item) => ({
    ...item,
    name: formatShortDate(item.name),
  }));

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);

    if (period === "today") {
      return date.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (period === "week") {
      const daysUz = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
      return daysUz[date.getDay()];
    }

    return formatShortDate(dateStr);
  };

  const formattedChartData = chartData.map((item) => ({
    ...item,
    name: formatChartDate(item.name),
  }));

  const periodLabel = useMemo(() => {
    if (period === "today") return "Bugun";
    if (period === "week") return "Hafta";
    if (period === "days") return `${days} kun`;
    if (period === "month") return `Oy (${month})`;
    if (period === "year") return `Yil (${year})`;
    return "";
  }, [period, days, month, year]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }).map((_, i) => String(current - i));
  }, []);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const options: { value: string; label: string }[] = [];

    for (let i = 0; i < 24; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);

      const y = d.getFullYear();
      const m = d.getMonth() + 1;

      const value = `${y}-${String(m).padStart(2, "0")}`;

      const rawLabel = d.toLocaleDateString("uz-UZ", {
        month: "long",
        year: "numeric",
      });

      const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

      options.push({ value, label });
    }

    return options;
  }, []);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="bg-blue-500 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
        <PageHeader
          isBlue={true}
          title="Boshqaruv paneli"
          description="Doclab Marketplace statistikasi va umumiy ko'rinishi"
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Tabs
                value={period}
                onValueChange={(v) => setPeriod(v as TimePeriod)}
                className="w-full sm:w-auto"
              >
                <TabsList className="bg-white dark:bg-slate-800 p-1 sm:p-1.5 rounded-xl border border-blue-100 dark:border-slate-700 w-full sm:w-auto h-auto gap-0.5 sm:gap-1 flex-wrap">
                  {["year", "month", "days", "today", "week"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none
                        text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400
                        data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950
                        data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400
                        data-[state=active]:shadow-lg data-[state=active]:ring-1 data-[state=active]:ring-black/5 dark:data-[state=active]:ring-white/10"
                    >
                      {tab === "year" && "Yil"}
                      {tab === "month" && "Oy"}
                      {tab === "days" && "Kunlar"}
                      {tab === "today" && "Bugun"}
                      {tab === "week" && "Hafta"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {period === "days" && (
                <div className="relative w-full sm:w-auto">
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="h-10 sm:h-11 w-full sm:w-auto rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                  >
                    <option value={7}>Oxirgi 7 kun</option>
                    <option value={14}>Oxirgi 14 kun</option>
                    <option value={30}>Oxirgi 30 kun</option>
                    <option value={90}>Oxirgi 90 kun</option>
                  </select>
                </div>
              )}

              {period === "month" && (
                <Select value={month} onValueChange={(v) => setMonth(v)}>
                  <SelectTrigger className="h-10 sm:h-11 w-full sm:w-[180px] rounded-xl border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40">
                    <SelectValue placeholder="Oy tanlang" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                    {monthOptions.map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value}
                        className="focus:bg-blue-50 dark:focus:bg-slate-800 focus:text-blue-700 dark:focus:text-blue-400 cursor-pointer text-slate-700 dark:text-slate-300"
                      >
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {period === "year" && (
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 sm:h-11 w-full sm:w-auto rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              )}
            </div>
          }
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Jami foydalanuvchilar",
            value: stats?.users.total,
            icon: Users,
            trend: 12,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/40",
          },
          {
            title: "Jami sotuvchilar",
            value: stats?.users.sellers,
            icon: Store,
            trend: 8,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-100 dark:bg-indigo-900/40",
          },
          {
            title: "Jami mahsulotlar",
            value: stats?.products.total,
            icon: Package,
            trend: 15,
            color: "text-sky-600 dark:text-sky-400",
            bg: "bg-sky-100 dark:bg-sky-900/40",
          },
          {
            title: "Jami buyurtmalar",
            value: stats?.orders.total,
            icon: ShoppingCart,
            trend: 5,
            color: "text-cyan-600 dark:text-cyan-400",
            bg: "bg-cyan-100 dark:bg-cyan-900/40",
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-2">
        {[
          {
            title: "Jami daromad (GMV)",
            value: stats?.finance.gmv,
            icon: DollarSign,
          },
          {
            title: "Platforma komissiyasi",
            value: stats?.finance.platformRevenue,
            icon: Percent,
            variant: "primaryDeep",
          },
          {
            title: "Haridor komissiyasi",
            value: stats?.finance.buyerCommission,
            icon: Percent,
            variant: "primaryTeal",
          },
          {
            title: "Sotuvchi komissiyasi",
            value: stats?.finance.sellerCommission,
            icon: Percent,
            variant: "primaryDark",
          },
          {
            title: "Sotuvchiga beriladigon",
            value: stats?.finance.sellerPayout,
            icon: Wallet,
            variant: "warning",
          },
          {
            title: "Kutilayotgan mahsulotlar",
            value: stats?.products.pending,
            icon: Clock,
            isCount: true,
            variant: "tealDark",
          },
          {
            title: "Kutilayotgan yechimlar",
            value: stats?.withdrawals.pending,
            icon: Wallet,
            isCount: true,
            variant: "violet",
          },
          {
            title: "Platforma sof foyda",
            value: stats?.finance.netProfit,
            icon: DollarSign,
            special: true,
          },
          {
            title: "Provider komissiyasi",
            value: stats?.finance.providerFees,
            icon: DollarSign,
            variant: "danger",
          },
        ].map((item, i) => {
          let cardStyle = "";
          let iconBoxStyle = "";
          let titleStyle = "";
          let valueStyle = "";

          if (item.variant === "primaryDeep") {
            cardStyle = "bg-[#2f4181] border-[#2f4181]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/80";
            valueStyle = "text-white";
          } else if (item.variant === "tealDark") {
            cardStyle = "bg-[#1a9684] border-[#1a9684]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.variant === "violet") {
            cardStyle = "bg-[#7C3AED] border-[#7C3AED]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.variant === "rose") {
            cardStyle = "bg-[#F43F5E] border-[#F43F5E]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.variant === "primaryDark") {
            // #004874
            cardStyle = "bg-[#004874] border-[#004874]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/80";
            valueStyle = "text-white";
          } else if (item.variant === "primaryTeal") {
            // #00d9b8
            cardStyle = "bg-[#00d9b8] border-[#00d9b8]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.variant === "warning") {
            cardStyle = "bg-[#FD9303] border-[#FD9303]";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.variant === "danger") {
            cardStyle = "bg-red-500 border-red-500";
            iconBoxStyle = "bg-white/20 text-white";
            titleStyle = "text-white/90";
            valueStyle = "text-white";
          } else if (item.special) {
            // --- YASHIL ---
            cardStyle =
              "bg-emerald-500 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800";
            iconBoxStyle =
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300";
            titleStyle = "text-white dark:text-emerald-400";
            valueStyle = "text-white dark:text-emerald-300";
          } else if (i < 4) {
            if (i % 2 === 0) {
              cardStyle =
                "bg-blue-500 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800";
              iconBoxStyle =
                "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300";
              titleStyle = "text-white dark:text-blue-400";
              valueStyle = "text-white dark:text-blue-300";
            } else {
              cardStyle =
                "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800";
              iconBoxStyle =
                "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
              titleStyle = "text-slate-500 dark:text-slate-400";
              valueStyle = "text-slate-800 dark:text-slate-100";
            }
          } else {
            cardStyle =
              "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800";
            iconBoxStyle =
              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
            titleStyle = "text-slate-500 dark:text-slate-400";
            valueStyle = "text-slate-800 dark:text-slate-100";
          }

          return (
            <div
              key={i}
              className={`rounded-xl border p-4 flex flex-col justify-between shadow-lg transition-all hover:shadow-md ${cardStyle}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${iconBoxStyle}`}>
                  <item.icon size={18} />
                </div>
                <span
                  className={`text-sm font-medium line-clamp-1 ${titleStyle}`}
                >
                  {item.title}
                </span>
              </div>
              <span className={`text-xl font-bold ${valueStyle}`}>
                {item.isCount
                  ? item.value || 0
                  : formatCurrency(item.value || 0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {periodLabel} statistika
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Buyurtmalar va daromad dinamikasi
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Buyurtmalar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Daromad
              </span>
            </div>
          </div>
        </div>

        <div className="h-[350px] w-full">
          {chartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : formattedChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
                <Package className="h-6 w-6 text-slate-300 dark:text-slate-500" />
              </div>
              Ma'lumot topilmadi
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#94a3b8"
                  strokeOpacity={0.2}
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                  dx={-10}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#EFF6FF",
                    borderColor: "#3b82f6",
                    borderRadius: "12px",
                    boxShadow: "0 6px 16px rgba(30, 64, 175, 0.5)",
                    padding: "12px",
                    color: "#ffffff",
                  }}
                  itemStyle={{ paddingBottom: 4 }}
                  formatter={(value, name) => {
                    if (name === "orders")
                      return [
                        <span className="text-blue-400 font-bold">
                          {value}
                        </span>,
                        "Buyurtmalar",
                      ];
                    if (name === "revenue")
                      return [
                        <span className="text-sky-400 font-bold">
                          {formatCurrency(Number(value))}
                        </span>,
                        "Daromad",
                      ];
                    return [value, name];
                  }}
                  labelStyle={{
                    color: "black",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                  cursor={{
                    stroke: "#64748b",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#0284c7" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Products Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              Mahsulotlar statistikasi ({periodLabel})
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Statuslar bo’yicha yuklangan mahsulotlar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm bg-slate-50 dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-indigo-500" />
              <span className="font-medium text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Yuklangan
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
              <span className="font-medium text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Aktiv
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500" />
              <span className="font-medium text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Moderatsiya
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-400" />
              <span className="font-medium text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                Bekor qilingan
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          {productsChartLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : formattedProductsChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              Ma'lumot topilmadi
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedProductsChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#94a3b8"
                  strokeOpacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#EFF6FF", // blue-800
                    borderColor: "#3b82f6",
                    borderRadius: "12px",
                    boxShadow: "0 6px 16px rgba(30, 64, 175, 0.5)",
                    padding: "12px",
                    color: "#ffffff",
                  }}
                  labelStyle={{
                    color: "black",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                  formatter={(value, name) => {
                    const map: Record<string, string> = {
                      total: "Yuklangan",
                      approved: "Aktiv",
                      pending: "Moderatsiya",
                      rejected: "Bekor qilingan",
                      preview: "Qayta rasim",
                    };
                    return [`${value} ta`, map[name as string] ?? String(name)];
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  fillOpacity={0.1}
                  fill="#6366f1"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#22c55e"
                  fillOpacity={0.1}
                  fill="#22c55e"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#f59e0b"
                  fillOpacity={0.1}
                  fill="#f59e0b"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="rejected"
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.08}
                  fill="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="preview"
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.08}
                  fill="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-50 dark:border-slate-800 bg-blue-500 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white dark:text-slate-100">
                Kutilayotgan mahsulotlar
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
            {productsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Kutilayotgan mahsulot yo'q</div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden sm:block">
                  <DataTable
                    columns={[
                      {
                        key: "name",
                        header: "Nomi",
                        className: "text-slate-500 dark:text-slate-400 font-medium",
                      },
                      {
                        key: "price",
                        header: "Narxi",
                        className: "text-slate-500 dark:text-slate-400 font-medium",
                        render: (p) => (
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatCurrency(p.price)}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Holati",
                        className: "text-slate-500 dark:text-slate-400 font-medium",
                        render: (p) => <ProductStatusBadge status={p.status} />,
                      },
                    ]}
                    data={pendingProducts}
                    keyExtractor={(p) => p._id}
                    emptyMessage="Kutilayotgan mahsulot yo'q"
                  />
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingProducts.map((p) => (
                    <div key={p._id} className="p-3 space-y-2">
                      <p className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
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

        {/* Pending Withdrawals */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-blue-50 dark:border-slate-800 bg-blue-500 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white dark:text-slate-100">
                Kutilayotgan yechimlar
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/finance/withdrawals")}
              className="text-xs sm:text-sm"
            >
              Barchasi <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 p-2">
            {withdrawalsLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Kutilayotgan yechim yo'q</div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden sm:block">
                  <DataTable
                    columns={[
                      { key: "cardNumber", header: "Karta raqami" },
                      {
                        key: "amount",
                        header: "Summa",
                        render: (w) => (
                          <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                            {formatCurrency(w.amount)}
                          </span>
                        ),
                      },
                      {
                        key: "status",
                        header: "Holati",
                        render: (w) => <StatusBadge status={w.status} />,
                      },
                    ]}
                    data={pendingWithdrawals}
                    keyExtractor={(w) => w._id}
                    emptyMessage="Kutilayotgan yechim yo'q"
                  />
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingWithdrawals.map((w) => (
                    <div key={w._id} className="p-3 space-y-2">
                      <p className="font-mono text-sm text-muted-foreground">{w.cardNumber}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                          {formatCurrency(w.amount)}
                        </span>
                        <StatusBadge status={w.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders - Full Width */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-blue-50 dark:border-slate-800 bg-blue-500 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white dark:text-slate-100">
              So'nggi buyurtmalar
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/finance/orders")}
          >
            Barchasi <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="p-2">
          {ordersLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Ma'lumot topilmadi</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <DataTable
                  columns={[
                    {
                      key: "_id",
                      header: "ID",
                      render: (o) => (
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          #{o._id.slice(0, 8).toUpperCase()}
                        </span>
                      ),
                    },
                    {
                      key: "totalAmount",
                      header: "Summa",
                      render: (o) => (
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatCurrency(o.totalAmount)}
                        </span>
                      ),
                    },
                    {
                      key: "status",
                      header: "Holati",
                      render: (o) => <StatusBadge status={o.status} />,
                    },
                    {
                      key: "createdAt",
                      header: "Sana",
                      render: (o) => (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString("uz-UZ")}
                        </span>
                      ),
                    },
                  ]}
                  data={recentOrders}
                  keyExtractor={(o) => o._id}
                />
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((o) => (
                  <div key={o._id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        #{o._id.slice(0, 8).toUpperCase()}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatCurrency(o.totalAmount)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
