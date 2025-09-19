"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressTrackerProps {
  currentQuestion: number
  totalQuestions: number
  answeredCount: number
}

export function ProgressTracker({ currentQuestion, totalQuestions, answeredCount }: ProgressTrackerProps) {
  const progressPercentage = (answeredCount / totalQuestions) * 100

  return (
    <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span className="text-muted-foreground">
          {answeredCount} of {totalQuestions} answered
        </span>
      </div>
      <Progress value={progressPercentage} className="h-3 rounded-full" />
      <div className="mt-4 text-xs text-right text-muted-foreground">{Math.round(progressPercentage)}% Complete</div>
    </div>
  )
}

