"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminPage, useUpdatePage } from "@/hooks/use-pages";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SEOAnalyzer } from "@/components/seo/seo-analyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data, isLoading } = useAdminPage(slug);
  const updatePage = useUpdatePage();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (data?.page && !loaded) {
      setTitle(data.page.title);
      setContent(data.page.content);
      setMetaTitle(data.page.metaTitle || "");
      setMetaDescription(data.page.metaDescription || "");
      setMetaKeywords(data.page.metaKeywords || "");
      setLoaded(true);
    }
  }, [data, loaded]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      await updatePage.mutateAsync({
        slug,
        data: {
          title,
          content,
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          metaKeywords: metaKeywords || undefined,
        },
      });
      toast.success("Page saved!");
      router.push("/admin/pages");
    } catch {
      toast.error("Failed to save page");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Edit Page
          </h1>
        </div>
        <Button onClick={handleSave} disabled={updatePage.isPending} className="gap-2">
          <Save size={16} /> {updatePage.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              className="text-lg h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            {loaded && (
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your page content..."
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-sm">SEO Settings</h3>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Meta Title</label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Meta title"}
                className="text-sm h-9"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {(metaTitle || title).length}/60
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Meta Description</label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
                className="text-sm"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {metaDescription.length}/160
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Keywords</label>
              <Input
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="text-sm h-9"
              />
            </div>
          </div>

          <SEOAnalyzer
            title={title}
            content={content}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            metaKeywords={metaKeywords}
            slug={slug}
          />
        </div>
      </div>
    </div>
  );
}
