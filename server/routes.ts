import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertViewingSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      // For demo purposes, using userId = 1. In a real app, this would come from authentication
      const documents = await storage.getDocumentsByUserId(1);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: "Failed to create document" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Viewing session routes
  app.get("/api/viewing-sessions/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const session = await storage.getViewingSession(documentId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching viewing session:", error);
      res.status(500).json({ error: "Failed to fetch viewing session" });
    }
  });

  app.post("/api/viewing-sessions", async (req, res) => {
    try {
      const validatedData = insertViewingSessionSchema.parse(req.body);
      const session = await storage.createViewingSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating viewing session:", error);
      res.status(400).json({ error: "Failed to create viewing session" });
    }
  });

  app.put("/api/viewing-sessions/:documentId", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const { currentPage, scale } = req.body;
      const session = await storage.updateViewingSession(documentId, currentPage, scale);
      res.json(session);
    } catch (error) {
      console.error("Error updating viewing session:", error);
      res.status(500).json({ error: "Failed to update viewing session" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
