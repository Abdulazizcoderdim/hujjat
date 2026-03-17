import { cn } from "@/lib/utils";

type BadgeStatus =
  | "success"
  | "failed"
  | "warning"
  | "primary"
  | "secondary"
  | "muted"
  | "info"
  | "pending"
  | string;

interface StatusBadgeProps {
  status: BadgeStatus;
  children?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<string, string> = {
  success: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  secondary: "bg-muted text-muted-foreground border-border",
  muted: "bg-muted/50 text-muted-foreground border-border",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pending: "bg-warning/10 text-warning border-warning/25",
};

export function StatusBadgeLogs({
  status,
  children,
  className,
}: StatusBadgeProps) {
  const base =
    "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap";

  return (
    <span
      className={cn(
        base,
        statusStyles[status] ?? statusStyles.secondary,
        className,
      )}
    >
      {children ?? status}
    </span>
  );
}
