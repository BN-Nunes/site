import type { MetadataRoute } from "next";
import { departments } from "./departamentos/departments";
import { getSiteUrl } from "./lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/lojas`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/quem-somos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politica-de-cookies`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const departmentRoutes: MetadataRoute.Sitemap = departments.map((department) => ({
    url: `${base}/departamentos/${department.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...departmentRoutes];
}
