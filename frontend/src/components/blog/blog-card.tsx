import Link from "next/link";
import { Blog } from "@/types";
import { formatDate, readingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUpRight } from "lucide-react";

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export function BlogCard({ blog, featured = false }: BlogCardProps) {
  if (featured) {
    return (
      <Link href={`/blog/${blog.slug}`} className="group block">
        <article className="overflow-hidden rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden min-h-[240px]">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px] px-2 py-0.5">Featured</Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {readingTime(blog.content)}
                </span>
              </div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {blog.title}
              </h2>
              <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-3">
                {blog.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[10px]">
                    {blog.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight">{blog.author.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(blog.createdAt)}</p>
                  </div>
                </div>
                <span className="text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full">
      <article className="overflow-hidden rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-md hover:shadow-primary/5 h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              {readingTime(blog.content)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(blog.createdAt)}
            </span>
          </div>
          <h3
            className="text-[15px] font-bold mb-1.5 group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {blog.title}
          </h3>
          <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 flex-1">
            {blog.excerpt}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-[9px]">
              {blog.author.name.charAt(0)}
            </div>
            <span className="text-[11px] font-medium">{blog.author.name}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
