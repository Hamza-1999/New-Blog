"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAdminBlogs, useDeleteBlog } from "@/hooks/use-blogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useAdminBlogs({ page, limit: 10, status, search });
  const deleteMutation = useDeleteBlog();

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (!blogs.length) {
      if (selectedIds.size > 0) {
        setSelectedIds(new Set());
      }
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set<string>();
      blogs.forEach((blog) => {
        if (prev.has(blog.id)) {
          next.add(blog.id);
        }
      });
      return next;
    });
  }, [blogs, selectedIds.size]);

  const selectedCount = selectedIds.size;
  const allSelected = useMemo(
    () => blogs.length > 0 && blogs.every((blog) => selectedIds.has(blog.id)),
    [blogs, selectedIds]
  );
  const someSelected = useMemo(
    () => blogs.some((blog) => selectedIds.has(blog.id)) && !allSelected,
    [blogs, selectedIds, allSelected]
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Blog deleted");
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (blogs.length === 0) return prev;
      const next = new Set<string>();
      const shouldSelectAll = !blogs.every((blog) => prev.has(blog.id));
      if (shouldSelectAll) {
        blogs.forEach((blog) => next.add(blog.id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} selected blog${count > 1 ? "s" : ""}?`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds(new Set());
      toast.success(`${count} blog${count > 1 ? "s" : ""} deleted`);
    } catch {
      toast.error("Failed to delete selected blogs");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const tabs = [
    { label: "All", value: "" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Blogs
        </h1>
        <Link href="/admin/blogs/new">
          <Button className="gap-2">
            <Plus size={16} /> New Blog
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                status === tab.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm ml-auto">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search blogs..."
              className="pl-9 h-9"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Blog List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <FileText size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No blogs found</p>
            <p className="text-sm mt-1">Create your first blog post to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="px-4 py-3 flex flex-wrap items-center gap-3 bg-card">
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  aria-label="Select all blogs"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border border-input"
                />
                {selectedCount > 0 ? `${selectedCount} selected` : "Select all"}
              </label>
              {selectedCount > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="h-8"
                >
                  Delete selected
                </Button>
              )}
            </div>
            {blogs.map((blog) => (
              <div key={blog.id} className="p-4 flex items-center gap-4 hover:bg-accent/20 transition-colors">
                <input
                  type="checkbox"
                  aria-label={`Select blog ${blog.title}`}
                  checked={selectedIds.has(blog.id)}
                  onChange={() => toggleSelected(blog.id)}
                  className="h-4 w-4 rounded border border-input"
                />
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                  <img src={blog.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{blog.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{blog.author.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(blog.createdAt)}</span>
                    <Badge variant={blog.status === "published" ? "success" : "warning"} className="text-[10px]">
                      {blog.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/blogs/${blog.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil size={14} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(blog.id, blog.title)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
