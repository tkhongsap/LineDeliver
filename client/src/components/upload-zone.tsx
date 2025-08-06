import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, Info, CheckCircle, AlertCircle, Download, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface UploadResponse {
  sessionId: string;
  message: string;
}

interface UploadSession {
  id: string;
  filename: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  status: string;
  errors?: string;
}

interface UploadZoneProps {
  onSampleDataLoaded?: () => void;
}

export function UploadZone({ onSampleDataLoaded }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Upload Started",
        description: "Your file is being processed...",
      });
      
      // Poll for upload status
      pollUploadStatus(data.sessionId);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pollUploadStatus = async (sessionId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/upload/${sessionId}`);
        const session: UploadSession = await response.json();
        setUploadSession(session);
        
        if (session.status === 'completed') {
          setUploadProgress(100);
          toast({
            title: "Upload Complete",
            description: `Successfully processed ${session.successCount} records with ${session.errorCount} errors.`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        } else if (session.status === 'failed') {
          toast({
            title: "Upload Failed",
            description: "Failed to process the uploaded file.",
            variant: "destructive",
          });
        } else {
          // Continue polling
          setTimeout(checkStatus, 1000);
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }
      } catch (error) {
        console.error('Failed to check upload status:', error);
      }
    };
    
    checkStatus();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV, XLS, or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    setUploadSession(null);
    uploadMutation.mutate(file);
  };

  // Load sample data mutation
  const loadSampleDataMutation = useMutation({
    mutationFn: async (): Promise<{ message: string; count: number }> => {
      const response = await fetch("/api/load-sample-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to load sample data");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sample Data Loaded",
        description: `${data.count} sample customer records created successfully!`,
      });
      
      // Invalidate customer records queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/customer-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-records/stats"] });
      
      // Call callback to switch tabs if provided
      if (onSampleDataLoaded) {
        setTimeout(() => {
          onSampleDataLoaded();
        }, 500);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to Load Sample Data",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownloadSampleCSV = () => {
    // Create sample CSV content
    const csvContent = `user_id,order_no,delivery_date,customer_name,phone,address,notes
U1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p,ORD-2024-0001,2024-01-22,สมชาย ใจดี,0812345678,123 หมู่ 1 ตำบลบางกะปิ อำเภอเมือง กรุงเทพฯ 10110,โทรก่อนส่ง
U2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q,ORD-2024-0002,2024-01-23,สมหญิง สวยงาม,0823456789,456 หมู่ 2 ตำบลคลองเตย เขตคลองเตย กรุงเทพฯ 10110,
INVALID001,ORD-2024-0003,2024-01-24,นางสาวทดสอบ โรงแรม,0834567890,789 หมู่ 3 ตำบลมักกะสัน เขตราชเทวี กรุงเทพฯ 10400,ที่อยู่ไม่ถูกต้อง`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-customer-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSampleData = () => {
    loadSampleDataMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-start">
        <Button
          variant="outline"
          onClick={handleDownloadSampleCSV}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Sample CSV
        </Button>
        <Button
          onClick={handleLoadSampleData}
          disabled={loadSampleDataMutation.isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Database className="w-4 h-4" />
          {loadSampleDataMutation.isPending ? "Loading..." : "Load Sample Data"}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Need sample data? Download our template file or load test data
      </p>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragOver
            ? "border-emerald-500 bg-emerald-100"
            : "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <CloudUpload className="text-emerald-600 w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-2">
            Drag & drop delivery files here, or click to select
          </h3>
          <p className="text-gray-500 mb-4">Supports CSV, XLS, XLSX files up to 5MB</p>
          <Button
            onClick={handleFileSelect}
            disabled={uploadMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {uploadMutation.isPending ? "Uploading..." : "Choose Files"}
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Upload Status */}
      {uploadSession && (
        <div className="space-y-4">
          {uploadSession.status === 'completed' && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                <strong>Upload completed successfully!</strong>
                <br />
                Processed {uploadSession.totalRecords} records: {uploadSession.successCount} successful, {uploadSession.errorCount} errors.
              </AlertDescription>
            </Alert>
          )}
          
          {uploadSession.status === 'failed' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Upload failed!</strong>
                <br />
                Please check your file format and try again.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* File Requirements */}
      <Alert className="border-amber-200 bg-amber-50">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <p className="font-medium mb-1">Required columns:</p>
          <p>user_id, order_no, delivery_date</p>
          <p className="mt-1"><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
