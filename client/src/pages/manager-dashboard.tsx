import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, ChevronDown, Download, LogOut, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/dashboard/stats-card";
import CustomerList from "@/components/dashboard/customer-list";
import { Shield } from "lucide-react";

interface DashboardStats {
  totalCustomers: number;
  prominentCustomers: number;
  conversionRate: number;
  averagePolicyValue: number;
}

interface Customer {
  id: number;
  userId: number;
  gender: string;
  qualification: string;
  income: string;
  isProminent: boolean;
  prominenceScore: number;
  policiesChosen: string;
}

// Sample chart data
const prominentCustomerData = [
  { income: 'Below 2L', health: 120, life: 80 },
  { income: '2L-5L', health: 150, life: 130 },
  { income: '5L-10L', health: 80, life: 110 },
  { income: 'Above 10L', health: 60, life: 80 },
];

const modelPerformanceData = [
  { month: 'Jan', accuracy: 85, precision: 80, recall: 75 },
  { month: 'Feb', accuracy: 87, precision: 83, recall: 78 },
  { month: 'Mar', accuracy: 89, precision: 81, recall: 80 },
  { month: 'Apr', accuracy: 91, precision: 88, recall: 76 },
  { month: 'May', accuracy: 92, precision: 89, recall: 75 },
  { month: 'Jun', accuracy: 93, precision: 90, recall: 78 },
];

export default function ManagerDashboard() {
  const { user, logoutMutation } = useAuth();
  
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/manager/dashboard-stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: customers, isLoading: isCustomersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/manager/prominent-customers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  if (!user || user.userType !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                This dashboard is only accessible to managers.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary pb-32">
        <nav className="bg-primary border-b border-primary-dark">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Shield className="h-8 w-8 text-white" />
                  <span className="ml-2 text-xl font-semibold text-white">InsureTech Manager</span>
                </div>
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  <a href="#" className="border-white text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="#" className="border-transparent text-white opacity-70 hover:border-white hover:opacity-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Customers
                  </a>
                  <a href="#" className="border-transparent text-white opacity-70 hover:border-white hover:opacity-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Reports
                  </a>
                  <a href="#" className="border-transparent text-white opacity-70 hover:border-white hover:opacity-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Settings
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="relative inline-block text-left">
                    <Button variant="outline" className="text-white border-white hover:bg-primary-dark">
                      Export Data
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
                <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                  <Button variant="ghost" size="icon" className="text-white">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <div className="ml-3 relative">
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="text-white flex items-center"
                    >
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary font-medium mr-2">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <LogOut className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <header className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">
              Manager Dashboard
            </h1>
            <p className="mt-2 text-white opacity-80">
              Monitor customer prominence patterns and policy performance.
            </p>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
          {/* Overview Cards */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-5 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Overview</h2>
              <p className="mt-1 text-sm text-gray-500">Quick stats and system performance metrics.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:divide-x sm:divide-gray-200 px-5 py-5">
                <StatsCard
                  title="Total Customers"
                  value={isStatsLoading ? "-" : stats?.totalCustomers.toString() || "0"}
                  trend="+5.7%"
                  trendLabel="vs last month"
                  positive={true}
                />
                <StatsCard
                  title="Prominent Customers"
                  value={isStatsLoading ? "-" : stats?.prominentCustomers.toString() || "0"}
                  trend={isStatsLoading ? "-" : `${stats?.conversionRate.toFixed(1)}%` || "0%"}
                  trendLabel="of total customers"
                  positive={true}
                />
                <StatsCard
                  title="Policy Conversion Rate"
                  value={isStatsLoading ? "-" : `${stats?.conversionRate.toFixed(1)}%` || "0%"}
                  trend="+2.1%"
                  trendLabel="vs last week"
                  positive={true}
                />
                <StatsCard
                  title="Avg. Policy Value"
                  value={isStatsLoading ? "-" : `₹${stats?.averagePolicyValue.toLocaleString() || "0"}`}
                  trend="-1.2%"
                  trendLabel="vs last month"
                  positive={false}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Prominent Customer Analysis */}
            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="px-5 py-6 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Prominent Customer Analysis</h2>
                  <p className="mt-1 text-sm text-gray-500">Distribution of prominent customers by policy type and income bracket</p>
                </div>
                <div>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="12months">Last 12 months</SelectItem>
                      <SelectItem value="alltime">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="px-5 py-5">
                <div className="h-72 bg-gray-50 rounded-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prominentCustomerData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="income" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="health" name="Health Insurance" fill="#1a56db" />
                      <Bar dataKey="life" name="Life Insurance" fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Prominent Customers List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-6 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Recent Prominent Customers</h2>
                <p className="mt-1 text-sm text-gray-500">Latest customers identified as prominent by AI</p>
              </div>
              <div className="border-t border-gray-200">
                {isCustomersLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <CustomerList customers={customers || []} />
                )}
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary-dark">
                      View all customers <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Model Performance */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-5 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">AI Model Performance</h2>
              <p className="mt-1 text-sm text-gray-500">Monitoring the performance of the prominence prediction model</p>
            </div>
            <div className="border-t border-gray-200 px-5 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Accuracy</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-3xl font-semibold text-gray-900">92.7%</p>
                    <p className="ml-2 text-sm text-green-600">+1.2%</p>
                  </div>
                  <div className="mt-1">
                    <Progress value={92.7} className="h-1.5" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Precision</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-3xl font-semibold text-gray-900">89.1%</p>
                    <p className="ml-2 text-sm text-green-600">+0.8%</p>
                  </div>
                  <div className="mt-1">
                    <Progress value={89.1} className="h-1.5" />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Recall</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-3xl font-semibold text-gray-900">86.3%</p>
                    <p className="ml-2 text-sm text-red-600">-0.5%</p>
                  </div>
                  <div className="mt-1">
                    <Progress value={86.3} className="h-1.5" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Model Performance Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={modelPerformanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#1a56db" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="precision" name="Precision" stroke="#14b8a6" />
                      <Line type="monotone" dataKey="recall" name="Recall" stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
