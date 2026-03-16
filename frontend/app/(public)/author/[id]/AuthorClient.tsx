"use client";

import { ProductCard } from "@/components/ProductCard";
import { ServerPagination } from "@/components/ServerPagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IProduct } from "@/interface";
import { formatUzDate } from "@/lib/formatDate";
import {
  Calendar,
  Eye,
  FileText,
  Gauge,
  Search,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuthorClient({
  data,
  page,
  limit,
  search,
  authorId,
  rank,
}: {
  data: any;
  page: number;
  limit: number;
  search?: string;
  authorId: string;
  rank: number | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(search ?? "");

  const updateParam = (key: string, val?: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (val) sp.set(key, val);
    else sp.delete(key);
    sp.set("page", "1");
    router.push(`?${sp.toString()}`);
  };

  return (
    <main className="flex-1 py-8 lg:py-12">
      {
        <div className="container-main">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Bosh sahifa
            </Link>
            <span>/</span>
            <Link
              href="/authors"
              className="hover:text-primary transition-colors"
            >
              Mualliflar
            </Link>
            <span>/</span>
            <span className="text-foreground">{data.full_name}</span>
          </div>

          {/* data Header */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 lg:p-8 mb-10 border border-border/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-primary/20">
                <AvatarImage
                  src={
                    data.avatar ||
                    "https://www.svgrepo.com/show/452030/avatar-default.svg"
                  }
                  alt={data.full_name}
                />
                <AvatarFallback className="text-2xl">
                  {data.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatUzDate(data.createdAt)} dan beri
                  </Badge>
                </div>
                <h1 className="font-display sm:text-3xl text-lg lg:text-4xl font-bold text-foreground mb-3">
                  {data.full_name}
                </h1>
                {data.bio && (
                  <p className="text-muted-foreground sm:text-lg text-sm max-w-2xl">
                    {data.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {data.totalProducts}
                </div>
                <div className="text-sm text-muted-foreground">Hujjatlar</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {data.totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Ko'rishlar</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {data.totalSold.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Sotilgan</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {rank ? `#${rank}` : "-"}
                </div>
                <div className="text-sm text-muted-foreground">Reyting</div>
              </div>
            </div>
          </div>

          {/* Author Products */}
          <section className="mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Muallifning hujjatlari
              </h2>

              {/* SEARCH INPUT QISMI */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hujjatlarni qidirish..."
                  defaultValue={search}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && updateParam("search", value)
                  }
                  className="pl-9 bg-card"
                />
              </div>
            </div>

            {data.products.items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.products.items.map(
                    (product: IProduct<string, string>) => (
                      <ProductCard key={product._id} product={product} />
                    ),
                  )}
                </div>

                <ServerPagination
                  page={page}
                  totalPages={data.products.pagination.totalPages}
                  hrefBase={`author/${authorId}`}
                  searchParams={{ search, limit: String(limit) }}
                />
              </>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                {search ? (
                  <>
                    <p className="text-lg font-medium text-foreground">
                      Topilmadi 😔
                    </p>
                    <p className="text-muted-foreground">
                      "{search}" bo'yicha hech qanday hujjat yo'q.
                    </p>
                    <Button
                      variant="link"
                      onClick={() => updateParam("search", "")}
                      className="mt-2 text-primary"
                    >
                      Filtrni tozalash
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Bu muallif hali hujjat joylamagan.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      }
    </main>
  );
}
