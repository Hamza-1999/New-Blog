export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "author";
  avatar?: string;
  bio?: string;
  createdAt?: string;
  _count?: { blogs: number };
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "draft" | "published";
  authorId: string;
  author: Pick<User, "id" | "name" | "avatar" | "bio">;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: Pagination;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AdFormat = "horizontal" | "rectangle" | "square";

export type AdPlacement =
  | "home_after_featured"
  | "home_below_grid"
  | "blog_above_content"
  | "blog_below_content"
  | "blog_sidebar"
  | "home_sidebar";

export interface AdSlot {
  id: string;
  name: string;
  slotId: string;
  format: AdFormat;
  placement: AdPlacement;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  updatedAt: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  thumbnail: string;
  excerpt?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: "draft" | "published";
}
