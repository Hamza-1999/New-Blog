"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle, Target } from "lucide-react";

interface SEOAnalyzerProps {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  slug: string;
}

interface SEOCheck {
  label: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

export function SEOAnalyzer({
  title,
  content,
  metaTitle,
  metaDescription,
  metaKeywords,
  slug,
}: SEOAnalyzerProps) {
  const plainContent = content.replace(/<[^>]*>/g, "");
  const wordCount = plainContent.split(/\s+/).filter(Boolean).length;
  const focusKeyword = metaKeywords.split(",")[0]?.trim().toLowerCase() || "";

  const checks = useMemo<SEOCheck[]>(() => {
    const results: SEOCheck[] = [];

    // Title checks
    if (!title) {
      results.push({ label: "Post Title", status: "fail", message: "Add a title to your post" });
    } else if (title.length < 30) {
      results.push({ label: "Post Title", status: "warning", message: "Title is too short. Aim for 50-60 characters" });
    } else if (title.length > 70) {
      results.push({ label: "Post Title", status: "warning", message: "Title is too long. Keep under 60 characters for best SEO" });
    } else {
      results.push({ label: "Post Title", status: "pass", message: "Title length is optimal" });
    }

    // Meta title
    const mt = metaTitle || title;
    if (!mt) {
      results.push({ label: "Meta Title", status: "fail", message: "Add a meta title" });
    } else if (mt.length >= 50 && mt.length <= 60) {
      results.push({ label: "Meta Title", status: "pass", message: `Meta title length (${mt.length}) is perfect` });
    } else {
      results.push({ label: "Meta Title", status: "warning", message: `Meta title length is ${mt.length}. Aim for 50-60 characters` });
    }

    // Meta description
    if (!metaDescription) {
      results.push({ label: "Meta Description", status: "fail", message: "Add a meta description" });
    } else if (metaDescription.length >= 120 && metaDescription.length <= 160) {
      results.push({ label: "Meta Description", status: "pass", message: `Meta description length (${metaDescription.length}) is optimal` });
    } else if (metaDescription.length < 120) {
      results.push({ label: "Meta Description", status: "warning", message: `Too short (${metaDescription.length}). Aim for 120-160 characters` });
    } else {
      results.push({ label: "Meta Description", status: "warning", message: `Too long (${metaDescription.length}). Keep under 160 characters` });
    }

    // Focus keyword
    if (!focusKeyword) {
      results.push({ label: "Focus Keyword", status: "fail", message: "Add at least one keyword" });
    } else {
      results.push({ label: "Focus Keyword", status: "pass", message: `Focus keyword: "${focusKeyword}"` });

      // Keyword in title
      if (title.toLowerCase().includes(focusKeyword)) {
        results.push({ label: "Keyword in Title", status: "pass", message: "Focus keyword found in title" });
      } else {
        results.push({ label: "Keyword in Title", status: "fail", message: "Add focus keyword to your title" });
      }

      // Keyword in meta description
      if (metaDescription.toLowerCase().includes(focusKeyword)) {
        results.push({ label: "Keyword in Meta Desc", status: "pass", message: "Focus keyword found in meta description" });
      } else {
        results.push({ label: "Keyword in Meta Desc", status: "warning", message: "Add focus keyword to meta description" });
      }

      // Keyword in slug
      if (slug.toLowerCase().includes(focusKeyword.replace(/\s+/g, "-"))) {
        results.push({ label: "Keyword in URL", status: "pass", message: "Focus keyword found in permalink" });
      } else {
        results.push({ label: "Keyword in URL", status: "warning", message: "Consider adding focus keyword to permalink" });
      }

      // Keyword in content
      const keywordCount = (plainContent.toLowerCase().match(new RegExp(focusKeyword, "g")) || []).length;
      const density = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(1) : "0";
      if (keywordCount === 0) {
        results.push({ label: "Keyword in Content", status: "fail", message: "Focus keyword not found in content" });
      } else if (parseFloat(density) > 3) {
        results.push({ label: "Keyword Density", status: "warning", message: `Keyword density (${density}%) is too high. Aim for 1-2%` });
      } else {
        results.push({ label: "Keyword Density", status: "pass", message: `Keyword density is ${density}% (${keywordCount} times)` });
      }
    }

    // Content length
    if (wordCount < 100) {
      results.push({ label: "Content Length", status: "fail", message: `Only ${wordCount} words. Write at least 300 words` });
    } else if (wordCount < 300) {
      results.push({ label: "Content Length", status: "warning", message: `${wordCount} words. Aim for 600+ words for better SEO` });
    } else if (wordCount >= 600) {
      results.push({ label: "Content Length", status: "pass", message: `Great! ${wordCount} words` });
    } else {
      results.push({ label: "Content Length", status: "warning", message: `${wordCount} words. 600+ words is recommended` });
    }

    // Heading structure
    const hasH2 = /<h2/i.test(content);
    const hasH3 = /<h3/i.test(content);
    if (hasH2) {
      results.push({ label: "Subheadings", status: "pass", message: "Content uses subheadings" });
    } else if (wordCount > 300) {
      results.push({ label: "Subheadings", status: "warning", message: "Add H2/H3 subheadings to structure your content" });
    }

    // Images
    const imageCount = (content.match(/<img/g) || []).length;
    if (imageCount > 0) {
      results.push({ label: "Images", status: "pass", message: `${imageCount} image(s) found in content` });
    } else if (wordCount > 200) {
      results.push({ label: "Images", status: "warning", message: "Add images to make content more engaging" });
    }

    // Links
    const linkCount = (content.match(/<a /g) || []).length;
    if (linkCount > 0) {
      results.push({ label: "Links", status: "pass", message: `${linkCount} link(s) found` });
    } else if (wordCount > 300) {
      results.push({ label: "Links", status: "warning", message: "Add internal or external links" });
    }

    // Permalink
    if (!slug) {
      results.push({ label: "Permalink", status: "fail", message: "Set a permalink for your post" });
    } else if (slug.length > 75) {
      results.push({ label: "Permalink", status: "warning", message: "Permalink is too long. Keep it concise" });
    } else {
      results.push({ label: "Permalink", status: "pass", message: "Permalink is set" });
    }

    return results;
  }, [title, content, metaTitle, metaDescription, focusKeyword, slug, plainContent, wordCount]);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const score = checks.length > 0 ? Math.round((passCount / checks.length) * 100) : 0;

  const scoreColor =
    score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-500" : "text-red-500";
  const scoreBg =
    score >= 80 ? "bg-emerald-50 border-emerald-200" : score >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Target size={18} className="text-primary" />
        <h3 className="font-semibold text-sm">SEO Analysis</h3>
      </div>

      <div className={cn("p-4 border-b border-border", scoreBg)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SEO Score</span>
          <span className={cn("text-2xl font-bold", scoreColor)}>{score}/100</span>
        </div>
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
        {checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 py-1.5"
          >
            <span className="mt-0.5 flex-shrink-0">
              {check.status === "pass" && <Check size={14} className="text-emerald-600" />}
              {check.status === "fail" && <X size={14} className="text-red-500" />}
              {check.status === "warning" && <AlertTriangle size={14} className="text-amber-500" />}
            </span>
            <div>
              <span className="text-xs font-semibold text-foreground">{check.label}: </span>
              <span className="text-xs text-muted-foreground">{check.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
