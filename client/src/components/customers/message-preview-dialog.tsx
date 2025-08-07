import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  messageTemplates, 
  generateMessagePreview, 
  formatDeliveryDate,
  type MessageTemplate 
} from "@/lib/message-templates";
import type { CustomerRecord } from "@shared/customer-schema";
import { 
  Eye, 
  Package,
  Clock,
  MessageSquare,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  Hash
} from "lucide-react";

interface MessagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
}

export function MessagePreviewDialog({ 
  isOpen, 
  onClose, 
  customer
}: MessagePreviewDialogProps) {
  // Use the default delivery confirmation template for preview
  const deliveryTemplate = messageTemplates.find(t => t.id === "delivery-confirmation") || messageTemplates[0];
  const previewMessage = deliveryTemplate ? generateMessagePreview(deliveryTemplate, customer) : "";
  
  // Format customer data for display
  const formattedDeliveryDate = formatDeliveryDate(customer.deliveryDate);
  const currentTime = new Date().toLocaleTimeString('th-TH', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2 text-emerald-600" />
            LINE Message Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Customer Information Section */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="ml-2 font-semibold">{customer.customerName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Hash className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600 font-medium">LINE ID:</span>
                    <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded border">
                      {customer.lineUserId}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600 font-medium">Order Number:</span>
                    <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded border">
                      {customer.orderNumber}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600 font-medium">Delivery Date:</span>
                    <span className="ml-2 font-semibold">{formattedDeliveryDate}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="ml-2">{customer.phone}</span>
                    </div>
                  )}
                  {customer.deliveryAddress && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <span className="text-gray-600 font-medium">Address:</span>
                      <span className="ml-2 text-xs leading-relaxed">{customer.deliveryAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LINE Interface Mockup */}
          <Card className="border-2 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-emerald-600" />
                LINE Chat Interface Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* LINE Chat Header */}
              <div className="bg-emerald-600 text-white p-4 mx-6 mt-4 rounded-t-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">Delivery Service</div>
                    <div className="text-sm opacity-90">Official Account</div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-6 bg-gray-50 mx-6 rounded-b-lg">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Message Header */}
                  <div className="bg-emerald-600 text-white p-3">
                    <div className="flex items-center text-sm font-medium">
                      <Package className="w-4 h-4 mr-2" />
                      🚚 การยืนยันการจัดส่ง
                    </div>
                  </div>
                  
                  {/* Message Body */}
                  <div className="p-4">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed font-thai text-gray-800">
                      {previewMessage}
                    </div>
                  </div>
                  
                  {/* Quick Reply Buttons */}
                  <div className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 mb-2">Quick Reply:</div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          disabled 
                          className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm cursor-not-allowed opacity-75"
                        >
                          ✅ ยืนยันการจัดส่ง
                        </button>
                        <button 
                          disabled 
                          className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm cursor-not-allowed opacity-75"
                        >
                          📅 ขอเปลี่ยนวันส่ง
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Message Timestamp */}
                <div className="text-xs text-gray-400 text-right mt-2">
                  {currentTime} ICT ✓✓
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Details Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-blue-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Message Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-700 font-medium">Message Type:</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">Flex Message</Badge>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-700 font-medium">Quick Replies:</span>
                    <span className="ml-2 text-blue-800">2 options (Confirm / Reschedule)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-blue-700 font-medium">Language:</span>
                    <span className="ml-2 text-blue-800">Thai</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-700 font-medium">Scheduled Time:</span>
                    <span className="ml-2 text-blue-800">09:00 ICT</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expected Customer Responses Card */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-amber-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-amber-600" />
                Expected Customer Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900">✅ Confirm</div>
                    <div className="text-sm text-amber-700">Customer confirms delivery as scheduled</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900">📅 Reschedule</div>
                    <div className="text-sm text-amber-700">Customer requests to reschedule delivery</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-amber-900">No Response</div>
                    <div className="text-sm text-amber-700">Customer doesn't respond within timeout period</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}