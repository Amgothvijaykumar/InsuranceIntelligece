import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Policy } from "@shared/schema";
import { ArrowLeft, CheckCircle, InfoIcon, Lightbulb, AlertTriangle } from "lucide-react";

interface PredictionResult {
  customer: {
    id: number;
    isProminent: boolean;
    prominenceScore: number;
  };
  isProminent: boolean;
  prominenceScore: number;
  governmentPolicies: Policy[];
  privatePolicies: Policy[];
  recommendationReasons?: Record<string, string>;
  additionalCoverageSuggestions?: string[];
}

export default function PredictionResultPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data, isLoading, error } = useQuery<PredictionResult>({
    queryKey: ["assessmentResult"],
    // No queryFn needed as the data is already in the query cache
    // If the data isn't available, redirect to assessment page
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !data) {
    // If no data is available, redirect to assessment page
    navigate("/assessment");
    return null;
  }
  
  const { 
    isProminent, 
    prominenceScore, 
    governmentPolicies, 
    privatePolicies,
    recommendationReasons = {},
    additionalCoverageSuggestions = []
  } = data;
  
  const handleBackToForm = () => {
    navigate("/assessment");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-primary bg-opacity-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Assessment Results
              </h3>
              <div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {isProminent ? "Prominent Customer" : "Standard Customer"}
                </Badge>
              </div>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Based on your profile, we've identified personalized recommendations.
            </p>
          </div>

          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Customer Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  <span className={`font-medium ${isProminent ? 'text-green-600' : 'text-gray-600'}`}>
                    {isProminent ? 'Prominent Customer' : 'Standard Customer'}
                  </span>
                  {isProminent && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Eligible for Premium Benefits
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Assessment Confidence
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <Progress value={prominenceScore} className="h-2.5" />
                  <span className="text-xs text-gray-500 mt-1 block">{prominenceScore}% Confidence Score</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-lg font-medium text-gray-900">Recommended Government Policies</h4>
            <p className="text-sm text-gray-500 mb-4">
              Based on your profile {isProminent ? 'and prominence status' : ''}, 
              {governmentPolicies.length > 0 
                ? ' you are eligible for these special government schemes:' 
                : ' we did not find any government schemes matching your criteria.'}
            </p>
            
            {governmentPolicies.length > 0 ? (
              <div className="space-y-4">
                {governmentPolicies.map((policy) => (
                  <div key={policy.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-md font-medium text-gray-900">{policy.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Highly Suitable
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {policy.premium !== undefined && (
                        <span className="inline-flex items-center text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-100">
                          Premium: ₹{policy.premium}/year
                        </span>
                      )}
                      {policy.coverage !== undefined && (
                        <span className="inline-flex items-center text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-100">
                          Coverage: ₹{policy.coverage.toLocaleString()}
                        </span>
                      )}
                      {policy.eligibilityCriteria && Object.entries(policy.eligibilityCriteria).map(([key, value], i) => (
                        <span key={i} className="inline-flex items-center text-xs text-gray-600 px-2 py-0.5 rounded bg-gray-100">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex">
                      <Button variant="link" className="text-sm text-primary hover:text-primary-dark font-medium px-0">
                        View Details
                      </Button>
                      <Button variant="link" className="ml-4 text-sm text-primary hover:text-primary-dark font-medium px-0">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center text-gray-400 p-4">
                    <InfoIcon className="h-5 w-5 mr-2" />
                    <p>No government policies found matching your criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900">Private Insurance Recommendations</h4>
              <p className="text-sm text-gray-500 mb-4">
                Based on your profile, we also recommend these private insurance options:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {privatePolicies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h5 className="text-md font-medium text-gray-900">{policy.name}</h5>
                    {isProminent && (
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium bg-primary bg-opacity-10 text-primary px-2 py-0.5 rounded">
                          Prominent Customer Discount
                        </span>
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-600">{policy.description}</p>
                    <Button variant="link" className="mt-3 text-sm text-primary hover:text-primary-dark font-medium p-0">
                      View Options
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized Recommendation Reasons */}
            {Object.keys(recommendationReasons).length > 0 && (
              <div className="mt-8 border border-primary-200 rounded-lg p-5 bg-primary-50">
                <div className="flex items-center mb-3">
                  <Lightbulb className="h-5 w-5 text-primary mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Why We Recommend These Policies</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(recommendationReasons).map(([category, reason], index) => (
                    <div key={index} className="bg-white p-3 rounded-md border border-gray-100">
                      <h5 className="text-sm font-medium text-gray-800 capitalize">{category} Insurance</h5>
                      <p className="text-sm text-gray-600 mt-1">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional Coverage Suggestions */}
            {additionalCoverageSuggestions.length > 0 && (
              <div className="mt-6 border border-amber-200 rounded-lg p-5 bg-amber-50">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Consider Additional Coverage</h4>
                </div>
                <ul className="space-y-2">
                  {additionalCoverageSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={handleBackToForm}
                className="inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
              <Button className="inline-flex items-center">
                Save Recommendations
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
