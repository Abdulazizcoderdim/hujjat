import { Button } from "@/components/ui/button";
import { ICategory, IPagination } from "@/interface";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "./CategoryCard";

interface CategoryResponse {
  items: ICategory[];
  pagination: IPagination;
}

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("XATOLIK: API URL topilmadi (.env faylni tekshiring)");
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }

  try {
    const res = await fetch(`${apiUrl}/categories?limit=8`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`API Xatolik qaytardi: ${res.status} ${res.statusText}`);
      return {
        items: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    }

    return (await res.json()) as Promise<CategoryResponse>;
  } catch (error) {
    // Haqiqiy xatoni konsolga chiqarish
    console.error("FETCH FAILED - Batafsil xato:", error);
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }
}

export const CategoriesSection = async () => {
  const data = await getCategories();

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Kategoriyalar
            </h2>
            <p className="text-muted-foreground">
              O&apos;zingizga kerakli toifadagi hujjatlarni toping
            </p>
          </div>
          <Link href="/categories">
            <Button variant="ghost" className="group">
              Barchasi
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {data.items.map((category, index) => (
            <CategoryCard
              key={index}
              category={category}
              className={`animate-fade-up stagger-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
