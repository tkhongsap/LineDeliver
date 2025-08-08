import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Settings,
  TestTube,
  Users
} from "lucide-react";

export default function LineTest() {
  const [lineUserId, setLineUserId] = useState("");
  const [message, setMessage] = useState("");
  const [bulkRecipients, setBulkRecipients] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);
  const { toast } = useToast();

  // Check LINE API configuration status
  const checkStatus = async () => {
    try {
      const response = await fetch("/api/line/status");
      const data = await response.json();
      setConfigStatus(data);
      
      if (data.isConfigured) {
        // Also test the connection
        const connResponse = await fetch("/api/line/test-connection");
        const connData = await connResponse.json();
        setConnectionStatus(connData);
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    }
  };

  // Send single test message
  const sendTestMessage = async () => {
    if (!lineUserId || !message) {
      toast({
        title: "Missing Information",
        description: "Please enter both LINE User ID and message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/line/test-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineUserId, message })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: `Successfully sent message to ${lineUserId}`,
          duration: 5000
        });
        setMessage("");
      } else {
        toast({
          title: "Failed to Send",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error: any) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Send bulk messages
  const sendBulkMessages = async () => {
    if (!bulkRecipients) {
      toast({
        title: "Missing Recipients",
        description: "Please enter recipient data in the format: LINE_ID,message",
        variant: "destructive"
      });
      return;
    }

    // Parse bulk recipients (format: LINE_ID,message per line)
    const lines = bulkRecipients.split('\n').filter(line => line.trim());
    const recipients = lines.map(line => {
      const [lineUserId, ...messageParts] = line.split(',');
      return {
        lineUserId: lineUserId.trim(),
        message: messageParts.join(',').trim()
      };
    });

    if (recipients.length === 0) {
      toast({
        title: "No Valid Recipients",
        description: "Please check your input format",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/line/bulk-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Bulk Send Complete",
          description: `Sent ${data.successful} messages successfully`,
          duration: 5000
        });
        setBulkRecipients("");
      } else {
        toast({
          title: "Bulk Send Partial",
          description: `Sent ${data.successful}/${data.totalSent} messages. ${data.failed} failed.`,
          variant: data.failed > 0 ? "destructive" : "default",
          duration: 5000
        });
      }
    } catch (error: any) {
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Load status on component mount
  useState(() => {
    checkStatus();
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <MessageCircle className="w-8 h-8 mr-3 text-green-600" />
          LINE Messaging Test
        </h1>
        <p className="text-gray-600 mt-2">
          Test LINE messaging functionality before deploying to production
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Access Token</span>
              {configStatus?.hasAccessToken ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Channel Secret</span>
              {configStatus?.hasChannelSecret ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Connection</span>
              {connectionStatus?.connected ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {connectionStatus?.error || "Not Connected"}
                </Badge>
              )}
            </div>
            <Button 
              onClick={checkStatus} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Refresh Status
            </Button>
          </div>

          {!configStatus?.isConfigured && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Required</AlertTitle>
              <AlertDescription>
                Please create a <code>.env</code> file with your LINE API credentials.
                Copy <code>.env.example</code> and fill in your LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Message Testing Tabs */}
      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">
            <TestTube className="w-4 h-4 mr-2" />
            Single Message
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="w-4 h-4 mr-2" />
            Bulk Messages
          </TabsTrigger>
        </TabsList>

        {/* Single Message Test */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Message</CardTitle>
              <CardDescription>
                Send a single message to a LINE user for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lineUserId">LINE User ID</Label>
                <Input
                  id="lineUserId"
                  placeholder="U1234567890abcdef1234567890abcdef"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  disabled={!configStatus?.isConfigured}
                />
                <p className="text-xs text-gray-500">
                  Enter the LINE User ID (starts with 'U' followed by 32 hex characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your test message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  disabled={!configStatus?.isConfigured}
                />
              </div>

              <Button
                onClick={sendTestMessage}
                disabled={isSending || !configStatus?.isConfigured}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Messages Test */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Messages</CardTitle>
              <CardDescription>
                Test sending messages to multiple LINE users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkRecipients">Recipients (one per line)</Label>
                <Textarea
                  id="bulkRecipients"
                  placeholder={`U1234567890abcdef1234567890abcdef,Hello Customer 1
U2234567890abcdef1234567890abcdef,Hello Customer 2
U3234567890abcdef1234567890abcdef,Hello Customer 3`}
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                  rows={8}
                  disabled={!configStatus?.isConfigured}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Format: LINE_USER_ID,message (one recipient per line)
                </p>
              </div>

              <Button
                onClick={sendBulkMessages}
                disabled={isSending || !configStatus?.isConfigured}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Bulk Messages...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Send Bulk Messages
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">How to Get Your LINE User ID</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open LINE Official Account Manager</li>
            <li>Go to your Official Account settings</li>
            <li>Navigate to "Messaging API" settings</li>
            <li>Your LINE User ID will be displayed there</li>
            <li>Alternatively, you can get it from webhook events when users interact with your bot</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}