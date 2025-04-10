import { users, type User, type InsertUser, customers, type Customer, type InsertCustomer, policies, type Policy, type InsertPolicy, customerPolicies, type CustomerPolicy, type InsertCustomerPolicy } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByUserId(userId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined>;
  getProminentCustomers(): Promise<Customer[]>;
  
  // Policy methods
  getPolicy(id: number): Promise<Policy | undefined>;
  getPolicies(): Promise<Policy[]>;
  getPoliciesByCategory(category: string): Promise<Policy[]>;
  getGovernmentPolicies(): Promise<Policy[]>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  
  // Customer Policy methods
  getCustomerPolicy(id: number): Promise<CustomerPolicy | undefined>;
  getCustomerPoliciesByCustomerId(customerId: number): Promise<CustomerPolicy[]>;
  createCustomerPolicy(customerPolicy: InsertCustomerPolicy): Promise<CustomerPolicy>;
  updateCustomerPolicy(id: number, data: Partial<CustomerPolicy>): Promise<CustomerPolicy | undefined>;
  
  sessionStore: any; // Using any for now to fix type issues
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private customersMap: Map<number, Customer>;
  private policiesMap: Map<number, Policy>;
  private customerPoliciesMap: Map<number, CustomerPolicy>;
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentCustomerId: number;
  currentPolicyId: number;
  currentCustomerPolicyId: number;

  constructor() {
    this.usersMap = new Map();
    this.customersMap = new Map();
    this.policiesMap = new Map();
    this.customerPoliciesMap = new Map();
    
    this.currentUserId = 1;
    this.currentCustomerId = 1;
    this.currentPolicyId = 1;
    this.currentCustomerPolicyId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some policies
    this.seedPolicies();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.usersMap.set(id, user);
    return user;
  }
  
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersMap.get(id);
  }
  
  async getCustomerByUserId(userId: number): Promise<Customer | undefined> {
    return Array.from(this.customersMap.values()).find(
      (customer) => customer.userId === userId,
    );
  }
  
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const customer: Customer = { 
      ...insertCustomer, 
      id, 
      isProminent: false, 
      prominenceScore: 0,
      createdAt,
      updatedAt
    };
    this.customersMap.set(id, customer);
    return customer;
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customersMap.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { 
      ...customer,
      ...data,
      updatedAt: new Date()
    };
    this.customersMap.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async getProminentCustomers(): Promise<Customer[]> {
    return Array.from(this.customersMap.values()).filter(
      (customer) => customer.isProminent === true,
    );
  }
  
  // Policy methods
  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.policiesMap.get(id);
  }
  
  async getPolicies(): Promise<Policy[]> {
    return Array.from(this.policiesMap.values());
  }
  
  async getPoliciesByCategory(category: string): Promise<Policy[]> {
    return Array.from(this.policiesMap.values()).filter(
      (policy) => policy.category === category,
    );
  }
  
  async getGovernmentPolicies(): Promise<Policy[]> {
    return Array.from(this.policiesMap.values()).filter(
      (policy) => policy.isGovernmentPolicy === true,
    );
  }
  
  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = this.currentPolicyId++;
    const createdAt = new Date();
    const policy: Policy = { ...insertPolicy, id, createdAt };
    this.policiesMap.set(id, policy);
    return policy;
  }
  
  // Customer Policy methods
  async getCustomerPolicy(id: number): Promise<CustomerPolicy | undefined> {
    return this.customerPoliciesMap.get(id);
  }
  
  async getCustomerPoliciesByCustomerId(customerId: number): Promise<CustomerPolicy[]> {
    return Array.from(this.customerPoliciesMap.values()).filter(
      (customerPolicy) => customerPolicy.customerId === customerId,
    );
  }
  
  async createCustomerPolicy(insertCustomerPolicy: InsertCustomerPolicy): Promise<CustomerPolicy> {
    const id = this.currentCustomerPolicyId++;
    const createdAt = new Date();
    const customerPolicy: CustomerPolicy = { 
      ...insertCustomerPolicy, 
      id, 
      createdAt
    };
    this.customerPoliciesMap.set(id, customerPolicy);
    return customerPolicy;
  }
  
  async updateCustomerPolicy(id: number, data: Partial<CustomerPolicy>): Promise<CustomerPolicy | undefined> {
    const customerPolicy = this.customerPoliciesMap.get(id);
    if (!customerPolicy) return undefined;
    
    const updatedCustomerPolicy = { 
      ...customerPolicy,
      ...data
    };
    this.customerPoliciesMap.set(id, updatedCustomerPolicy);
    return updatedCustomerPolicy;
  }
  
  // Seed methods
  private seedPolicies() {
    // Government health policies
    this.createPolicy({
      name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
      description: "Government-backed life insurance scheme with low premium and high coverage.",
      category: "life",
      provider: "Government of India",
      premium: 330,
      coverage: 200000,
      eligibilityCriteria: {
        ageMin: 18,
        ageMax: 50
      },
      benefits: {
        lifeCovers: ["Natural death", "Accidental death"]
      },
      isGovernmentPolicy: true
    });
    
    this.createPolicy({
      name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
      description: "Accident insurance coverage with minimal premium payment.",
      category: "accident",
      provider: "Government of India",
      premium: 12,
      coverage: 200000,
      eligibilityCriteria: {
        ageMin: 18,
        ageMax: 70
      },
      benefits: {
        accidentCovers: ["Accidental death", "Permanent disability"]
      },
      isGovernmentPolicy: true
    });
    
    this.createPolicy({
      name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
      description: "Health insurance scheme that provides coverage for hospitalization expenses.",
      category: "health",
      provider: "Government of India",
      premium: 0,
      coverage: 500000,
      eligibilityCriteria: {
        incomeCriteria: "Below poverty line families"
      },
      benefits: {
        familyCoverage: true,
        hospitalizationCovers: ["Pre and post hospitalization expenses", "Medicine costs"]
      },
      isGovernmentPolicy: true
    });
    
    // Private policies
    this.createPolicy({
      name: "Premium Health Insurance",
      description: "Comprehensive health coverage with special benefits for prominent customers.",
      category: "health",
      provider: "InsureTech",
      premium: 15000,
      coverage: 1000000,
      eligibilityCriteria: {
        ageMin: 18,
        ageMax: 70
      },
      benefits: {
        cashless: true,
        maternity: true,
        preExistingConditions: "Covered after 3 years"
      },
      isGovernmentPolicy: false
    });
    
    this.createPolicy({
      name: "Premium Life Insurance",
      description: "Tailored life insurance solutions with enhanced benefits and coverage options.",
      category: "life",
      provider: "InsureTech",
      premium: 20000,
      coverage: 2000000,
      eligibilityCriteria: {
        ageMin: 18,
        ageMax: 65
      },
      benefits: {
        termPeriod: "10-30 years",
        criticalIllnessCover: true
      },
      isGovernmentPolicy: false
    });
    
    this.createPolicy({
      name: "Vehicle Insurance - Comprehensive",
      description: "Full coverage for your vehicle including third-party liability and own damage.",
      category: "vehicle",
      provider: "InsureTech",
      premium: 8000,
      coverage: 500000,
      eligibilityCriteria: {
        vehicleAge: "Less than 15 years"
      },
      benefits: {
        ownDamage: true,
        thirdParty: true,
        zeroDepreciation: true
      },
      isGovernmentPolicy: false
    });
  }
}

export const storage = new MemStorage();
