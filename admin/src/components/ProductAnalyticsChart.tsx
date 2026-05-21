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
  const { data: chartData = [], isLoading } = useQuery({
    queryKey: ["product-analytics"],
    queryFn: async () => {
      const res = await $api.get("/products/analytics");
      return res.data;
    },
  });

  return (
    <div style={{ height: 240, padding: 6 }}>
      {isLoading ? (
        <div className="ent-empty" style={{ border: 0 }}>
          Yuklanmoqda...
        </div>
      ) : chartData.length === 0 ? (
        <div className="ent-empty" style={{ border: 0 }}>
          Ma'lumot yo'q
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 12, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="dashTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563a8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563a8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#e3e6ea"
              strokeDasharray="2 2"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#a0a4ab" }}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#5e6470" }}
              dy={4}
            />
            <YAxis
              axisLine={{ stroke: "#a0a4ab" }}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#5e6470" }}
              width={28}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #a0a4ab",
                background: "#ffffff",
                fontSize: 12,
                padding: "4px 8px",
                borderRadius: 2,
              }}
              labelStyle={{ fontWeight: 600, color: "#1f2328" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
            />
            <Area
              name="Jami yuklangan"
              type="monotone"
              dataKey="total"
              stroke="#2563a8"
              fill="url(#dashTotal)"
              strokeWidth={2}
            />
            <Area
              name="Tasdiqlangan"
              type="monotone"
              dataKey="approved"
              stroke="#2e7d32"
              fillOpacity={0}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductAnalyticsChart;
