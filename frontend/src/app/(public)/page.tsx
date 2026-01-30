import { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/blog-card";
import { AdBanner } from "@/components/layout/ad-banner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Blog, BlogsResponse } from "@/types";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const metadata: Metadata = {
  title: "Flavor Journal - Stories, Ideas & Insights",
  description:
    "A curated collection of thoughtful articles, deep insights, and compelling narratives. Discover stories worth reading.",
  openGraph: {
    title: "Flavor Journal - Stories, Ideas & Insights",
    description:
      "A curated collection of thoughtful articles, deep insights, and compelling narratives.",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Journal - Stories, Ideas & Insights",
    description:
      "A curated collection of thoughtful articles, deep insights, and compelling narratives.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

async function getBlogs({
  page,
  search,
}: {
  page: number;
  search: string;
}): Promise<BlogsResponse> {
  try {
    const url = new URL(`${API_URL}/blogs/public`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "7");
    if (search) {
      url.searchParams.set("search", search);
    }

    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) {
      return { blogs: [], pagination: { page, limit: 7, total: 0, totalPages: 0 } };
    }

    const data = (await res.json()) as BlogsResponse;
    return data;
  } catch {
    return { blogs: [], pagination: { page, limit: 7, total: 0, totalPages: 0 } };
  }
}

function buildPageHref(page: number, search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { page?: string; search?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const search = (searchParams?.search ?? "").trim();
  const data = await getBlogs({ page, search });
  const blogs = data.blogs || [];
  const pagination = data.pagination;
  const featuredBlog = blogs[0];
  const restBlogs = blogs.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-primary/2" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10 relative">
          <div className="max-w-xl animate-fade-up">
            <p className="text-primary font-semibold text-[11px] tracking-[0.2em] uppercase mb-3">
              Welcome to Flavor Journal
            </p>
            <h1
              className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stories worth
              <span className="text-primary block">reading.</span>
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6 max-w-md">
              A curated collection of thoughtful articles, deep insights, and compelling narratives.
            </p>
            <form action="/" method="get" className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  defaultValue={search}
                  placeholder="Search articles..."
                  className="pl-9 h-9 text-[13px]"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={36} className="mx-auto text-muted-foreground/30 mb-3" />
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              No articles found
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {search ? "Try a different search term" : "Check back soon for new content"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredBlog && page === 1 && !search && (
              <div className="mb-8 animate-fade-up">
                <BlogCard blog={featuredBlog as Blog} featured />
              </div>
            )}

            <AdBanner placement="home_after_featured" className="mb-8" />

            {/* Section heading */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {search ? `Results for "${search}"` : "Latest Articles"}
              </h2>
              {pagination && (
                <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
                  {pagination.total} article{pagination.total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {(page === 1 && !search ? restBlogs : blogs).map((blog, i) => (
                <div key={blog.id} className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            <AdBanner placement="home_below_grid" className="mb-8" />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                {page > 1 ? (
                  <Link
                    href={buildPageHref(page - 1, search)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 text-[13px]"
                    )}
                  >
                    <ChevronLeft size={14} /> Prev
                  </Link>
                ) : (
                  <span
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 text-[13px] pointer-events-none opacity-50"
                    )}
                  >
                    <ChevronLeft size={14} /> Prev
                  </span>
                )}

                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>

                {page < pagination.totalPages ? (
                  <Link
                    href={buildPageHref(page + 1, search)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 text-[13px]"
                    )}
                  >
                    Next <ChevronRight size={14} />
                  </Link>
                ) : (
                  <span
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 text-[13px] pointer-events-none opacity-50"
                    )}
                  >
                    Next <ChevronRight size={14} />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
