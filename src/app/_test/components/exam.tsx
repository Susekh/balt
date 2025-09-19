'use client';
import React, { useEffect, useState } from 'react';
import MainExam from './main-exam';
import { Loader } from 'lucide-react';

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

interface ExamData {
  questions: Question[]
}

const Exam = ({ testId, examData }: { testId: string; examData: ExamData }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
  // const [duration, setDuration] = useState<number>(0);
  const [keyPressed, setKeyPressed] = useState('');
  // console.log(duration)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeyPressed(event.key);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  },);

  useEffect(() => {
  }, [keyPressed]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ExamData', JSON.stringify(examData));
    }
  },);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('ExamData');
      if (localData) {
        const parsed = JSON.parse(localData);
        setQuestions(parsed.questions);
        setTimeRemaining(parsed.timeRemaining);
        // setDuration(parsed.duration);
        setTimeElapsed(parsed.timeElapsed);
      }
    }
  }, []);
  return (
    <>
      {questions.length > 0 ? (
        <MainExam
          testId={testId}
          questions={questions}
          timeElapsed={timeElapsed}
          timeRemaining={timeRemaining}
          // duration={duration}
        />
      ) : (
        <>
          <div className="h-screen flex flex-row justify-center items-center text-2xl font-semibold">
            Loading please wait <Loader className="animate-spin" />
          </div>
        </>
      )}
    </>
  );
};

export default Exam;
