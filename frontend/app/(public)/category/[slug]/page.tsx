import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ServerPagination } from "@/components/ServerPagination";
import { Button } from "@/components/ui/button";
import { IPagination, IProduct } from "@/interface";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

interface CategoryRes {
  category: string;
  items: IProduct<string, string>[];
  pagination: IPagination;
}

async function getCategory(
  slug: string,
  page: number,
  limit: number,
): Promise<CategoryRes | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}?page=${page}&limit=${limit}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const limit = [10, 20, 30, 50, 100].includes(Number(resolvedSearchParams.limit))
    ? Number(resolvedSearchParams.limit)
    : 10;
  const data = await getCategory(slug, page, limit);

  if (!data) {
    return { title: "Kategoriya topilmadi | DocLab" };
  }

  return {
    title: `${data.category} – sahifa ${page} | DocLab`,
    description: `${data.category} kategoriyasidagi hujjatlar. Jami ${data.pagination.total} ta.`,
    alternates: {
      canonical: `/category/${slug}?page=${page}`,
    },
    openGraph: {
      title: `${data.category} | DocLab`,
      description: `${data.category} kategoriyasidagi hujjatlar`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const limit = [10, 20, 30, 50, 100].includes(Number(resolvedSearchParams.limit))
    ? Number(resolvedSearchParams.limit)
    : 10;

  const data = await getCategory(slug, page, limit);

  if (!data) notFound();

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8 lg:py-12">
          <div className="container-main">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Kategoriyalarga qaytish
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    {data?.category}
                  </h1>
                  <p className="text-muted-foreground">
                    {data?.items?.length} ta hujjat topildi
                  </p>
                </div>
                {/* <Button variant="outline" className="w-fit">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtrlash
                </Button> */}
              </div>
            </div>

            {/* Products Grid */}
            {data.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  Bu kategoriyada hozircha hujjatlar yo&apos;q
                </p>
                <Link href="/">
                  <Button variant="hero">Bosh sahifaga qaytish</Button>
                </Link>
              </div>
            )}

            <ServerPagination
              page={page}
              totalPages={data.pagination.totalPages}
              hrefBase={`category/${slug}`}
              searchParams={{
                limit: String(limit),
              }}
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
