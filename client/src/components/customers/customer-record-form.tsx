import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertCustomerRecordSchema, updateCustomerRecordSchema } from "@shared/customer-schema";
import type { CustomerRecord, InsertCustomerRecord, UpdateCustomerRecord } from "@shared/customer-schema";
import { useCreateCustomerRecord, useUpdateCustomerRecord } from "@/hooks/use-customer-records";
import { validateCustomerName, validatePhoneNumber, validateLineUserId, validateOrderNumber, validateDeliveryDate, validateDeliveryAddress, validationHints, formatPhoneNumber, formatOrderNumber } from "@/lib/validation";
import { CalendarDays, User, Phone, MessageCircle, Package, MapPin, FileText } from "lucide-react";

interface CustomerRecordFormProps {
  record?: CustomerRecord;
  onSuccess?: (record: CustomerRecord) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function CustomerRecordForm({ 
  record, 
  onSuccess, 
  onCancel, 
  mode = record ? "edit" : "create" 
}: CustomerRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useCreateCustomerRecord();
  const updateMutation = useUpdateCustomerRecord();

  const schema = mode === "edit" ? updateCustomerRecordSchema : insertCustomerRecordSchema;
  
  const form = useForm<InsertCustomerRecord | UpdateCustomerRecord>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: record?.customerName || "",
      phone: record?.phone || "",
      lineUserId: record?.lineUserId || "",
      orderNumber: record?.orderNumber || "",
      deliveryDate: record?.deliveryDate || "",
      deliveryAddress: record?.deliveryAddress || "",
      notes: record?.notes || "",
      status: (record?.status as "ready" | "edited" | "invalid") || "ready"
    }
  });

  const onSubmit = async (data: InsertCustomerRecord | UpdateCustomerRecord) => {
    setIsSubmitting(true);
    try {
      let savedRecord: CustomerRecord;
      
      if (mode === "edit" && record) {
        savedRecord = await updateMutation.mutateAsync({
          id: record.id,
          data: data as UpdateCustomerRecord
        });
      } else {
        savedRecord = await createMutation.mutateAsync(data as InsertCustomerRecord);
      }
      
      onSuccess?.(savedRecord);
    } catch (error) {
      console.error("Failed to save customer record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneFormat = (value: string) => {
    const formatted = formatPhoneNumber(value);
    form.setValue("phone", formatted);
  };

  const handleOrderNumberFormat = (value: string) => {
    const formatted = formatOrderNumber(value);
    form.setValue("orderNumber", formatted);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          {mode === "edit" ? (
            <>
              <User className="w-5 h-5 mr-2" />
              Edit Customer Record
            </>
          ) : (
            <>
              <User className="w-5 h-5 mr-2" />
              Add New Customer Record
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={validationHints.customerName.placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.customerName.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={validationHints.phone.placeholder}
                      {...field}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handlePhoneFormat(e.target.value);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.phone.hint} (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LINE User ID */}
            <FormField
              control={form.control}
              name="lineUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    LINE User ID *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={validationHints.lineUserId.placeholder}
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.lineUserId.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Number */}
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Order Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={validationHints.orderNumber.placeholder}
                      {...field}
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleOrderNumberFormat(e.target.value);
                        }
                        field.onBlur();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.orderNumber.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date */}
            <FormField
              control={form.control}
              name="deliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Delivery Date *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.deliveryDate.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Address */}
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Delivery Address
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={validationHints.deliveryAddress.placeholder}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.deliveryAddress.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={validationHints.notes.placeholder}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {validationHints.notes.hint}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status (only for edit mode) */}
            {mode === "edit" && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="edited">Edited</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of this customer record
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : mode === "edit" ? "Update Record" : "Create Record"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}