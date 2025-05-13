import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatsData = {
  today: number;
  week: number;
  focusTime: number;
  completionRate: number;
};

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/session-stats"],
  });

  return (
    <section className="bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Ready to boost your productivity today?
          </p>
        </div>
        {/* This image would be replaced with an SVG in a real implementation */}
        <div className="hidden md:block bg-primary/10 w-[200px] h-[150px] rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-16 w-16 text-primary/50"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase font-medium text-muted-foreground">Today</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-primary">{stats?.today || 0} sessions</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase font-medium text-muted-foreground">This week</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-primary">{stats?.week || 0} sessions</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase font-medium text-muted-foreground">Focus time</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-emerald-500">{stats?.focusTime || 0}h</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase font-medium text-muted-foreground">Completion</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-emerald-500">{stats?.completionRate || 0}%</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
