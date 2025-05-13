import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";

interface CompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartBreak: () => void;
  onSkipBreak: () => void;
  breakDuration: number;
}

export default function CompleteModal({
  open,
  onOpenChange,
  onStartBreak,
  onSkipBreak,
  breakDuration,
}: CompleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Great job!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You've completed your focus session. Take a {breakDuration}-minute break before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex justify-center space-x-2">
          <AlertDialogAction
            onClick={onSkipBreak}
            className="bg-card hover:bg-card/90 border text-foreground"
          >
            Skip Break
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onStartBreak}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Start Break
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
