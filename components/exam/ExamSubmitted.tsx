"use client";
import { CheckCircle, Home, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExamSubmittedProps {
  totalQuestions: number;
  answered: number;
  timeSpent: number;       // in seconds
  tabSwitches: number;
  onViewAnswers: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

export default function ExamSubmitted({
  totalQuestions,
  answered,
  timeSpent,
  tabSwitches,
  onViewAnswers,
}: ExamSubmittedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white border-2 border-green-500 rounded-xl p-10 text-center shadow-lg max-w-md w-full">
        
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Exam Submitted Successfully!
        </h2>

        <div className="text-gray-700 space-y-2 mb-6">
          <p><strong>Total Questions:</strong> {totalQuestions}</p>
          <p><strong>Answered:</strong> {answered}</p>
          <p><strong>Time Spent:</strong> {formatTime(timeSpent)}</p>
          <p><strong>Tab Switches:</strong> {tabSwitches}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onViewAnswers}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Eye size={18} />
            Go to Dashboard.
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Home size={18} />
            Go to Home
          </button>
        </div>

      </div>
    </div>
  );
}
