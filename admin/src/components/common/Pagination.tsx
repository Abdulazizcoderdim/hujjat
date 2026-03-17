import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total?: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  // Page raqamlarini generatsiya qilish (masalan: 1 ... 4 5 6 ... 10)
  const generatePagination = () => {
    const delta = 1; // Hozirgi sahifadan qancha yonini ko'rsatish
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = page - delta; i <= page + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    if (totalPages > 1) range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-4 gap-4">
      {/* Chap tomon: Jami ma'lumot va Limit tanlash */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground order-2 sm:order-1">
        {typeof total === "number" && (
          <span className="whitespace-nowrap">Jami: {total} ta</span>
        )}
        <div className="flex items-center gap-2">
          <span>Har sahifada:</span>
          <Select
            value={limit.toString()}
            onValueChange={(value) => {
              onLimitChange(Number(value));
              onPageChange(1); // Limit o'zgarganda 1-sahifaga qaytish
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100, 500, 1000].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* O'ng tomon: Navigatsiya tugmalari */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Eng boshiga */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Bitta orqaga */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Raqamlar */}
        <div className="flex items-center gap-1 mx-1">
          {generatePagination().map((pageNum, idx) =>
            pageNum === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(pageNum as number)}
              >
                {pageNum}
              </Button>
            ),
          )}
        </div>

        {/* Bitta oldinga */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Eng oxiriga */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
