import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box, CheckCircle, Calendar, Clock, Users, FileCheck, Edit, AlertTriangle } from "lucide-react";
import type { DeliveryStats } from "@shared/schema";
import type { CustomerRecordsStats } from "@shared/customer-schema";

interface EnhancedStatsCardsProps {
  deliveryStats?: DeliveryStats;
  customerStats?: CustomerRecordsStats;
  isLoading: boolean;
  lastSync?: string;
}

export function EnhancedStatsCards({ 
  deliveryStats, 
  customerStats, 
  isLoading, 
  lastSync 
}: EnhancedStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Delivery Statistics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Records Statistics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Last Sync Display */}
      {lastSync && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
          <div className="text-sm text-gray-500">
            Last sync: {new Date(lastSync).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      )}

      {/* Delivery Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {deliveryStats?.totalDeliveries.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Box className="text-emerald-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {deliveryStats?.confirmed.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <CheckCircle className="text-emerald-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rescheduled</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {deliveryStats?.rescheduled.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Calendar className="text-yellow-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-red-600">
                    {deliveryStats?.pending.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <Clock className="text-red-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Records Statistics */}
      {customerStats && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {customerStats.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="text-blue-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ready to Send</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {customerStats.readyToSend.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <FileCheck className="text-emerald-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Edited</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {customerStats.edited.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Edit className="text-yellow-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Invalid</p>
                    <p className="text-3xl font-bold text-red-600">
                      {customerStats.invalid.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <AlertTriangle className="text-red-600 w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}