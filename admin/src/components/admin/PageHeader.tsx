import { cn } from "@/lib/utils"; // Agar shadcn/ui ishlatayotgan bo'lsangiz
import { ModeToggle } from "../mode-toggle";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  isBlue?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  isBlue = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all",
      )}
    >
      <div>
        <h1
          className={cn(
            "text-xl sm:text-2xl font-bold",
            isBlue ? "text-white dark:text-blue-100" : "text-foreground",
          )}
        >
          {title}
        </h1>

        {description && (
          <p
            className={cn(
              "text-sm mt-1",
              isBlue
                ? "text-white dark:text-blue-300/80"
                : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ModeToggle />
        {actions && <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">{actions}</div>}
      </div>
    </div>
  );
}
