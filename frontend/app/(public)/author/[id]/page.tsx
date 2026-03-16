import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { IProduct } from "@/interface";
import { Metadata } from "next";
import AuthorClient from "./AuthorClient";

interface ProfileResponse {
  _id: string;
  full_name: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  totalProducts: number;
  totalViews: number;
  totalSold: number;
  products: {
    items: IProduct<string, string>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    limit?: string;
  }>;
}

async function getAuthor(
  id: string,
  page: number,
  limit: number,
  search?: string,
): Promise<ProfileResponse | null> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search) qs.set("search", search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}?${qs}`,
    { next: { revalidate: 300 } },
  );

  if (!res.ok) return null;
  return res.json();
}

async function getSellerRunk(id: string): Promise<number | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/stats/rank/${id}`,
    { cache: "no-store" },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.rank;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const { search, page } = await searchParams;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return {
      title: "Muallif topilmadi | DocLab",
      description: "So‘ralgan muallif mavjud emas",
      robots: { index: false, follow: false },
    };
  }

  const user: ProfileResponse = await res.json();

  const baseTitle = search
    ? `"${search}" – ${user.full_name} hujjatlari`
    : `${user.full_name} – DocLab sotuvchisi va barcha hujjatlari`;

  const title = Number(page) > 1 ? `${baseTitle} | Sahifa ${page}` : baseTitle;

  const description = user.bio
    ? `${user.full_name} – ${user.bio}. DocLab orqali ${user.full_name} tomonidan tayyorlangan professional hujjatlar, shablonlar va materiallarni yuklab oling.`
    : `${user.full_name} – DocLab platformasidagi professional muallif. Uning barcha hujjatlari, shablonlari va ishlanmalari bilan tanishing.`;

  const BASE_URL = "https://www.doclab.uz";
  const pageNum = Number(page) || 1;
  const urlParams = new URLSearchParams();
  if (pageNum > 1) urlParams.set("page", String(pageNum));
  if (search) urlParams.set("search", search);
  const qs = urlParams.toString();
  const canonicalPath = `/author/${id}${qs ? `?${qs}` : ""}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  const avatarUrl = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${BASE_URL}${user.avatar.startsWith("/") ? "" : "/"}${user.avatar}`
    : `${BASE_URL}/logo.png`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title,
      description,
      type: "profile",
      locale: "uz_UZ",
      url: canonicalUrl,
      siteName: "DocLab",
      images: [
        {
          url: avatarUrl,
          width: 400,
          height: 400,
          alt: user.full_name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatarUrl],
    },

    robots: {
      index: Number(page) === 1,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const paramsResult = await params;
  const searchResult = await searchParams;

  const page = Number(searchResult.page ?? 1);
  const limit = [10, 20, 30, 50, 100].includes(Number(searchResult.limit))
    ? Number(searchResult.limit)
    : 10;
  const search = searchResult.search;

  const data = await getAuthor(paramsResult.id, page, limit, search);
  const rank = await getSellerRunk(paramsResult.id);

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <h1 className="text-2xl font-bold">Muallif topilmadi</h1>
        </main>
        <Footer />
      </>
    );
  }

  const BASE_URL = "https://www.doclab.uz";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.full_name,
    url: `${BASE_URL}/author/${data._id}`,
    image: data.avatar || `${BASE_URL}/logo.png`,
    description:
      data.bio || `${data.full_name} – DocLab dagi professional muallif.`,
    jobTitle: "Author",
    worksFor: {
      "@type": "Organization",
      name: "DocLab",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Bosh sahifa",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mualliflar",
        item: `${BASE_URL}/authors`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.full_name,
        item: `${BASE_URL}/author/${paramsResult.id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      <AuthorClient
        data={data}
        page={page}
        limit={limit}
        search={search}
        authorId={paramsResult.id}
        rank={rank}
      />
      <Footer />
    </div>
  );
}
