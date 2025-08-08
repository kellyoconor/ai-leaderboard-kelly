import { type WeeklyRanking, type InsertWeeklyRanking, type WeeklyRankingsBatch, weeklyRankings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, inArray, count } from "drizzle-orm";

export interface IStorage {
  // Weekly Rankings
  createWeeklyRankings(batch: WeeklyRankingsBatch): Promise<WeeklyRanking[]>;
  getWeeklyRankings(weekOf: string): Promise<WeeklyRanking[]>;
  getAllWeeks(): Promise<string[]>;
  getHistoricalRankings(weeks: number): Promise<WeeklyRanking[]>;
  getCurrentWeekRankings(): Promise<WeeklyRanking[]>;
  getWeeksAtTop(): Promise<Array<{toolName: string, count: number}>>;
}

export class DatabaseStorage implements IStorage {
  private getCurrentWeekString(): string {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  async createWeeklyRankings(batch: WeeklyRankingsBatch): Promise<WeeklyRanking[]> {
    // Remove existing rankings for this week
    await db.delete(weeklyRankings).where(eq(weeklyRankings.weekOf, batch.weekOf));

    // Add new rankings
    const newRankings = await db
      .insert(weeklyRankings)
      .values(
        batch.rankings.map(ranking => ({
          weekOf: batch.weekOf,
          rank: ranking.rank,
          toolName: ranking.toolName,
          category: ranking.category,
          activity: ranking.activity,
        }))
      )
      .returning();

    return newRankings.sort((a, b) => a.rank - b.rank);
  }

  async getWeeklyRankings(weekOf: string): Promise<WeeklyRanking[]> {
    return await db
      .select()
      .from(weeklyRankings)
      .where(eq(weeklyRankings.weekOf, weekOf))
      .orderBy(weeklyRankings.rank);
  }

  async getAllWeeks(): Promise<string[]> {
    const result = await db
      .selectDistinct({ weekOf: weeklyRankings.weekOf })
      .from(weeklyRankings)
      .orderBy(desc(weeklyRankings.weekOf));
    
    return result.map(r => r.weekOf);
  }

  async getHistoricalRankings(weeks: number = 4): Promise<WeeklyRanking[]> {
    const allWeeks = await this.getAllWeeks();
    const recentWeeks = allWeeks.slice(0, weeks);
    
    if (recentWeeks.length === 0) return [];

    return await db
      .select()
      .from(weeklyRankings)
      .where(inArray(weeklyRankings.weekOf, recentWeeks))
      .orderBy(desc(weeklyRankings.weekOf), weeklyRankings.rank);
  }

  async getCurrentWeekRankings(): Promise<WeeklyRanking[]> {
    const currentWeek = this.getCurrentWeekString();
    return this.getWeeklyRankings(currentWeek);
  }

  async getWeeksAtTop(): Promise<Array<{toolName: string, count: number}>> {
    const result = await db
      .select({
        toolName: weeklyRankings.toolName,
        count: count()
      })
      .from(weeklyRankings)
      .where(eq(weeklyRankings.rank, 1))
      .groupBy(weeklyRankings.toolName)
      .orderBy(desc(count()));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
