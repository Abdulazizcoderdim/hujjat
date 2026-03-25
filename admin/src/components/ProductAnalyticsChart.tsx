import $api from "@/http/axios";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProductAnalyticsChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["product-analytics"],
    queryFn: async () => {
      const res = await $api.get("/products/analytics");
      return res.data;
    },
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-lg p-6 lg:p-8">
      <h2 className="text-lg font-semibold mb-4">
        Kitoblar dinamikasi (Haftalik)
      </h2>

      <div className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chartData?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Ma'lumot topilmadi
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                dy={10}
                fontSize={12}
              />
              <YAxis axisLine={false} tickLine={false} dx={-10} fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />

              <Area
                name="Jami yuklangan"
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                fill="url(#colorTotal)"
                strokeWidth={3}
              />
              <Area
                name="Tasdiqlangan"
                type="monotone"
                dataKey="approved"
                stroke="#22c55e"
                fillOpacity={0}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProductAnalyticsChart;
