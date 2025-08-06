import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  messageTemplates, 
  generateMessagePreview, 
  validateTemplateForCustomer,
  type MessageTemplate 
} from "@/lib/message-templates";
import type { CustomerRecord } from "@shared/customer-schema";
import { 
  MessageCircle, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Copy,
  Smartphone
} from "lucide-react";

interface MessagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
  onSendMessage?: (template: MessageTemplate, customer: CustomerRecord) => void;
}

export function MessagePreviewDialog({ 
  isOpen, 
  onClose, 
  customer, 
  onSendMessage 
}: MessagePreviewDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(messageTemplates[0]?.id || "");
  const { toast } = useToast();

  const selectedTemplate = messageTemplates.find(t => t.id === selectedTemplateId);
  const previewMessage = selectedTemplate ? generateMessagePreview(selectedTemplate, customer) : "";
  const validation = selectedTemplate ? validateTemplateForCustomer(selectedTemplate, customer) : { isValid: false, missingFields: [] };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (selectedTemplate && validation.isValid) {
      onSendMessage?.(selectedTemplate, customer);
      toast({
        title: "Message queued",
        description: `LINE message queued for ${customer.customerName}`,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            LINE Message Preview
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection & Customer Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{customer.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">LINE ID:</span>
                  <span className="font-mono text-xs">{customer.lineUserId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order:</span>
                  <span className="font-mono text-xs">{customer.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Date:</span>
                  <span>{customer.deliveryDate}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select Message Template</label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {selectedTemplate.description}
                </div>
              )}
            </div>

            {/* Validation Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  {validation.isValid ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                  )}
                  Message Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validation.isValid ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Ready to send
                  </Badge>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="destructive">
                      Missing required fields
                    </Badge>
                    <div className="text-xs text-red-600">
                      Missing: {validation.missingFields.join(", ")}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">LINE Message Preview</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
                disabled={!previewMessage}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>

            {/* LINE Interface Mockup */}
            <Card className="bg-gray-50">
              <CardContent className="p-0">
                {/* LINE Chat Header */}
                <div className="bg-green-600 text-white p-3 rounded-t-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">ThaiBev Customer Service</div>
                      <div className="text-xs opacity-80">Official Account</div>
                    </div>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="p-4 bg-white">
                  <div className="max-w-xs ml-auto">
                    <div className="bg-green-500 text-white p-3 rounded-lg rounded-br-none">
                      <ScrollArea className="max-h-60">
                        <div className="text-sm whitespace-pre-wrap font-thai">
                          {previewMessage || "Select a template to preview the message"}
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="text-xs text-gray-400 text-right mt-1">
                      {new Date().toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} ✓✓
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Variables */}
            {selectedTemplate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Template Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="flex items-center">
                        <Badge variant="outline" className="text-xs">
                          [{variable}]
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!validation.isValid || !selectedTemplate}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Send LINE Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}