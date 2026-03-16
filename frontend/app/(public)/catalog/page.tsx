import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ICategory, IPagination, IProduct } from "@/interface";
import { Metadata } from "next";
import CatalogClient from "./CatalogClient";

interface Props {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    category?: string;
    sort?: string;
    search?: string;
  }>;
}

interface ProductResponse {
  items: IProduct<string, string>[];
  pagination: IPagination;
}

interface CategoryResponse {
  items: ICategory[];
}

async function getProducts(params: {
  page: number;
  limit: number;
  category?: string;
  sort?: string;
  search?: string;
}): Promise<ProductResponse> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sort: params.sort ?? "new",
  });

  if (params.category) qs.set("categoryId", params.category);
  if (params.search) qs.set("search", params.search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/approved?${qs.toString()}`,
    { next: { revalidate: 300 } },
  );

  if (!res.ok) {
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: params.limit, totalPages: 1 },
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

  return {
    title: search
      ? `"${search}" bo‘yicha hujjatlar – ${page}`
      : `Hujjatlar katalogi – ${page}`,
    description: "Professional hujjatlar katalogi",
  };
}

export default async function CatalogPage({ searchParams }: Props) {
  const searchResults = await searchParams;
  const page = Number(searchResults.page ?? 1);
  const limit = [10, 20, 30, 50, 100].includes(Number(searchResults.limit))
    ? Number(searchResults.limit)
    : 10;

  const [products, categories] = await Promise.all([
    getProducts({
      page,
      limit,
      category: searchResults.category,
      sort: searchResults.sort,
      search: searchResults.search,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <CatalogClient
        products={products}
        categories={categories.items}
        page={page}
      />

      <Footer />
    </div>
  );
}
