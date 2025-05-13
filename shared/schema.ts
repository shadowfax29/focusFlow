import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const timerSettings = pgTable("timer_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  focusMinutes: integer("focus_minutes").notNull().default(25),
  shortBreakMinutes: integer("short_break_minutes").notNull().default(5),
  longBreakMinutes: integer("long_break_minutes").notNull().default(15),
  pomodorosUntilLongBreak: integer("pomodoros_until_long_break").notNull().default(4),
  autoStartBreaks: boolean("auto_start_breaks").notNull().default(true),
  autoStartPomodoros: boolean("auto_start_pomodoros").notNull().default(false),
});

export const insertTimerSettingsSchema = createInsertSchema(timerSettings).omit({
  id: true,
});

export const blockedSites = pgTable("blocked_sites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domain: text("domain").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
});

export const insertBlockedSiteSchema = createInsertSchema(blockedSites).omit({
  id: true,
});

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionStart: boolean("session_start").notNull().default(true),
  breakTime: boolean("break_time").notNull().default(true),
  sessionCompletion: boolean("session_completion").notNull().default(true),
  soundAlerts: boolean("sound_alerts").notNull().default(true),
  volume: integer("volume").notNull().default(70),
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  plannedDuration: integer("planned_duration").notNull(), // in seconds
  actualDuration: integer("actual_duration"), // in seconds
  pomodorosPlanned: integer("pomodoros_planned").notNull(),
  pomodorosCompleted: integer("pomodoros_completed").notNull().default(0),
  task: text("task"),
  isCompleted: boolean("is_completed").notNull().default(false),
  abortReason: text("abort_reason"),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  endTime: true,
  actualDuration: true,
  pomodorosCompleted: true,
  isCompleted: true,
  abortReason: true,
});

export const updateSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  userId: true,
  startTime: true,
  plannedDuration: true,
  pomodorosPlanned: true,
  task: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TimerSettings = typeof timerSettings.$inferSelect;
export type InsertTimerSettings = z.infer<typeof insertTimerSettingsSchema>;
export type BlockedSite = typeof blockedSites.$inferSelect;
export type InsertBlockedSite = z.infer<typeof insertBlockedSiteSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;
