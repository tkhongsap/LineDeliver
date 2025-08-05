import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, CalendarX, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DeliveryStats, DailyPerformance, RescheduleReason } from "@shared/schema";

export function ReportsSection() {
  const [dateRange, setDateRange] = useState("Jan 01, 2024 - Aug 05, 2025");
  const [reportType, setReportType] = useState("summary");
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/performance", 7],
    queryFn: async () => {
      const response = await fetch(`/api/performance?days=7`);
      if (!response.ok) throw new Error('Failed to fetch performance data');
      return response.json();
    },
  });

  const { data: rescheduleReasons, isLoading: reasonsLoading } = useQuery({
    queryKey: ["/api/reschedule-reasons"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      // Generate and download report based on selected parameters
      const params = new URLSearchParams({
        type: reportType,
        dateRange: dateRange
      });
      
      const response = await fetch(`/api/export?${params.toString()}`);
      if (!response.ok) throw new Error('Report generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-report-${reportType}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Your report has been downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Report Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      {/* Report Generator */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <Input
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="text-emerald-600 w-5 h-5 mr-2" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Messages Sent</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {((stats as DeliveryStats)?.totalDeliveries || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {(stats as DeliveryStats)?.responseRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {(stats as DeliveryStats)?.avgResponseTime || "0 hours"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reschedule Reasons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarX className="text-amber-600 w-5 h-5 mr-2" />
              Top Reschedule Reasons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reasonsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(rescheduleReasons as RescheduleReason[] || []).slice(0, 3).map((reason, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{reason.reason}</span>
                    <span className="text-xl font-bold text-amber-600">{reason.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="text-emerald-600 w-5 h-5 mr-2" />
            Daily Performance (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {(performance as DailyPerformance[] || []).map((day, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{day.date}</span>
                    <span className="text-sm font-medium text-emerald-600">{day.sent} sent</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{day.confirmed}</div>
                      <div className="text-xs text-gray-500">Confirmed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">{day.rescheduled}</div>
                      <div className="text-xs text-gray-500">Rescheduled</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{day.noResponse}</div>
                      <div className="text-xs text-gray-500">No Response</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
