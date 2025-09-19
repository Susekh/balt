"use client";

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

interface ResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReturn: () => void;
  // score: number;
  // totalQuestions: number;
  // timeTaken: string;
}

export function ResultDialog({
  isOpen,
  onOpenChange,
  onReturn,
  // score,
  // totalQuestions,
  // timeTaken,
}: ResultDialogProps) {
  // const scorePercentage = Math.round((score / totalQuestions) * 100);

  // const getFeedbackMessage = () => {
  //   if (score === totalQuestions) return "Perfect Score!";
  //   if (scorePercentage >= 80) return "Excellent work!";
  //   if (scorePercentage >= 60) return "Good job!";
  //   if (scorePercentage >= 40) return "Nice effort!";
  //   return "Better luck next time!";
  // };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-center">
            Test Submission Status
          </AlertDialogTitle>
          <div className="flex flex-col justify-center items-center space-y-8">
            <div className="bg-green-500 rounded-full p-1">
              <CheckCircle className="w-[5rem] h-[5rem] text-white" />
            </div>
            {/* <div className="bg-green-500 rounded-full p-1"> */}
              {/* <X className="w-[5rem] h-[5rem] text-white" /> */}
            {/* </div> */}
            <div className="text-center text-lg font-semibold">
              Your test has been submitted successfully!!
            </div>
            <div className="text-center">
              Thank you for completing the assessment!
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription></AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onReturn} className="w-full">
            Return to Home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
