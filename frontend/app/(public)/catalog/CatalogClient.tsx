"use client";

import { ProductCard } from "@/components/ProductCard";
import { ServerPagination } from "@/components/ServerPagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory, IPagination, IProduct } from "@/interface";
import { Filter, Grid3X3, List, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type SortBy = "new" | "popular" | "sold" | "price-low" | "price-high";

interface Props {
  products: {
    items: IProduct<string, string>[];
    pagination: IPagination;
  };
  categories: ICategory[];
  page: number;
}

export default function CatalogClient({ products, categories, page }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const limit = searchParams.get("limit") ?? undefined;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") ?? "",
  );

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1"); // filter o‘zgarsa page reset
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <main className="flex-1">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Katalog
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Barcha hujjatlar bir joyda. Kerakli hujjatni toping va yuklab oling.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-xl border border-border/50 p-5 sticky top-24">
              <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrlar
              </h3>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Qidirish..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && updateParam("search", searchQuery)
                  }
                />
              </div>

              {/* Categories */}
              <div className="space-y-2 h-96 overflow-y-auto">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Kategoriyalar
                </h4>
                <button
                  onClick={() => updateParam("category")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Hammasi
                </button>
                {categories?.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => updateParam("category", category._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === category._id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {products.pagination.total}
                </span>{" "}
                ta hujjat topildi
              </p>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="w-[220px]">
                  <Select
                    defaultValue={searchParams.get("sort") ?? "new"}
                    onValueChange={(v) => updateParam("sort", v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Saralash" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="new">Eng yangi</SelectItem>
                      <SelectItem value="popular">
                        Mashhur (ko‘p ko‘rilgan)
                      </SelectItem>
                      <SelectItem value="sold">Ko‘p sotilgan</SelectItem>
                      <SelectItem value="price-low">Arzon</SelectItem>
                      <SelectItem value="price-high">Qimmat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.items.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {products.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  Hujjat topilmadi
                </h3>
                <p className="text-muted-foreground">
                  Boshqa kalit so'zlar bilan qidirib ko'ring
                </p>
              </div>
            )}
            <ServerPagination
              page={page}
              totalPages={products.pagination.totalPages}
              hrefBase="catalog"
              searchParams={{
                category,
                sort,
                search,
                limit,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
