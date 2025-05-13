import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import StatsOverview from "@/components/dashboard/stats-overview";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import RecentSessions from "@/components/dashboard/recent-sessions";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | FocusFlow</title>
        <meta name="description" content="Track your productivity with FocusFlow's intuitive dashboard. View session statistics, focus analytics, and recent activity." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6 max-w-6xl">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left column */}
                <div className="w-full lg:w-7/12 space-y-6">
                  <StatsOverview />
                  <AnalyticsChart />
                  <RecentSessions />
                </div>
                
                {/* Right column - Will be added when the timer component is complete */}
                <div className="w-full lg:w-5/12">
                  {/* Placeholder for future components that will be added to the dashboard */}
                </div>
              </div>
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </>
  );
}
