import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Session } from "@shared/schema";
import { format, subDays, subMonths, getDay, getWeek, startOfWeek, addDays, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck, XOctagon, Timer, CalendarDays } from "lucide-react";
import { Helmet } from "react-helmet";

// Type for metrics cards
type MetricCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
};

// Metrics card component
function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Fetch session data
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Placeholder metrics until we have real data
  const metrics = [
    {
      title: "Total Sessions",
      value: sessions?.length || 0,
      change: 12,
      icon: <Timer className="h-5 w-5 text-white" />,
      color: "bg-primary text-primary-foreground"
    },
    {
      title: "Focus Time (hrs)",
      value: sessions ? Math.round((sessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0) / 3600) * 10) / 10 : 0,
      change: 8,
      icon: <CalendarDays className="h-5 w-5 text-white" />,
      color: "bg-primary text-primary-foreground"
    },
    {
      title: "Completed Sessions",
      value: sessions?.filter(s => s.isCompleted).length || 0,
      change: 24,
      icon: <BadgeCheck className="h-5 w-5 text-white" />,
      color: "bg-emerald-500 text-white"
    },
    {
      title: "Aborted Sessions",
      value: sessions?.filter(s => !s.isCompleted).length || 0,
      change: -5,
      icon: <XOctagon className="h-5 w-5 text-white" />,
      color: "bg-destructive text-destructive-foreground"
    }
  ];

  // Process data for weekly chart
  const getWeeklyData = () => {
    if (!sessions) return [];
    
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
    
    return dayNames.map((day, index) => {
      const currentDate = addDays(startOfWeekDate, index);
      const nextDate = addDays(currentDate, 1);
      
      const daySessions = sessions.filter(session => {
        const sessionDate = parseISO(session.startTime as unknown as string);
        return sessionDate >= currentDate && sessionDate < nextDate;
      });
      
      const focusTimeHours = daySessions.reduce((acc, session) => 
        acc + ((session.actualDuration || 0) / 3600), 0);
      
      return {
        name: day,
        sessions: daySessions.length,
        focusHours: Math.round(focusTimeHours * 10) / 10,
        completed: daySessions.filter(s => s.isCompleted).length,
        aborted: daySessions.filter(s => !s.isCompleted).length
      };
    });
  };

  // Process data for completion pie chart
  const getCompletionData = () => {
    if (!sessions) return [];
    
    const completed = sessions.filter(s => s.isCompleted).length;
    const aborted = sessions.filter(s => !s.isCompleted).length;
    
    return [
      { name: "Completed", value: completed },
      { name: "Aborted", value: aborted }
    ];
  };

  // Get chart data based on selected time range
  const getChartData = () => {
    switch (timeRange) {
      case 'week':
        return getWeeklyData();
      case 'month':
      case 'year':
        // For demo purposes, we'll use weekly data
        return getWeeklyData();
      default:
        return [];
    }
  };

  const chartData = getChartData();
  const completionData = getCompletionData();
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <>
      <Helmet>
        <title>Analytics | FocusFlow</title>
        <meta name="description" content="Analyze your productivity patterns with detailed charts and statistics. Track focus time, completion rates, and session history." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6 max-w-6xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Track your focus habits and productivity trends</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[100px]" />
                  ))
                ) : (
                  metrics.map(metric => (
                    <MetricCard key={metric.title} {...metric} />
                  ))
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Focus Trends</CardTitle>
                    <Tabs defaultValue="week" className="w-[300px]">
                      <TabsList>
                        <TabsTrigger value="week" onClick={() => setTimeRange('week')}>Week</TabsTrigger>
                        <TabsTrigger value="month" onClick={() => setTimeRange('month')}>Month</TabsTrigger>
                        <TabsTrigger value="year" onClick={() => setTimeRange('year')}>Year</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sessions" name="Sessions" fill="rgba(59, 130, 246, 0.6)" />
                            <Bar dataKey="focusHours" name="Focus Hours" fill="rgba(16, 185, 129, 0.6)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Session Completion</CardTitle>
                    <CardDescription>Completed vs aborted sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={completionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {completionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </>
  );
}
