"use client";

import { ProductCard } from "@/components/ProductCard";
import { ServerPagination } from "@/components/ServerPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICategory, IPagination, IProduct } from "@/interface";
import {
  Clock,
  FileText,
  Loader2,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const recentSearches = ["Biznes reja", "Prezentatsiya", "CV shablon"];
const popularSearches = ["Marketing", "Soliq", "Shartnoma", "Excel"];

interface Props {
  products: {
    items: IProduct<string, string>[];
    pagination: IPagination;
  };
  categories: ICategory[];
  searchParams: {
    q?: string;
    category?: string;
    limit?: string;
  };
  page: number;
}

export default function SearchClient({
  products,
  categories,
  searchParams,
  page,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState(searchParams.q ?? "");

  const updateParams = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(params.toString());

    Object.entries(updates).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });

    sp.set("page", "1");

    startTransition(() => {
      router.push(`/search?${sp.toString()}`);
    });
  };

  const handleSearchClick = (term: string) => {
    setValue(term);
    updateParams({ q: term });
  };

  const handleCategoryFilter = (categoryId: string) => {
    if (searchParams.category === categoryId) {
      updateParams({ category: undefined });
    } else {
      updateParams({ category: categoryId });
    }
  };

  const clearSearch = () => {
    setValue("");
    updateParams({ q: undefined });
  };

  const hasResults = products.items.length > 0;
  const currentSearchTerm = searchParams.q;
  const currentCategoryId = searchParams.category;
  const currentLimit = params.get("limit") ?? searchParams.limit;

  const isEmptyState = !currentSearchTerm && !currentCategoryId && !hasResults;

  return (
    <main className="flex-1">
      {/* Search Header - Google-like prominent search */}
      <div className="sticky top-16 lg:top-20 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container-main py-6">
          {/* Main Search Input */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-primary/30 transition-all duration-300">
                <SearchIcon className="absolute left-5 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Hujjat, shablon yoki materiallarni qidiring..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && updateParams({ q: value })
                  }
                  className="pl-14 pr-24 h-14 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {value && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-20 p-1.5 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                {isPending && (
                  <div className="absolute right-2 h-10 px-5 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={!searchParams.category ? "default" : "outline"}
                size="sm"
                onClick={() => updateParams({ category: undefined })}
                className="whitespace-nowrap rounded-full"
              >
                Barchasi
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={
                    searchParams.category === category._id
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => updateParams({ category: category._id })}
                  className="whitespace-nowrap rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container-main py-8">
        {/* Empty State - Show suggestions */}
        {!currentSearchTerm && !hasResults && !currentCategoryId && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <Clock className="w-4 h-4" />
                Oxirgi qidiruvlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(search)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-full text-sm transition-colors"
                  >
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <Sparkles className="w-4 h-4" />
                Mashhur qidiruvlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(search)}
                    className="px-4 py-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Categories */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
                <SlidersHorizontal className="w-4 h-4" />
                Kategoriyalar bo'yicha ko'rish
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryFilter(category._id)}
                    className="flex items-center gap-3 p-4 bg-card hover:bg-secondary/50 border border-border/50 rounded-xl text-left transition-all hover:shadow-md group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.productsCount || 0} hujjat
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {(currentSearchTerm || currentCategoryId || hasResults) && (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {currentSearchTerm && (
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">
                      "{currentSearchTerm}"
                    </span>{" "}
                    uchun{" "}
                    <span className="text-primary font-semibold">
                      {products.pagination.total || 0}
                    </span>{" "}
                    ta natija topildi
                  </p>
                )}
                {!currentSearchTerm && currentCategoryId && (
                  <p className="text-muted-foreground">
                    <span className="text-primary font-semibold">
                      {products.pagination.total || 0}
                    </span>{" "}
                    ta hujjat topildi
                  </p>
                )}
              </div>
              {(currentSearchTerm || currentCategoryId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Tozalash
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isPending && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Results Grid */}
            {!isPending && hasResults && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.items.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {products?.pagination && products.pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <ServerPagination
                      page={page}
                      totalPages={products.pagination.totalPages}
                      hrefBase="search"
                      searchParams={{
                        q: currentSearchTerm,
                        category: currentCategoryId,
                        limit: currentLimit ?? undefined,
                      }}
                    />{" "}
                  </div>
                )}
              </>
            )}

            {/* No Results State */}
            {!isPending && !hasResults && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
                  <SearchIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  Natija topilmadi
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {currentSearchTerm
                    ? `"${currentSearchTerm}" bo'yicha hech narsa topilmadi. Boshqa kalit so'zlarni sinab ko'ring.`
                    : "Bu kategoriyada hujjat topilmadi."}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={clearSearch}>
                    Barcha hujjatlarni ko'rish
                  </Button>
                </div>{" "}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
