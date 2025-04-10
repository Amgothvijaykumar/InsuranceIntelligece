import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AssessmentForm from "@/components/insurance/assessment-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CustomerAssessment } from "@shared/schema";

export default function AssessmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const assessmentMutation = useMutation({
    mutationFn: async (formData: CustomerAssessment) => {
      const res = await apiRequest("POST", "/api/assessment", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      // Store the prediction result in the query cache
      queryClient.setQueryData(["assessmentResult"], data);
      
      // Navigate to result page
      navigate("/prediction");
      
      toast({
        title: "Assessment completed",
        description: "Your personal assessment has been processed successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (formData: CustomerAssessment) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your assessment",
        variant: "destructive"
      });
      return;
    }
    
    const assessment = {
      ...formData,
      userId: user.id
    };
    
    assessmentMutation.mutate(assessment);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-primary bg-opacity-10">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Customer Assessment
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Answer these questions to help us find the best insurance policies for you.
            </p>
          </div>
          
          <AssessmentForm 
            onSubmit={handleSubmit} 
            isSubmitting={assessmentMutation.isPending}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
