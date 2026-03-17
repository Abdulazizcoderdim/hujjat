"use client";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICategory, IPagination, IProduct } from "@/interface";
import { cn } from "@/lib/utils";
import { Grid, List, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ProductClient = ({
  search,
  data,
  categories,
}: {
  search?: string;
  data: { items: IProduct<string, string>[]; pagination: IPagination };
  categories: ICategory[];
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const router = useRouter();
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Hujjat qidirish..."
            className="pl-10 h-12"
          />
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => updateParam("category", "")}
            className="whitespace-nowrap"
          >
            Barchasi
          </Button>
          {categories.slice(0, 5).map((category) => (
            <Button
              key={category.id}
              onClick={() => updateParam("category", category.id)}
              className="whitespace-nowrap"
              variant={selectedCategory === category.id ? "default" : "outline"}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {data.pagination.total} ta hujjat topildi
        </p>
      </div>

      {/* Products Grid */}
      {data.items.length > 0 ? (
        <div
          className={cn(
            "grid gap-6",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1",
          )}
        >
          {data.items.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              className={`animate-fade-up stagger-${(index % 5) + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            Qidiruv natijasi topilmadi
          </p>
          <Button variant="outline" onClick={() => updateParam("search", "")}>
            Filtrlarni tozalash
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductClient;
