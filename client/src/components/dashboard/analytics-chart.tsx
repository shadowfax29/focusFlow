import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Session } from "@shared/schema";

type TimeRange = "week" | "month" | "year";

// Function to generate weekly data
function generateWeeklyData(sessions: Session[] = []) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Adjust to Monday = 0, Sunday = 6
  
  const data = dayNames.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOfWeek + index);
    date.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    // Filter sessions for this day
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= date && sessionDate < nextDay;
    });
    
    // Calculate focus hours (convert from seconds to hours)
    const focusHours = daySessions.reduce((acc, session) => {
      return acc + ((session.actualDuration || 0) / 3600);
    }, 0);
    
    return {
      day,
      sessions: daySessions.length,
      focusHours: Math.round(focusHours * 10) / 10,
    };
  });
  
  return data;
}

export default function AnalyticsChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  const chartData = generateWeeklyData(sessions);

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Focus Analytics</CardTitle>
        <div className="flex gap-1">
          <Button 
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            Year
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-md" />
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="sessions" 
                  name="Sessions" 
                  fill="rgba(59, 130, 246, 0.6)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="focusHours" 
                  name="Focus Hours" 
                  fill="rgba(16, 185, 129, 0.6)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
