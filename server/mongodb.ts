import mongoose from 'mongoose';
import { User, Customer, Policy, CustomerPolicy } from '@shared/schema';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insurancedb';

// Initialize MongoDB connection
export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Define Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gender: { type: String, default: null },
  area: { type: String, default: null },
  qualification: { type: String, default: null },
  income: { type: String, default: null },
  vintage: { type: Number, default: null },
  claimAmount: { type: Number, default: null },
  policiesCount: { type: Number, default: null },
  policiesChosen: { type: String, default: null },
  policyType: { type: String, default: null },
  maritalStatus: { type: String, default: null },
  isProminent: { type: Boolean, default: false },
  prominenceScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  provider: { type: String, required: true },
  premium: { type: Number, default: null },
  coverage: { type: Number, default: null },
  eligibilityCriteria: { type: mongoose.Schema.Types.Mixed, default: {} },
  benefits: { type: mongoose.Schema.Types.Mixed, default: {} },
  isGovernmentPolicy: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const CustomerPolicySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
export const UserModel = mongoose.model<User & mongoose.Document>('User', UserSchema);
export const CustomerModel = mongoose.model<Customer & mongoose.Document>('Customer', CustomerSchema);
export const PolicyModel = mongoose.model<Policy & mongoose.Document>('Policy', PolicySchema);
export const CustomerPolicyModel = mongoose.model<CustomerPolicy & mongoose.Document>('CustomerPolicy', CustomerPolicySchema);