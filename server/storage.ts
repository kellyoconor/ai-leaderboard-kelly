import { type WeeklyRanking, type InsertWeeklyRanking, type WeeklyRankingsBatch, weeklyRankings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, inArray, count, and, lte } from "drizzle-orm";

export interface IStorage {
  // Weekly Rankings
  createWeeklyRankings(batch: WeeklyRankingsBatch): Promise<WeeklyRanking[]>;
  getWeeklyRankings(weekOf: string): Promise<WeeklyRanking[]>;
  getAllWeeks(): Promise<string[]>;
  getHistoricalRankings(weeks: number): Promise<WeeklyRanking[]>;
  getCurrentWeekRankings(): Promise<WeeklyRanking[]>;
  getWeeksAtPosition(upToWeek?: string): Promise<Array<{toolName: string, rank: number, count: number}>>;
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
    // First try to get rankings for the actual current week
    const actualCurrentWeek = this.getCurrentWeekString();
    const currentWeekRankings = await this.getWeeklyRankings(actualCurrentWeek);
    
    // If current week has data, return it
    if (currentWeekRankings.length > 0) {
      return currentWeekRankings;
    }
    
    // Otherwise return empty array to indicate new week needs data
    return [];
  }

  async getWeeksAtPosition(upToWeek?: string): Promise<Array<{toolName: string, rank: number, count: number}>> {
    // Build where conditions
    const whereConditions = [];
    
    // If upToWeek is specified, only count weeks up to and including that week
    if (upToWeek) {
      whereConditions.push(lte(weeklyRankings.weekOf, upToWeek));
    }
    
    const result = await db
      .select({
        toolName: weeklyRankings.toolName,
        rank: weeklyRankings.rank,
        count: count()
      })
      .from(weeklyRankings)
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
      .groupBy(weeklyRankings.toolName, weeklyRankings.rank)
      .orderBy(weeklyRankings.toolName, weeklyRankings.rank);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
