import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CustomerRecord } from '@shared/customer-schema';
import { AlertTriangle, RefreshCw, Eye } from 'lucide-react';

interface EditConflictDetectorProps {
  record: CustomerRecord;
  isEditing: boolean;
  onConflictResolved: () => void;
  onViewConflict: (currentRecord: CustomerRecord, serverRecord: CustomerRecord) => void;
}

interface ConflictInfo {
  hasConflict: boolean;
  serverRecord?: CustomerRecord;
  conflictFields: string[];
  lastChecked: Date;
}

export function EditConflictDetector({ 
  record, 
  isEditing, 
  onConflictResolved, 
  onViewConflict 
}: EditConflictDetectorProps) {
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo>({
    hasConflict: false,
    conflictFields: [],
    lastChecked: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Check for conflicts when editing starts or periodically during editing
  useEffect(() => {
    if (!isEditing) return;

    const checkForConflicts = async () => {
      setIsChecking(true);
      try {
        // Simulate API call to get current server state
        const response = await fetch(`/api/customer-records/${record.id}`);
        if (!response.ok) throw new Error('Failed to check for conflicts');
        
        const serverRecord: CustomerRecord = await response.json();
        
        // Compare last modified timestamps
        const clientLastModified = new Date(record.lastModified);
        const serverLastModified = new Date(serverRecord.lastModified);
        
        if (serverLastModified > clientLastModified) {
          // Detect which fields have changed
          const conflictFields = detectConflictFields(record, serverRecord);
          
          setConflictInfo({
            hasConflict: true,
            serverRecord,
            conflictFields,
            lastChecked: new Date()
          });
          
          toast({
            title: "Edit conflict detected",
            description: `This record was modified by another user. ${conflictFields.length} field(s) affected.`,
            variant: "destructive",
            duration: 8000,
          });
        } else {
          setConflictInfo({
            hasConflict: false,
            conflictFields: [],
            lastChecked: new Date()
          });
        }
      } catch (error) {
        console.error('Error checking for conflicts:', error);
        toast({
          title: "Conflict check failed",
          description: "Unable to check for edit conflicts",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately when editing starts
    checkForConflicts();

    // Set up periodic checks during editing (every 30 seconds)
    const intervalId = setInterval(checkForConflicts, 30000);

    return () => clearInterval(intervalId);
  }, [isEditing, record, toast]);

  // Detect which specific fields have conflicts
  const detectConflictFields = (clientRecord: CustomerRecord, serverRecord: CustomerRecord): string[] => {
    const conflicts: string[] = [];
    
    if (clientRecord.customerName !== serverRecord.customerName) {
      conflicts.push('Customer Name');
    }
    if (clientRecord.phone !== serverRecord.phone) {
      conflicts.push('Phone');
    }
    if (clientRecord.lineUserId !== serverRecord.lineUserId) {
      conflicts.push('LINE User ID');
    }
    if (clientRecord.orderNumber !== serverRecord.orderNumber) {
      conflicts.push('Order Number');
    }
    if (clientRecord.deliveryDate !== serverRecord.deliveryDate) {
      conflicts.push('Delivery Date');
    }
    if (clientRecord.deliveryAddress !== serverRecord.deliveryAddress) {
      conflicts.push('Delivery Address');
    }
    if (clientRecord.notes !== serverRecord.notes) {
      conflicts.push('Notes');
    }
    if (clientRecord.status !== serverRecord.status) {
      conflicts.push('Status');
    }
    
    return conflicts;
  };

  const handleRefreshRecord = () => {
    if (conflictInfo.serverRecord) {
      // Force refresh the record with server data
      onConflictResolved();
      setConflictInfo({
        hasConflict: false,
        conflictFields: [],
        lastChecked: new Date()
      });
      
      toast({
        title: "Record refreshed",
        description: "Record updated with latest server data",
        duration: 3000,
      });
    }
  };

  const handleViewConflicts = () => {
    if (conflictInfo.serverRecord) {
      onViewConflict(record, conflictInfo.serverRecord);
    }
  };

  const handleIgnoreConflict = () => {
    setConflictInfo({
      hasConflict: false,
      conflictFields: [],
      lastChecked: new Date()
    });
    
    toast({
      title: "Conflict ignored",
      description: "Continuing with current edits",
      duration: 3000,
    });
  };

  if (!isEditing || !conflictInfo.hasConflict) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 mb-4">
      <CardContent className="p-4">
        <Alert className="border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <strong className="text-orange-800">Edit Conflict Detected</strong>
                <p className="text-sm text-orange-700 mt-1">
                  Another user has modified this record while you were editing. 
                  The following fields have conflicts: <span className="font-medium">
                    {conflictInfo.conflictFields.join(', ')}
                  </span>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewConflicts}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Changes
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshRecord}
                  disabled={isChecking}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                  Use Server Version
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIgnoreConflict}
                  className="text-gray-700 border-gray-300 hover:bg-gray-100"
                >
                  Continue Editing
                </Button>
              </div>
              
              <div className="text-xs text-orange-600">
                Last checked: {conflictInfo.lastChecked.toLocaleTimeString()}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Conflict resolution dialog component
export function ConflictResolutionDialog({ 
  isOpen, 
  onClose, 
  clientRecord, 
  serverRecord, 
  onResolve 
}: {
  isOpen: boolean;
  onClose: () => void;
  clientRecord: CustomerRecord;
  serverRecord: CustomerRecord;
  onResolve: (resolvedRecord: CustomerRecord) => void;
}) {
  const [resolution, setResolution] = useState<'client' | 'server' | 'manual'>('server');

  const handleResolve = () => {
    switch (resolution) {
      case 'client':
        onResolve(clientRecord);
        break;
      case 'server':
        onResolve(serverRecord);
        break;
      default:
        // For manual resolution, this would open a merge interface
        onResolve(serverRecord);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold">Resolve Edit Conflict</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Your Version</h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                  <div><strong>Customer:</strong> {clientRecord.customerName}</div>
                  <div><strong>Phone:</strong> {clientRecord.phone || 'N/A'}</div>
                  <div><strong>Order:</strong> {clientRecord.orderNumber}</div>
                  <div><strong>Last Modified:</strong> {new Date(clientRecord.lastModified).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Server Version</h3>
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                  <div><strong>Customer:</strong> {serverRecord.customerName}</div>
                  <div><strong>Phone:</strong> {serverRecord.phone || 'N/A'}</div>
                  <div><strong>Order:</strong> {serverRecord.orderNumber}</div>
                  <div><strong>Last Modified:</strong> {new Date(serverRecord.lastModified).toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Resolution Strategy:</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="server"
                    checked={resolution === 'server'}
                    onChange={(e) => setResolution(e.target.value as 'server')}
                    className="mr-2"
                  />
                  <span className="text-sm">Use server version (recommended)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="client"
                    checked={resolution === 'client'}
                    onChange={(e) => setResolution(e.target.value as 'client')}
                    className="mr-2"
                  />
                  <span className="text-sm">Keep my changes (may overwrite other user's work)</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleResolve}>Resolve Conflict</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}