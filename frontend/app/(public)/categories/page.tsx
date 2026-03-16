import { CategoryCard } from "@/components/category/CategoryCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ICategory, IPagination } from "@/interface";
import { Metadata } from "next";

interface CategoryResponse {
  items: ICategory[];
  pagination: IPagination;
}

async function getCategories(): Promise<CategoryResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100`,
    {
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 100, totalPages: 1 },
    };
  }

  return res.json();
}

export const metadata: Metadata = {
  title: "Barcha kategoriyalar | DocLab",
  description:
    "DocLab platformasidagi barcha hujjat kategoriyalari. Kerakli hujjatni tez va oson toping.",
  alternates: {
    canonical: "/categories",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Barcha kategoriyalar | DocLab",
    description: "DocLab platformasidagi barcha hujjat kategoriyalari.",
    type: "website",
  },
};

const Categories = async () => {
  const data = await getCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Barcha kategoriyalar
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              O&apos;zingizga kerakli toifadagi hujjatlarni tanlang va
              professional materiallarga ega bo&apos;ling
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.items.map((category, index) => (
              <CategoryCard
                key={index}
                category={category}
                className={`animate-fade-up stagger-${(index % 5) + 1}`}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
