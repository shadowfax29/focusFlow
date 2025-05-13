import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/use-timer";
import { TimerProvider } from "@/hooks/use-timer";
import { AlertCircle } from "lucide-react";

// Helper component to display the active session indicator content
function ActiveSessionContent() {
  const { seconds, isRunning, timerMode } = useTimer();
  const [isVisible, setIsVisible] = useState(false);
  
  // Format timer display
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get the appropriate label based on timer mode
  const getLabel = () => {
    switch (timerMode) {
      case 'focus':
        return 'Focus session in progress';
      case 'shortBreak':
        return 'Short break in progress';
      case 'longBreak':
        return 'Long break in progress';
      default:
        return 'Session in progress';
    }
  };

  // Get the appropriate color class based on timer mode
  const getColorClass = () => {
    switch (timerMode) {
      case 'focus':
        return 'bg-primary text-primary-foreground';
      case 'shortBreak':
      case 'longBreak':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };
  
  // Show or hide the indicator based on timer state
  useEffect(() => {
    setIsVisible(isRunning);
  }, [isRunning]);
  
  // Return null if timer is not running
  if (!isVisible) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "fixed bottom-16 md:bottom-4 left-1/2 transform -translate-x-1/2 py-2 px-4 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all duration-300",
        getColorClass()
      )}
    >
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">
        {getLabel()}: {formatTime(seconds)} remaining
      </span>
    </div>
  );
}

// Wrapper component with TimerProvider context
export default function ActiveSessionIndicator() {
  // We need to check if timer hook is already provided in the context
  // This avoids double wrapping when the component is used in the Timer page
  const [hasTimerContext, setHasTimerContext] = useState(false);
  
  useEffect(() => {
    try {
      // Try to use the hook to check if context exists
      useTimer();
      setHasTimerContext(true);
    } catch (error) {
      setHasTimerContext(false);
    }
  }, []);
  
  // If there's an error accessing the context, it means we need to provide it
  if (!hasTimerContext) {
    return (
      <TimerProvider>
        <ActiveSessionContent />
      </TimerProvider>
    );
  }
  
  // Otherwise, just render the content directly
  return <ActiveSessionContent />;
}
