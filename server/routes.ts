import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBlockedSiteSchema, insertSessionSchema, updateSessionSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Timer settings routes
  app.get("/api/timer-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getTimerSettings(req.user.id);
      if (!settings) {
        const newSettings = await storage.createTimerSettings({
          userId: req.user.id,
          focusMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          pomodorosUntilLongBreak: 4,
          autoStartBreaks: true,
          autoStartPomodoros: false
        });
        return res.json(newSettings);
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch timer settings" });
    }
  });

  app.patch("/api/timer-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateTimerSettings(req.user.id, req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to update timer settings" });
    }
  });

  // Blocked sites routes
  app.get("/api/blocked-sites", requireAuth, async (req, res) => {
    try {
      const sites = await storage.getBlockedSites(req.user.id);
      res.json(sites);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch blocked sites" });
    }
  });

  app.post("/api/blocked-sites", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBlockedSiteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const site = await storage.createBlockedSite(validatedData);
      res.status(201).json(site);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create blocked site" });
    }
  });

  app.patch("/api/blocked-sites/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isEnabled } = req.body;
      
      if (typeof isEnabled !== 'boolean') {
        return res.status(400).json({ message: "isEnabled must be a boolean" });
      }
      
      const site = await storage.updateBlockedSite(parseInt(id), req.user.id, isEnabled);
      if (!site) {
        return res.status(404).json({ message: "Blocked site not found" });
      }
      res.json(site);
    } catch (err) {
      res.status(500).json({ message: "Failed to update blocked site" });
    }
  });

  app.delete("/api/blocked-sites/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlockedSite(parseInt(id), req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Blocked site not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete blocked site" });
    }
  });

  // Notification settings routes
  app.get("/api/notification-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getNotificationSettings(req.user.id);
      if (!settings) {
        const newSettings = await storage.createNotificationSettings({
          userId: req.user.id,
          sessionStart: true,
          breakTime: true,
          sessionCompletion: true,
          soundAlerts: true,
          volume: 70
        });
        return res.json(newSettings);
      }
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.patch("/api/notification-settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateNotificationSettings(req.user.id, req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Session routes
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getSessions(req.user.id, limit);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(parseInt(id), req.user.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.patch("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateSessionSchema.partial().parse(req.body);
      const session = await storage.updateSession(parseInt(id), req.user.id, validatedData);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.get("/api/session-stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getSessionStats(req.user.id);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch session stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
