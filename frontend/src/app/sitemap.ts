import { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getPageUpdatedAt(slug: string): Promise<Date> {
  try {
    const res = await fetch(`${API_URL}/pages/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      return new Date(data.page.updatedAt);
    }
  } catch {
    // fallback
  }
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [aboutDate, privacyDate, termsDate] = await Promise.all([
    getPageUpdatedAt("about"),
    getPageUpdatedAt("privacy-policy"),
    getPageUpdatedAt("terms"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: aboutDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: privacyDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: termsDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API_URL}/blogs/public?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      blogPages = data.blogs.map(
        (blog: { slug: string; updatedAt: string }) => ({
          url: `${SITE_URL}/blog/${blog.slug}`,
          lastModified: new Date(blog.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.9,
        })
      );
    }
  } catch {
    // API might not be running during build
  }

  return [...staticPages, ...blogPages];
}
