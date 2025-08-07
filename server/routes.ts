import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { weeklyRankingsBatchSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current week rankings
  app.get("/api/rankings/current", async (req, res) => {
    try {
      const rankings = await storage.getCurrentWeekRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current rankings" });
    }
  });

  // Get rankings for a specific week
  app.get("/api/rankings/week/:weekOf", async (req, res) => {
    try {
      const { weekOf } = req.params;
      const rankings = await storage.getWeeklyRankings(weekOf);
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly rankings" });
    }
  });

  // Get all weeks
  app.get("/api/rankings/weeks", async (req, res) => {
    try {
      const weeks = await storage.getAllWeeks();
      res.json(weeks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weeks" });
    }
  });

  // Get historical rankings (last N weeks)
  app.get("/api/rankings/history", async (req, res) => {
    try {
      const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 4;
      const rankings = await storage.getHistoricalRankings(weeks);
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch historical rankings" });
    }
  });

  // Create/update weekly rankings
  app.post("/api/rankings", async (req, res) => {
    try {
      const batch = weeklyRankingsBatchSchema.parse(req.body);
      const rankings = await storage.createWeeklyRankings(batch);
      res.json(rankings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid ranking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save rankings" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
