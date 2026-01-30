"use client";

import { useState } from "react";
import { usePublicBlogs } from "@/hooks/use-blogs";
import { BlogCard } from "@/components/blog/blog-card";
import { AdBanner } from "@/components/layout/ad-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export function HomeContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { data, isLoading } = usePublicBlogs({ page, limit: 7, search });

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;
  const featuredBlog = blogs[0];
  const restBlogs = blogs.slice(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02]" />
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
            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : blogs.length === 0 ? (
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
                <BlogCard blog={featuredBlog} featured />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="gap-1.5 text-[13px]"
                >
                  <ChevronLeft size={14} /> Prev
                </Button>
                <span className="text-[13px] text-muted-foreground tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="gap-1.5 text-[13px]"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
