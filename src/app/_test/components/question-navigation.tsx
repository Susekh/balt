'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Answers {
  value: string | null;
  type: string;
}

// interface Question {
//   // options: Option[];
//   question: string;
//   question_id: number;
//   answeredOption: number | null;
//   appearStatus: string;
//   attemptTime: null | string;
// }

interface QuestionNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: Answers[];
  onQuestionSelect: (index: number) => void;
}

export function QuestionNavigation({
  totalQuestions,
  currentQuestion,
  answers,
  onQuestionSelect,
}: QuestionNavigationProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-1/3 border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Question Navigation
      </h3>
      <div className="flex flex-wrap gap-2 justify-start">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const questionNumber = index + 1;
          const type = answers[index].type
          const isCurrent = currentQuestion === questionNumber;

          return (
            <Button
              key={index}
              variant={type ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'w-10 h-10 transition-all duration-200',
                isCurrent && 'ring-2 ring-blue-500 ring-offset-2',
                type === 'answered'
                  ? 'bg-green-600 text-primary-foreground'
                  : type === 'answeredmarkedreview'
                    ? 'bg-indigo-600 text-primary-foreground'
                    : type === 'unansweredmarkedreview'
                      ? 'bg-amber-600 text-primary-foreground'
                      : type === 'unanswered'
                        ? 'bg-red-500 text-primary-foreground'
                        : 'bg-gray-300 text-black',
                type && !isCurrent && 'opacity-80 hover:opacity-100 hover:text-white',
              )}
              onClick={() => onQuestionSelect(questionNumber)}
            >
              {questionNumber}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 justify-start mt-4">
        <div className="w-full flex flex-row gap-2 items-center">
          <div className='p-0.5 ring ring-sky-600 rounded-lg'>
          <span className="w-9 h-9 bg-green-600/80 rounded-lg flex justify-center items-center text-white">
          </span>{' '}
          </div>
          - Answered
        </div>
        <div className="w-full flex flex-row gap-2 items-center">
          <div className='p-0.5 ring ring-sky-600 rounded-lg'>
          <span className="w-9 h-9 bg-red-500/80 rounded-lg flex justify-center items-center text-white">
          </span>{' '}
          </div>
          - Not answered
        </div>
        <div className="w-full flex flex-row gap-2 items-center">
          <div className='p-0.5 ring ring-sky-600 rounded-lg'>
          <span className="w-9 h-9 bg-indigo-600/80 rounded-lg flex justify-center items-center text-white">
          </span>{' '}
          </div>
          - Answered and marked for review
        </div>
        <div className="w-full flex flex-row gap-2 items-center">
          <div className='p-0.5 ring ring-sky-600 rounded-lg'>
          <span className="w-9 h-9 bg-amber-600/90 rounded-lg flex justify-center items-center text-white">
          </span>{' '}
          </div>
          - Unanswered and marked for review
        </div>
        <div className="w-full flex flex-row gap-2 items-center">
          <div className='p-0.5 ring ring-sky-600 rounded-lg'>
          <span className="w-9 h-9 bg-gray-300 rounded-lg flex justify-center items-center text-white">
          </span>{' '}
          </div>
          - Not attended
        </div>
      </div>
    </div>
  );
}
