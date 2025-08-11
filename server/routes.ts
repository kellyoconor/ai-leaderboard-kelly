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

  // Get weeks at each position for each tool (optionally up to a specific week)
  app.get("/api/rankings/weeks-at-position", async (req, res) => {
    try {
      const upToWeek = req.query.upToWeek as string | undefined;
      const weeksAtPosition = await storage.getWeeksAtPosition(upToWeek);
      res.json(weeksAtPosition);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weeks at position data" });
    }
  });

  // GitHub API proxy endpoints
  app.get("/api/github/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "GitHub user not found" });
      }
      
      const userData = await response.json();
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GitHub user data" });
    }
  });

  app.get("/api/github/repos/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=10`);
      
      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch repositories" });
      }
      
      const reposData = await response.json();
      res.json(reposData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GitHub repositories" });
    }
  });

  app.get("/api/github/contributions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // For real GitHub contributions, we need to use their GraphQL API
      // This requires authentication, so we'll try with the GitHub token
      const githubToken = process.env.GITHUB_TOKEN;
      
      // GitHub GraphQL query to get contribution data
      // First try to get the authenticated user's data if username matches
      const query = `
        query {
          viewer {
            login
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;
      
      let response;
      
      if (githubToken) {
        // Try with token first
        response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query
          })
        });
      }
      
      // Check if we have a valid response
      if (!githubToken) {
        return generateMockContributions(res);
      }
      
      if (!response || !response.ok) {
        return generateMockContributions(res);
      }
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      // Transform the data to our format
      const contributions = [];
      const weeks = data.data.viewer.contributionsCollection.contributionCalendar.weeks;
      
      for (const week of weeks) {
        for (const day of week.contributionDays) {
          const count = day.contributionCount;
          let level = 0;
          if (count >= 10) level = 4;
          else if (count >= 7) level = 3;
          else if (count >= 4) level = 2;
          else if (count >= 1) level = 1;
          
          contributions.push({
            date: day.date,
            count: count,
            level: level
          });
        }
      }
      

      
      res.json(contributions);
    } catch (error) {
      console.error('GitHub contributions error:', error);
      // Fall back to mock data on any error
      return generateMockContributions(res);
    }
  });

  // Helper function to generate mock contribution data
  function generateMockContributions(res: any) {
    const contributions = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Generate 365 days of realistic mock data
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let count = 0;
      const random = Math.random();
      
      if (!isWeekend && random > 0.3) {
        if (random > 0.9) count = Math.floor(Math.random() * 15) + 10;
        else if (random > 0.7) count = Math.floor(Math.random() * 8) + 3;
        else if (random > 0.5) count = Math.floor(Math.random() * 3) + 1;
      } else if (isWeekend && random > 0.7) {
        count = Math.floor(Math.random() * 5) + 1;
      }
      
      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 7) level = 3;
      else if (count >= 4) level = 2;
      else if (count >= 1) level = 1;
      
      contributions.push({
        date: d.toISOString().split('T')[0],
        count,
        level
      });
    }
    
    res.json(contributions);
  }

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
