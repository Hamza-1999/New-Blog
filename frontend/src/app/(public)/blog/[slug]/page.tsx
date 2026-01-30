import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdBanner } from "@/components/layout/ad-banner";
import { ArrowLeft, Clock, CalendarDays } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blogs/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.blog;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Not Found" };

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.metaKeywords?.split(",").map((k: string) => k.trim()),
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.author.name],
      images: [{ url: blog.thumbnail, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: [blog.thumbnail],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${blog.slug}`,
    },
  };
}

function getReadingTime(content: string) {
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.metaDescription || blog.excerpt,
        image: blog.thumbnail,
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt,
        author: { "@type": "Person", name: blog.author.name },
        publisher: {
          "@type": "Organization",
          name: "Flavor Journal",
          url: SITE_URL,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${blog.slug}` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: blog.title,
            item: `${SITE_URL}/blog/${blog.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <article className="max-w-3xl flex-1 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={13} />
              All articles
            </Link>

            <header className="mb-8">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-[1.15]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[13px]">
                    {blog.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight">{blog.author.name}</p>
                    {blog.author.bio && (
                      <p className="text-[11px] text-muted-foreground">{blog.author.bio}</p>
                    )}
                  </div>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {getReadingTime(blog.content)}
                  </span>
                </div>
              </div>

              <div className="relative aspect-[2/1] rounded-xl overflow-hidden">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </header>

            <AdBanner placement="blog_above_content" className="mb-8" />

            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            <AdBanner placement="blog_below_content" className="mt-8 mb-8" />

            <div className="mt-10 p-6 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {blog.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] mb-0.5">Written by</p>
                  <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-display)" }}>
                    {blog.author.name}
                  </h3>
                  {blog.author.bio && (
                    <p className="text-muted-foreground text-[13px] mt-0.5">{blog.author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </article>

          <aside className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="sticky top-8">
              <AdBanner placement="blog_sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
