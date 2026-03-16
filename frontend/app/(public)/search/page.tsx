import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ICategory, IPagination, IProduct } from "@/interface";
import { Metadata } from "next";
import SearchClient from "./SearchClient";

interface ProductsResponse {
  items: IProduct<string, string>[];
  pagination: IPagination;
}

interface CategoriesResponse {
  items: ICategory[];
}

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    limit?: string;
  }>;
}

async function getProducts(params: {
  q?: string;
  category?: string;
  page: number;
  limit: number;
}): Promise<ProductsResponse> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.q) qs.set("search", params.q);
  if (params.category) qs.set("categoryId", params.category);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/approved?${qs}`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
  } catch (error) {
    console.error("Product fetch error:", error);
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: params.limit, totalPages: 1 },
    };
  }
}

async function getCategories(): Promise<ICategory[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=100&page=1`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) return [];
    const data: CategoriesResponse = await res.json();
    return data.items;
  } catch (error) {
    console.error("Category fetch error:", error);
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const { page, q } = resolvedParams;

  const title = q
    ? `"${q}" bo‘yicha qidiruv – sahifa ${page ?? 1} | DocLab`
    : `Qidiruv | DocLab`;

  const description = q
    ? `"${q}" bo‘yicha topilgan hujjatlar, shablonlar va materiallar`
    : "DocLab hujjatlari bo‘yicha qidiruv";

  return {
    title,
    description,
    robots: {
      index: !q || Number(page ?? 1) === 1,
      follow: true,
    },
    alternates: {
      canonical: `/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page ?? 1);
  const q = resolvedParams.q;
  const category = resolvedParams.category;
  const limit = [10, 20, 30, 50, 100].includes(Number(resolvedParams.limit))
    ? Number(resolvedParams.limit)
    : 10;

  const [products, categories] = await Promise.all([
    getProducts({
      q,
      category,
      page,
      limit,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <SearchClient
        products={products}
        categories={categories}
        searchParams={resolvedParams}
        page={page}
      />

      <Footer />
    </div>
  );
}
