import axios from "axios";
import { AdPlacement } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/admin") && path !== "/admin/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    api.put("/auth/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};

// Blogs API
export const blogsApi = {
  getPublic: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/blogs/public", { params }),
  getPublicBySlug: (slug: string) => api.get(`/blogs/public/${slug}`),
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get("/blogs", { params }),
  getById: (id: string) => api.get(`/blogs/${id}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post("/blogs", data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: string, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
};

// Upload API
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    return api.post("/upload/thumbnail", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Settings API
export const settingsApi = {
  getAll: () => api.get("/settings"),
  get: (key: string) => api.get("/settings", { params: { key } }),
  update: (key: string, value: string) =>
    api.put("/settings", { key, value }),
};

// Ad Slots API
export const adSlotsApi = {
  getAll: () => api.get("/ad-slots"),
  getByPlacement: (placement: AdPlacement) =>
    api.get("/ad-slots", { params: { placement } }),
  getAdmin: () => api.get("/ad-slots/admin"),
  create: (data: {
    name: string;
    slotId: string;
    format: string;
    placement: string;
    isActive?: boolean;
  }) => api.post("/ad-slots", data),
  update: (
    id: string,
    data: {
      name?: string;
      slotId?: string;
      format?: string;
      placement?: string;
      isActive?: boolean;
    }
  ) => api.put(`/ad-slots/${id}`, data),
  delete: (id: string) => api.delete(`/ad-slots/${id}`),
};

// Pages API
export const pagesApi = {
  getAll: () => api.get("/pages"),
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
  update: (
    slug: string,
    data: {
      title: string;
      content: string;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
    }
  ) => api.put(`/pages/${slug}`, data),
};

// Users API
export const usersApi = {
  getAll: () => api.get("/users"),
  create: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    bio?: string;
  }) => api.post("/users", data),
  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: string;
      bio?: string;
      password?: string;
    }
  ) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
