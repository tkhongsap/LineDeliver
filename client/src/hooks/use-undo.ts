import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UndoAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  description: string;
  timestamp: Date;
  undoFn: () => Promise<void>;
  redoFn: () => Promise<void>;
}

export function useUndo(maxHistory: number = 5) {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const { toast } = useToast();

  const addAction = useCallback((action: Omit<UndoAction, 'id' | 'timestamp'>) => {
    const newAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setUndoStack(prev => {
      const newStack = [newAction, ...prev];
      return newStack.slice(0, maxHistory);
    });

    // Show toast notification
    toast({
      title: "Action completed",
      description: `${action.description} - Click here to undo`,
      duration: 5000,
    });
  }, [maxHistory, toast]);

  const undo = useCallback(async (actionId?: string) => {
    const targetAction = actionId 
      ? undoStack.find(action => action.id === actionId)
      : undoStack[0];

    if (!targetAction) {
      toast({
        title: "No action to undo",
        description: "No recent actions available to undo",
        variant: "destructive",
      });
      return;
    }

    try {
      await targetAction.undoFn();
      
      // Remove the action from the stack
      setUndoStack(prev => prev.filter(action => action.id !== targetAction.id));
      
      toast({
        title: "Action undone",
        description: `Undid: ${targetAction.description}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Undo failed",
        description: "Failed to undo the action",
        variant: "destructive",
      });
    }
  }, [undoStack, toast]);

  const redo = useCallback(async (action: UndoAction) => {
    try {
      await action.redoFn();
      
      toast({
        title: "Action redone",
        description: `Redid: ${action.description}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Redo failed",
        description: "Failed to redo the action",
        variant: "destructive",
      });
    }
  }, [toast]);

  const canUndo = undoStack.length > 0;

  const clearHistory = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    addAction,
    undo,
    canUndo,
    undoStack,
    clearHistory,
  };
}

// Hook for creating undo actions for customer records
export function useCustomerRecordUndo() {
  const { addAction, undo, canUndo, undoStack, clearHistory } = useUndo();

  const createUndoableAction = useCallback((
    type: 'create' | 'update' | 'delete',
    description: string,
    undoFn: () => Promise<void>,
    redoFn: () => Promise<void>
  ) => {
    addAction({
      type,
      description,
      undoFn,
      redoFn,
    });
  }, [addAction]);

  return {
    createUndoableAction,
    undo,
    canUndo,
    undoStack,
    clearHistory,
  };
}