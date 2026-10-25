
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

const BASE_URL = getSiteUrl() || "https://muaraku.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    {
      url: BASE_URL,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/support`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ];

  return publicPages;
}
