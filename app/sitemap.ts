import type { MetadataRoute } from "next";
import { departments } from "./departamentos/departments";
import { isDemoProduct, productPath } from "./lib/product-page";
import { getDepartmentsWithLiveProducts } from "./lib/products-source.server";
import { getSiteUrl } from "./lib/site-config";
import { storeSlug, stores } from "./lojas/stores";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${base}/lojas/${storeSlug(store)}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Um produto que está em dois departamentos tem uma página só.
  const productPaths = new Set((await getDepartmentsWithLiveProducts()).flatMap((department) => department.products.filter((product) => !isDemoProduct(product)).map(productPath)));
  const productRoutes: MetadataRoute.Sitemap = [...productPaths].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: 0.6 }));

  return [...staticRoutes, ...departmentRoutes, ...storeRoutes, ...productRoutes];
}
