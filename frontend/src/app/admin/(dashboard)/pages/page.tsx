"use client";

import Link from "next/link";
import { useAdminPages } from "@/hooks/use-pages";
import { FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPagesPage() {
  const { data, isLoading } = useAdminPages();
  const pages = data?.pages || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Pages
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Modified</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <FileText size={16} />
                      </div>
                      <span className="font-medium text-sm">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs bg-secondary px-2 py-1 rounded">/{page.slug}</code>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(page.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/pages/${page.slug}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Pencil size={13} /> Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No pages found. Run the database seed to create default pages.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
