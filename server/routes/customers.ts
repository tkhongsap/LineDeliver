import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertCustomerRecordSchema, updateCustomerRecordSchema } from "@shared/customer-schema";
import type { CustomerRecordsFilters } from "@shared/customer-schema";

const router = Router();

// Get customer records with pagination, search, and filtering
router.get("/", async (req, res) => {
  try {
    const filters: CustomerRecordsFilters = {
      search: req.query.search as string,
      status: req.query.status as "all" | "ready" | "edited" | "invalid",
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as "asc" | "desc"
    };

    const result = await storage.getCustomerRecords(filters);
    res.json(result);
  } catch (error) {
    console.error("Error getting customer records:", error);
    res.status(500).json({ error: "Failed to get customer records" });
  }
});

// Get customer records statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await storage.getCustomerRecordsStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting customer records stats:", error);
    res.status(500).json({ error: "Failed to get customer records stats" });
  }
});

// Get single customer record
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const record = await storage.getCustomerRecord(id);
    
    if (!record) {
      return res.status(404).json({ error: "Customer record not found" });
    }
    
    res.json(record);
  } catch (error) {
    console.error("Error getting customer record:", error);
    res.status(500).json({ error: "Failed to get customer record" });
  }
});

// Create new customer record
router.post("/", async (req, res) => {
  try {
    const validatedData = insertCustomerRecordSchema.parse(req.body);
    const record = await storage.createCustomerRecord(validatedData);
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error",
        details: error.errors 
      });
    }
    console.error("Error creating customer record:", error);
    res.status(500).json({ error: "Failed to create customer record" });
  }
});

// Update customer record
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateCustomerRecordSchema.parse(req.body);
    
    const updatedRecord = await storage.updateCustomerRecord(id, validatedData);
    
    if (!updatedRecord) {
      return res.status(404).json({ error: "Customer record not found" });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error",
        details: error.errors 
      });
    }
    console.error("Error updating customer record:", error);
    res.status(500).json({ error: "Failed to update customer record" });
  }
});

// Delete customer record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteCustomerRecord(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Customer record not found" });
    }
    
    res.json({ message: "Customer record deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer record:", error);
    res.status(500).json({ error: "Failed to delete customer record" });
  }
});

// Bulk delete customer records
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty IDs array" });
    }

    const result = await storage.bulkDeleteCustomerRecords(ids);
    res.json(result);
  } catch (error) {
    console.error("Error bulk deleting customer records:", error);
    res.status(500).json({ error: "Failed to bulk delete customer records" });
  }
});

export default router;