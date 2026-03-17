import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "canceled"
  | "success"
  | "failed"
  | "active"
  | "blocked"
  | "credit"
  | "debit";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Kutilmoqda",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  approved: {
    label: "Tasdiqlangan",
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Rad etilgan",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  paid: {
    label: "To'langan",
    className: "bg-success/20 text-success border-success/30",
  },
  canceled: {
    label: "Bekor qilingan",
    className: "bg-muted text-muted-foreground border-muted",
  },
  success: {
    label: "Muvaffaqiyatli",
    className: "bg-success/20 text-success border-success/30",
  },
  failed: {
    label: "Muvaffaqiyatsiz",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  active: {
    label: "Faol",
    className: "bg-success/20 text-success border-success/30",
  },
  blocked: {
    label: "Bloklangan",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  credit: {
    label: "Kirim",
    className: "bg-success/20 text-success border-success/30",
  },
  debit: {
    label: "Chiqim",
    className: "bg-warning/20 text-warning border-warning/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
