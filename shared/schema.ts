import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  userType: text("user_type").notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  userType: true,
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gender: text("gender"),
  area: text("area"),
  qualification: text("qualification"),
  income: text("income"),
  vintage: integer("vintage"),
  claimAmount: integer("claim_amount"),
  policiesCount: integer("policies_count"),
  policiesChosen: text("policies_chosen"),
  policyType: text("policy_type"),
  maritalStatus: text("marital_status"),
  isProminent: boolean("is_prominent").default(false),
  prominenceScore: integer("prominence_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  isProminent: true,
  prominenceScore: true,
  createdAt: true,
  updatedAt: true,
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  premium: integer("premium"),
  coverage: integer("coverage"),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  benefits: jsonb("benefits"),
  isGovernmentPolicy: boolean("is_government_policy").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
});

export const customerPolicies = pgTable("customer_policies", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  policyId: integer("policy_id").notNull(),
  status: text("status").notNull().default("recommended"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerPolicySchema = createInsertSchema(customerPolicies).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

export type InsertCustomerPolicy = z.infer<typeof insertCustomerPolicySchema>;
export type CustomerPolicy = typeof customerPolicies.$inferSelect;

// Assessment form schema
export const customerAssessmentSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
  area: z.enum(["urban", "rural"]),
  qualification: z.string().min(1, "Qualification is required"),
  income: z.string().min(1, "Income is required"),
  vintage: z.number().min(0, "Vintage must be at least 0"),
  claimAmount: z.number().min(0, "Claim amount must be at least 0"),
  policiesCount: z.number().min(0, "Policies count must be at least 0"),
  policiesChosen: z.string().min(1, "At least one policy must be chosen"),
  policyType: z.string().min(1, "Policy type is required"),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  userId: z.number(),
});

export type CustomerAssessment = z.infer<typeof customerAssessmentSchema>;
