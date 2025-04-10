import { CustomerAssessment, Policy } from "@shared/schema";

// Define customer profile types based on customer characteristics
type CustomerProfile = 
  | "HighIncome" 
  | "LowIncome" 
  | "Senior" 
  | "Student" 
  | "Family" 
  | "RuralResident" 
  | "UrbanResident" 
  | "HealthConscious" 
  | "FrequentClaimant"
  | "NewCustomer"
  | "LoyalCustomer";

// Define policy matching scores by profile type
interface PolicyScore {
  category: string;
  isGovernmentRecommended: boolean;
  priorityScore: number;
}

/**
 * Analyzes a customer's profile and returns an array of customer profile types.
 * This function uses a rule-based system to determine which profiles a customer fits into.
 */
function analyzeCustomerProfile(data: CustomerAssessment): CustomerProfile[] {
  const profiles: CustomerProfile[] = [];

  // Income based profiles
  if (data.income === "above-15L" || data.income === "10L-15L") {
    profiles.push("HighIncome");
  } else if (data.income === "below-2L") {
    profiles.push("LowIncome");
  }

  // Age/life stage profiles - inferred from other data
  if (data.qualification === "high-school" && data.vintage < 2) {
    profiles.push("Student");
  }

  // Family status
  if (data.maritalStatus === "married") {
    profiles.push("Family");
  }

  // Location based
  if (data.area === "rural") {
    profiles.push("RuralResident");
  } else if (data.area === "urban") {
    profiles.push("UrbanResident");
  }

  // Health profiles - inferred from policy choices
  if (data.policiesChosen.includes("health")) {
    profiles.push("HealthConscious");
  }

  // Claims history
  if (data.claimAmount > 50000) {
    profiles.push("FrequentClaimant");
  }

  // Customer loyalty
  if (data.vintage < 1) {
    profiles.push("NewCustomer");
  } else if (data.vintage >= 5) {
    profiles.push("LoyalCustomer");
  }

  return profiles;
}

/**
 * Gets policy scores for each customer profile type.
 * Higher scores indicate better matches.
 */
function getPolicyScoresByProfile(profile: CustomerProfile): PolicyScore[] {
  switch (profile) {
    case "HighIncome":
      return [
        { category: "life", isGovernmentRecommended: false, priorityScore: 9 },
        { category: "health", isGovernmentRecommended: false, priorityScore: 8 },
        { category: "investment", isGovernmentRecommended: false, priorityScore: 9 },
        { category: "vehicle", isGovernmentRecommended: false, priorityScore: 7 }
      ];
    case "LowIncome":
      return [
        { category: "life", isGovernmentRecommended: true, priorityScore: 9 },
        { category: "health", isGovernmentRecommended: true, priorityScore: 10 },
        { category: "accident", isGovernmentRecommended: true, priorityScore: 8 }
      ];
    case "Senior":
      return [
        { category: "health", isGovernmentRecommended: true, priorityScore: 10 },
        { category: "life", isGovernmentRecommended: true, priorityScore: 7 }
      ];
    case "Student":
      return [
        { category: "accident", isGovernmentRecommended: true, priorityScore: 8 },
        { category: "health", isGovernmentRecommended: true, priorityScore: 7 }
      ];
    case "Family":
      return [
        { category: "health", isGovernmentRecommended: true, priorityScore: 10 },
        { category: "life", isGovernmentRecommended: true, priorityScore: 9 },
        { category: "home", isGovernmentRecommended: false, priorityScore: 7 }
      ];
    case "RuralResident":
      return [
        { category: "crop", isGovernmentRecommended: true, priorityScore: 9 },
        { category: "health", isGovernmentRecommended: true, priorityScore: 10 }
      ];
    case "UrbanResident":
      return [
        { category: "vehicle", isGovernmentRecommended: false, priorityScore: 8 },
        { category: "home", isGovernmentRecommended: false, priorityScore: 7 }
      ];
    case "HealthConscious":
      return [
        { category: "health", isGovernmentRecommended: false, priorityScore: 10 },
        { category: "accident", isGovernmentRecommended: false, priorityScore: 8 }
      ];
    case "FrequentClaimant":
      return [
        { category: "health", isGovernmentRecommended: true, priorityScore: 9 },
        { category: "accident", isGovernmentRecommended: true, priorityScore: 8 }
      ];
    case "NewCustomer":
      return [
        { category: "health", isGovernmentRecommended: true, priorityScore: 8 },
        { category: "accident", isGovernmentRecommended: true, priorityScore: 7 }
      ];
    case "LoyalCustomer":
      return [
        { category: "life", isGovernmentRecommended: false, priorityScore: 9 },
        { category: "health", isGovernmentRecommended: false, priorityScore: 9 },
        { category: "vehicle", isGovernmentRecommended: false, priorityScore: 8 }
      ];
    default:
      return [];
  }
}

/**
 * Adjusts policy scores based on the customer's prominence status
 */
function adjustScoresForProminence(
  scores: Map<string, { score: number, isGovtRecommended: boolean }>,
  prominenceScore: number
): Map<string, { score: number, isGovtRecommended: boolean }> {
  // Clone the map to avoid modifying the original
  const adjustedScores = new Map(scores);
  
  // For prominent customers, boost premium private policies
  if (prominenceScore >= 70) {
    // Boost private policies for high-prominence customers
    for (const [category, data] of adjustedScores.entries()) {
      if (!data.isGovtRecommended) {
        // Boost private policy scores for prominent customers
        adjustedScores.set(category, { 
          score: data.score * 1.25,  // 25% boost for private policies
          isGovtRecommended: false 
        });
      } else {
        // Slightly reduce government policy scores for prominent customers
        adjustedScores.set(category, { 
          score: data.score * 0.9,  // 10% reduction
          isGovtRecommended: true 
        });
      }
    }
  } else {
    // For non-prominent customers, boost government schemes
    for (const [category, data] of adjustedScores.entries()) {
      if (data.isGovtRecommended) {
        // Boost government policy scores
        adjustedScores.set(category, { 
          score: data.score * 1.25,  // 25% boost
          isGovtRecommended: true 
        });
      }
    }
  }
  
  return adjustedScores;
}

/**
 * Main recommendation function that analyzes customer data and returns optimized policy recommendations
 */
export function generatePolicyRecommendations(
  data: CustomerAssessment,
  prominenceScore: number,
  availablePolicies: Policy[]
): { recommendedGovernmentPolicies: Policy[], recommendedPrivatePolicies: Policy[] } {
  // Step 1: Identify customer profiles
  const customerProfiles = analyzeCustomerProfile(data);
  
  // Step 2: Compute category scores based on profiles
  const categoryScores = new Map<string, { score: number, isGovtRecommended: boolean }>();
  
  // Sum up scores across all profiles
  for (const profile of customerProfiles) {
    const profileScores = getPolicyScoresByProfile(profile);
    
    for (const { category, isGovernmentRecommended, priorityScore } of profileScores) {
      const currentScore = categoryScores.get(category);
      
      if (currentScore) {
        // If we already have a score for this category, add to it
        categoryScores.set(category, {
          score: currentScore.score + priorityScore,
          // If any profile recommends government, we'll keep that recommendation
          isGovtRecommended: currentScore.isGovtRecommended || isGovernmentRecommended
        });
      } else {
        // First time seeing this category
        categoryScores.set(category, {
          score: priorityScore,
          isGovtRecommended: isGovernmentRecommended
        });
      }
    }
  }
  
  // Step 3: Adjust scores based on prominence
  const adjustedScores = adjustScoresForProminence(categoryScores, prominenceScore);
  
  // Step 4: Sort available policies by adjusted scores
  const scoredPolicies = availablePolicies.map(policy => {
    const categoryData = adjustedScores.get(policy.category);
    const score = categoryData?.score || 0;
    const isGovtRecommended = categoryData?.isGovtRecommended || false;
    
    return {
      policy,
      score,
      isGovtRecommended
    };
  });
  
  // Sort by score (descending)
  scoredPolicies.sort((a, b) => b.score - a.score);
  
  // Step 5: Separate government and private policies
  const recommendedGovernmentPolicies: Policy[] = [];
  const recommendedPrivatePolicies: Policy[] = [];
  
  for (const { policy, isGovtRecommended } of scoredPolicies) {
    if (policy.isGovernmentPolicy && (isGovtRecommended || prominenceScore < 70)) {
      recommendedGovernmentPolicies.push(policy);
    } else if (!policy.isGovernmentPolicy) {
      recommendedPrivatePolicies.push(policy);
    }
  }
  
  return {
    recommendedGovernmentPolicies,
    recommendedPrivatePolicies
  };
}

/**
 * Analyzes the customer's needs and returns personalized descriptions for why specific 
 * policy categories are recommended
 */
export function generatePersonalizedRecommendationReasons(
  data: CustomerAssessment,
  prominenceScore: number
): Map<string, string> {
  const reasons = new Map<string, string>();
  const profiles = analyzeCustomerProfile(data);
  
  // Health insurance reasons
  if (profiles.includes("Family")) {
    reasons.set("health", "Health insurance is essential for protecting your entire family from unexpected medical expenses.");
  } else if (profiles.includes("HealthConscious")) {
    reasons.set("health", "Based on your health-conscious choices, we recommend comprehensive health coverage to maintain your wellbeing.");
  } else if (profiles.includes("FrequentClaimant")) {
    reasons.set("health", "Your history suggests you would benefit from a robust health insurance policy with wide coverage.");
  } else {
    reasons.set("health", "Health insurance provides financial protection against unexpected medical costs.");
  }
  
  // Life insurance reasons
  if (profiles.includes("Family")) {
    reasons.set("life", "Life insurance provides financial security for your family's future in case of unexpected events.");
  } else if (profiles.includes("HighIncome")) {
    reasons.set("life", "Protect your wealth and ensure your legacy with a comprehensive life insurance policy.");
  } else {
    reasons.set("life", "Life insurance offers peace of mind and financial protection for your loved ones.");
  }
  
  // Vehicle insurance reasons
  if (profiles.includes("UrbanResident")) {
    reasons.set("vehicle", "Living in an urban area means higher traffic and accident risks - comprehensive vehicle insurance is recommended.");
  } else {
    reasons.set("vehicle", "Vehicle insurance protects against damages and liability while driving.");
  }
  
  // Accident insurance reasons
  if (profiles.includes("Student") || profiles.includes("NewCustomer")) {
    reasons.set("accident", "Accident insurance provides affordable protection against unexpected injuries and related expenses.");
  } else {
    reasons.set("accident", "Accident insurance covers medical costs and provides income protection if you're injured.");
  }
  
  return reasons;
}

/**
 * Generates recommendations for additional coverage based on the customer's profile 
 * and existing policies
 */
export function suggestAdditionalCoverage(
  data: CustomerAssessment, 
  prominenceScore: number
): string[] {
  const suggestions: string[] = [];
  const profiles = analyzeCustomerProfile(data);
  const existingPolicies = data.policiesChosen.split(',');
  
  // Suggest health insurance if not already selected
  if (!existingPolicies.includes("health")) {
    suggestions.push("Consider adding health insurance to your portfolio for comprehensive medical coverage.");
  }
  
  // Family-specific suggestions
  if (profiles.includes("Family") && !existingPolicies.includes("life")) {
    suggestions.push("As someone with a family, life insurance is crucial for protecting your loved ones financially.");
  }
  
  // High income suggestions
  if (profiles.includes("HighIncome") && !existingPolicies.includes("investment")) {
    suggestions.push("With your income level, an investment-linked insurance policy could help grow your wealth while providing protection.");
  }
  
  // Rural resident suggestions
  if (profiles.includes("RuralResident") && !existingPolicies.includes("crop")) {
    suggestions.push("Living in a rural area, you might benefit from agricultural or crop insurance coverage.");
  }
  
  // Urban resident suggestions
  if (profiles.includes("UrbanResident") && !existingPolicies.includes("home")) {
    suggestions.push("For urban residents, home insurance provides protection against theft, damage, and liability.");
  }
  
  return suggestions;
}