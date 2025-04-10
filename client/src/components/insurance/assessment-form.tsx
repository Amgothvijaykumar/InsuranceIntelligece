import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerAssessment, customerAssessmentSchema } from "@shared/schema";

interface AssessmentFormProps {
  onSubmit: (data: CustomerAssessment) => void;
  isSubmitting: boolean;
}

// Define the form schema without userId (will be added by the parent component)
const formSchema = customerAssessmentSchema.omit({ userId: true });

type FormValues = z.infer<typeof formSchema>;

export default function AssessmentForm({ onSubmit, isSubmitting }: AssessmentFormProps) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      area: "urban",
      qualification: "",
      income: "",
      vintage: 0,
      claimAmount: 0,
      policiesCount: 0,
      policiesChosen: "",
      policyType: "",
      maritalStatus: "single",
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Combine selected policies into a comma-separated string
    const formData = {
      ...values,
      policiesChosen: selectedPolicies.join(',')
    };
    
    onSubmit(formData as CustomerAssessment);
  };

  const handlePolicyChange = (policyType: string, checked: boolean) => {
    setSelectedPolicies(prevSelected => {
      if (checked) {
        return [...prevSelected, policyType];
      } else {
        return prevSelected.filter(type => type !== policyType);
      }
    });
    
    // Update the form value
    form.setValue('policiesChosen', selectedPolicies.join(','));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-6">
        {/* Gender */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <label htmlFor="gender-male" className="text-sm">Male</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
                    <label htmlFor="gender-female" className="text-sm">Female</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="gender-other" />
                    <label htmlFor="gender-other" className="text-sm">Other</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Area */}
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Area</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urban" id="area-urban" />
                    <label htmlFor="area-urban" className="text-sm">Urban</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rural" id="area-rural" />
                    <label htmlFor="area-rural" className="text-sm">Rural</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Qualification */}
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your qualification" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                  <SelectItem value="post-graduate">Post Graduate</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Income */}
        <FormField
          control={form.control}
          name="income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Income</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your income range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="below-2L">Below 2 Lakhs</SelectItem>
                  <SelectItem value="2L-5L">2 Lakhs - 5 Lakhs</SelectItem>
                  <SelectItem value="5L-10L">5 Lakhs - 10 Lakhs</SelectItem>
                  <SelectItem value="10L-15L">10 Lakhs - 15 Lakhs</SelectItem>
                  <SelectItem value="above-15L">Above 15 Lakhs</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Vintage (Years with the company) */}
        <FormField
          control={form.control}
          name="vintage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years with current/previous insurance provider</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  min="0" 
                  max="50" 
                  placeholder="0" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Claim Amount */}
        <FormField
          control={form.control}
          name="claimAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previous Claim Amount (if any)</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    className="pl-7 pr-12" 
                    min="0" 
                    placeholder="0" 
                  />
                </FormControl>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">INR</span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Policies */}
        <FormField
          control={form.control}
          name="policiesCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Current Policies</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  min="0" 
                  max="20" 
                  placeholder="0" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Policies Chosen */}
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Policies You're Interested In</FormLabel>
          <div className="space-y-2">
            <div className="flex items-start">
              <Checkbox 
                id="policy-health" 
                checked={selectedPolicies.includes('health')}
                onCheckedChange={(checked) => handlePolicyChange('health', checked === true)}
              />
              <label htmlFor="policy-health" className="ml-3 text-sm font-medium text-gray-700">
                Health Insurance
              </label>
            </div>
            <div className="flex items-start">
              <Checkbox 
                id="policy-vehicle" 
                checked={selectedPolicies.includes('vehicle')}
                onCheckedChange={(checked) => handlePolicyChange('vehicle', checked === true)}
              />
              <label htmlFor="policy-vehicle" className="ml-3 text-sm font-medium text-gray-700">
                Vehicle Insurance
              </label>
            </div>
            <div className="flex items-start">
              <Checkbox 
                id="policy-life" 
                checked={selectedPolicies.includes('life')}
                onCheckedChange={(checked) => handlePolicyChange('life', checked === true)}
              />
              <label htmlFor="policy-life" className="ml-3 text-sm font-medium text-gray-700">
                Life Insurance
              </label>
            </div>
            <div className="flex items-start">
              <Checkbox 
                id="policy-property" 
                checked={selectedPolicies.includes('property')}
                onCheckedChange={(checked) => handlePolicyChange('property', checked === true)}
              />
              <label htmlFor="policy-property" className="ml-3 text-sm font-medium text-gray-700">
                Property Insurance
              </label>
            </div>
          </div>
          {form.formState.errors.policiesChosen && (
            <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.policiesChosen.message}</p>
          )}
        </div>

        {/* Policy Type */}
        <FormField
          control={form.control}
          name="policyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Policy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="family-floater">Family Floater</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Marital Status */}
        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Marital Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-wrap space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="marital-single" />
                    <label htmlFor="marital-single" className="text-sm">Single</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="marital-married" />
                    <label htmlFor="marital-married" className="text-sm">Married</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="divorced" id="marital-divorced" />
                    <label htmlFor="marital-divorced" className="text-sm">Divorced</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="widowed" id="marital-widowed" />
                    <label htmlFor="marital-widowed" className="text-sm">Widowed</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-5">
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              className="mr-3"
            >
              Clear Form
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
