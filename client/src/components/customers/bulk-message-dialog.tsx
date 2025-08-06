import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  Clock,
  X
} from "lucide-react";

interface BulkMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerRecord[];
  onSendBulkMessage?: (template: MessageTemplate, customers: CustomerRecord[], customMessage?: string) => void;
}

interface MessageQueueItem {
  customer: CustomerRecord;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
}

export function BulkMessageDialog({ 
  isOpen, 
  onClose, 
  customers, 
  onSendBulkMessage 
}: BulkMessageDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(messageTemplates[0]?.id || "");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [messageQueue, setMessageQueue] = useState<MessageQueueItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState<'preview' | 'sending' | 'complete'>('preview');
  const { toast } = useToast();

  const selectedTemplate = messageTemplates.find(t => t.id === selectedTemplateId);
  
  // Calculate valid customers for selected template
  const validCustomers = customers.filter(customer => {
    if (useCustomMessage) return true;
    if (!selectedTemplate) return false;
    const validation = validateTemplateForCustomer(selectedTemplate, customer);
    return validation.isValid;
  });

  const invalidCustomers = customers.filter(customer => {
    if (useCustomMessage) return false;
    if (!selectedTemplate) return true;
    const validation = validateTemplateForCustomer(selectedTemplate, customer);
    return !validation.isValid;
  });

  const handleStartSending = () => {
    if (!selectedTemplate && !useCustomMessage) return;
    
    const queue: MessageQueueItem[] = validCustomers.map(customer => ({
      customer,
      status: 'pending'
    }));
    
    setMessageQueue(queue);
    setCurrentStep('sending');
    setIsSending(true);
    
    // Simulate batch processing (replace with actual LINE API calls)
    processBulkMessages(queue);
  };

  const processBulkMessages = async (queue: MessageQueueItem[]) => {
    const batchSize = 10; // Process 10 messages at a time
    const delay = 1000; // 1 second delay between batches
    
    for (let i = 0; i < queue.length; i += batchSize) {
      const batch = queue.slice(i, i + batchSize);
      
      // Process batch
      for (const item of batch) {
        setMessageQueue(prev => prev.map(q => 
          q.customer.id === item.customer.id 
            ? { ...q, status: 'sending' }
            : q
        ));
        
        // Simulate API call (replace with actual LINE API)
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Simulate success/failure (90% success rate)
        const success = Math.random() > 0.1;
        
        setMessageQueue(prev => prev.map(q => 
          q.customer.id === item.customer.id 
            ? { 
                ...q, 
                status: success ? 'sent' : 'failed',
                error: success ? undefined : 'Failed to send message'
              }
            : q
        ));
      }
      
      // Delay between batches
      if (i + batchSize < queue.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setIsSending(false);
    setCurrentStep('complete');
    
    const sentCount = queue.filter(q => q.status === 'sent').length;
    const failedCount = queue.filter(q => q.status === 'failed').length;
    
    toast({
      title: "Bulk message complete",
      description: `${sentCount} messages sent successfully, ${failedCount} failed`,
      duration: 5000,
    });
  };

  const handleClose = () => {
    if (isSending) {
      toast({
        title: "Cannot close",
        description: "Please wait for bulk messaging to complete",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep('preview');
    setMessageQueue([]);
    setCustomMessage("");
    setUseCustomMessage(false);
    onClose();
  };

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Message Options</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="template"
                  name="messageType"
                  checked={!useCustomMessage}
                  onChange={() => setUseCustomMessage(false)}
                />
                <label htmlFor="template" className="text-sm">Use Template</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom"
                  name="messageType"
                  checked={useCustomMessage}
                  onChange={() => setUseCustomMessage(true)}
                />
                <label htmlFor="custom" className="text-sm">Custom Message</label>
              </div>
            </div>
          </div>

          {!useCustomMessage ? (
            <div className="space-y-3">
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
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Custom Message</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message..."
                rows={6}
                className="resize-none"
              />
            </div>
          )}
        </div>

        {/* Recipients Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Recipients Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Selected:</span>
                <Badge variant="outline">{customers.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valid Recipients:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {validCustomers.length}
                </Badge>
              </div>
              {invalidCustomers.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invalid Recipients:</span>
                  <Badge variant="destructive">{invalidCustomers.length}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview for first valid customer */}
          {validCustomers.length > 0 && selectedTemplate && !useCustomMessage && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Message Preview</CardTitle>
                <p className="text-xs text-gray-500">
                  Preview for: {validCustomers[0].customerName}
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className="whitespace-pre-wrap">
                    {generateMessagePreview(selectedTemplate, validCustomers[0])}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Invalid Recipients List */}
      {invalidCustomers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Customers with Missing Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-32">
              <div className="space-y-1">
                {invalidCustomers.map(customer => {
                  const validation = selectedTemplate ? validateTemplateForCustomer(selectedTemplate, customer) : { missingFields: [] };
                  return (
                    <div key={customer.id} className="flex justify-between items-center text-sm">
                      <span>{customer.customerName}</span>
                      <span className="text-xs text-red-600">
                        Missing: {validation.missingFields.join(", ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSendingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium">Sending Messages</h3>
        <p className="text-gray-600">Processing bulk LINE messages...</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{messageQueue.filter(q => q.status !== 'pending').length} / {messageQueue.length}</span>
        </div>
        <Progress 
          value={(messageQueue.filter(q => q.status !== 'pending').length / messageQueue.length) * 100} 
          className="w-full"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Message Queue Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {messageQueue.map(item => (
                <div key={item.customer.id} className="flex justify-between items-center text-sm">
                  <span>{item.customer.customerName}</span>
                  <div className="flex items-center">
                    {item.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                    {item.status === 'sending' && (
                      <Badge variant="secondary" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                        Sending
                      </Badge>
                    )}
                    {item.status === 'sent' && <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>}
                    {item.status === 'failed' && <Badge variant="destructive">Failed</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => {
    const sentCount = messageQueue.filter(q => q.status === 'sent').length;
    const failedCount = messageQueue.filter(q => q.status === 'failed').length;

    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Bulk Messaging Complete</h3>
          <p className="text-gray-600">
            {sentCount} messages sent successfully
            {failedCount > 0 && `, ${failedCount} failed`}
          </p>
        </div>

        {failedCount > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Failed Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {messageQueue.filter(q => q.status === 'failed').map(item => (
                    <div key={item.customer.id} className="flex justify-between items-center text-sm">
                      <span>{item.customer.customerName}</span>
                      <span className="text-xs text-red-600">{item.error}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
              Bulk LINE Messaging
            </div>
            {!isSending && (
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[400px]">
          {currentStep === 'preview' && renderPreviewStep()}
          {currentStep === 'sending' && renderSendingStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>

        <DialogFooter>
          {currentStep === 'preview' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleStartSending}
                disabled={validCustomers.length === 0 || (!selectedTemplate && !useCustomMessage)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to {validCustomers.length} Recipients
              </Button>
            </>
          )}
          {currentStep === 'complete' && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}