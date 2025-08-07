import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weeklyRankings = pgTable("weekly_rankings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekOf: text("week_of").notNull(), // ISO date string for the Monday of the week
  rank: integer("rank").notNull(),
  toolName: text("tool_name").notNull(),
  category: text("category").notNull(),
  activity: text("activity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWeeklyRankingSchema = createInsertSchema(weeklyRankings).omit({
  id: true,
  createdAt: true,
});

export const weeklyRankingsBatchSchema = z.object({
  weekOf: z.string(),
  rankings: z.array(z.object({
    rank: z.number().min(1).max(5),
    toolName: z.string().min(1),
    category: z.string().min(1),
    activity: z.string().min(1),
  })).length(5),
});

export type InsertWeeklyRanking = z.infer<typeof insertWeeklyRankingSchema>;
export type WeeklyRanking = typeof weeklyRankings.$inferSelect;
export type WeeklyRankingsBatch = z.infer<typeof weeklyRankingsBatchSchema>;
