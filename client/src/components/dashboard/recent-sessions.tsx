import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";
import { Session } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

// Helper functions to format time
function formatDuration(seconds: number | null): string {
  if (!seconds) return "0 min";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatTimeRange(start: string | Date, end: string | Date | null): string {
  const startDate = new Date(start);
  const isToday = new Date().toDateString() === startDate.toDateString();
  const datePrefix = isToday ? "Today" : format(startDate, "MMM d");
  
  if (!end) {
    return `${datePrefix}, ${format(startDate, "h:mm a")} - In progress`;
  }
  
  const endDate = new Date(end);
  return `${datePrefix}, ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;
}

export default function RecentSessions() {
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions?limit=5", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    }
  });

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Recent Sessions</CardTitle>
        <Link href="/history">
          <a className="text-primary text-sm hover:underline">View all</a>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${session.isCompleted ? 'bg-emerald-500' : 'bg-destructive'}`}>
                    {session.isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {session.isCompleted ? "Completed session" : "Aborted session"}
                      {session.task && `: ${session.task}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRange(session.startTime, session.endTime)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDuration(session.actualDuration)}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.pomodorosCompleted} of {session.pomodorosPlanned} pomodoros
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No sessions recorded yet</p>
            <p className="text-sm mt-1">Start your first focus session to see your history</p>
          </div>
        )}
      </CardContent>
      {sessions && sessions.length > 0 && (
        <CardFooter className="pt-2 pb-4 justify-center">
          <Link href="/timer">
            <a className="text-primary hover:underline text-sm">Start a new session</a>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
