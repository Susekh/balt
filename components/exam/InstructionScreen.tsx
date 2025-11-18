// components/exam/InstructionsScreen.tsx
'use client';
import React from 'react';
import { Clock, Eye, AlertTriangle } from 'lucide-react';

type InstructionsScreenProps = {
  onStart: () => void;
};

export default function InstructionsScreen({ onStart }: InstructionsScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Exam Instructions</h1>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-1" />
            <p>Time limit: 60 minutes</p>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-1" />
            <p>Keep this window in focus at all times. Tab switching is monitored.</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
            <p>Right-click and keyboard shortcuts are disabled.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Test Structure:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Verbal Ability</li>
            <li>• Analytical Ability</li>
            <li>• General Mental Ability</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded hover:bg-blue-700 transition-colors"
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}