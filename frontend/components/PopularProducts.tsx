import { Button } from "@/components/ui/button";
import { IPagination, IProduct } from "@/interface";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

interface ProductResponse {
  items: IProduct<string, string>[];
  pagination: IPagination;
}

async function getPopularProducts() {
  const params = new URLSearchParams({
    limit: "4",
    sort: "sold",
  });

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/products/approved?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`[PopularProducts] API ${res.status}: ${res.statusText}, URL: ${url}`);
      return {
        items: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }

    return res.json() as Promise<ProductResponse>;
  } catch (error) {
    console.error("[PopularProducts] Fetch xatolik:", error);
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
}

export const PopularProducts = async () => {
  const data = await getPopularProducts();

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Ommabop</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Ko'p sotilayotgan hujjatlar
            </h2>
            <p className="text-muted-foreground">
              Foydalanuvchilar eng ko'p xarid qilgan hujjatlar
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="group">
              Barchasini ko'rish
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              className={`animate-fade-up stagger-${index + 1}`}
            />
          ))}
        </div>

        <div className="sm:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {data.items.map((product, index) => (
                <CarouselItem key={index} className="pl-4 basis-[85%]">
                  <ProductCard
                    product={product}
                    className={`animate-fade-up stagger-${index + 1}`}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
