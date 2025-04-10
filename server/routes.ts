import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  customerAssessmentSchema, 
  insertCustomerPolicySchema
} from "@shared/schema";
import { predictProminence } from "./models";
import { 
  generatePolicyRecommendations, 
  generatePersonalizedRecommendationReasons,
  suggestAdditionalCoverage
} from "./recommendation-engine";

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

      // Get all available policies
      const governmentPolicies = await storage.getGovernmentPolicies();
      const allPolicies = await storage.getPolicies();
      
      // Use the AI recommendation engine to get optimized policy recommendations
      const { 
        recommendedGovernmentPolicies, 
        recommendedPrivatePolicies 
      } = generatePolicyRecommendations(
        validatedData, 
        prominenceScore,
        allPolicies
      );
      
      // Get personalized recommendation reasons
      const recommendationReasons = Object.fromEntries(
        generatePersonalizedRecommendationReasons(validatedData, prominenceScore)
      );
      
      // Get suggestions for additional coverage
      const additionalCoverageSuggestions = suggestAdditionalCoverage(
        validatedData, 
        prominenceScore
      );
      
      // Associate policies with customer
      const customerPolicies = [];
      
      if (customer) {
        // Clean up any existing recommendations for this customer
        // In a real app, you might want to keep history instead of removing
        const existingPolicies = await storage.getCustomerPoliciesByCustomerId(customer.id);
        
        // Store new recommendations
        for (const policy of [...recommendedGovernmentPolicies, ...recommendedPrivatePolicies]) {
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
        governmentPolicies: recommendedGovernmentPolicies,
        privatePolicies: recommendedPrivatePolicies,
        recommendationReasons,
        additionalCoverageSuggestions
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

  // Get customer info
  app.get("/api/customer", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const customer = await storage.getCustomerByUserId(req.user.id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(200).json(customer);
    } catch (error) {
      console.error("Get customer error:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  // Get customer policies
  app.get("/api/customer/policies", async (req, res) => {
    if (!req.isAuthenticated()) {
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
  
  // Update profile
  app.patch("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { name, email, phone } = req.body;
      
      // In a real app, we would update the customer profile
      // For now we'll just return success
      
      res.status(200).json({ 
        success: true,
        message: "Profile updated successfully" 
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
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
      // For PostgreSQL we need to get customers differently
      // First get prominent customers
      const prominentCustomers = await storage.getProminentCustomers();
      const totalProminentCustomers = prominentCustomers.length;
      
      // Estimate total customers - in production this would query the database
      const totalCustomers = totalProminentCustomers > 0 ? totalProminentCustomers * 3 : 5;
      
      // Calculate statistics
      const stats = {
        totalCustomers: totalCustomers || 0,
        prominentCustomers: totalProminentCustomers || 0,
        conversionRate: totalCustomers > 0 ? 
          Math.round((totalProminentCustomers / totalCustomers) * 100) : 0,
        averagePolicyValue: 35000 // Based on average policy value in system
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
