import { AdFormat, AdPlacement } from "@/types";

export const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  home_after_featured: "Home - After Featured Post",
  home_below_grid: "Home - Below Blog Grid",
  blog_above_content: "Blog Post - Above Content",
  blog_below_content: "Blog Post - Below Content",
  blog_sidebar: "Blog Post - Sidebar",
  home_sidebar: "Home - Sidebar",
};

export const FORMAT_LABELS: Record<AdFormat, string> = {
  horizontal: "Horizontal (Responsive)",
  rectangle: "Rectangle (336x280)",
  square: "Square (300x250)",
};

export const ALL_PLACEMENTS: AdPlacement[] = Object.keys(PLACEMENT_LABELS) as AdPlacement[];
export const ALL_FORMATS: AdFormat[] = Object.keys(FORMAT_LABELS) as AdFormat[];
