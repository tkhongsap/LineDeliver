import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Delivery, InsertDelivery, DeliveryStats } from "@shared/schema";

const DELIVERIES_QUERY_KEY = ["deliveries"];
const DELIVERY_STATS_QUERY_KEY = ["delivery-stats"];

export function useDeliveries(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: [...DELIVERIES_QUERY_KEY, filters],
    queryFn: async (): Promise<Delivery[]> => {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }
      return response.json();
    },
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: [...DELIVERIES_QUERY_KEY, id],
    queryFn: async (): Promise<Delivery> => {
      const response = await fetch(`/api/deliveries/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch delivery');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useDeliveryStats() {
  return useQuery({
    queryKey: DELIVERY_STATS_QUERY_KEY,
    queryFn: async (): Promise<DeliveryStats> => {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch delivery stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertDelivery): Promise<Delivery> => {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create delivery");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DELIVERY_STATS_QUERY_KEY });
    },
  });
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Delivery> }): Promise<Delivery> => {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update delivery");
      return response.json();
    },
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DELIVERY_STATS_QUERY_KEY });
      queryClient.setQueryData([...DELIVERIES_QUERY_KEY, updatedDelivery.id], updatedDelivery);
    },
  });
}

export function useDeleteDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete delivery");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DELIVERY_STATS_QUERY_KEY });
    },
  });
}