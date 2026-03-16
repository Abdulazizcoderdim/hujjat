import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.doclab.uz";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile/", "/admin/", "/api/", "/auth/", "/api/preview/"],
    },
    sitemap: `${baseUrl}/sitemap_index.xml`,
  };
}
