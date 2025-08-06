import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer Records Table Schema
export const customerRecords = pgTable("customer_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  lineUserId: text("line_user_id").notNull(),
  orderNumber: text("order_number").notNull().unique(),
  deliveryDate: text("delivery_date").notNull(), // YYYY-MM-DD format
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  status: text("status").notNull().default("ready"), // ready, edited, invalid
  lastModified: timestamp("last_modified").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Message Templates Table Schema
export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: text("template_id").notNull().unique(),
  templateName: text("template_name").notNull(),
  content: text("content").notNull(),
  variables: text("variables"), // JSON string of variable definitions
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

// Customer Record Schemas
export const insertCustomerRecordSchema = createInsertSchema(customerRecords).omit({
  id: true,
  createdAt: true,
  lastModified: true
}).extend({
  // Enhanced validation for customer data
  customerName: z.string()
    .min(1, "Customer name is required")
    .max(100, "Customer name must be less than 100 characters")
    .regex(/^[\u0E00-\u0E7Fa-zA-Z\s'-]+$/, "Customer name must contain only Thai, English characters, spaces, hyphens, and apostrophes"),
  
  phone: z.string()
    .optional()
    .refine((val) => !val || /^\+66-\d{2}-\d{3}-\d{4}$/.test(val), {
      message: "Phone number must be in format +66-XX-XXX-XXXX"
    }),
  
  lineUserId: z.string()
    .min(1, "LINE User ID is required")
    .regex(/^U[a-f0-9]{32}$/, "LINE User ID must start with 'U' followed by 32 hexadecimal characters"),
  
  orderNumber: z.string()
    .min(1, "Order number is required")
    .regex(/^ORD-\d{4}-\d{3,}$/, "Order number must be in format ORD-YYYY-XXX"),
  
  deliveryDate: z.string()
    .min(1, "Delivery date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Delivery date must be in YYYY-MM-DD format")
    .refine((date) => new Date(date) >= new Date(), {
      message: "Delivery date must be today or in the future"
    }),
  
  deliveryAddress: z.string()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: "Delivery address must be less than 500 characters"
    }),
  
  notes: z.string().optional(),
  
  status: z.enum(["ready", "edited", "invalid"]).default("ready")
});

export const updateCustomerRecordSchema = insertCustomerRecordSchema.partial();

// Message Template Schemas
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true
});

// TypeScript Types
export type CustomerRecord = typeof customerRecords.$inferSelect;
export type InsertCustomerRecord = z.infer<typeof insertCustomerRecordSchema>;
export type UpdateCustomerRecord = z.infer<typeof updateCustomerRecordSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;

// Customer Records Statistics Interface
export interface CustomerRecordsStats {
  totalRecords: number;
  readyToSend: number;
  edited: number;
  invalid: number;
  lastSync: string; // ISO timestamp
}

// Search and Filter Interfaces
export interface CustomerRecordsFilters {
  search?: string;
  status?: "all" | "ready" | "edited" | "invalid";
  page?: number;
  limit?: number;
  sortBy?: keyof CustomerRecord;
  sortOrder?: "asc" | "desc";
}

export interface CustomerRecordsResponse {
  data: CustomerRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Message Broadcasting Interfaces
export interface MessageBroadcastRequest {
  customerIds: string[];
  templateId: string;
  variables?: Record<string, string>;
}

export interface MessageBroadcastResponse {
  broadcastId: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  status: "pending" | "completed" | "failed";
  errors?: string[];
}

// Template Variable System
export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  required: boolean;
  example: string;
}

export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: "ชื่อลูกค้า",
    label: "Customer Name",
    description: "Customer name from CSV",
    required: true,
    example: "คุณสมชาย"
  },
  {
    key: "หมายเลขออเดอร์",
    label: "Order Number",
    description: "Order number from CSV",
    required: true,
    example: "ORD-2024-0001"
  },
  {
    key: "วันที่จัดส่ง",
    label: "Delivery Date",
    description: "Delivery date (if provided)",
    required: false,
    example: "22 มกราคม 2024"
  },
  {
    key: "ที่อยู่จัดส่ง",
    label: "Delivery Address",
    description: "Address (if provided)",
    required: false,
    example: "123 ถนนสุขุมวิท กรุงเทพฯ"
  }
];

// Default LINE Message Template
export const DEFAULT_LINE_MESSAGE_TEMPLATE = `🚚 การยืนยันการจัดส่ง

สวัสดีครับ คุณ[ชื่อลูกค้า]
เราจะจัดส่งสินค้าให้คุณในวันที่ [วันที่จัดส่ง]

หมายเลขออเดอร์: [หมายเลขออเดอร์]
วันที่จัดส่ง: [วันที่จัดส่ง]

Quick Reply:
✅ ยืนยันการจัดส่ง
📅 ขอเปลี่ยนวันส่ง`;