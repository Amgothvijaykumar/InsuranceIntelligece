import { CustomerAssessment } from "@shared/schema";
import * as tf from "@tensorflow/tfjs-node";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Use a absolute paths for models folder
const MODEL_DIR = path.join(process.cwd(), "server", "models");
// Load the saved model artifacts
const prominenceModel = path.join(MODEL_DIR, "prominence_model.h5");
const scalerPath = path.join(MODEL_DIR, "scaler.save");
const leIncomePath = path.join(MODEL_DIR, "le_income.save");
const leNumPoliciesPath = path.join(MODEL_DIR, "le_num_policies.save");

// Placeholder function for TensorFlow.js model loading and prediction
// In a real app, this would load the trained model from a file

// Mock encoders and transformers
type EncoderMap = {
  [key: string]: number
};

const incomeEncoder: EncoderMap = {
  "below-2L": 0,
  "2L-5L": 1, 
  "5L-10L": 2,
  "10L-15L": 3,
  "above-15L": 4
};

const policyTypeEncoder: EncoderMap = {
  "individual": 0,
  "family-floater": 1,
  "group": 2,
  "corporate": 3
};

const genderEncoder: EncoderMap = {
  "male": 0,
  "female": 1,
  "other": 2
};

const areaEncoder: EncoderMap = {
  "urban": 0,
  "rural": 1
};

const maritalStatusEncoder: EncoderMap = {
  "single": 0,
  "married": 1,
  "divorced": 2,
  "widowed": 3
};

const qualificationEncoder: EncoderMap = {
  "high-school": 0,
  "graduate": 1,
  "post-graduate": 2,
  "doctorate": 3,
  "other": 4
};

// Function to convert input data to model format
function preprocessInput(data: CustomerAssessment): number[] {
  // Encode categorical variables
  const gender = genderEncoder[data.gender] || 0;
  const area = areaEncoder[data.area] || 0;
  const qualification = qualificationEncoder[data.qualification] || 0;
  const income = incomeEncoder[data.income] || 0;
  const policyType = policyTypeEncoder[data.policyType] || 0;
  const maritalStatus = maritalStatusEncoder[data.maritalStatus] || 0;
  
  // Convert numerical variables
  const vintage = data.vintage || 0;
  const claimAmount = data.claimAmount || 0;
  const policiesCount = data.policiesCount || 0;
  
  // Count selected policies
  const policiesChosen = data.policiesChosen.split(',').length;
  
  // Return as array in the expected order for the model
  return [
    gender, area, qualification, income, vintage, 
    claimAmount, policiesCount, policiesChosen, policyType, maritalStatus
  ];
}

// Load ML model
async function loadModel(): Promise<tf.LayersModel> {
  try {
    // Check if model file exists
    if (fs.existsSync(prominenceModel)) {
      return await tf.loadLayersModel(`file://${prominenceModel}`);
    } else {
      console.warn("Model file not found, using fallback prediction logic");
      throw new Error("Model file not found");
    }
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

// Main prediction function
export async function predictProminence(data: CustomerAssessment): Promise<{ isProminent: boolean, prominenceScore: number }> {
  try {
    // Preprocess the input data
    const input = preprocessInput(data);
    
    let prominenceScore: number;
    let model: tf.LayersModel | null = null;
    
    try {
      // Try to load and use the TensorFlow model
      model = await loadModel();
      // Convert input to tensor
      const inputTensor = tf.tensor2d([input]);
      // Get prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const result = prediction.dataSync()[0] * 100;
      prominenceScore = Math.round(result);
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
    } catch (modelError) {
      console.warn("Using fallback prediction method:", modelError.message);
      
      // Fallback logic when model is not available or fails
      prominenceScore = 0;
      
      // Income contributes up to 40 points
      prominenceScore += incomeEncoder[data.income] * 10;
      
      // Policies count contributes up to 30 points
      prominenceScore += Math.min(data.policiesCount * 5, 30);
      
      // Vintage (years with company) contributes up to 30 points
      prominenceScore += Math.min(data.vintage * 3, 30);
      
      // Claim amount reduces score (inverse relationship)
      const normalizedClaim = data.claimAmount / 50000; // Normalize to a scale
      prominenceScore -= Math.min(normalizedClaim * 10, 20);
      
      // Cap the score at 100
      prominenceScore = Math.max(0, Math.min(prominenceScore, 100));
    } finally {
      // Clean up model if loaded
      if (model) {
        model.dispose();
      }
    }
    
    // Customer is prominent if score is >= 70
    const isProminent = prominenceScore >= 70;
    
    return {
      isProminent,
      prominenceScore: Math.round(prominenceScore)
    };
  } catch (error) {
    console.error("Prediction error:", error);
    // Default to not prominent in case of errors
    return {
      isProminent: false,
      prominenceScore: 0
    };
  }
}
