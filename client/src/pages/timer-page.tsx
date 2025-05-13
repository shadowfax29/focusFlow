import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TimerCircle from "@/components/timer/timer-circle";
import TimerControls from "@/components/timer/timer-controls";
import SessionInfo from "@/components/timer/session-info";
import AbortModal from "@/components/timer/abort-modal";
import CompleteModal from "@/components/timer/complete-modal";
import WebsiteBlocker from "@/components/blocklist/website-blocker";
import { useTimer } from "@/hooks/use-timer";
import { TimerProvider } from "@/hooks/use-timer";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Helmet } from "react-helmet";

// Wrapper component to use the timer context
function TimerPageContent() {
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const {
    seconds,
    isRunning,
    timerMode,
    currentPomodoro,
    totalPomodoros,
    progress,
    elapsedTime,
    task,
    timerSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setTask,
    abortSession
  } = useTimer();

  // Format the timer display
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get status text based on timer mode
  const getStatusText = () => {
    switch (timerMode) {
      case 'focus':
        return 'FOCUS';
      case 'shortBreak':
        return 'SHORT BREAK';
      case 'longBreak':
        return 'LONG BREAK';
      default:
        return 'FOCUS';
    }
  };

  // Handle reset button click
  const handleReset = () => {
    if (isRunning) {
      setIsAbortModalOpen(true);
    } else {
      resetTimer();
    }
  };

  // Handle abort session
  const handleAbortSession = (reason: string) => {
    abortSession(reason);
    setIsAbortModalOpen(false);
  };

  // Get break duration for complete modal
  const getBreakDuration = () => {
    return timerMode === 'longBreak' ? 
      (timerSettings?.longBreakMinutes || 15) : 
      (timerSettings?.shortBreakMinutes || 5);
  };

  return (
    <>
      <Helmet>
        <title>Focus Timer | FocusFlow</title>
        <meta name="description" content="Stay focused with FocusFlow's Pomodoro timer. Customize work and break intervals, track your sessions, and block distractions." />
      </Helmet>
      
      {/* Website blocker component to block distracting sites during focus time */}
      {isRunning && timerMode === 'focus' && <WebsiteBlocker />}
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="container mx-auto p-6 max-w-3xl">
              <Card className="bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Focus Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <TimerCircle 
                      progress={progress}
                      mode={timerMode}
                      timeDisplay={formatTime(seconds)}
                      statusText={getStatusText()}
                    />
                    
                    <TimerControls 
                      isRunning={isRunning}
                      onStart={startTimer}
                      onReset={handleReset}
                      onSkip={skipTimer}
                    />
                    
                    <SessionInfo 
                      currentPomodoro={currentPomodoro}
                      totalPomodoros={totalPomodoros}
                      timerMode={timerMode}
                      elapsedTime={elapsedTime}
                      task={task}
                      onTaskChange={setTask}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
        <MobileNav />
        
        <AbortModal 
          open={isAbortModalOpen}
          onOpenChange={setIsAbortModalOpen}
          onConfirm={handleAbortSession}
        />
        
        <CompleteModal 
          open={isCompleteModalOpen}
          onOpenChange={setIsCompleteModalOpen}
          onStartBreak={startTimer}
          onSkipBreak={skipTimer}
          breakDuration={getBreakDuration()}
        />
      </div>
    </>
  );
}

// Wrapper component to provide TimerProvider context
export default function TimerPage() {
  return (
    <TimerProvider>
      <TimerPageContent />
    </TimerProvider>
  );
}
