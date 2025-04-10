import { IStorage } from './storage';
import { 
  User, InsertUser, 
  Customer, InsertCustomer, 
  Policy, InsertPolicy, 
  CustomerPolicy, InsertCustomerPolicy 
} from '@shared/schema';
import session from 'express-session';
import pgPromise from 'pg-promise';
import ConnectPgSimple from 'connect-pg-simple';

const PgStore = ConnectPgSimple(session);
const pgp = pgPromise({});

// Use the DATABASE_URL environment variable provided by Replit
const db = pgp(process.env.DATABASE_URL || 'postgresql://localhost:5432/insurancedb');

export class PostgresStorage implements IStorage {
  // Session store
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/insurancedb',
      },
      tableName: 'session',
      createTableIfMissing: true
    });
    
    // Initialize the database
    this.initDatabase().catch(err => console.error('Error initializing database:', err));
  }
  
  private async initDatabase() {
    try {
      // Create tables if they don't exist
      await this.createTables();
      
      // Seed policies if none exist
      const policyCount = await db.oneOrNone('SELECT COUNT(*) FROM policies');
      if (!policyCount || parseInt(policyCount.count) === 0) {
        await this.seedPolicies();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
  
  private async createTables() {
    // Users table
    await db.none(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        user_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Customers table
    await db.none(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        gender VARCHAR(50),
        area VARCHAR(50),
        qualification VARCHAR(50),
        income VARCHAR(50),
        vintage INTEGER,
        claim_amount NUMERIC,
        policies_count INTEGER,
        policies_chosen TEXT,
        policy_type VARCHAR(50),
        marital_status VARCHAR(50),
        is_prominent BOOLEAN DEFAULT FALSE,
        prominence_score INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Policies table
    await db.none(`
      CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        premium NUMERIC,
        coverage NUMERIC,
        eligibility_criteria JSONB,
        benefits JSONB,
        is_government_policy BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Customer policies table
    await db.none(`
      CREATE TABLE IF NOT EXISTS customer_policies (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        policy_id INTEGER NOT NULL REFERENCES policies(id),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Database tables created successfully');
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
      return user ? this.mapUserRow(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
      return user ? this.mapUserRow(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
      return user ? this.mapUserRow(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      const newUser = await db.one(
        'INSERT INTO users(username, password, email, user_type) VALUES($1, $2, $3, $4) RETURNING *',
        [user.username, user.password, user.email, user.userType]
      );
      return this.mapUserRow(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    try {
      const customer = await db.oneOrNone('SELECT * FROM customers WHERE id = $1', [id]);
      return customer ? this.mapCustomerRow(customer) : undefined;
    } catch (error) {
      console.error('Error getting customer:', error);
      return undefined;
    }
  }
  
  async getCustomerByUserId(userId: number): Promise<Customer | undefined> {
    try {
      const customer = await db.oneOrNone('SELECT * FROM customers WHERE user_id = $1', [userId]);
      return customer ? this.mapCustomerRow(customer) : undefined;
    } catch (error) {
      console.error('Error getting customer by user ID:', error);
      return undefined;
    }
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      const newCustomer = await db.one(
        `INSERT INTO customers(
          user_id, gender, area, qualification, income, vintage, 
          claim_amount, policies_count, policies_chosen, policy_type, marital_status
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          customer.userId, 
          customer.gender || null, 
          customer.area || null, 
          customer.qualification || null, 
          customer.income || null, 
          customer.vintage || null, 
          customer.claimAmount || null,
          customer.policiesCount || null,
          customer.policiesChosen || null,
          customer.policyType || null,
          customer.maritalStatus || null
        ]
      );
      return this.mapCustomerRow(newCustomer);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined> {
    try {
      // Build dynamic update query based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (data.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        values.push(data.gender);
      }
      
      if (data.area !== undefined) {
        updateFields.push(`area = $${paramIndex++}`);
        values.push(data.area);
      }
      
      if (data.qualification !== undefined) {
        updateFields.push(`qualification = $${paramIndex++}`);
        values.push(data.qualification);
      }
      
      if (data.income !== undefined) {
        updateFields.push(`income = $${paramIndex++}`);
        values.push(data.income);
      }
      
      if (data.vintage !== undefined) {
        updateFields.push(`vintage = $${paramIndex++}`);
        values.push(data.vintage);
      }
      
      if (data.claimAmount !== undefined) {
        updateFields.push(`claim_amount = $${paramIndex++}`);
        values.push(data.claimAmount);
      }
      
      if (data.policiesCount !== undefined) {
        updateFields.push(`policies_count = $${paramIndex++}`);
        values.push(data.policiesCount);
      }
      
      if (data.policiesChosen !== undefined) {
        updateFields.push(`policies_chosen = $${paramIndex++}`);
        values.push(data.policiesChosen);
      }
      
      if (data.policyType !== undefined) {
        updateFields.push(`policy_type = $${paramIndex++}`);
        values.push(data.policyType);
      }
      
      if (data.maritalStatus !== undefined) {
        updateFields.push(`marital_status = $${paramIndex++}`);
        values.push(data.maritalStatus);
      }
      
      if (data.isProminent !== undefined) {
        updateFields.push(`is_prominent = $${paramIndex++}`);
        values.push(data.isProminent);
      }
      
      if (data.prominenceScore !== undefined) {
        updateFields.push(`prominence_score = $${paramIndex++}`);
        values.push(data.prominenceScore);
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = NOW()`);
      
      if (updateFields.length === 0) {
        return this.getCustomer(id);
      }
      
      // Add id as the last parameter
      values.push(id);
      
      const updatedCustomer = await db.oneOrNone(
        `UPDATE customers SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return updatedCustomer ? this.mapCustomerRow(updatedCustomer) : undefined;
    } catch (error) {
      console.error('Error updating customer:', error);
      return undefined;
    }
  }
  
  async getProminentCustomers(): Promise<Customer[]> {
    try {
      const customers = await db.manyOrNone('SELECT * FROM customers WHERE is_prominent = TRUE');
      return customers.map(customer => this.mapCustomerRow(customer));
    } catch (error) {
      console.error('Error getting prominent customers:', error);
      return [];
    }
  }
  
  // Policy methods
  async getPolicy(id: number): Promise<Policy | undefined> {
    try {
      const policy = await db.oneOrNone('SELECT * FROM policies WHERE id = $1', [id]);
      return policy ? this.mapPolicyRow(policy) : undefined;
    } catch (error) {
      console.error('Error getting policy:', error);
      return undefined;
    }
  }
  
  async getPolicies(): Promise<Policy[]> {
    try {
      const policies = await db.manyOrNone('SELECT * FROM policies');
      return policies.map(policy => this.mapPolicyRow(policy));
    } catch (error) {
      console.error('Error getting policies:', error);
      return [];
    }
  }
  
  async getPoliciesByCategory(category: string): Promise<Policy[]> {
    try {
      const policies = await db.manyOrNone('SELECT * FROM policies WHERE category = $1', [category]);
      return policies.map(policy => this.mapPolicyRow(policy));
    } catch (error) {
      console.error('Error getting policies by category:', error);
      return [];
    }
  }
  
  async getGovernmentPolicies(): Promise<Policy[]> {
    try {
      const policies = await db.manyOrNone('SELECT * FROM policies WHERE is_government_policy = TRUE');
      return policies.map(policy => this.mapPolicyRow(policy));
    } catch (error) {
      console.error('Error getting government policies:', error);
      return [];
    }
  }
  
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    try {
      const newPolicy = await db.one(
        `INSERT INTO policies(
          name, description, category, provider, premium, coverage, 
          eligibility_criteria, benefits, is_government_policy
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          policy.name, 
          policy.description, 
          policy.category, 
          policy.provider, 
          policy.premium || null, 
          policy.coverage || null,
          policy.eligibilityCriteria ? JSON.stringify(policy.eligibilityCriteria) : null,
          policy.benefits ? JSON.stringify(policy.benefits) : null,
          policy.isGovernmentPolicy || false
        ]
      );
      return this.mapPolicyRow(newPolicy);
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }
  
  // Customer Policy methods
  async getCustomerPolicy(id: number): Promise<CustomerPolicy | undefined> {
    try {
      const customerPolicy = await db.oneOrNone('SELECT * FROM customer_policies WHERE id = $1', [id]);
      return customerPolicy ? this.mapCustomerPolicyRow(customerPolicy) : undefined;
    } catch (error) {
      console.error('Error getting customer policy:', error);
      return undefined;
    }
  }
  
  async getCustomerPoliciesByCustomerId(customerId: number): Promise<CustomerPolicy[]> {
    try {
      const customerPolicies = await db.manyOrNone('SELECT * FROM customer_policies WHERE customer_id = $1', [customerId]);
      return customerPolicies.map(cp => this.mapCustomerPolicyRow(cp));
    } catch (error) {
      console.error('Error getting customer policies by customer ID:', error);
      return [];
    }
  }
  
  async createCustomerPolicy(customerPolicy: InsertCustomerPolicy): Promise<CustomerPolicy> {
    try {
      const newCustomerPolicy = await db.one(
        'INSERT INTO customer_policies(customer_id, policy_id, status) VALUES($1, $2, $3) RETURNING *',
        [customerPolicy.customerId, customerPolicy.policyId, customerPolicy.status || 'recommended']
      );
      return this.mapCustomerPolicyRow(newCustomerPolicy);
    } catch (error) {
      console.error('Error creating customer policy:', error);
      throw error;
    }
  }
  
  async updateCustomerPolicy(id: number, data: Partial<CustomerPolicy>): Promise<CustomerPolicy | undefined> {
    try {
      // Build dynamic update query based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (data.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(data.status);
      }
      
      if (updateFields.length === 0) {
        return this.getCustomerPolicy(id);
      }
      
      // Add id as the last parameter
      values.push(id);
      
      const updatedCustomerPolicy = await db.oneOrNone(
        `UPDATE customer_policies SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return updatedCustomerPolicy ? this.mapCustomerPolicyRow(updatedCustomerPolicy) : undefined;
    } catch (error) {
      console.error('Error updating customer policy:', error);
      return undefined;
    }
  }
  
  // Helper methods
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      email: row.email,
      userType: row.user_type,
      createdAt: row.created_at
    };
  }
  
  private mapCustomerRow(row: any): Customer {
    return {
      id: row.id,
      userId: row.user_id,
      gender: row.gender,
      area: row.area,
      qualification: row.qualification,
      income: row.income,
      vintage: row.vintage,
      claimAmount: row.claim_amount,
      policiesCount: row.policies_count,
      policiesChosen: row.policies_chosen,
      policyType: row.policy_type,
      maritalStatus: row.marital_status,
      isProminent: row.is_prominent,
      prominenceScore: row.prominence_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  private mapPolicyRow(row: any): Policy {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      provider: row.provider,
      premium: row.premium,
      coverage: row.coverage,
      eligibilityCriteria: row.eligibility_criteria,
      benefits: row.benefits,
      isGovernmentPolicy: row.is_government_policy,
      createdAt: row.created_at
    };
  }
  
  private mapCustomerPolicyRow(row: any): CustomerPolicy {
    return {
      id: row.id,
      customerId: row.customer_id,
      policyId: row.policy_id,
      status: row.status,
      createdAt: row.created_at
    };
  }
  
  // Seed methods
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
        eligibility_criteria: JSON.stringify({
          ageMin: 18,
          ageMax: 50
        }),
        benefits: JSON.stringify({
          lifeCovers: ["Natural death", "Accidental death"]
        }),
        is_government_policy: true
      },
      {
        name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
        description: "Accident insurance coverage with minimal premium payment.",
        category: "accident",
        provider: "Government of India",
        premium: 12,
        coverage: 200000,
        eligibility_criteria: JSON.stringify({
          ageMin: 18,
          ageMax: 70
        }),
        benefits: JSON.stringify({
          accidentCovers: ["Accidental death", "Permanent disability"]
        }),
        is_government_policy: true
      },
      {
        name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana",
        description: "Health insurance scheme that provides coverage for hospitalization expenses.",
        category: "health",
        provider: "Government of India",
        premium: 0,
        coverage: 500000,
        eligibility_criteria: JSON.stringify({
          incomeCriteria: "Below poverty line families"
        }),
        benefits: JSON.stringify({
          familyCoverage: true,
          hospitalizationCovers: ["Pre and post hospitalization expenses", "Medicine costs"]
        }),
        is_government_policy: true
      },
      
      // Private policies
      {
        name: "Premium Health Insurance",
        description: "Comprehensive health coverage with special benefits for prominent customers.",
        category: "health",
        provider: "InsureTech",
        premium: 15000,
        coverage: 1000000,
        eligibility_criteria: JSON.stringify({
          ageMin: 18,
          ageMax: 70
        }),
        benefits: JSON.stringify({
          cashless: true,
          maternity: true,
          preExistingConditions: "Covered after 3 years"
        }),
        is_government_policy: false
      },
      {
        name: "Premium Life Insurance",
        description: "Tailored life insurance solutions with enhanced benefits and coverage options.",
        category: "life",
        provider: "InsureTech",
        premium: 20000,
        coverage: 2000000,
        eligibility_criteria: JSON.stringify({
          ageMin: 18,
          ageMax: 65
        }),
        benefits: JSON.stringify({
          termPeriod: "10-30 years",
          criticalIllnessCover: true
        }),
        is_government_policy: false
      },
      {
        name: "Vehicle Insurance - Comprehensive",
        description: "Full coverage for your vehicle including third-party liability and own damage.",
        category: "vehicle",
        provider: "InsureTech",
        premium: 8000,
        coverage: 500000,
        eligibility_criteria: JSON.stringify({
          vehicleAge: "Less than 15 years"
        }),
        benefits: JSON.stringify({
          ownDamage: true,
          thirdParty: true,
          zeroDepreciation: true
        }),
        is_government_policy: false
      }
    ];
    
    for (const policy of policies) {
      await db.none(
        `INSERT INTO policies(
          name, description, category, provider, premium, coverage, 
          eligibility_criteria, benefits, is_government_policy
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          policy.name, 
          policy.description, 
          policy.category, 
          policy.provider, 
          policy.premium, 
          policy.coverage,
          policy.eligibility_criteria,
          policy.benefits,
          policy.is_government_policy
        ]
      );
    }
    
    console.log('Policies seeded successfully');
  }
}