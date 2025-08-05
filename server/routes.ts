import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeliverySchema, insertUploadSessionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLS, and XLSX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all deliveries with optional filtering
  app.get("/api/deliveries", async (req, res) => {
    try {
      const { status, search } = req.query;
      const filters: { status?: string; search?: string } = {};
      
      if (status && typeof status === 'string') filters.status = status;
      if (search && typeof search === 'string') filters.search = search;
      
      const deliveries = await storage.getDeliveries(filters);
      res.json(deliveries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  // Get single delivery
  app.get("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = await storage.getDelivery(req.params.id);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivery" });
    }
  });

  // Create new delivery
  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  // Update delivery
  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const updates = req.body;
      const delivery = await storage.updateDelivery(req.params.id, updates);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  // Delete delivery
  app.delete("/api/deliveries/:id", async (req, res) => {
    try {
      const success = await storage.deleteDelivery(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete delivery" });
    }
  });

  // Upload CSV/Excel file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const session = await storage.createUploadSession({
        filename: req.file.originalname,
        totalRecords: 0,
        successCount: 0,
        errorCount: 0,
        status: "processing",
        errors: null
      });

      // Process file in background (simplified for demo)
      processFileAsync(req.file, session.id);

      res.json({ sessionId: session.id, message: "File upload started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process file upload" });
    }
  });

  // Get upload session status
  app.get("/api/upload/:sessionId", async (req, res) => {
    try {
      const session = await storage.getUploadSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Upload session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upload session" });
    }
  });

  // Get delivery statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDeliveryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get daily performance
  app.get("/api/performance", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const performance = await storage.getDailyPerformance(days);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Get reschedule reasons
  app.get("/api/reschedule-reasons", async (req, res) => {
    try {
      const reasons = await storage.getRescheduleReasons();
      res.json(reasons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reschedule reasons" });
    }
  });

  // Export deliveries as CSV
  app.get("/api/export", async (req, res) => {
    try {
      const { status, search } = req.query;
      const filters: { status?: string; search?: string } = {};
      
      if (status && typeof status === 'string') filters.status = status;
      if (search && typeof search === 'string') filters.search = search;
      
      const deliveries = await storage.getDeliveries(filters);
      
      // Generate CSV content
      const csvHeader = "Order ID,Customer Name,User ID,Delivery Date,Status,Response Time,New Date,Reschedule Reason\n";
      const csvContent = deliveries.map(d => 
        `${d.orderId},"${d.customerName}",${d.userId},${d.deliveryDate},${d.status},${d.responseTime || ''},${d.newDeliveryDate || ''},"${d.rescheduleReason || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="deliveries.csv"');
      res.send(csvHeader + csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simplified file processing function
async function processFileAsync(file: Express.Multer.File, sessionId: string) {
  try {
    // Simulate file processing
    setTimeout(async () => {
      await storage.updateUploadSession(sessionId, {
        status: "completed",
        totalRecords: 10,
        successCount: 8,
        errorCount: 2,
        errors: JSON.stringify([
          { row: 3, error: "Invalid date format" },
          { row: 7, error: "Missing required field: user_id" }
        ])
      });
    }, 2000);
  } catch (error) {
    await storage.updateUploadSession(sessionId, {
      status: "failed",
      errors: JSON.stringify([{ error: "Failed to process file" }])
    });
  }
}
