import { type WeeklyRanking, type InsertWeeklyRanking, type WeeklyRankingsBatch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Weekly Rankings
  createWeeklyRankings(batch: WeeklyRankingsBatch): Promise<WeeklyRanking[]>;
  getWeeklyRankings(weekOf: string): Promise<WeeklyRanking[]>;
  getAllWeeks(): Promise<string[]>;
  getHistoricalRankings(weeks: number): Promise<WeeklyRanking[]>;
  getCurrentWeekRankings(): Promise<WeeklyRanking[]>;
}

export class MemStorage implements IStorage {
  private weeklyRankings: Map<string, WeeklyRanking>;

  constructor() {
    this.weeklyRankings = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed with sample data for demonstration
    const currentWeek = this.getCurrentWeekString();
    const lastWeek = this.getWeekString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const currentWeekData = [
      { rank: 1, toolName: "Claude 3.5 Sonnet", category: "Code & Writing", activity: "Built 3 React components, wrote technical documentation, and created API integration code" },
      { rank: 2, toolName: "GPT-4 Turbo", category: "General AI Assistant", activity: "Research on market trends, created presentation outlines, and brainstormed product features" },
      { rank: 3, toolName: "Midjourney", category: "Image Generation", activity: "Created hero images for landing page, social media graphics, and concept art for new features" },
      { rank: 4, toolName: "Notion AI", category: "Productivity & Notes", activity: "Organized project documentation, created meeting summaries, and structured knowledge base" },
      { rank: 5, toolName: "RunwayML", category: "Video Generation", activity: "Generated product demo videos and animated promotional content for social media" },
    ];

    const lastWeekData = [
      { rank: 1, toolName: "GPT-4 Turbo", category: "General AI Assistant", activity: "Created comprehensive business analysis and strategic planning documents" },
      { rank: 2, toolName: "Claude 3.5 Sonnet", category: "Code & Writing", activity: "Developed backend APIs and database schema design" },
      { rank: 3, toolName: "Midjourney", category: "Image Generation", activity: "Brand identity exploration and marketing visual creation" },
      { rank: 4, toolName: "Perplexity AI", category: "Research", activity: "Deep research on industry trends and competitive analysis" },
      { rank: 5, toolName: "Notion AI", category: "Productivity & Notes", activity: "Project management and team collaboration workflows" },
    ];

    currentWeekData.forEach(ranking => {
      const id = randomUUID();
      this.weeklyRankings.set(id, {
        id,
        weekOf: currentWeek,
        rank: ranking.rank,
        toolName: ranking.toolName,
        category: ranking.category,
        activity: ranking.activity,
        createdAt: new Date(),
      });
    });

    lastWeekData.forEach(ranking => {
      const id = randomUUID();
      this.weeklyRankings.set(id, {
        id,
        weekOf: lastWeek,
        rank: ranking.rank,
        toolName: ranking.toolName,
        category: ranking.category,
        activity: ranking.activity,
        createdAt: new Date(),
      });
    });
  }

  private getCurrentWeekString(): string {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  private getWeekString(date: Date): string {
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  async createWeeklyRankings(batch: WeeklyRankingsBatch): Promise<WeeklyRanking[]> {
    // Remove existing rankings for this week
    const existingIds = Array.from(this.weeklyRankings.entries())
      .filter(([_, ranking]) => ranking.weekOf === batch.weekOf)
      .map(([id, _]) => id);
    
    existingIds.forEach(id => this.weeklyRankings.delete(id));

    // Add new rankings
    const newRankings: WeeklyRanking[] = [];
    batch.rankings.forEach(ranking => {
      const id = randomUUID();
      const newRanking: WeeklyRanking = {
        id,
        weekOf: batch.weekOf,
        rank: ranking.rank,
        toolName: ranking.toolName,
        category: ranking.category,
        activity: ranking.activity,
        createdAt: new Date(),
      };
      this.weeklyRankings.set(id, newRanking);
      newRankings.push(newRanking);
    });

    return newRankings.sort((a, b) => a.rank - b.rank);
  }

  async getWeeklyRankings(weekOf: string): Promise<WeeklyRanking[]> {
    return Array.from(this.weeklyRankings.values())
      .filter(ranking => ranking.weekOf === weekOf)
      .sort((a, b) => a.rank - b.rank);
  }

  async getAllWeeks(): Promise<string[]> {
    const weeks = new Set(Array.from(this.weeklyRankings.values()).map(r => r.weekOf));
    return Array.from(weeks).sort((a, b) => b.localeCompare(a)); // Most recent first
  }

  async getHistoricalRankings(weeks: number = 4): Promise<WeeklyRanking[]> {
    const allWeeks = await this.getAllWeeks();
    const recentWeeks = allWeeks.slice(0, weeks);
    
    return Array.from(this.weeklyRankings.values())
      .filter(ranking => recentWeeks.includes(ranking.weekOf))
      .sort((a, b) => {
        if (a.weekOf === b.weekOf) {
          return a.rank - b.rank;
        }
        return b.weekOf.localeCompare(a.weekOf);
      });
  }

  async getCurrentWeekRankings(): Promise<WeeklyRanking[]> {
    const currentWeek = this.getCurrentWeekString();
    return this.getWeeklyRankings(currentWeek);
  }
}

export const storage = new MemStorage();
