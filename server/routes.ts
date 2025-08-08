import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDeliverySchema, insertUploadSessionSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import customerRoutes from "./routes/customers";
import { 
  sendTextMessage, 
  validateLineUserId, 
  getConfigStatus,
  testConnection,
  sendBulkMessages,
  getAllFollowerIds
} from "./services/line-service";

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

  // Sample Data route
  app.post("/api/load-sample-data", async (req, res) => {
    try {
      const result = await storage.loadSampleData();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to load sample data" });
    }
  });

  // Customer Records routes
  app.use("/api/customer-records", customerRoutes);

  // LINE Messaging API Test Endpoints
  
  // Get LINE API configuration status
  app.get("/api/line/status", (req, res) => {
    const status = getConfigStatus();
    res.json(status);
  });

  // Test LINE API connection
  app.get("/api/line/test-connection", async (req, res) => {
    try {
      const result = await testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        connected: false, 
        error: "Failed to test connection" 
      });
    }
  });

  // Send test message to a LINE user
  app.post("/api/line/test-message", async (req, res) => {
    try {
      const { lineUserId, message } = req.body;
      
      // Validate input
      if (!lineUserId || !message) {
        return res.status(400).json({ 
          success: false,
          error: "lineUserId and message are required" 
        });
      }
      
      // Validate LINE User ID format
      if (!validateLineUserId(lineUserId)) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid LINE User ID format. Must start with 'U' followed by 32 hex characters" 
        });
      }
      
      // Send the message
      const result = await sendTextMessage(lineUserId, message);
      
      if (result.success) {
        res.json({
          success: true,
          message: "Message sent successfully",
          messageId: result.messageId
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error("Error sending test message:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to send message" 
      });
    }
  });

  // Get all follower User IDs
  app.get("/api/line/followers", async (req, res) => {
    try {
      const result = await getAllFollowerIds();
      
      if (result.success) {
        res.json({
          success: true,
          followers: result.userIds,
          totalCount: result.totalCount
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error("Error getting followers:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Failed to get followers" 
      });
    }
  });

  // Send bulk messages to multiple LINE users
  app.post("/api/line/bulk-message", async (req, res) => {
    try {
      const { recipients } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: "recipients array is required"
        });
      }
      
      // Validate all recipients
      const invalidRecipients = recipients.filter(r => 
        !r.lineUserId || !r.message || !validateLineUserId(r.lineUserId)
      );
      
      if (invalidRecipients.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Some recipients have invalid LINE User IDs or missing messages",
          invalidCount: invalidRecipients.length
        });
      }
      
      // Send messages
      const result = await sendBulkMessages(
        recipients.map(r => ({
          userId: r.lineUserId,
          message: r.message
        }))
      );
      
      res.json({
        success: result.failed === 0,
        ...result
      });
    } catch (error: any) {
      console.error("Error sending bulk messages:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to send bulk messages"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// File processing function - ready for real implementation
async function processFileAsync(file: Express.Multer.File, sessionId: string) {
  try {
    // TODO: Implement actual file processing logic
    // For now, we'll mark the session as ready for processing
    // This should be replaced with actual CSV/Excel parsing and validation
    
    setTimeout(async () => {
      await storage.updateUploadSession(sessionId, {
        status: "pending", // Changed from "completed" to indicate it needs real implementation
        totalRecords: 0,
        successCount: 0,
        errorCount: 0,
        errors: JSON.stringify([])
      });
    }, 500); // Reduced timeout since we're not actually processing
    
  } catch (error) {
    await storage.updateUploadSession(sessionId, {
      status: "failed",
      errors: JSON.stringify([{ error: "File processing not yet implemented" }])
    });
  }
}
