"use client"

import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SubmitDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  totalQuestions: number
  answeredCount: number
}

export function SubmitDialog({ isOpen, onOpenChange, onSubmit, totalQuestions, answeredCount }: SubmitDialogProps) {
  const hasUnansweredQuestions = answeredCount < totalQuestions

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Submit Test</AlertDialogTitle>
          <div className="space-y-4">
            <div>Are you sure you want to submit your test? You cannot change your answers after submission.</div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Total Questions:</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Answered:</span>
                <span className="font-medium">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <span className="font-medium">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            {hasUnansweredQuestions && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>You have unanswered questions. Are you sure you want to proceed?</span>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription></AlertDialogDescription>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
            Submit Test
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

