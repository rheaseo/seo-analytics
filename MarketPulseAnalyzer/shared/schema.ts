import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyticsReports = pgTable("analytics_reports", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  weeklyChange: jsonb("weekly_change").notNull(),
  monthlyChange: jsonb("monthly_change").notNull(),
  engagementThisWeek: jsonb("engagement_this_week").notNull(),
  engagementPriorWeek: jsonb("engagement_prior_week").notNull(),

  weeklyInsight: text("weekly_insight"),
  monthlyInsight: text("monthly_insight"),
  rawHtml: text("raw_html").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalyticsReportSchema = createInsertSchema(analyticsReports).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalyticsReport = z.infer<typeof insertAnalyticsReportSchema>;
export type AnalyticsReport = typeof analyticsReports.$inferSelect;
