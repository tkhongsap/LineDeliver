import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  CustomerRecord, 
  InsertCustomerRecord, 
  UpdateCustomerRecord, 
  CustomerRecordsResponse, 
  CustomerRecordsFilters,
  CustomerRecordsStats 
} from "@shared/customer-schema";

const CUSTOMER_RECORDS_QUERY_KEY = ["customer-records"];
const CUSTOMER_STATS_QUERY_KEY = ["customer-records", "stats"];

export function useCustomerRecords(filters?: CustomerRecordsFilters) {
  return useQuery({
    queryKey: [...CUSTOMER_RECORDS_QUERY_KEY, filters],
    queryFn: async (): Promise<CustomerRecordsResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy.toString());
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/customer-records?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer records');
      }
      return response.json();
    },
  });
}

export function useCustomerRecord(id: string) {
  return useQuery({
    queryKey: [...CUSTOMER_RECORDS_QUERY_KEY, id],
    queryFn: async (): Promise<CustomerRecord> => {
      const response = await fetch(`/api/customer-records/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer record');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCustomerRecordsStats() {
  return useQuery({
    queryKey: CUSTOMER_STATS_QUERY_KEY,
    queryFn: async (): Promise<CustomerRecordsStats> => {
      const response = await fetch('/api/customer-records/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch customer records stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useCreateCustomerRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertCustomerRecord): Promise<CustomerRecord> => {
      const response = await fetch("/api/customer-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create customer record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_RECORDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_STATS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomerRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomerRecord }): Promise<CustomerRecord> => {
      const response = await fetch(`/api/customer-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update customer record");
      return response.json();
    },
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_RECORDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_STATS_QUERY_KEY });
      queryClient.setQueryData([...CUSTOMER_RECORDS_QUERY_KEY, updatedRecord.id], updatedRecord);
    },
  });
}

export function useDeleteCustomerRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/customer-records/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete customer record");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_RECORDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_STATS_QUERY_KEY });
    },
  });
}

export function useBulkDeleteCustomerRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<{ deletedCount: number; errors: string[] }> => {
      const response = await fetch("/api/customer-records/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to bulk delete customer records");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_RECORDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_STATS_QUERY_KEY });
    },
  });
}