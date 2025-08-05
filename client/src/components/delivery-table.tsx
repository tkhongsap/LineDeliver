import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, CheckCircle, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Delivery } from "@shared/schema";

const statusConfig = {
  confirmed: { 
    color: "bg-emerald-100 text-emerald-800", 
    icon: CheckCircle 
  },
  rescheduled: { 
    color: "bg-amber-100 text-amber-800", 
    icon: Calendar 
  },
  pending: { 
    color: "bg-blue-100 text-blue-800", 
    icon: Clock 
  },
  "no-response": { 
    color: "bg-red-100 text-red-800", 
    icon: AlertTriangle 
  }
};

export function DeliveryTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["/api/deliveries", { status: statusFilter, search: searchQuery }],
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/export?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliveries.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Delivery data has been exported to CSV.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export delivery data.",
        variant: "destructive",
      });
    },
  });

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "-";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredDeliveries = deliveries as Delivery[];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order ID, customer name, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="no-response">No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Showing {filteredDeliveries.length} deliveries
      </div>

      {/* Delivery Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Delivery Date</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Response Time</TableHead>
                <TableHead className="font-medium">New Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeliveries.map((delivery) => {
                  const statusInfo = statusConfig[delivery.status as keyof typeof statusConfig];
                  const StatusIcon = statusInfo?.icon || Clock;
                  
                  return (
                    <TableRow key={delivery.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{delivery.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{delivery.customerName}</div>
                          <div className="text-sm text-gray-500">{delivery.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{delivery.deliveryDate}</TableCell>
                      <TableCell>
                        <Badge className={`inline-flex items-center ${statusInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {delivery.status === 'no-response' ? 'No Response' : 
                           delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(delivery.responseTime)}</TableCell>
                      <TableCell>{delivery.newDeliveryDate || "-"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
