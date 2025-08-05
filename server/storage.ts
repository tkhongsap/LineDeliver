import { type Delivery, type InsertDelivery, type UploadSession, type InsertUploadSession, type DeliveryStats, type DailyPerformance, type RescheduleReason } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private deliveries: Map<string, Delivery>;
  private uploadSessions: Map<string, UploadSession>;

  constructor() {
    this.deliveries = new Map();
    this.uploadSessions = new Map();
    
    // Initialize with sample data for demonstration
    this.initializeSampleData();
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
}

export const storage = new MemStorage();
