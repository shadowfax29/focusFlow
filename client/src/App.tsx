import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import TimerPage from "@/pages/timer-page";
import BlocklistPage from "@/pages/blocklist-page";
import AnalyticsPage from "@/pages/analytics-page";
import HistoryPage from "@/pages/history-page";
import SettingsPage from "@/pages/settings-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import ActiveSessionIndicator from "@/components/ui/active-session-indicator";
import WebsiteBlocker from "@/components/blocklist/website-blocker";
import { useAuth } from "@/hooks/use-auth";

// Auth route that redirects to dashboard if user is already logged in
function AuthRoute() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    console.log("User already logged in, redirecting from auth page to dashboard");
    return <Redirect to="/" />;
  }

  // Otherwise, show the auth page
  return <AuthPage />;
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/timer" component={TimerPage} />
      <ProtectedRoute path="/blocklist" component={BlocklistPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
      <ActiveSessionIndicator />
    </TooltipProvider>
  );
}

export default App;
