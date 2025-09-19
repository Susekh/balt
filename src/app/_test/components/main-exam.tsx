'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultDialog } from './result-dialog';
import { SubmitDialog } from './submit-dialog';
import { QuestionNavigation } from './question-navigation';
import { QuestionCard } from './question-card';
import { ProgressTracker } from './progress-tracker';
import { TestTimer } from './test-timer';
import { Loader } from 'lucide-react';
// import { testQuestions } from '@/misc/sampleQuestions';

interface Answers {
  id: number | null;
  value: string | null;
  type: string;
}

interface Option {
  text: string;
  option_id: number;
}

interface Question {
  slNo: number;
  options: Option[];
  question: string;
  question_id: number;
  answeredOption: number | null;
  answeredText: string | null;
  appearStatus: string;
  attemptTime: null | string;
}

const saveToLocalStorage = (answers: Answers[], currentQuestionInd: number) => {
  const localData = window.localStorage.getItem('ExamData');
  const parsedLocalData = localData && JSON.parse(localData);
  parsedLocalData.questions = parsedLocalData.questions.map(
    (question: Question, index: number) => {
      const answer = answers[index];
      return {
        ...question,
        answeredOption: answer?.id ?? null,
        appearStatus: answer?.type ?? 'unvisited',
        answeredText: answer?.value ?? null,
        attemptTime:
          index === currentQuestionInd
            ? new Date().getTime()
            : (question.attemptTime ?? null),
      };
    },
  );
  window.localStorage.setItem('ExamData', JSON.stringify(parsedLocalData));
};

const MainExam = ({
  testId,
  questions,
  timeElapsed,
  timeRemaining,
  // stateChange
}: {
  testId: string;
  questions: Question[];
  timeElapsed: number | null;
  timeRemaining: number;
  // stateChange: boolean
}) => {
  console.log(timeElapsed);
  const [currentQuestion, setCurrentQuestion] = useState(1); // 1-indexed for user display
  const [answers, setAnswers] = useState<Answers[]>(
    Array(questions.length).fill({ id: null, value: null, type: '' }),
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(
    timeRemaining * 60,
  );
  // const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // const [timeTaken, setTimeTaken] = useState("00:00");
  const router = useRouter();

  // Test duration in seconds (60 minutes)
  // const TEST_DURATION = 60 * 30;

  useEffect(() => {
    if (questions) {
      const updatedAnswers = questions.map((q) => ({
        id: q.answeredOption,
        value: q.answeredText,
        type: q.appearStatus,
      }));
      setAnswers(updatedAnswers);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      saveDataToBackend();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, []);

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch('/api/odsic-final-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
        }),
      });
      console.log('parsedresponse   ', response.status);
      return response.status;
    } catch (error) {
      console.error('Failed to save data', error);
    }
  };

  const saveDataToBackend = async () => {
    try {
      const localData = window.localStorage.getItem('ExamData');
      const parsedLocalData = localData && JSON.parse(localData);

      await fetch('/api/user-exam-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          answers: {
            ...parsedLocalData,
            timeRemaining: Math.ceil(timeLeftInSeconds / 60), // Optional: send seconds directly
          },
        }),
      });
    } catch (error) {
      console.error('Failed to save data', error);
    }
  };

  const handleAnswerChange = (value: string, id: number | null) => {
    const newAnswers = [...answers];
    if (value !== '' && id !== null) {
      newAnswers[currentQuestion - 1] = {
        id: id,
        value: value,
        type: 'answered',
      };
      setAnswers(newAnswers);
      saveToLocalStorage(newAnswers, currentQuestion - 1);
    } else {
      newAnswers[currentQuestion - 1] = {
        id: null,
        value: null,
        type: 'unanswered',
      };
      setAnswers(newAnswers);
      saveToLocalStorage(newAnswers, currentQuestion - 1);
    }
    // saveDataToBackend()
  };

  const handleMarkedForReview = (
    id: number | null,
    value: string,
    markedForReviewAnswered: boolean,
  ) => {
    const newAnswers = [...answers];
    if (markedForReviewAnswered) {
      newAnswers[currentQuestion - 1] = {
        id: id,
        value: value,
        type: 'answeredmarkedreview',
      };
      setAnswers(newAnswers);
      saveToLocalStorage(newAnswers, currentQuestion - 1);
    } else {
      newAnswers[currentQuestion - 1] = {
        id: null,
        value: null,
        type: 'unansweredmarkedreview',
      };
      setAnswers(newAnswers);
      saveToLocalStorage(newAnswers, currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      saveDataToBackend();
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // const handlePrevious = () => {
  //   if (currentQuestion > 1) {
  //     setCurrentQuestion(currentQuestion - 1);
  //   }
  // };

  const handleQuestionSelect = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
  };

  const handleTimeUp = () => {
    if (!testCompleted) {
      handleSubmitTest();
    }
  };

  const returnHome = () => {
    if(document.fullscreenElement){
      document.exitFullscreen()
    }
    router.push('/');
  }

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);
      saveDataToBackend();
      const status = await handleFinalSubmit();
      setIsSubmitting(false);
      setTestCompleted(true);
      if (status === 200) setShowResultDialog(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter((answer) => answer.id !== null).length;
  const currentQuestionData = questions[currentQuestion - 1]; // Adjust for 0-indexed array
  if (isSubmitting) {
    return SubmissionVisual();
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-1">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header with title and timer */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-2xl font-bold">Assessment in Progress</div>
          <TestTimer
            initialTime={timeRemaining * 60}
            onTimeUp={handleTimeUp}
            onTick={setTimeLeftInSeconds}
          />
        </div>

        {/* Progress tracker */}
        <ProgressTracker
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          answeredCount={answeredCount}
        />

        {/* Question card */}
        <div className="flex flex-row justify-center items-start gap-2">
          <QuestionCard
            questionNumber={currentQuestion}
            totalQuestions={questions.length}
            question={currentQuestionData.question}
            options={currentQuestionData.options}
            selectedAnswer={answers[currentQuestion - 1].value}
            onAnswerChange={handleAnswerChange}
            onMarkedForReview={handleMarkedForReview}
            onNext={handleNext}
            onSubmit={() => setShowSubmitDialog(true)}
          />

          {/* Question navigation */}
          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answers={answers}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <SubmitDialog
        isOpen={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSubmit={handleSubmitTest}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
      />

      {/* Results Dialog */}
      <ResultDialog
        isOpen={showResultDialog}
        onOpenChange={setShowResultDialog}
        onReturn={() => returnHome()}
        // score={score}
        // totalQuestions={testQuestions.length}
        // timeTaken={timeTaken}
      />
    </main>
  );
};

export default MainExam;

function SubmissionVisual() {
  return (
    <>
      <div className="w-full h-screen bg-white/50 flex flex-col justify-center items-center">
        <div>Wait while submitting you exam</div>
        <Loader className="animate-spin" />
      </div>
    </>
  );
}
