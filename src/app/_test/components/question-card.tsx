'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  option_id: number;
  text: string;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: Option[];
  selectedAnswer: string | null;
  onAnswerChange: (value: string, id: number | null) => void;
  onMarkedForReview: (
    id: number | null,
    value: string,
    answered: boolean,
  ) => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedAnswer,
  onAnswerChange,
  onMarkedForReview,
  onNext,
  onSubmit,
}: QuestionCardProps) {
  const handleMarkedForReview = (selectedAnswer: string, answered: boolean) => {
    const selectedOption = options.find((opt) => opt.text === selectedAnswer);
    onMarkedForReview(
      selectedOption?.option_id ?? null,
      selectedAnswer ?? '',
      answered,
    );
    onNext();
  };

  const handleSaveAndNext = (selectedAnswer: string | null) => {
    if (selectedAnswer !== null) {
      const selectedOption = options.find((opt) => opt.text === selectedAnswer);
      onAnswerChange(selectedAnswer, selectedOption?.option_id ?? null);
    } else {
      onAnswerChange('', null);
    }
    onNext();
  };

  return (
    <Card className="mb-8 border-none shadow-lg overflow-hidden w-2/3">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2 pt-2">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
            {questionNumber}
          </span>
          <span>Question {questionNumber}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-8 px-6">
        <div className="space-y-8">
          <p
            dangerouslySetInnerHTML={{ __html: question }}
            className="text-xl font-medium"
          ></p>

          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={(value) => {
              const selectedAnswer = options.find((opt) => opt.text === value);
              onAnswerChange(value, selectedAnswer?.option_id ?? null);
            }}
            className="space-y-4"
          >
            {options.map((option) => (
              <div
                key={option.option_id}
                className={cn(
                  'flex items-center space-x-3 p-4 rounded-lg transition-all',
                  selectedAnswer === option.text
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-gray-50 border border-transparent',
                )}
              >
                <RadioGroupItem value={option.text} id={option.text} />
                <Label
                  dangerouslySetInnerHTML={{ __html: option.text }}
                  htmlFor={option.text}
                  className="cursor-pointer w-full"
                ></Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col bg-gray-50 py-4 px-6">
        <div className='w-full flex justify-between'>
          {selectedAnswer ? (
            <Button
              onClick={() => handleMarkedForReview(selectedAnswer, true)}
              className="gap-2 bg-indigo-600"
            >
              Mark for Review
            </Button>
          ) : (
            <Button
              onClick={() => handleMarkedForReview('', false)}
              className="gap-2 bg-amber-600"
            >
              Mark for Review
            </Button>
          )}

          <Button
            onClick={() => handleSaveAndNext(selectedAnswer)}
            className="gap-2 bg-green-600"
          >
            Save & Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">
          <Button
            onClick={onSubmit}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            Finish Exam
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
