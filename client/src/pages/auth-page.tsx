import { useState } from "react";
import { Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().default(false),
  userType: z.enum(["customer", "manager"]),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["customer", "manager"]),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    if (user.userType === "manager") {
      navigate("/manager");
    } else {
      navigate("/");
    }
    return null;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
      userType: "customer",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      userType: "customer",
    },
  });

  const onLogin = (data: LoginValues) => {
    loginMutation.mutate(
      {
        username: data.username,
        password: data.password,
      },
      {
        onSuccess: (user) => {
          if (user.userType === "manager") {
            navigate("/manager");
          } else {
            navigate("/");
          }
        },
      }
    );
  };

  const onRegister = (data: RegisterValues) => {
    registerMutation.mutate(
      {
        username: data.username,
        email: data.email,
        password: data.password,
        userType: data.userType,
      },
      {
        onSuccess: (user) => {
          if (user.userType === "manager") {
            navigate("/manager");
          } else {
            navigate("/");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left column - Auth Forms */}
      <div className="bg-white flex flex-col justify-center p-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            InsureTech
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            AI-powered insurance solutions for your needs
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Sign in as</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="customer" id="customer" />
                                  <label htmlFor="customer">Customer</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="manager" id="manager" />
                                  <label htmlFor="manager">Manager</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Register as</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="customer" id="r-customer" />
                                  <label htmlFor="r-customer">Customer</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="manager" id="r-manager" />
                                  <label htmlFor="r-manager">Manager</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-primary hover:text-primary-dark">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden md:block bg-primary-dark">
        <div className="h-full flex flex-col justify-center p-8 text-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">Smart Insurance with AI-Powered Insights</h2>
            <p className="text-lg text-white/80 mb-8">
              Join our platform to discover personalized insurance recommendations tailored to your unique profile. Our deep learning models analyze your data to find the perfect government schemes and private policies for you.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="h-6 w-6 mr-3 mt-0.5 text-primary-light" />
                <p>Advanced AI predictions that identify prominent customers and their ideal coverage needs</p>
              </div>
              <div className="flex items-start">
                <Shield className="h-6 w-6 mr-3 mt-0.5 text-primary-light" />
                <p>Access to exclusive government schemes that you might not know you're eligible for</p>
              </div>
              <div className="flex items-start">
                <Shield className="h-6 w-6 mr-3 mt-0.5 text-primary-light" />
                <p>Special insurance rates and benefits for customers identified as prominent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
