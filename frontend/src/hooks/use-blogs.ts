import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogsApi, uploadApi } from "@/lib/api";
import { BlogsResponse, Blog, BlogFormData } from "@/types";

export function usePublicBlogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery<BlogsResponse>({
    queryKey: ["public-blogs", params],
    queryFn: async () => {
      const res = await blogsApi.getPublic(params);
      return res.data;
    },
  });
}

export function usePublicBlog(slug: string) {
  return useQuery<{ blog: Blog }>({
    queryKey: ["public-blog", slug],
    queryFn: async () => {
      const res = await blogsApi.getPublicBySlug(slug);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useAdminBlogs(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  return useQuery<BlogsResponse>({
    queryKey: ["admin-blogs", params],
    queryFn: async () => {
      const res = await blogsApi.getAll(params);
      return res.data;
    },
  });
}

export function useAdminBlog(id: string) {
  return useQuery<{ blog: Blog }>({
    queryKey: ["admin-blog", id],
    queryFn: async () => {
      const res = await blogsApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BlogFormData) => {
      const res = await blogsApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogFormData> }) => {
      const res = await blogsApi.update(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await blogsApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await uploadApi.upload(file);
      return res.data;
    },
  });
}

export function useUploadThumbnail() {
  return useMutation({
    mutationFn: async (file: File) => {
      const res = await uploadApi.uploadThumbnail(file);
      return res.data;
    },
  });
}
