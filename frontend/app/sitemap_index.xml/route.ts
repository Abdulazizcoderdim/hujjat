import { NextResponse } from "next/server";

const BASE_URL = "https://doclab.uz";
const API_URL = "https://api.doclab.uz/api";
const ITEMS_PER_SITEMAP = 50000;

export const revalidate = 3600;

export async function GET() {
  try {
    const countRes = await fetch(`${API_URL}/products/sitemap-count`, {
      next: { revalidate: 3600 },
    });
    const totalProducts = await countRes.json();
    const productSitemapCount = Math.ceil(totalProducts / ITEMS_PER_SITEMAP);

    const sitemapUrls: string[] = [`${BASE_URL}/sitemap/0.xml`];
    for (let i = 0; i < productSitemapCount; i++) {
      sitemapUrls.push(`${BASE_URL}/sitemap/${i + 1}.xml`);
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...sitemapUrls.map(
        (url) =>
          `  <sitemap><loc>${url}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`,
      ),
      "</sitemapindex>",
    ].join("\n");

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
      },
    });
  } catch (error) {
    console.error("Sitemap index error:", error);
    const fallbackXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      `  <sitemap><loc>${BASE_URL}/sitemap/0.xml</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`,
      "</sitemapindex>",
    ].join("\n");

    return new NextResponse(fallbackXml, {
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
      },
    });
  }
}
