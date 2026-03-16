"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationLimitSelectProps {
  hrefBase: string;
  searchParams?: Record<string, string | undefined>;
  value: number;
  options?: number[];
  paramName?: string;
}

export function PaginationLimitSelect({
  hrefBase,
  searchParams = {},
  value,
  options = [10, 20, 30, 50, 100],
  paramName = "limit",
}: PaginationLimitSelectProps) {
  const router = useRouter();

  const pushWithLimit = (limit: number) => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, v]) => {
      if (v) params.set(key, v);
    });

    params.set(paramName, String(limit));
    params.set("page", "1");

    router.push(`/${hrefBase}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sahifada:</span>
      <Select
        value={String(value)}
        onValueChange={(v) => pushWithLimit(Number(v))}
      >
        <SelectTrigger className="h-9 w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

