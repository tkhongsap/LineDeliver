import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, FolderSync, Upload, Truck, BarChart3, Users, MessageCircle, ArrowRight, FileText } from "lucide-react";
import { StatsCards } from "@/components/stats-cards";
import { UploadZone } from "@/components/upload-zone";
import { DeliveryTable } from "@/components/delivery-table";
import { ReportsSection } from "@/components/reports-section";
import { CustomerRecordsTable } from "@/components/customers/customer-records-table";
import { CustomerRecordForm } from "@/components/customers/customer-record-form";
import { MessagePreviewDialog } from "@/components/customers/message-preview-dialog";
import { BulkMessageDialog } from "@/components/customers/bulk-message-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomerRecordsStats } from "@/hooks/use-customer-records";
import { apiRequest } from "@/lib/api";
import type { DeliveryStats } from "@shared/schema";
import type { CustomerRecord } from "@shared/customer-schema";

export default function Dashboard() {
  const [lastSync, setLastSync] = useState("2 min ago");
  const [activeTab, setActiveTab] = useState("upload");
  
  // Customer Records state management
  const [selectedRecord, setSelectedRecord] = useState<CustomerRecord | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [messageRecord, setMessageRecord] = useState<CustomerRecord | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState<CustomerRecord | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [bulkMessageRecords, setBulkMessageRecords] = useState<CustomerRecord[]>([]);
  const [isBulkMessageDialogOpen, setIsBulkMessageDialogOpen] = useState(false);

  // Auto-refresh last sync time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const minutes = Math.floor(Math.random() * 5) + 1;
      setLastSync(`${minutes} min ago`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch delivery statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DeliveryStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 60000, // Auto-refresh every minute
  });
  
  // Fetch customer records statistics
  const { data: customerStats, isLoading: customerStatsLoading } = useCustomerRecordsStats();

  const handleRefresh = async () => {
    // Trigger manual refresh of all data
    window.location.reload();
  };
  
  // Customer Records handlers
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
    console.log("View record:", record);
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

  const handleSampleDataLoaded = () => {
    setActiveTab("customers");
  };

  const handleUploadFile = () => {
    console.log("Upload file");
  };

  const handleExportData = () => {
    console.log("Export data");
  };

  const handleFormSuccess = (record: CustomerRecord) => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    setFormMode(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    setFormMode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Box className="text-white text-xl w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LINE OA Delivery Dashboard</h1>
                <p className="text-sm text-emerald-600 font-medium">Customer Service Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FolderSync className="text-emerald-500 w-4 h-4" />
              <span>Last sync: <span className="font-medium">{lastSync}</span></span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Quick Navigation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                    LINE Messaging
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Send bulk LINE messages for delivery confirmations and track customer responses.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-yellow-600" />
                    Analytics
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View detailed analytics and reports on delivery performance and customer responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="h-auto p-0 bg-transparent border-0 rounded-none">
                <TabsTrigger 
                  value="upload" 
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50 rounded-none"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Deliveries
                </TabsTrigger>
                <TabsTrigger 
                  value="customers"
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50 rounded-none"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customer Records
                </TabsTrigger>
                <TabsTrigger 
                  value="status"
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50 rounded-none"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery Status
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 data-[state=active]:bg-emerald-50 rounded-none"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="p-8 mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Daily Deliveries</h2>
                <p className="text-gray-600">Upload your daily delivery CSV or Excel file. Maximum file size: 5MB</p>
              </div>
              <UploadZone onSampleDataLoaded={handleSampleDataLoaded} />
            </TabsContent>

            <TabsContent value="customers" className="p-8 mt-0">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Records Management</h2>
                <p className="text-gray-600">Manage customer delivery records, send LINE messages, and track delivery confirmations.</p>
              </div>
              
              {/* Quick Actions for Customer Records */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            </TabsContent>

            <TabsContent value="status" className="p-8 mt-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Status Dashboard</h2>
                  <p className="text-gray-600">Track customer responses to delivery confirmations</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    <FolderSync className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              <DeliveryTable />
            </TabsContent>

            <TabsContent value="reports" className="p-8 mt-0">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Reports</h2>
                <p className="text-gray-600">Export delivery confirmation reports for analysis</p>
              </div>
              <ReportsSection />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Customer Records Dialogs */}
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
            console.log("Sending bulk message:", template, customers, customMessage);
          }}
        />
      </div>
    </div>
  );
}
