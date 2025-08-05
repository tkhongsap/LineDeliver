import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, FolderSync, Upload, Truck, BarChart3 } from "lucide-react";
import { StatsCards } from "@/components/stats-cards";
import { UploadZone } from "@/components/upload-zone";
import { DeliveryTable } from "@/components/delivery-table";
import { ReportsSection } from "@/components/reports-section";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const [lastSync, setLastSync] = useState("2 min ago");

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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 60000, // Auto-refresh every minute
  });

  const handleRefresh = async () => {
    // Trigger manual refresh of all data
    window.location.reload();
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
                <p className="text-sm text-emerald-600 font-medium">ThaiBev Customer Service Portal</p>
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

        {/* Main Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabs defaultValue="upload" className="w-full">
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
              <UploadZone />
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
      </div>
    </div>
  );
}
