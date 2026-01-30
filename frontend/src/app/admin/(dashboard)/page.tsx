"use client";

import { useAdminBlogs } from "@/hooks/use-blogs";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Eye, FilePen, Users, Plus, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: allBlogs } = useAdminBlogs({ limit: 100 });
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => { const res = await usersApi.getAll(); return res.data; },
    enabled: user?.role === "admin",
  });

  const blogs = allBlogs?.blogs || [];
  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;
  const recentBlogs = blogs.slice(0, 5);

  const stats = [
    { label: "Total Blogs", value: blogs.length, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "Published", value: publishedCount, icon: Eye, color: "text-emerald-600 bg-emerald-50" },
    { label: "Drafts", value: draftCount, icon: FilePen, color: "text-amber-600 bg-amber-50" },
    ...(user?.role === "admin"
      ? [{ label: "Authors", value: usersData?.users?.length || 0, icon: Users, color: "text-purple-600 bg-purple-50" }]
      : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back, {user?.name}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Here&apos;s what&apos;s happening with your blog
          </p>
        </div>
        <Link href="/admin/blogs/new">
          <Button size="sm" className="gap-1.5 text-[13px]">
            <Plus size={14} /> New Blog
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-[14px]" style={{ fontFamily: "var(--font-display)" }}>
            Recent Blogs
          </h2>
          <Link href="/admin/blogs" className="text-[12px] text-primary hover:underline">View all</Link>
        </div>
        {recentBlogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">No blogs yet. Create your first one!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBlogs.map((blog) => (
              <div key={blog.id} className="px-4 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="text-[13px] font-medium truncate">{blog.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{formatDate(blog.createdAt)}</span>
                    <Badge variant={blog.status === "published" ? "success" : "warning"} className="text-[9px] px-1.5 py-0">
                      {blog.status}
                    </Badge>
                  </div>
                </div>
                <Link href={`/admin/blogs/${blog.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ArrowUpRight size={13} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
