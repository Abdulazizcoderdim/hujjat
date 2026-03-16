import { Button } from "@/components/ui/button";
import { IPagination, IProduct } from "@/interface";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

interface FeaturedResponse {
  items: IProduct<string, string>[];
  pagination: IPagination;
}

async function getReferat() {
  const params = new URLSearchParams({
    limit: "4",
    categoryId: "69579ae5425b3c86947ed71c",
  });

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/products/approved?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      console.error(`[Referat] API ${res.status}: ${res.statusText}, URL: ${url}`);
      return {
        items: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }

    return res.json() as Promise<FeaturedResponse>;
  } catch (error) {
    console.error("[Referat] Fetch xatolik:", error);
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
}

export const ReferatProducts = async () => {
  const data = await getReferat();

  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-accent mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Referat hujjatlar</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Referat hujjatlar
            </h2>
            {/* <p className="text-muted-foreground">
              Eng yangi va yuqori sifatli hujjatlar
            </p> */}
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
