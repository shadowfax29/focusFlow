import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Timer, ShieldAlert, BarChartBig, CheckCircle } from "lucide-react";

// Form schema with validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submissions
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    // Remove confirmPassword as it's not in the API schema
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Redirect if already logged in
  if (user) {
    console.log("User authenticated, redirecting to dashboard", user);
    return <Redirect to="/" />;
  } else {
    console.log("User not authenticated yet");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Auth forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">FocusFlow</h2>
            </div>
            <CardTitle className="text-2xl">Welcome to FocusFlow</CardTitle>
            <CardDescription>
              Sign in to access your productivity dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
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
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
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
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
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
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-4">
            <div className="text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <span>Don't have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>Register</Button></span>
              ) : (
                <span>Already have an account? <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>Login</Button></span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="w-full md:w-1/2 bg-primary text-primary-foreground p-8 flex items-center justify-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold">Boost Your Productivity</h1>
          <p className="text-xl">
            FocusFlow helps you stay focused with Pomodoro timers and website blocking.
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground p-2 rounded-full text-primary">
                <Timer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Pomodoro Timer</h3>
                <p className="text-primary-foreground/80">
                  Customize your work and break intervals for optimal focus.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground p-2 rounded-full text-primary">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Website Blocking</h3>
                <p className="text-primary-foreground/80">
                  Block distracting websites during focus sessions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground p-2 rounded-full text-primary">
                <BarChartBig className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Detailed Analytics</h3>
                <p className="text-primary-foreground/80">
                  Track your productivity with insightful charts and statistics.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary-foreground p-2 rounded-full text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Session Tracking</h3>
                <p className="text-primary-foreground/80">
                  Log your work sessions and review your progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
