import { IStorage } from './storage';
import { UserModel, CustomerModel, PolicyModel, CustomerPolicyModel } from './mongodb';
import { 
  User, InsertUser, 
  Customer, InsertCustomer, 
  Policy, InsertPolicy, 
  CustomerPolicy, InsertCustomerPolicy 
} from '@shared/schema';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export class MongoDBStorage implements IStorage {
  // Session store
  sessionStore: any;
  
  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/insurancedb',
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60 // 14 days
    });
    
    // Seed policies if none exist
    this.seedPoliciesIfEmpty();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email });
      return user ? this.mapUserToType(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      const newUser = await UserModel.create(user);
      return this.mapUserToType(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      const customer = await CustomerModel.findById(id);
      return customer ? this.mapCustomerToType(customer) : undefined;
    } catch (error) {
      console.error('Error getting customer:', error);
      return undefined;
    }
  }
  
  async getCustomerByUserId(userId: number): Promise<Customer | undefined> {
    try {
      const customer = await CustomerModel.findOne({ userId });
      return customer ? this.mapCustomerToType(customer) : undefined;
    } catch (error) {
      console.error('Error getting customer by user ID:', error);
      return undefined;
    }
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      const newCustomer = await CustomerModel.create({
        ...customer,
        isProminent: false,
        prominenceScore: 0
      });
      return this.mapCustomerToType(newCustomer);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined> {
    try {
      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );
      return updatedCustomer ? this.mapCustomerToType(updatedCustomer) : undefined;
    } catch (error) {
      console.error('Error updating customer:', error);
      return undefined;
    }
  }
  
  async getProminentCustomers(): Promise<Customer[]> {
    try {
      const customers = await CustomerModel.find({ isProminent: true });
      return customers.map(customer => this.mapCustomerToType(customer));
    } catch (error) {
      console.error('Error getting prominent customers:', error);
      return [];
    }
  }
  
  // Policy methods
  async getPolicy(id: number): Promise<Policy | undefined> {
    try {
      const policy = await PolicyModel.findById(id);
      return policy ? this.mapPolicyToType(policy) : undefined;
    } catch (error) {
      console.error('Error getting policy:', error);
      return undefined;
    }
  }
  
  async getPolicies(): Promise<Policy[]> {
    try {
      const policies = await PolicyModel.find();
      return policies.map(policy => this.mapPolicyToType(policy));
    } catch (error) {
      console.error('Error getting policies:', error);
      return [];
    }
  }
  
  async getPoliciesByCategory(category: string): Promise<Policy[]> {
    try {
      const policies = await PolicyModel.find({ category });
      return policies.map(policy => this.mapPolicyToType(policy));
    } catch (error) {
      console.error('Error getting policies by category:', error);
      return [];
    }
  }
  
  async getGovernmentPolicies(): Promise<Policy[]> {
    try {
      const policies = await PolicyModel.find({ isGovernmentPolicy: true });
      return policies.map(policy => this.mapPolicyToType(policy));
    } catch (error) {
      console.error('Error getting government policies:', error);
      return [];
    }
  }
  
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    try {
      const newPolicy = await PolicyModel.create(policy);
      return this.mapPolicyToType(newPolicy);
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }
  
  // Customer Policy methods
  async getCustomerPolicy(id: number): Promise<CustomerPolicy | undefined> {
    try {
      const customerPolicy = await CustomerPolicyModel.findById(id);
      return customerPolicy ? this.mapCustomerPolicyToType(customerPolicy) : undefined;
    } catch (error) {
      console.error('Error getting customer policy:', error);
      return undefined;
    }
  }
  
  async getCustomerPoliciesByCustomerId(customerId: number): Promise<CustomerPolicy[]> {
    try {
      const customerPolicies = await CustomerPolicyModel.find({ customerId });
      return customerPolicies.map(cp => this.mapCustomerPolicyToType(cp));
    } catch (error) {
      console.error('Error getting customer policies by customer ID:', error);
      return [];
    }
  }
  
  async createCustomerPolicy(customerPolicy: InsertCustomerPolicy): Promise<CustomerPolicy> {
    try {
      const newCustomerPolicy = await CustomerPolicyModel.create(customerPolicy);
      return this.mapCustomerPolicyToType(newCustomerPolicy);
    } catch (error) {
      console.error('Error creating customer policy:', error);
      throw error;
    }
  }
  
  async updateCustomerPolicy(id: number, data: Partial<CustomerPolicy>): Promise<CustomerPolicy | undefined> {
    try {
      const updatedCustomerPolicy = await CustomerPolicyModel.findByIdAndUpdate(id, data, { new: true });
      return updatedCustomerPolicy ? this.mapCustomerPolicyToType(updatedCustomerPolicy) : undefined;
    } catch (error) {
      console.error('Error updating customer policy:', error);
      return undefined;
    }
  }
  
  // Helper methods
  private mapUserToType(user: any): User {
    return {
      id: user._id,
      username: user.username,
      password: user.password,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt
    };
  }
  
  private mapCustomerToType(customer: any): Customer {
    return {
      id: customer._id,
      userId: customer.userId,
      gender: customer.gender,
      area: customer.area,
      qualification: customer.qualification,
      income: customer.income,
      vintage: customer.vintage,
      claimAmount: customer.claimAmount,
      policiesCount: customer.policiesCount,
      policiesChosen: customer.policiesChosen,
      policyType: customer.policyType,
      maritalStatus: customer.maritalStatus,
      isProminent: customer.isProminent,
      prominenceScore: customer.prominenceScore,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  }
  
  private mapPolicyToType(policy: any): Policy {
    return {
      id: policy._id,
      name: policy.name,
      description: policy.description,
      category: policy.category,
      provider: policy.provider,
      premium: policy.premium,
      coverage: policy.coverage,
      eligibilityCriteria: policy.eligibilityCriteria,
      benefits: policy.benefits,
      isGovernmentPolicy: policy.isGovernmentPolicy,
      createdAt: policy.createdAt
    };
  }
  
  private mapCustomerPolicyToType(customerPolicy: any): CustomerPolicy {
    return {
      id: customerPolicy._id,
      customerId: customerPolicy.customerId,
      policyId: customerPolicy.policyId,
      status: customerPolicy.status,
      createdAt: customerPolicy.createdAt
    };
  }
  
  // Seed methods
  private async seedPoliciesIfEmpty() {
    try {
      const count = await PolicyModel.countDocuments();
      if (count === 0) {
        await this.seedPolicies();
      }
    } catch (error) {
      console.error('Error seeding policies:', error);
    }
  }
  
  private async seedPolicies() {
    const policies = [
      // Government health policies
      {
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
      },
      {
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
      },
      {
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
      },
      
      // Private policies
      {
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
      },
      {
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
      },
      {
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
      }
    ];
    
    await PolicyModel.insertMany(policies);
    console.log('Policies seeded successfully');
  }
}