
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/admin", "/auth"],
    },
    sitemap: `${getSiteUrl() || "https://muaraku.id"}/sitemap.xml`,
  };
}
