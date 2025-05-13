import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/timer" component={TimerPage} />
      <ProtectedRoute path="/blocklist" component={BlocklistPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
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
      <WebsiteBlocker />
    </TooltipProvider>
  );
}

export default App;
