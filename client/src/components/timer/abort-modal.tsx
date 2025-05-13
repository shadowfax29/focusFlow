import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AbortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export default function AbortModal({ open, onOpenChange, onConfirm }: AbortModalProps) {
  const [reason, setReason] = useState<string>("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abort current session?</AlertDialogTitle>
          <AlertDialogDescription>
            Your progress will be saved, but this session will be marked as incomplete.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="abort-reason" className="mb-2 block">
            Reason (optional)
          </Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger id="abort-reason">
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emergency">Emergency came up</SelectItem>
              <SelectItem value="meeting">Unexpected meeting</SelectItem>
              <SelectItem value="tired">Too tired to focus</SelectItem>
              <SelectItem value="distracted">Too many distractions</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Abort Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
