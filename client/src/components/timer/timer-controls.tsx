import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward 
} from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export default function TimerControls({ 
  isRunning, 
  onStart, 
  onReset, 
  onSkip 
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full"
        onClick={onReset}
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        className="w-16 h-16 rounded-full shadow-lg"
        onClick={onStart}
      >
        {isRunning ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-1" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full"
        onClick={onSkip}
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
