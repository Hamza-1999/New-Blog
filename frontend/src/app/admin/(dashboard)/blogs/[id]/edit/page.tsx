"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminBlog, useUpdateBlog, useUploadThumbnail } from "@/hooks/use-blogs";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SEOAnalyzer } from "@/components/seo/seo-analyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { Save, ImagePlus, X, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useAdminBlog(id);
  const updateBlog = useUpdateBlog();
  const uploadThumbnail = useUploadThumbnail();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (data?.blog && !loaded) {
      const blog = data.blog;
      setTitle(blog.title);
      setContent(blog.content);
      setThumbnail(blog.thumbnail);
      setSlug(blog.slug);
      setMetaTitle(blog.metaTitle || "");
      setMetaDescription(blog.metaDescription || "");
      setMetaKeywords(blog.metaKeywords || "");
      setStatus(blog.status);
      setLoaded(true);
    }
  }, [data, loaded]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadThumbnail.mutateAsync(file);
      setThumbnail(res.url);
      toast.success("Thumbnail uploaded");
    } catch {
      toast.error("Failed to upload thumbnail");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (saveStatus: "draft" | "published") => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!content.trim()) { toast.error("Content is required"); return; }
    if (!thumbnail) { toast.error("Thumbnail is required"); return; }

    try {
      await updateBlog.mutateAsync({
        id,
        data: {
          title,
          content,
          thumbnail,
          slug,
          metaTitle: metaTitle || title,
          metaDescription,
          metaKeywords,
          status: saveStatus,
        },
      });
      toast.success(saveStatus === "published" ? "Blog published!" : "Draft saved!");
      router.push("/admin/blogs");
    } catch {
      toast.error("Failed to update blog");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Edit Blog
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSubmit("draft")} disabled={updateBlog.isPending} className="gap-1.5 flex-1 sm:flex-none">
            <FileText size={14} /> <span className="hidden sm:inline">Save </span>Draft
          </Button>
          <Button size="sm" onClick={() => handleSubmit("published")} disabled={updateBlog.isPending} className="gap-1.5 flex-1 sm:flex-none">
            <Eye size={14} /> Publish
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title"
              className="text-lg h-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Permalink</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/blog/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="your-blog-url"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail *</label>
            {thumbnail ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  onClick={() => setThumbnail("")}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/30">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <ImagePlus size={32} className="text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload thumbnail</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            {loaded && <RichTextEditor content={content} onChange={setContent} />}
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
              <span className="text-[10px] text-muted-foreground mt-1 block">{(metaTitle || title).length}/60</span>
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
              <span className="text-[10px] text-muted-foreground mt-1 block">{metaDescription.length}/160</span>
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
