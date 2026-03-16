import { Button } from "@/components/ui/button";
import { PaginationLimitSelect } from "@/components/PaginationLimitSelect";
import Link from "next/link";

interface ServerPaginationProps {
  page: number;
  totalPages: number;
  hrefBase: string;
  searchParams?: Record<string, string | undefined>;
  limit?: number;
  limitOptions?: number[];
  limitParamName?: string;
  showLimitSelect?: boolean;
}

export function ServerPagination({
  page,
  totalPages,
  hrefBase,
  searchParams = {},
  limit,
  limitOptions,
  limitParamName = "limit",
  showLimitSelect = true,
}: ServerPaginationProps) {
  const derivedLimit = Number(searchParams[limitParamName] ?? limit ?? 10);
  const effectiveLimit =
    Number.isFinite(derivedLimit) && derivedLimit > 0 ? derivedLimit : 10;

  if (totalPages <= 1 && !showLimitSelect) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    params.set("page", String(p));
    return `/${hrefBase}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-8">
      {showLimitSelect && (
        <PaginationLimitSelect
          hrefBase={hrefBase}
          searchParams={searchParams}
          value={effectiveLimit}
          options={limitOptions}
          paramName={limitParamName}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          {/* Oldingi */}
          {page > 1 && (
            <Link href={buildHref(page - 1)}>
              <Button size={"sm"} variant="outline">
                Oldingi
              </Button>
            </Link>
          )}

          {/* Joriy sahifa */}
          <span className="sm:px-4 sm:py-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md">
            {page}
          </span>

          {/* Keyingi */}
          {page < totalPages && (
            <Link href={buildHref(page + 1)}>
              <Button size={"sm"} variant="outline">
                Keyingi
              </Button>
            </Link>
          )}

          <p className="ml-4 flex items-center text-sm gap-3 text-muted-foreground">
            <span className="sm:flex hidden">/ </span> {totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
