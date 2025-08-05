import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Box, CheckCircle, Calendar, Clock } from "lucide-react";
import type { DeliveryStats } from "@shared/schema";

interface StatsCardsProps {
  stats?: DeliveryStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalDeliveries.toLocaleString() || "0"}</p>
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
              <p className="text-3xl font-bold text-emerald-600">{stats?.confirmed.toLocaleString() || "0"}</p>
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
              <p className="text-3xl font-bold text-amber-600">{stats?.rescheduled.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Calendar className="text-amber-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-red-600">{stats?.pending.toLocaleString() || "0"}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="text-red-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
