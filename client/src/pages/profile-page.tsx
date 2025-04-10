import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Save, User, FileClock, AlertTriangle, FileCheck, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Customer Name",
    email: user?.email || "",
    phone: "9876543210",
  });

  // Fetch customer data
  const { data: customer, isLoading: isCustomerLoading } = useQuery<any>({
    queryKey: ["/api/customer"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Fetch customer policies
  const { data: policies, isLoading: isPoliciesLoading } = useQuery<any[]>({
    queryKey: ["/api/customer/policies"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
    initialData: [],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customer"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-5xl w-full mx-auto py-10 px-4 sm:px-6 flex-grow">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={null} alt={user.username} />
                <AvatarFallback className="bg-primary text-white text-xl">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{profileData.name}</CardTitle>
              <CardDescription className="text-center">
                Customer ID: {user.id}
                <div className="mt-1">
                  <Badge variant="outline">
                    {user.userType === "manager" ? "Manager" : "Customer"}
                  </Badge>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-sm text-gray-900">{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Phone</span>
                    <span className="text-sm text-gray-900">{profileData.phone}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {isEditing ? (
                <div className="flex justify-end space-x-2 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Tabs Section */}
          <div className="md:col-span-2">
            <Tabs defaultValue="policies">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="policies">My Policies</TabsTrigger>
                <TabsTrigger value="assessments">Assessment History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="policies" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileCheck className="mr-2 h-5 w-5 text-primary" />
                      Current Policies
                    </CardTitle>
                    <CardDescription>
                      Track your insurance policies and their status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPoliciesLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : !policies || policies.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center space-y-3">
                        <div className="flex justify-center">
                          <AlertTriangle className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-medium">No policies found</h3>
                        <p className="text-sm text-gray-500">
                          You don't have any active policies yet. Complete an assessment to get recommendations.
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => navigate("/assessment")}
                        >
                          Take Assessment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {policies.map((policy, index) => (
                          <div 
                            key={index} 
                            className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{policy.policy?.name}</h4>
                                <Badge 
                                  variant={policy.status === "active" ? "default" : "outline"}
                                  className={policy.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                >
                                  {policy.status === "active" ? "Active" : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{policy.policy?.description}</p>
                              <div className="flex items-center space-x-4 text-xs pt-2">
                                <span className="text-gray-500">
                                  Policy #: {policy.id}
                                </span>
                                <span className="text-gray-500">
                                  Premium: ₹{policy.policy?.premium || 0}/year
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <FileCheck className="mr-2 h-5 w-5 text-primary" />
                      Recommended Policies
                    </CardTitle>
                    <CardDescription>
                      Policies recommended based on your profile and assessment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center space-y-3">
                      <div className="flex justify-center">
                        <FileClock className="h-10 w-10 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-medium">Take an assessment</h3>
                      <p className="text-sm text-gray-500">
                        Complete an assessment to get personalized insurance recommendations.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate("/assessment")}
                      >
                        Take Assessment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="assessments" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Assessment History
                    </CardTitle>
                    <CardDescription>
                      View your past assessments and results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isCustomerLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : !customer ? (
                      <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center space-y-3">
                        <div className="flex justify-center">
                          <AlertTriangle className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-medium">No assessments taken</h3>
                        <p className="text-sm text-gray-500">
                          You haven't taken any assessments yet. Complete an assessment to get started.
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => navigate("/assessment")}
                        >
                          Take Assessment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full ${customer.isProminent ? 'bg-green-600' : 'bg-gray-600'} flex items-center justify-center text-white font-medium`}>
                                {customer.isProminent ? 'P' : 'S'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                Latest Assessment
                              </p>
                              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className="mr-1">Customer Type:</span>
                                  <Badge className={customer.isProminent ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {customer.isProminent ? "Prominent" : "Standard"}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className="mr-1">Score:</span>
                                  <span className="font-medium">{customer.prominenceScore}%</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate("/assessment")}
                            >
                              Retake
                            </Button>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500">Gender</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.gender || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Qualification</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.qualification || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Income Range</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.income || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Area</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.area || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Marital Status</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.maritalStatus || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">Family Size</span>
                              <p className="mt-1 text-sm text-gray-900">{customer.familySize || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}