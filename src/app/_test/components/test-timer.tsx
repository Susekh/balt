"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestTimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
  onTick?: (remaining: number) => void;
}

export function TestTimer({ initialTime, onTimeUp, onTick }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [timerWarning, setTimerWarning] = useState(initialTime <= 300)

  useEffect(() => {
    setTimeLeft(initialTime);
    setTimerWarning(initialTime <= 300);
  }, [initialTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        if (prev === 301) setTimerWarning(true);
        if (onTick) requestAnimationFrame(() => onTick(prev - 1)); // Update parent
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp, onTick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-full shadow-sm transition-all duration-300",
        timerWarning ? "bg-red-500 text-red-50 animate-pulse" : "bg-white text-primary",
      )}
    >
      <Clock className="h-5 w-5" />
      <span className="font-mono text-lg font-semibold tracking-wider">{formatTime(timeLeft)}</span>
    </div>
  )
}

