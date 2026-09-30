import { Express } from "express";

export function registerRoutes(app: Express) {
  // Routes stub - to be implemented with actual trading journal routes

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
}
