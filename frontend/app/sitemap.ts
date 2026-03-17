import { MetadataRoute } from "next";

const BASE_URL = "https://doclab.uz";
const API_URL = "https://api.doclab.uz/api";
const ITEMS_PER_SITEMAP = 50000;

type SitemapItem = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

export async function generateSitemaps() {
  try {
    const countRes = await fetch(`${API_URL}/products/sitemap-count`, {
      next: { revalidate: 3600 },
    });
    const totalProducts = await countRes.json();

    const productSitemapCount = Math.ceil(totalProducts / ITEMS_PER_SITEMAP);

    const sitemaps = [{ id: "0" }];

    for (let i = 0; i < productSitemapCount; i++) {
      sitemaps.push({ id: (i + 1).toString() });
    }

    return sitemaps;
  } catch (error) {
    console.error("Generate Sitemaps Error:", error);
    return [{ id: "0" }];
  }
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const idStr = await props.id;
  const id = Number(idStr);

  const staticRoutes: MetadataRoute.Sitemap =
    id === 0
      ? [
          {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
          },
          {
            url: `${BASE_URL}/catalog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
          },
          {
            url: `${BASE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          },
          {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          },
          {
            url: `${BASE_URL}/authors`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          },
          {
            url: `${BASE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
          },
          {
            url: `${BASE_URL}/help`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.4,
          },
          {
            url: `${BASE_URL}/user-agreement`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
          },
          {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
          },
        ]
      : [];

  try {
    if (id === 0) {
      const categoriesRes = await fetch(`${API_URL}/categories/sitemap-data`, {
        next: { revalidate: 3600 },
      });
      const categories: SitemapItem[] = await categoriesRes.json();

      const authorsRes = await fetch(`${API_URL}/users/sitemap-data`, {
        next: { revalidate: 3600 },
      });
      const authors: any[] = await authorsRes.json();

      const categoryRoutes: MetadataRoute.Sitemap = categories.map((item) => ({
        url: `${BASE_URL}/category/${item.slug}`,
        lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

      const authorRoutes: MetadataRoute.Sitemap = authors.map((item) => ({
        url: `${BASE_URL}/author/${item.id}`,
        lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

      return [...staticRoutes, ...categoryRoutes, ...authorRoutes];
    }

    const productsRes = await fetch(
      `${API_URL}/products/sitemap-ids?page=${id}&limit=${ITEMS_PER_SITEMAP}`,
      { next: { revalidate: 3600 } },
    );

    const products: SitemapItem[] = await productsRes.json();

    const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
      url: `${BASE_URL}/product/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return productRoutes;
  } catch (error) {
    console.error(`SITEMAP ERROR (ID: ${id}):`, error);
    return [];
  }
}
