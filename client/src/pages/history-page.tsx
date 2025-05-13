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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Session } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

// Helper function to format duration from seconds
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

export default function HistoryPage() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch all sessions
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  // Calculate pagination
  const totalSessions = sessions?.length || 0;
  const totalPages = Math.ceil(totalSessions / itemsPerPage);
  const paginatedSessions = sessions
    ? sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];
    
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Session History | FocusFlow</title>
        <meta name="description" content="View your complete session history. Track your focus patterns over time and analyze your productivity trends." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Session History</h1>
                <p className="text-muted-foreground">View and filter your past focus sessions</p>
              </div>
              
              <Card className="bg-card shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Sessions</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder={itemsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : totalSessions > 0 ? (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Task</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Pomodoros</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedSessions.map((session) => (
                              <TableRow key={session.id}>
                                <TableCell>
                                  {format(parseISO(session.startTime as unknown as string), "MMM d, yyyy HH:mm")}
                                </TableCell>
                                <TableCell>
                                  {session.task || <span className="text-muted-foreground italic">No task</span>}
                                </TableCell>
                                <TableCell>{formatDuration(session.actualDuration)}</TableCell>
                                <TableCell>{session.pomodorosCompleted} of {session.pomodorosPlanned}</TableCell>
                                <TableCell>
                                  {session.isCompleted ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>
                                  ) : (
                                    <Badge variant="destructive">Aborted</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Show current page and surrounding pages
                            let pageToShow = currentPage - 2 + i;
                            
                            // Adjust if we're at the beginning
                            if (currentPage < 3) {
                              pageToShow = i + 1;
                            }
                            
                            // Adjust if we're at the end
                            if (currentPage > totalPages - 2) {
                              pageToShow = totalPages - 4 + i;
                            }
                            
                            // Ensure pageToShow is within valid range
                            if (pageToShow > 0 && pageToShow <= totalPages) {
                              return (
                                <PaginationItem key={pageToShow}>
                                  <PaginationLink
                                    isActive={pageToShow === currentPage}
                                    onClick={() => handlePageChange(pageToShow)}
                                  >
                                    {pageToShow}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No sessions found</p>
                      <p className="text-sm mt-1">Start your first focus session to see your history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </>
  );
}
