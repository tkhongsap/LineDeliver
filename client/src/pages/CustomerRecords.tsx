import { useState } from "react";
import { EnhancedStatsCards } from "@/components/enhanced-stats-cards";
import { CustomerRecordsTable } from "@/components/customers/customer-records-table";
import { CustomerRecordForm } from "@/components/customers/customer-record-form";
import { MessagePreviewDialog } from "@/components/customers/message-preview-dialog";
import { BulkMessageDialog } from "@/components/customers/bulk-message-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerRecordsStats } from "@/hooks/use-customer-records";
import { useQuery } from "@tanstack/react-query";
import type { CustomerRecord } from "@shared/customer-schema";
import type { DeliveryStats } from "@shared/schema";
import { Users, FileText, MessageCircle, Upload } from "lucide-react";

export default function CustomerRecords() {
  const [selectedRecord, setSelectedRecord] = useState<CustomerRecord | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [messageRecord, setMessageRecord] = useState<CustomerRecord | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState<CustomerRecord | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [bulkMessageRecords, setBulkMessageRecords] = useState<CustomerRecord[]>([]);
  const [isBulkMessageDialogOpen, setIsBulkMessageDialogOpen] = useState(false);

  const { data: customerStats, isLoading: customerStatsLoading } = useCustomerRecordsStats();
  const { data: deliveryStats, isLoading: deliveryStatsLoading } = useQuery<DeliveryStats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch delivery stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: CustomerRecord) => {
    setSelectedRecord(record);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleViewRecord = (record: CustomerRecord) => {
    setPreviewCustomer(record);
    setIsPreviewDialogOpen(true);
  };

  const handleSendMessage = (record: CustomerRecord) => {
    setMessageRecord(record);
    setIsMessageDialogOpen(true);
  };

  const handleBulkMessage = (records: CustomerRecord[]) => {
    setBulkMessageRecords(records);
    setIsBulkMessageDialogOpen(true);
  };

  const handleUploadFile = () => {
    // TODO: Implement file upload functionality
    console.log("Upload file");
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Export data");
  };

  const handleFormSuccess = (record: CustomerRecord) => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    setFormMode(null);
    // Could show a success toast here
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    setFormMode(null);
  };

  const isStatsLoading = customerStatsLoading || deliveryStatsLoading;
  const lastSync = customerStats?.lastSync;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Records Management</h1>
        <p className="text-gray-600 mt-2">
          Manage customer delivery records, send LINE messages, and track delivery confirmations.
        </p>
      </div>

      {/* Enhanced Statistics */}
      <EnhancedStatsCards
        deliveryStats={deliveryStats}
        customerStats={customerStats}
        isLoading={isStatsLoading}
        lastSync={lastSync}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateRecord}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2 text-emerald-600" />
              Add Customer Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Create a new customer delivery record with LINE messaging integration.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleUploadFile}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Upload className="w-5 h-5 mr-2 text-blue-600" />
              Bulk Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Upload CSV or Excel files to import multiple customer records at once.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportData}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2 text-yellow-600" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Export customer records and delivery data for reporting and analysis.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Records Table */}
      <CustomerRecordsTable
        onCreateRecord={handleCreateRecord}
        onEditRecord={handleEditRecord}
        onViewRecord={handleViewRecord}
        onSendMessage={handleSendMessage}
        onBulkMessage={handleBulkMessage}
        onUploadFile={handleUploadFile}
        onExportData={handleExportData}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === "edit" ? "Edit Customer Record" : "Add New Customer Record"}
            </DialogTitle>
          </DialogHeader>
          <CustomerRecordForm
            record={selectedRecord || undefined}
            mode={formMode || "create"}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Message Preview Dialog */}
      {messageRecord && (
        <MessagePreviewDialog
          isOpen={isMessageDialogOpen}
          onClose={() => setIsMessageDialogOpen(false)}
          customer={messageRecord}
        />
      )}

      {/* Preview Dialog for Eye Icon */}
      {previewCustomer && (
        <MessagePreviewDialog
          isOpen={isPreviewDialogOpen}
          onClose={() => {
            setIsPreviewDialogOpen(false);
            setPreviewCustomer(null);
          }}
          customer={previewCustomer}
        />
      )}

      {/* Bulk Message Dialog */}
      <BulkMessageDialog
        isOpen={isBulkMessageDialogOpen}
        onClose={() => setIsBulkMessageDialogOpen(false)}
        customers={bulkMessageRecords}
        onSendBulkMessage={(template, customers, customMessage) => {
          // TODO: Implement actual bulk LINE messaging
          console.log("Sending bulk message:", template, customers, customMessage);
        }}
      />
    </div>
  );
}