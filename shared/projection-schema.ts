import { pgTable, integer, text, decimal, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const savedProjections = pgTable("saved_projections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  accountId: integer("account_id").notNull(),
  userId: text("user_id").notNull(),
  startingCapital: decimal("starting_capital", { precision: 10, scale: 2 }).notNull(),
  riskPerTrade: decimal("risk_per_trade", { precision: 5, scale: 2 }).notNull(),
  rewardRiskRatio: decimal("reward_risk_ratio", { precision: 5, scale: 2 }).notNull(),
  targetProfit: decimal("target_profit", { precision: 10, scale: 2 }).notNull(),
  projectedDays: integer("projected_days").notNull(),
  compoundingEnabled: boolean("compounding_enabled").default(false),
  compoundingPercentage: decimal("compounding_percentage", { precision: 5, scale: 2 }).default("0"),
  riskCuttingEnabled: boolean("risk_cutting_enabled").default(false),
  riskCuttingPercentage: decimal("risk_cutting_percentage", { precision: 5, scale: 2 }).default("0"),
  status: text("status").notNull().default("active"), // active, completed, failed
  isLocked: boolean("is_locked").default(false),
  actualPnl: decimal("actual_pnl", { precision: 10, scale: 2 }).default("0"),
  suggestedAdjustments: text("suggested_adjustments"), // JSON string of suggestions
  hasPendingSuggestions: boolean("has_pending_suggestions").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  lockedAt: timestamp("locked_at"),
});

export const projectionAdjustmentHistory = pgTable("projection_adjustment_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectionId: integer("projection_id").notNull(),
  adjustmentType: text("adjustment_type").notNull(), // manual, auto-suggestion, system
  oldValues: text("old_values").notNull(), // JSON string
  newValues: text("new_values").notNull(), // JSON string
  reason: text("reason"),
  acceptedByUser: boolean("accepted_by_user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedProjectionSchema = createInsertSchema(savedProjections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  lockedAt: true,
});

export const insertProjectionAdjustmentSchema = createInsertSchema(projectionAdjustmentHistory).omit({
  id: true,
  createdAt: true,
});

export type SavedProjection = typeof savedProjections.$inferSelect;
export type InsertSavedProjection = z.infer<typeof insertSavedProjectionSchema>;
export type ProjectionAdjustmentHistory = typeof projectionAdjustmentHistory.$inferSelect;
export type InsertProjectionAdjustment = z.infer<typeof insertProjectionAdjustmentSchema>;