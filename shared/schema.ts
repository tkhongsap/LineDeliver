import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  userId: text("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  deliveryDate: text("delivery_date").notNull(), // YYYY-MM-DD format
  status: text("status").notNull().default("pending"), // pending, confirmed, rescheduled, no-response
  responseTime: timestamp("response_time"),
  newDeliveryDate: text("new_delivery_date"), // For rescheduled deliveries
  rescheduleReason: text("reschedule_reason"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const uploadSessions = pgTable("upload_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  totalRecords: integer("total_records").notNull(),
  successCount: integer("success_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  errors: text("errors"), // JSON string of errors
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUploadSessionSchema = createInsertSchema(uploadSessions).omit({
  id: true,
  createdAt: true
});

export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertUploadSession = z.infer<typeof insertUploadSessionSchema>;
export type UploadSession = typeof uploadSessions.$inferSelect;

// Stats interface for dashboard
export interface DeliveryStats {
  totalDeliveries: number;
  confirmed: number;
  rescheduled: number;
  pending: number;
  noResponse: number;
  responseRate: number;
  avgResponseTime: string;
}

// Report interface
export interface DailyPerformance {
  date: string;
  sent: number;
  confirmed: number;
  rescheduled: number;
  noResponse: number;
}

export interface RescheduleReason {
  reason: string;
  count: number;
}
