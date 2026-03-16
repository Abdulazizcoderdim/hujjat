import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ServerPagination } from "@/components/ServerPagination";
import { ICategory, IPagination, IProduct } from "@/interface";
import { Metadata } from "next";
import ProductClient from "./ProductClient";

interface Props {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
  }>;
}

interface ProductResponse {
  items: IProduct<string, string>[];
  pagination: IPagination;
}

interface CategoryResponse {
  items: ICategory[];
}

async function getProducts({
  page,
  limit,
  search,
  category,
}: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}): Promise<ProductResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: "popular",
  });

  if (search) params.set("search", search);
  if (category) params.set("categoryId", category);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/approved?${params.toString()}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) {
    return {
      items: [],
      pagination: { total: 0, page, limit, totalPages: 1 },
    };
  }

  return res.json();
}

async function getCategories(): Promise<CategoryResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100&page=1`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return { items: [] };
  return res.json();
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const searchResults = await searchParams;
  const page = Number(searchResults.page ?? 1);
  const search = searchResults.search;

  const titleBase = search
    ? `"${search}" bo‘yicha hujjatlar`
    : "Barcha hujjatlar";

  return {
    title: `${titleBase} – sahifa ${page} | DocLab`,
    description: search
      ? `"${search}" bo‘yicha topilgan professional hujjatlar`
      : "DocLab’dagi barcha professional hujjatlar, shablonlar va materiallar",
    alternates: {
      canonical: `/products?page=${page}${search ? `&search=${search}` : ""}`,
    },
    openGraph: {
      title: titleBase,
      description: "Professional hujjatlar katalogi",
      type: "website",
    },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const searchResults = await searchParams;
  const page = Number(searchResults.page ?? 1);
  const search = searchResults.search;
  const limit = [10, 20, 30, 50, 100].includes(Number(searchResults.limit))
    ? Number(searchResults.limit)
    : 10;

  const [products, categories] = await Promise.all([
    getProducts({
      page,
      limit,
      search,
      category: searchResults.category,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {search ? `"${search}" bo‘yicha hujjatlar` : "Barcha hujjatlar"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional hujjatlar, shablonlar va materiallarning eng katta
              to&apos;plami
            </p>
          </div>

          <ProductClient
            search={search}
            data={products}
            categories={categories.items}
          />

          <ServerPagination
            page={page}
            totalPages={products.pagination.totalPages}
            hrefBase={`products`}
            searchParams={{
              search,
              category: searchResults.category,
              limit: String(limit),
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
