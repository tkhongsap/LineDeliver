import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCustomerRecord } from "@/hooks/use-customer-records";
import { updateCustomerRecordSchema } from "@shared/customer-schema";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import type { CustomerRecord, UpdateCustomerRecord } from "@shared/customer-schema";
import { Edit2, Save, X, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerRowProps {
  record: CustomerRecord;
  isSelected: boolean;
  onSelect: (recordId: string, selected: boolean) => void;
  onEdit: (record: CustomerRecord) => void;
}

export function CustomerRow({ record, isSelected, onSelect, onEdit }: CustomerRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const updateMutation = useUpdateCustomerRecord();

  const form = useForm<UpdateCustomerRecord>({
    resolver: zodResolver(updateCustomerRecordSchema),
    defaultValues: {
      customerName: record.customerName,
      phone: record.phone || undefined,
      lineUserId: record.lineUserId,
      orderNumber: record.orderNumber,
      deliveryDate: record.deliveryDate,
      deliveryAddress: record.deliveryAddress || undefined,
      notes: record.notes || "",
      status: record.status as "ready" | "edited" | "invalid",
    },
  });

  // Watch form values for auto-save
  const watchedValues = useWatch({ control: form.control });

  // Auto-save functionality with 5-second delay
  const debouncedAutoSave = useDebouncedCallback(async (data: UpdateCustomerRecord) => {
    if (!isEditing) return;
    
    try {
      setIsAutoSaving(true);
      await updateMutation.mutateAsync({
        id: record.id,
        data: { ...data, status: "edited" },
      });
      setLastSaved(new Date());
      toast({
        title: "Auto-saved",
        description: "Changes saved automatically",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Auto-save failed",
        description: "Unable to save changes automatically",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, 5000);

  // Trigger auto-save when form values change
  useEffect(() => {
    if (isEditing && watchedValues) {
      const formData = form.getValues();
      if (form.formState.isValid) {
        debouncedAutoSave(formData);
      }
    }
  }, [watchedValues, isEditing, debouncedAutoSave, form]);

  const handleEditStart = () => {
    setIsEditing(true);
    form.reset({
      customerName: record.customerName,
      phone: record.phone || undefined,
      lineUserId: record.lineUserId,
      orderNumber: record.orderNumber,
      deliveryDate: record.deliveryDate,
      deliveryAddress: record.deliveryAddress || undefined,
      notes: record.notes || "",
      status: record.status as "ready" | "edited" | "invalid",
    });
  };

  const handleSave = async (data: UpdateCustomerRecord) => {
    try {
      await updateMutation.mutateAsync({
        id: record.id,
        data: { ...data, status: "edited" },
      });
      
      setIsEditing(false);
      toast({
        title: "Customer record updated",
        description: "Changes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer record",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleDetailedEdit = () => {
    onEdit(record);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "edited":
        return "secondary";
      case "invalid":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-emerald-600";
      case "edited":
        return "text-yellow-600";
      case "invalid":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isEditing) {
    return (
      <TableRow className="bg-yellow-50 border-yellow-200">
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(record.id, checked as boolean)}
          />
        </TableCell>
        <TableCell>
          <Input
            {...form.register("customerName")}
            className="h-8 text-sm"
            placeholder="Customer name"
          />
          {form.formState.errors.customerName && (
            <span className="text-xs text-red-500">
              {form.formState.errors.customerName.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Input
            {...form.register("phone")}
            className="h-8 text-sm"
            placeholder="+66-xx-xxx-xxxx"
          />
          {form.formState.errors.phone && (
            <span className="text-xs text-red-500">
              {form.formState.errors.phone.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Input
            {...form.register("lineUserId")}
            className="h-8 text-sm"
            placeholder="LINE User ID"
          />
          {form.formState.errors.lineUserId && (
            <span className="text-xs text-red-500">
              {form.formState.errors.lineUserId.message}
            </span>
          )}
        </TableCell>
        <TableCell>
          <Input
            {...form.register("orderNumber")}
            className="h-8 text-sm"
            placeholder="Order number"
          />
        </TableCell>
        <TableCell>
          <Input
            {...form.register("deliveryDate")}
            type="date"
            className="h-8 text-sm"
          />
        </TableCell>
        <TableCell>
          <Input
            {...form.register("deliveryAddress")}
            className="h-8 text-sm"
            placeholder="Delivery address"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">editing</Badge>
            {isAutoSaving && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1 animate-spin" />
                Auto-saving...
              </div>
            )}
            {lastSaved && !isAutoSaving && (
              <div className="text-xs text-green-600">
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={form.handleSubmit(handleSave)}
              disabled={updateMutation.isPending}
              className="h-7 px-2"
            >
              <Save className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="group hover:bg-gray-50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(record.id, checked as boolean)}
        />
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center justify-between">
          <span>{record.customerName}</span>
        </div>
      </TableCell>
      <TableCell>{record.phone}</TableCell>
      <TableCell>
        <span className="font-mono text-sm">{record.lineUserId}</span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-sm">{record.orderNumber}</span>
      </TableCell>
      <TableCell>{record.deliveryDate}</TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate" title={record.deliveryAddress || ""}>
          {record.deliveryAddress}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={getStatusBadgeVariant(record.status)}
          className={cn("capitalize", getStatusColor(record.status))}
        >
          {record.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditStart}
            className="h-7 px-2"
            title="Quick edit"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDetailedEdit}
            className="h-7 px-2"
            title="Detailed edit"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}