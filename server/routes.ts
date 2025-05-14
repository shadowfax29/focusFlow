import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBlockedSiteSchema, insertSessionSchema, updateSessionSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

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
      console.log("Received session creation request:", req.body);

      // Check if required fields are present
      if (!req.body.plannedDuration) {
        console.error("Missing plannedDuration");
        return res.status(400).json({ message: "Invalid data", errors: [{ code: "missing_field", path: ["plannedDuration"], message: "Required" }] });
      }

      if (!req.body.pomodorosPlanned) {
        console.error("Missing pomodorosPlanned");
        return res.status(400).json({ message: "Invalid data", errors: [{ code: "missing_field", path: ["pomodorosPlanned"], message: "Required" }] });
      }

      // Convert date string to Date object if needed
      let sessionData = { ...req.body };
      if (typeof sessionData.startTime === 'string') {
        sessionData.startTime = new Date(sessionData.startTime);
      }

      const validatedData = insertSessionSchema.parse({
        ...sessionData,
        userId: req.user.id
      });

      console.log("Validated session data:", validatedData);
      const session = await storage.createSession(validatedData);
      console.log("Session created:", session);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("Validation error:", err.errors);
        return res.status(400).json({ message: "Invalid data", errors: err.errors });
      }
      console.error("Session creation error:", err);
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

  // Extension API endpoints
  // Generate a token for the extension
  app.post("/api/extension/token", requireAuth, async (req, res) => {
    try {
      console.log("Generating extension token for user:", req.user.id, req.user.username);

      // Generate a simple token that includes the username
      // In a production app, you would use a more secure method
      const randomPart = randomBytes(16).toString('hex');
      const token = `${req.user.username}:${randomPart}`;

      console.log("Generated token:", token);

      // Return the token to the client
      res.json({ token });
      console.log("Token sent to client");
    } catch (err) {
      console.error("Error generating extension token:", err);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Middleware to verify extension token
  const verifyExtensionToken = async (req: Request, res: Response, next: Function) => {
    try {
      console.log("Verifying extension token");
      console.log("Headers:", req.headers);

      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("No valid authorization header found");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }

      const token = authHeader.split(' ')[1];
      console.log("Token from header:", token.substring(0, 10) + "...");

      // Find the user with this token
      console.log("Looking up user by extension token");
      const user = await storage.getUserByExtensionToken(token);

      if (!user) {
        console.log("No user found for token");
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      console.log("User found:", user.id, user.username);

      // Attach the user to the request
      req.user = user;
      next();
    } catch (err) {
      console.error("Error verifying extension token:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Get blocked sites for the extension
  app.get("/api/extension/blocked-sites", verifyExtensionToken, async (req, res) => {
    try {
      const sites = await storage.getBlockedSites(req.user.id);
      res.json(sites);
    } catch (err) {
      console.error("Error fetching blocked sites for extension:", err);
      res.status(500).json({ message: "Failed to fetch blocked sites" });
    }
  });

  // Get current timer status for the extension
  app.get("/api/extension/timer-status", verifyExtensionToken, async (req, res) => {
    try {
      // Get the user's active session if any
      const sessions = await storage.getSessions(req.user.id, 1);
      const activeSession = sessions.length > 0 && !sessions[0].endTime ? sessions[0] : null;

      // Get the user's timer settings
      const timerSettings = await storage.getTimerSettings(req.user.id);

      res.json({
        activeSession,
        timerSettings,
        serverTime: new Date()
      });
    } catch (err) {
      console.error("Error fetching timer status for extension:", err);
      res.status(500).json({ message: "Failed to fetch timer status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
