import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2 } from "lucide-react";

interface SessionInfoProps {
  currentPomodoro: number;
  totalPomodoros: number;
  timerMode: 'focus' | 'shortBreak' | 'longBreak';
  elapsedTime: number;
  task: string;
  onTaskChange: (task: string) => void;
}

export default function SessionInfo({
  currentPomodoro,
  totalPomodoros,
  timerMode,
  elapsedTime,
  task,
  onTaskChange
}: SessionInfoProps) {
  const [editingTask, setEditingTask] = useState(false);
  const [taskInput, setTaskInput] = useState(task);
  
  // Format elapsed time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Update task input when prop changes
  useEffect(() => {
    setTaskInput(task);
  }, [task]);

  // Save task handler
  const handleSaveTask = () => {
    onTaskChange(taskInput);
    setEditingTask(false);
  };

  // Handle pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTask();
    }
  };

  return (
    <div className="mt-6 w-full bg-muted rounded-lg p-4">
      {editingTask ? (
        <div className="flex gap-2">
          <Input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="What are you working on?"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <Button size="sm" onClick={handleSaveTask}>
            Save
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Current Task</span>
          <Button variant="ghost" size="sm" onClick={() => setEditingTask(true)}>
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      )}
      
      {!editingTask && (
        <p className="font-medium mt-1">
          {task || "No task set"}
        </p>
      )}
      
      <div className="flex justify-between mt-4">
        <div>
          <span className="text-sm text-muted-foreground">Pomodoro</span>
          <p className="font-medium">{currentPomodoro}/{totalPomodoros}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Total time</span>
          <p className="font-medium">{formatTime(elapsedTime)}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Status</span>
          <p className="font-medium capitalize">
            {timerMode === 'focus' ? (
              <span className="text-primary">Focus</span>
            ) : timerMode === 'shortBreak' ? (
              <span className="text-orange-500">Short Break</span>
            ) : (
              <span className="text-orange-500">Long Break</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
