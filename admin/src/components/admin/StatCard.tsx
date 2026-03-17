import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export type StatCardColor =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple"
  | "orange"
  | "white";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: StatCardColor;
  className?: string;
}

const colorStyles: Record<StatCardColor, string> = {
  default: "bg-card border-border text-card-foreground",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  green:
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  yellow:
    "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  purple:
    "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  orange:
    "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  white: "bg-card border-border text-card-foreground",
};

const iconStyles: Record<StatCardColor, string> = {
  default: "bg-muted text-muted-foreground",
  blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  green: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  yellow: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/20 text-red-600 dark:text-red-400",
  purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  white: "bg-muted text-muted-foreground",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "stat-card rounded-xl border p-4 shadow-sm transition-all",
        colorStyles[color],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium opacity-80")}>{title}</p>
          <p className="text-2xl font-bold">{value}</p>

          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "flex items-center px-1.5 py-0.5 rounded font-medium",
                  trend.isPositive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="opacity-70">o'tgan haftaga nisbatan</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconStyles[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
