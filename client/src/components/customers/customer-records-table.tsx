import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  MoreHorizontal,
  Eye,
  MessageCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCustomerRecords, useDeleteCustomerRecord, useBulkDeleteCustomerRecords } from "@/hooks/use-customer-records";
import type { CustomerRecord, CustomerRecordsFilters } from "@shared/customer-schema";
import { formatPhoneNumber } from "@/lib/validation";

interface CustomerRecordsTableProps {
  onEditRecord?: (record: CustomerRecord) => void;
  onViewRecord?: (record: CustomerRecord) => void;
  onSendMessage?: (record: CustomerRecord) => void;
  onCreateRecord?: () => void;
  onUploadFile?: () => void;
  onExportData?: () => void;
}

export function CustomerRecordsTable({
  onEditRecord,
  onViewRecord,
  onSendMessage,
  onCreateRecord,
  onUploadFile,
  onExportData
}: CustomerRecordsTableProps) {
  const [filters, setFilters] = useState<CustomerRecordsFilters>({
    search: "",
    status: "all",
    page: 1,
    limit: 50,
    sortBy: "lastModified",
    sortOrder: "desc"
  });

  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useCustomerRecords(filters);
  const deleteRecordMutation = useDeleteCustomerRecord();
  const bulkDeleteMutation = useBulkDeleteCustomerRecords();

  const records = data?.data || [];
  const pagination = data ? {
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages
  } : null;

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any, page: 1 }));
  };

  const handleSort = (sortBy: keyof CustomerRecord) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc"
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (checked) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(new Set(records.map(r => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this customer record?")) {
      try {
        await deleteRecordMutation.mutateAsync(recordId);
      } catch (error) {
        console.error("Failed to delete record:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedRecords.size} customer records?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(Array.from(selectedRecords));
        setSelectedRecords(new Set());
      } catch (error) {
        console.error("Failed to bulk delete records:", error);
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ready": return "default";
      case "edited": return "secondary";
      case "invalid": return "destructive";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready": return "Ready";
      case "edited": return "Edited";
      case "invalid": return "Invalid";
      default: return status;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load customer records. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer Records</CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={onUploadFile} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button onClick={onExportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={onCreateRecord} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, LINE ID, order number, phone..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.status} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="edited">Edited</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
          {selectedRecords.size > 0 && (
            <Button
              onClick={handleBulkDelete}
              variant="destructive"
              size="sm"
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedRecords.size})
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={records.length > 0 && selectedRecords.size === records.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("customerName")}>
                  <div className="flex items-center">
                    Customer Name
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>LINE User ID</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("orderNumber")}>
                  <div className="flex items-center">
                    Order Number
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("deliveryDate")}>
                  <div className="flex items-center">
                    Delivery Date
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lastModified")}>
                  <div className="flex items-center">
                    Last Modified
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                [...Array(10)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No customer records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRecords.has(record.id)}
                        onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.customerName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.phone || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.lineUserId}
                    </TableCell>
                    <TableCell>{record.orderNumber}</TableCell>
                    <TableCell>{record.deliveryDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(record.lastModified).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewRecord?.(record)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditRecord?.(record)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSendMessage?.(record)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} records
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}