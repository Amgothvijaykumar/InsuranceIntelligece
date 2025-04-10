import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  customerAssessmentSchema, 
  insertCustomerPolicySchema
} from "@shared/schema";
import { predictProminence } from "./models";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Customer assessment endpoint
  app.post("/api/assessment", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "customer") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = customerAssessmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if customer already exists
      let customer = await storage.getCustomerByUserId(req.user.id);
      
      if (customer) {
        // Update existing customer
        customer = await storage.updateCustomer(customer.id, validatedData);
      } else {
        // Create new customer
        customer = await storage.createCustomer(validatedData);
      }

      if (!customer) {
        return res.status(500).json({ message: "Failed to save customer data" });
      }

      // Predict prominence
      const { isProminent, prominenceScore } = await predictProminence(validatedData);
      
      // Update customer with prominence status
      customer = await storage.updateCustomer(customer.id, {
        isProminent,
        prominenceScore
      });

      // Get recommended policies based on prominence status
      const governmentPolicies = await storage.getGovernmentPolicies();
      const allPolicies = await storage.getPolicies();
      
      // Filter policies based on customer's preferences
      const preferredCategories = validatedData.policiesChosen.split(',');
      
      const filteredGovernmentPolicies = governmentPolicies.filter(policy => 
        preferredCategories.includes(policy.category)
      );
      
      const filteredPrivatePolicies = allPolicies.filter(policy => 
        !policy.isGovernmentPolicy && preferredCategories.includes(policy.category)
      );
      
      // Associate policies with customer
      const customerPolicies = [];
      
      if (customer) {
        for (const policy of [...filteredGovernmentPolicies, ...filteredPrivatePolicies]) {
          const customerPolicy = await storage.createCustomerPolicy({
            customerId: customer.id,
            policyId: policy.id,
            status: "recommended"
          });
          customerPolicies.push(customerPolicy);
        }
      }

      res.status(200).json({
        customer,
        isProminent,
        prominenceScore,
        governmentPolicies: filteredGovernmentPolicies,
        privatePolicies: filteredPrivatePolicies
      });
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Get all policies
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      res.status(200).json(policies);
    } catch (error) {
      console.error("Get policies error:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  // Get policies by category
  app.get("/api/policies/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const policies = await storage.getPoliciesByCategory(category);
      res.status(200).json(policies);
    } catch (error) {
      console.error("Get policies by category error:", error);
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  // Get customer policies
  app.get("/api/customer/policies", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "customer") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const customerPolicies = await storage.getCustomerPoliciesByCustomerId(customer.id);
      
      // Get full policy details
      const policiesWithDetails = await Promise.all(
        customerPolicies.map(async (cp) => {
          const policy = await storage.getPolicy(cp.policyId);
          return {
            ...cp,
            policy
          };
        })
      );
      
      res.status(200).json(policiesWithDetails);
    } catch (error) {
      console.error("Get customer policies error:", error);
      res.status(500).json({ message: "Failed to fetch customer policies" });
    }
  });

  // Get all prominent customers (for manager dashboard)
  app.get("/api/manager/prominent-customers", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "manager") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const prominentCustomers = await storage.getProminentCustomers();
      res.status(200).json(prominentCustomers);
    } catch (error) {
      console.error("Get prominent customers error:", error);
      res.status(500).json({ message: "Failed to fetch prominent customers" });
    }
  });

  // Get dashboard stats (for manager dashboard)
  app.get("/api/manager/dashboard-stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "manager") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const allCustomers = Array.from((await Promise.all(
        Array.from(Array(storage.currentCustomerId).keys())
          .map(async (id) => await storage.getCustomer(id + 1))
      )).filter(Boolean));
      
      const prominentCustomers = allCustomers.filter(c => c && c.isProminent);
      
      const stats = {
        totalCustomers: allCustomers.length,
        prominentCustomers: prominentCustomers.length,
        conversionRate: allCustomers.length > 0 ? 
          Math.round((prominentCustomers.length / allCustomers.length) * 100) : 0,
        averagePolicyValue: 25000 // Mock value since we don't have actual data
      };
      
      res.status(200).json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
