import { type Delivery, type InsertDelivery, type UploadSession, type InsertUploadSession, type DeliveryStats, type DailyPerformance, type RescheduleReason } from "@shared/schema";
import { type CustomerRecord, type InsertCustomerRecord, type UpdateCustomerRecord, type CustomerRecordsStats, type CustomerRecordsFilters, type CustomerRecordsResponse, type MessageTemplate, type InsertMessageTemplate } from "@shared/customer-schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Delivery methods
  getDelivery(id: string): Promise<Delivery | undefined>;
  getDeliveries(filters?: { status?: string; search?: string }): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined>;
  deleteDelivery(id: string): Promise<boolean>;
  
  // Upload session methods
  createUploadSession(session: InsertUploadSession): Promise<UploadSession>;
  updateUploadSession(id: string, updates: Partial<UploadSession>): Promise<UploadSession | undefined>;
  getUploadSession(id: string): Promise<UploadSession | undefined>;
  
  // Statistics methods
  getDeliveryStats(): Promise<DeliveryStats>;
  getDailyPerformance(days: number): Promise<DailyPerformance[]>;
  getRescheduleReasons(): Promise<RescheduleReason[]>;
  
  // Customer Records methods
  getCustomerRecord(id: string): Promise<CustomerRecord | undefined>;
  getCustomerRecords(filters?: CustomerRecordsFilters): Promise<CustomerRecordsResponse>;
  createCustomerRecord(record: InsertCustomerRecord): Promise<CustomerRecord>;
  updateCustomerRecord(id: string, updates: UpdateCustomerRecord): Promise<CustomerRecord | undefined>;
  deleteCustomerRecord(id: string): Promise<boolean>;
  bulkDeleteCustomerRecords(ids: string[]): Promise<{ deletedCount: number; errors: string[] }>;
  getCustomerRecordsStats(): Promise<CustomerRecordsStats>;
  
  // Message Template methods
  getMessageTemplate(id: string): Promise<MessageTemplate | undefined>;
  getMessageTemplates(): Promise<MessageTemplate[]>;
  createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate>;
  updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | undefined>;
}

export class MemStorage implements IStorage {
  private deliveries: Map<string, Delivery>;
  private uploadSessions: Map<string, UploadSession>;
  private customerRecords: Map<string, CustomerRecord>;
  private messageTemplates: Map<string, MessageTemplate>;

  constructor() {
    this.deliveries = new Map();
    this.uploadSessions = new Map();
    this.customerRecords = new Map();
    this.messageTemplates = new Map();
    
    // Always initialize default message template (required for LINE functionality)
    this.initializeDefaultMessageTemplate();
    
    // Initialize with sample data only in development if enabled
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SAMPLE_DATA === 'true') {
      this.initializeSampleData();
      this.initializeCustomerSampleData();
      this.initializeMessageTemplates();
    }
  }

  private initializeSampleData() {
    const sampleDeliveries: Delivery[] = [
      {
        id: "1",
        orderId: "ORD-2024-001",
        userId: "U1234567890",
        customerName: "สมชาย โจ๊ะ",
        deliveryDate: "2024-01-20",
        status: "confirmed",
        responseTime: new Date("2024-01-18T09:15:23Z"),
        newDeliveryDate: null,
        rescheduleReason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        orderId: "ORD-2024-002",
        userId: "U1234567891",
        customerName: "สมหญิง รักดี",
        deliveryDate: "2024-01-20",
        status: "rescheduled",
        responseTime: new Date("2024-01-18T10:30:45Z"),
        newDeliveryDate: "2024-01-22",
        rescheduleReason: "Not available",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "3",
        orderId: "ORD-2024-003",
        userId: "U1234567892",
        customerName: "วิชัย ชื่นคิด",
        deliveryDate: "2024-01-20",
        status: "pending",
        responseTime: null,
        newDeliveryDate: null,
        rescheduleReason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "4",
        orderId: "ORD-2024-004",
        userId: "U1234567893",
        customerName: "มาลี สุขสวย",
        deliveryDate: "2024-01-21",
        status: "no-response",
        responseTime: null,
        newDeliveryDate: null,
        rescheduleReason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleDeliveries.forEach(delivery => {
      this.deliveries.set(delivery.id, delivery);
    });
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveries(filters?: { status?: string; search?: string }): Promise<Delivery[]> {
    let deliveries = Array.from(this.deliveries.values());

    if (filters?.status) {
      deliveries = deliveries.filter(d => d.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      deliveries = deliveries.filter(d => 
        d.orderId.toLowerCase().includes(search) ||
        d.customerName.toLowerCase().includes(search) ||
        d.userId.toLowerCase().includes(search)
      );
    }

    return deliveries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = randomUUID();
    const now = new Date();
    const delivery: Delivery = {
      ...insertDelivery,
      id,
      status: insertDelivery.status || "pending",
      responseTime: insertDelivery.responseTime || null,
      newDeliveryDate: insertDelivery.newDeliveryDate || null,
      rescheduleReason: insertDelivery.rescheduleReason || null,
      createdAt: now,
      updatedAt: now
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;

    const updatedDelivery = {
      ...delivery,
      ...updates,
      updatedAt: new Date()
    };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async deleteDelivery(id: string): Promise<boolean> {
    return this.deliveries.delete(id);
  }

  async createUploadSession(insertSession: InsertUploadSession): Promise<UploadSession> {
    const id = randomUUID();
    const session: UploadSession = {
      ...insertSession,
      id,
      status: insertSession.status || "processing",
      successCount: insertSession.successCount || 0,
      errorCount: insertSession.errorCount || 0,
      errors: insertSession.errors || null,
      createdAt: new Date()
    };
    this.uploadSessions.set(id, session);
    return session;
  }

  async updateUploadSession(id: string, updates: Partial<UploadSession>): Promise<UploadSession | undefined> {
    const session = this.uploadSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.uploadSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getUploadSession(id: string): Promise<UploadSession | undefined> {
    return this.uploadSessions.get(id);
  }

  async getDeliveryStats(): Promise<DeliveryStats> {
    const deliveries = Array.from(this.deliveries.values());
    const totalDeliveries = deliveries.length;
    const confirmed = deliveries.filter(d => d.status === "confirmed").length;
    const rescheduled = deliveries.filter(d => d.status === "rescheduled").length;
    const pending = deliveries.filter(d => d.status === "pending").length;
    const noResponse = deliveries.filter(d => d.status === "no-response").length;
    const responseRate = totalDeliveries > 0 ? ((confirmed + rescheduled) / totalDeliveries) * 100 : 0;

    // Calculate average response time
    const respondedDeliveries = deliveries.filter(d => d.responseTime);
    let avgResponseTime = "0 hours";
    if (respondedDeliveries.length > 0) {
      const totalHours = respondedDeliveries.reduce((sum, d) => {
        if (d.responseTime && d.createdAt) {
          const diff = d.responseTime.getTime() - d.createdAt.getTime();
          return sum + (diff / (1000 * 60 * 60)); // Convert to hours
        }
        return sum;
      }, 0);
      avgResponseTime = `${(totalHours / respondedDeliveries.length).toFixed(1)} hours`;
    }

    return {
      totalDeliveries,
      confirmed,
      rescheduled,
      pending,
      noResponse,
      responseRate: Math.round(responseRate * 10) / 10,
      avgResponseTime
    };
  }

  async getDailyPerformance(days: number): Promise<DailyPerformance[]> {
    // Mock daily performance data
    const performance: DailyPerformance[] = [
      { date: "2024-01-15", sent: 245, confirmed: 198, rescheduled: 32, noResponse: 15 }
    ];
    return performance;
  }

  async getRescheduleReasons(): Promise<RescheduleReason[]> {
    const deliveries = Array.from(this.deliveries.values());
    const rescheduled = deliveries.filter(d => d.status === "rescheduled" && d.rescheduleReason);
    
    const reasonCounts = new Map<string, number>();
    rescheduled.forEach(d => {
      if (d.rescheduleReason) {
        const count = reasonCounts.get(d.rescheduleReason) || 0;
        reasonCounts.set(d.rescheduleReason, count + 1);
      }
    });

    // Add default reasons if not present
    if (!reasonCounts.has("Not available")) reasonCounts.set("Not available", 156);
    if (!reasonCounts.has("Wrong address")) reasonCounts.set("Wrong address", 89);
    if (!reasonCounts.has("Prefer different time")) reasonCounts.set("Prefer different time", 67);

    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Customer Records Methods Implementation
  private initializeCustomerSampleData() {
    const sampleCustomerRecords: CustomerRecord[] = [
      {
        id: "cr-001",
        customerName: "สมชาย สุขใจ",
        phone: "+66-81-234-5678",
        lineUserId: "U1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6",
        orderNumber: "ORD-2024-0001",
        deliveryDate: "2024-01-22",
        deliveryAddress: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        notes: "โทรก่อนส่งของ",
        status: "ready",
        lastModified: new Date(),
        createdAt: new Date()
      },
      {
        id: "cr-002",
        customerName: "สมหญิง สวยงาม",
        phone: "+66-82-345-6789",
        lineUserId: "U2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7",
        orderNumber: "ORD-2024-0002",
        deliveryDate: "2024-01-22",
        deliveryAddress: "456 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
        notes: "",
        status: "ready",
        lastModified: new Date(),
        createdAt: new Date()
      },
      {
        id: "cr-003",
        customerName: "นางสาวทดสอบ โรงแรม",
        phone: "+66-83-456-7890",
        lineUserId: "INVALID001",
        orderNumber: "ORD-2024-0003",
        deliveryDate: "2024-01-23",
        deliveryAddress: "789 ถนนเพชรบุรี แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400",
        notes: "ที่อยู่ไม่ถูกต้อง",
        status: "invalid",
        lastModified: new Date(),
        createdAt: new Date()
      }
    ];

    sampleCustomerRecords.forEach(record => {
      this.customerRecords.set(record.id, record);
    });
  }

  private initializeDefaultMessageTemplate() {
    const defaultTemplate: MessageTemplate = {
      id: "tpl-001",
      templateId: "delivery_confirmation",
      templateName: "การยืนยันการจัดส่ง",
      content: `🚚 การยืนยันการจัดส่ง

สวัสดีครับ คุณ[ชื่อลูกค้า]
เราจะจัดส่งสินค้าให้คุณในวันที่ [วันที่จัดส่ง]

หมายเลขออเดอร์: [หมายเลขออเดอร์]
วันที่จัดส่ง: [วันที่จัดส่ง]

Quick Reply:
✅ ยืนยันการจัดส่ง
📅 ขอเปลี่ยนวันส่ง`,
      variables: JSON.stringify([
        "ชื่อลูกค้า", "หมายเลขออเดอร์", "วันที่จัดส่ง", "ที่อยู่จัดส่ง"
      ]),
      isActive: 1,
      createdAt: new Date()
    };

    this.messageTemplates.set(defaultTemplate.id, defaultTemplate);
  }

  private initializeMessageTemplates() {
    // This method is kept for development sample data
    // The default template is now handled by initializeDefaultMessageTemplate()
  }

  async getCustomerRecord(id: string): Promise<CustomerRecord | undefined> {
    return this.customerRecords.get(id);
  }

  async getCustomerRecords(filters?: CustomerRecordsFilters): Promise<CustomerRecordsResponse> {
    let records = Array.from(this.customerRecords.values());
    
    // Apply search filter
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      records = records.filter(record => 
        record.customerName.toLowerCase().includes(search) ||
        record.lineUserId.toLowerCase().includes(search) ||
        record.orderNumber.toLowerCase().includes(search) ||
        (record.phone && record.phone.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      records = records.filter(record => record.status === filters.status);
    }

    // Apply sorting
    if (filters?.sortBy && filters?.sortOrder) {
      records.sort((a, b) => {
        const aValue = a[filters.sortBy!];
        const bValue = b[filters.sortBy!];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return filters.sortOrder === "asc" ? -1 : 1;
        if (bValue == null) return filters.sortOrder === "asc" ? 1 : -1;
        
        if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by lastModified descending
      records.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;
    const total = records.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedRecords = records.slice(offset, offset + limit);

    return {
      data: paginatedRecords,
      total,
      page,
      limit,
      totalPages
    };
  }

  async createCustomerRecord(record: InsertCustomerRecord): Promise<CustomerRecord> {
    const id = randomUUID();
    const now = new Date();
    const customerRecord: CustomerRecord = {
      ...record,
      id,
      phone: record.phone || null,
      deliveryAddress: record.deliveryAddress || null,
      notes: record.notes || null,
      lastModified: now,
      createdAt: now
    };

    this.customerRecords.set(id, customerRecord);
    return customerRecord;
  }

  async updateCustomerRecord(id: string, updates: UpdateCustomerRecord): Promise<CustomerRecord | undefined> {
    const existing = this.customerRecords.get(id);
    if (!existing) return undefined;

    const updated: CustomerRecord = {
      ...existing,
      ...updates,
      lastModified: new Date()
    };

    this.customerRecords.set(id, updated);
    return updated;
  }

  async deleteCustomerRecord(id: string): Promise<boolean> {
    return this.customerRecords.delete(id);
  }

  async bulkDeleteCustomerRecords(ids: string[]): Promise<{ deletedCount: number; errors: string[] }> {
    let deletedCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      const deleted = await this.deleteCustomerRecord(id);
      if (deleted) {
        deletedCount++;
      } else {
        errors.push(`Record with ID ${id} not found`);
      }
    }

    return { deletedCount, errors };
  }

  async getCustomerRecordsStats(): Promise<CustomerRecordsStats> {
    const records = Array.from(this.customerRecords.values());
    
    const totalRecords = records.length;
    const readyToSend = records.filter(r => r.status === "ready").length;
    const edited = records.filter(r => r.status === "edited").length;
    const invalid = records.filter(r => r.status === "invalid").length;

    return {
      totalRecords,
      readyToSend,
      edited,
      invalid,
      lastSync: new Date().toISOString()
    };
  }

  async getMessageTemplate(id: string): Promise<MessageTemplate | undefined> {
    return this.messageTemplates.get(id);
  }

  async getMessageTemplates(): Promise<MessageTemplate[]> {
    return Array.from(this.messageTemplates.values())
      .filter(template => template.isActive === 1)
      .sort((a, b) => a.templateName.localeCompare(b.templateName));
  }

  async createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate> {
    const id = randomUUID();
    const messageTemplate: MessageTemplate = {
      ...template,
      id,
      variables: template.variables || null,
      isActive: template.isActive || 1,
      createdAt: new Date()
    };

    this.messageTemplates.set(id, messageTemplate);
    return messageTemplate;
  }

  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate | undefined> {
    const existing = this.messageTemplates.get(id);
    if (!existing) return undefined;

    const updated: MessageTemplate = {
      ...existing,
      ...updates
    };

    this.messageTemplates.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
