import { users, timerSettings, blockedSites, notificationSettings, sessions } from "@shared/schema";
import type {
  User, InsertUser,
  TimerSettings, InsertTimerSettings,
  BlockedSite, InsertBlockedSite,
  NotificationSettings, InsertNotificationSettings,
  Session, InsertSession, UpdateSession
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PostgresSessionStore = connectPgSimple(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByExtensionToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Timer settings methods
  getTimerSettings(userId: number): Promise<TimerSettings | undefined>;
  createTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings>;
  updateTimerSettings(userId: number, settings: Partial<InsertTimerSettings>): Promise<TimerSettings | undefined>;

  // Blocked sites methods
  getBlockedSites(userId: number): Promise<BlockedSite[]>;
  createBlockedSite(site: InsertBlockedSite): Promise<BlockedSite>;
  updateBlockedSite(id: number, userId: number, isEnabled: boolean): Promise<BlockedSite | undefined>;
  deleteBlockedSite(id: number, userId: number): Promise<boolean>;

  // Notification settings methods
  getNotificationSettings(userId: number): Promise<NotificationSettings | undefined>;
  createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
  updateNotificationSettings(userId: number, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings | undefined>;

  // Session methods
  getSessions(userId: number, limit?: number): Promise<Session[]>;
  getSession(id: number, userId: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, userId: number, sessionUpdate: Partial<UpdateSession>): Promise<Session | undefined>;
  getSessionStats(userId: number): Promise<{
    today: number;
    week: number;
    focusTime: number;
    completionRate: number;
  }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByExtensionToken(token: string): Promise<User | undefined> {
    try {
      console.log("Looking for user with extension token:", token.substring(0, 10) + "...");

      // For demo purposes, we'll use a very simple approach
      // In a production app, you would validate the token properly

      // Extract username from token (assuming token format is "username:randomstring")
      const parts = token.split(':');
      if (parts.length !== 2) {
        console.log("Invalid token format");
        return undefined;
      }

      const username = parts[0];
      console.log("Extracted username from token:", username);

      // Find user by username
      const user = await this.getUserByUsername(username);

      if (user) {
        console.log("Found user:", user.id, user.username);
        return user;
      }

      console.log("No user found with username:", username);
      return undefined;
    } catch (error) {
      console.error("Error in getUserByExtensionToken:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Timer settings methods
  async getTimerSettings(userId: number): Promise<TimerSettings | undefined> {
    const [settings] = await db
      .select()
      .from(timerSettings)
      .where(eq(timerSettings.userId, userId));
    return settings;
  }

  async createTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings> {
    const [newSettings] = await db
      .insert(timerSettings)
      .values(settings)
      .returning();
    return newSettings;
  }

  async updateTimerSettings(userId: number, settings: Partial<InsertTimerSettings>): Promise<TimerSettings | undefined> {
    const [updatedSettings] = await db
      .update(timerSettings)
      .set(settings)
      .where(eq(timerSettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Blocked sites methods
  async getBlockedSites(userId: number): Promise<BlockedSite[]> {
    return await db
      .select()
      .from(blockedSites)
      .where(eq(blockedSites.userId, userId));
  }

  async createBlockedSite(site: InsertBlockedSite): Promise<BlockedSite> {
    const [newSite] = await db
      .insert(blockedSites)
      .values(site)
      .returning();
    return newSite;
  }

  async updateBlockedSite(id: number, userId: number, isEnabled: boolean): Promise<BlockedSite | undefined> {
    const [updatedSite] = await db
      .update(blockedSites)
      .set({ isEnabled })
      .where(and(eq(blockedSites.id, id), eq(blockedSites.userId, userId)))
      .returning();
    return updatedSite;
  }

  async deleteBlockedSite(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(blockedSites)
      .where(and(eq(blockedSites.id, id), eq(blockedSites.userId, userId)))
      .returning({ id: blockedSites.id });
    return result.length > 0;
  }

  // Notification settings methods
  async getNotificationSettings(userId: number): Promise<NotificationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    return settings;
  }

  async createNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings> {
    const [newSettings] = await db
      .insert(notificationSettings)
      .values(settings)
      .returning();
    return newSettings;
  }

  async updateNotificationSettings(userId: number, settings: Partial<InsertNotificationSettings>): Promise<NotificationSettings | undefined> {
    const [updatedSettings] = await db
      .update(notificationSettings)
      .set(settings)
      .where(eq(notificationSettings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Session methods
  async getSessions(userId: number, limit?: number): Promise<Session[]> {
    let query = db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.startTime));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async getSession(id: number, userId: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), eq(sessions.userId, userId)));
    return session;
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(sessionData)
      .returning();
    return newSession;
  }

  async updateSession(id: number, userId: number, sessionUpdate: Partial<UpdateSession>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(sessionUpdate)
      .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
      .returning();
    return updatedSession;
  }

  async getSessionStats(userId: number): Promise<{
    today: number;
    week: number;
    focusTime: number;
    completionRate: number;
  }> {
    const allSessions = await this.getSessions(userId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const todaySessions = allSessions.filter(
      session => new Date(session.startTime).getTime() >= startOfToday.getTime()
    );

    const weekSessions = allSessions.filter(
      session => new Date(session.startTime).getTime() >= oneWeekAgo.getTime()
    );

    const completedSessions = allSessions.filter(session => session.isCompleted);
    const completionRate = allSessions.length > 0
      ? Math.round((completedSessions.length / allSessions.length) * 100)
      : 0;

    // Calculate total focus time in hours from actual durations
    let totalFocusTimeSeconds = 0;
    weekSessions.forEach(session => {
      totalFocusTimeSeconds += session.actualDuration || 0;
    });

    // Convert to hours with one decimal point
    const focusTimeHours = Math.round((totalFocusTimeSeconds / 3600) * 10) / 10;

    return {
      today: todaySessions.length,
      week: weekSessions.length,
      focusTime: focusTimeHours,
      completionRate
    };
  }
}

export const storage = new DatabaseStorage();
