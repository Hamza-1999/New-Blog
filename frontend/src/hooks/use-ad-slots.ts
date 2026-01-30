import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adSlotsApi } from "@/lib/api";
import { AdSlot, AdPlacement } from "@/types";

export function useAdSlots() {
  return useQuery<{ slots: AdSlot[] }>({
    queryKey: ["ad-slots"],
    queryFn: async () => {
      const res = await adSlotsApi.getAll();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdSlotByPlacement(placement: AdPlacement) {
  return useQuery<{ slot: AdSlot | null }>({
    queryKey: ["ad-slot", placement],
    queryFn: async () => {
      const res = await adSlotsApi.getByPlacement(placement);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!placement,
  });
}

export function useAdminAdSlots() {
  return useQuery<{ slots: AdSlot[] }>({
    queryKey: ["admin-ad-slots"],
    queryFn: async () => {
      const res = await adSlotsApi.getAdmin();
      return res.data;
    },
  });
}

export function useCreateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      slotId: string;
      format: string;
      placement: string;
      isActive?: boolean;
    }) => {
      const res = await adSlotsApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slot"] });
    },
  });
}

export function useUpdateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        slotId?: string;
        format?: string;
        placement?: string;
        isActive?: boolean;
      };
    }) => {
      const res = await adSlotsApi.update(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slot"] });
    },
  });
}

export function useDeleteAdSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adSlotsApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slots"] });
      queryClient.invalidateQueries({ queryKey: ["ad-slot"] });
    },
  });
}
