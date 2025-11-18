// types/exam.types.ts

export type ContentItem = {
  type: 'text' | 'image';
  hardness: string;
  value: string;
};

export type SubQuestion = {
  id: string;
  hardness: string;
  content: ContentItem[];
  options: string[];
  type: 'mcq';
};

export type Question = {
  id: string;
  hardness: string;
  content: ContentItem[];
  subQuestions: SubQuestion[];
};

export type Section = {
  section: string;
  questions: Question[];
};

export type FlattenedSubQuestion = SubQuestion & {
  sectionName: string;
  questionId: string;
  questionContent: ContentItem[];
};

export type ExamData = {
  answers: Record<string, string>;
  timeSpent: number;
  tabSwitches: number;
  suspiciousActivity: number;
  focusWarnings: number;
  submittedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
};

export type Attempt = {
  qid: string;
  answer: string | null;
  section: string;
  questionNo: number;
  correct: boolean;
  correctAnswer: string;
  timeRemaining: number;
  attemptedAt: string;
};

export type AttemptsResponse = {
  email: string;
  date: string;
  attempts: Attempt[];
};