import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TimerSettings, Session } from "@shared/schema";
import { useAuth } from "./use-auth";

type TimerContextType = {
  // Timer state
  seconds: number;
  isRunning: boolean;
  timerMode: 'focus' | 'shortBreak' | 'longBreak';
  currentPomodoro: number;
  totalPomodoros: number;
  progress: number;
  elapsedTime: number;
  task: string;
  
  // Timer settings
  timerSettings: TimerSettings | null;
  isLoadingSettings: boolean;
  
  // Current session
  currentSession: Session | null;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setTask: (task: string) => void;
  abortSession: (reason: string) => void;
  completeSession: () => void;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
};

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Timer state
  const [seconds, setSeconds] = useState(25 * 60); // Default 25 minutes
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [currentPomodoro, setCurrentPomodoro] = useState(1);
  const [totalPomodoros, setTotalPomodoros] = useState(4);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [task, setTaskText] = useState("");
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Get timer settings
  const { 
    data: timerSettings,
    isLoading: isLoadingSettings
  } = useQuery<TimerSettings>({
    queryKey: ["/api/timer-settings"],
    enabled: !!user,
    onSuccess: (data) => {
      if (!currentSession) {
        // Initialize timer with settings
        const focusSeconds = data.focusMinutes * 60;
        setSeconds(focusSeconds);
        setInitialSeconds(focusSeconds);
        setTotalPomodoros(data.pomodorosUntilLongBreak);
      }
    }
  });

  // Update timer settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<TimerSettings>) => {
      const res = await apiRequest("PATCH", "/api/timer-settings", settings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timer-settings"] });
      toast({
        title: "Settings updated",
        description: "Your timer settings have been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { startTime: Date, plannedDuration: number, pomodorosPlanned: number, task?: string }) => {
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return await res.json();
    },
    onSuccess: (session: Session) => {
      setCurrentSession(session);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PATCH", `/api/sessions/${id}`, data);
      return await res.json();
    },
    onSuccess: (session: Session) => {
      if (session.isCompleted) {
        setCurrentSession(null);
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/session-stats"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate progress
  const progress = seconds > 0 ? (initialSeconds - seconds) / initialSeconds : 0;

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
        setElapsedTime(prevElapsedTime => prevElapsedTime + 1);
      }, 1000);
    } else if (isRunning && seconds === 0) {
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  // Handle timer completion
  const handleTimerComplete = () => {
    if (timerMode === 'focus') {
      // Completed a focus session
      playSound();
      showNotification("Focus session completed", "Time for a break!");
      
      // Update completed pomodoro count
      if (currentSession) {
        updateSessionMutation.mutate({
          id: currentSession.id,
          data: { 
            pomodorosCompleted: currentSession.pomodorosCompleted + 1
          }
        });
      }
      
      // Check if we should take a long break
      if (currentPomodoro >= totalPomodoros) {
        setTimerMode('longBreak');
        if (timerSettings) {
          const breakSeconds = timerSettings.longBreakMinutes * 60;
          setSeconds(breakSeconds);
          setInitialSeconds(breakSeconds);
        } else {
          setSeconds(15 * 60); // Default 15 minutes
          setInitialSeconds(15 * 60);
        }
        
        // Show complete session modal if we've finished all pomodoros
        if (currentSession) {
          toast({
            title: "Pomodoro cycle completed!",
            description: "You've completed all your planned pomodoros. Great job!",
          });
        }
      } else {
        // Take a short break
        setTimerMode('shortBreak');
        if (timerSettings) {
          const breakSeconds = timerSettings.shortBreakMinutes * 60;
          setSeconds(breakSeconds);
          setInitialSeconds(breakSeconds);
        } else {
          setSeconds(5 * 60); // Default 5 minutes
          setInitialSeconds(5 * 60);
        }
      }
      
      // Auto-start break if setting enabled
      if (timerSettings?.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Completed a break
      playSound();
      showNotification("Break completed", "Ready to focus again?");
      
      // If long break completed, reset pomodoro counter
      if (timerMode === 'longBreak') {
        setCurrentPomodoro(1);
        
        // Complete the session if we were in a session
        if (currentSession) {
          const actualDuration = elapsedTime;
          
          updateSessionMutation.mutate({
            id: currentSession.id,
            data: {
              endTime: new Date(),
              actualDuration,
              isCompleted: true
            }
          });
          
          setElapsedTime(0);
        }
      } else {
        // Increment pomodoro counter after short break
        setCurrentPomodoro(prev => prev + 1);
      }
      
      // Start focus timer
      setTimerMode('focus');
      if (timerSettings) {
        const focusSeconds = timerSettings.focusMinutes * 60;
        setSeconds(focusSeconds);
        setInitialSeconds(focusSeconds);
      } else {
        setSeconds(25 * 60); // Default 25 minutes
        setInitialSeconds(25 * 60);
      }
      
      // Auto-start next pomodoro if setting enabled
      if (timerSettings?.autoStartPomodoros) {
        setIsRunning(true);
      }
    }
  };

  // Timer actions
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      
      // Create new session record if starting focus mode and no current session
      if (timerMode === 'focus' && !currentSession) {
        const focusDuration = timerSettings ? timerSettings.focusMinutes * 60 : 25 * 60;
        const pomodorosPlanned = timerSettings ? timerSettings.pomodorosUntilLongBreak : 4;
        
        createSessionMutation.mutate({
          startTime: new Date(),
          plannedDuration: focusDuration * pomodorosPlanned,
          pomodorosPlanned,
          task: task || undefined
        });
        
        showNotification("Focus session started", `${timerSettings?.focusMinutes || 25} minutes of focus time`);
      }
    } else {
      pauseTimer();
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    
    // Reset timer based on current mode
    if (timerMode === 'focus') {
      const focusSeconds = timerSettings ? timerSettings.focusMinutes * 60 : 25 * 60;
      setSeconds(focusSeconds);
      setInitialSeconds(focusSeconds);
    } else if (timerMode === 'shortBreak') {
      const breakSeconds = timerSettings ? timerSettings.shortBreakMinutes * 60 : 5 * 60;
      setSeconds(breakSeconds);
      setInitialSeconds(breakSeconds);
    } else {
      const longBreakSeconds = timerSettings ? timerSettings.longBreakMinutes * 60 : 15 * 60;
      setSeconds(longBreakSeconds);
      setInitialSeconds(longBreakSeconds);
    }
  };

  const skipTimer = () => {
    pauseTimer();
    handleTimerComplete();
  };

  const setTask = (taskText: string) => {
    setTaskText(taskText);
  };

  const abortSession = (reason: string) => {
    pauseTimer();
    
    if (currentSession) {
      const actualDuration = elapsedTime;
      
      updateSessionMutation.mutate({
        id: currentSession.id,
        data: {
          endTime: new Date(),
          actualDuration,
          isCompleted: false,
          abortReason: reason
        }
      });
      
      // Reset timer
      setCurrentSession(null);
      setElapsedTime(0);
      setCurrentPomodoro(1);
      setTimerMode('focus');
      const focusSeconds = timerSettings ? timerSettings.focusMinutes * 60 : 25 * 60;
      setSeconds(focusSeconds);
      setInitialSeconds(focusSeconds);
      
      toast({
        title: "Session aborted",
        description: "Your session has been saved as incomplete",
      });
    }
  };

  const completeSession = () => {
    pauseTimer();
    
    if (currentSession) {
      const actualDuration = elapsedTime;
      
      updateSessionMutation.mutate({
        id: currentSession.id,
        data: {
          endTime: new Date(),
          actualDuration,
          isCompleted: true
        }
      });
      
      // Reset timer
      setElapsedTime(0);
      
      toast({
        title: "Session completed",
        description: "Great job on completing your session!",
      });
    }
  };

  const updateTimerSettings = (settings: Partial<TimerSettings>) => {
    updateSettingsMutation.mutate(settings);
  };

  // Helper functions
  const playSound = () => {
    // Play sound logic (would be implemented with audio element)
    // This is just a placeholder for where you'd implement the actual sound playback
  };

  const showNotification = (title: string, body: string) => {
    // Show browser notification if permissions are granted
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }

    // Also show toast notification
    toast({
      title,
      description: body,
    });
  };

  return (
    <TimerContext.Provider
      value={{
        seconds,
        isRunning,
        timerMode,
        currentPomodoro,
        totalPomodoros,
        progress,
        elapsedTime,
        task,
        timerSettings: timerSettings || null,
        isLoadingSettings,
        currentSession,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        setTask,
        abortSession,
        completeSession,
        updateTimerSettings
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
