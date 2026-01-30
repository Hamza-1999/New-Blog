import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api";
import { Page } from "@/types";

export function useAdminPages() {
  return useQuery<{ pages: Pick<Page, "id" | "title" | "slug" | "metaTitle" | "updatedAt">[] }>({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const res = await pagesApi.getAll();
      return res.data;
    },
  });
}

export function useAdminPage(slug: string) {
  return useQuery<{ page: Page }>({
    queryKey: ["admin-page", slug],
    queryFn: async () => {
      const res = await pagesApi.getBySlug(slug);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      data,
    }: {
      slug: string;
      data: {
        title: string;
        content: string;
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string;
      };
    }) => {
      const res = await pagesApi.update(slug, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-page"] });
    },
  });
}
