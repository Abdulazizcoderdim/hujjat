import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import ProductClientPage from "@/components/ProductClientPage";
import { ICategory, IProduct, IUser } from "@/interface";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(
  slug: string,
): Promise<IProduct<ICategory, IUser> | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/byslug/${slug}`,
    {
      cache: "no-store",
      // yoki: next: { revalidate: 60 }
    },
  );

  if (!res.ok) return null;

  return res.json();
}

async function getRelatedProducts(
  slug: string,
): Promise<IProduct<string, string>[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/related/${slug}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Hujjat topilmadi | DocLab",
      robots: { index: false, follow: true },
    };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : "DocLab platformasida sifatli hujjat va shablonlar.";

  const imageUrl = product.poster || "/logo.png";
  const productionUrl = "https://doclab.uz";

  return {
    title: `${product.name} | DocLab`,
    description: description,
    keywords: [
      product.categoryId?.name || "hujjat",
      "shablon",
      "referat",
      "kurs isi",
      "doclab",
    ],
    authors: [{ name: product.authorId?.full_name || "DocLab User" }],

    metadataBase: new URL(productionUrl),
    alternates: {
      canonical: `/product/${slug}`,
    },

    openGraph: {
      title: product.name,
      description: description,
      url: `/product/${slug}`,
      siteName: "DocLab",
      type: "website",
      locale: "uz_UZ",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: description,
      images: [imageUrl],
    },

    robots: {
      index: true,
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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const productData = getProduct(slug);
  const relatedData = getRelatedProducts(slug);

  const [product, relatedProducts] = await Promise.all([
    productData,
    relatedData,
  ]);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.poster || "/logo.png",
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "DocLab",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${slug}`,
      priceCurrency: "UZS",
      price: product.price || 0,
      priceValidUntil: "2025-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "DocLab",
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <main className="flex-1 py-8 lg:py-12">
        <ProductClientPage
          product={product}
          relatedProducts={relatedProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
