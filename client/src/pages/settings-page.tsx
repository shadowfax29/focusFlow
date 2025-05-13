import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Timer, 
  Bell, 
  UserRound,
  Moon,
  Sun
} from "lucide-react";
import TimerSettingsComponent from "@/components/settings/timer-settings";
import NotificationSettingsComponent from "@/components/settings/notification-settings";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <>
      <Helmet>
        <title>Settings | FocusFlow</title>
        <meta name="description" content="Configure your FocusFlow experience. Customize timer intervals, notification preferences, and account settings." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6 max-w-4xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Configure your focus and notification preferences</p>
              </div>
              
              <Tabs defaultValue="timer">
                <TabsList className="mb-6">
                  <TabsTrigger value="timer" className="gap-2">
                    <Timer className="h-4 w-4" />
                    <span>Timer</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    <span>Account</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="timer">
                  <Card>
                    <CardHeader>
                      <CardTitle>Timer Settings</CardTitle>
                      <CardDescription>
                        Configure your Pomodoro timer intervals and behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TimerSettingsComponent />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure when and how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NotificationSettingsComponent />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">User Information</h3>
                        <div className="border p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Username</div>
                            <div>{user?.username}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Theme</h3>
                        <div className="flex gap-2">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                            className="gap-2"
                          >
                            <Sun className="h-4 w-4" />
                            Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                            className="gap-2"
                          >
                            <Moon className="h-4 w-4" />
                            Dark
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Authentication</h3>
                        <Button 
                          variant="destructive" 
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                        >
                          {logoutMutation.isPending ? "Logging out..." : "Logout"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </>
  );
}
