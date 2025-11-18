'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Mail, Calendar, FileText, Lightbulb, Clock, Award } from 'lucide-react';

interface TextBlock {
  type: string;
  value: string;
}

interface AIResult {
  id: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

interface Attempt {
  qid: string;
  section: string;
  questionNo: number;
  question: TextBlock[] | null;
  subQuestion: TextBlock[] | null;
  answer: string | null;
  correct: boolean;
  correctAnswer: string;
  timeRemaining: number;
  attemptedAt: string;
  aiCorrectAnswer?: string;
  aiExplanation?: string;
  aiIsCorrect?: boolean;
  aiLoading?: boolean;
}

interface AnswersClientProps {
  email: string | null;
  date: string | null;
}

export default function AnswersClient({ email, date }: AnswersClientProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);

  const totalCorrect = attempts.filter((a) => a.correct).length;
  const totalWrong = attempts.length - totalCorrect;
  const accuracy = attempts.length > 0 ? ((totalCorrect / attempts.length) * 100).toFixed(1) : '0';

  const fetchAttempts = useCallback(async () => {
    if (!email || !date) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/v1/get-attempts?email=${email}&date=${date}`,
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setAttempts([]);
      } else {
        const formatted = (data.attempts || []).map((a: Attempt) => ({
          ...a,
          aiLoading: true,
        }));
        setAttempts(formatted);
      }
    } catch {
      setError('Failed to fetch attempts');
    } finally {
      setLoading(false);
    }
  }, [email, date]);

  const generateAI = useCallback(async () => {
    if (attempts.length === 0) return;

    console.log('Attempts ::', attempts);

    const sendData = attempts.map((a) => ({
      id: a.qid,
      section: a.section || '',
      questionNo: a.questionNo || '',
      mainQuestion:
        a.question
          ?.map((q) => {
            if (q.type === 'text') return q.value;
            if (q.type === 'image') return `[Image: ${q.value}]`;
            return '';
          })
          .join('\n') || '',
      subQuestion: a.subQuestion?.map((q) => q.value).join('\n') || '',
      userAnswer: a.answer || '',
      correctAnswer: a.correctAnswer || '',
      isCorrect: a.correct || false,
      timeRemaining: a.timeRemaining || 0,
      attemptedAt: a.attemptedAt || '',
    }));

    try {
      const res = await fetch('/api/v1/ai-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: sendData }),
      });

      const json: { result: AIResult[] } = await res.json();

      const updated = attempts.map((att) => {
        const aiItem = json.result.find((i) => i.id === att.qid);
        return aiItem
          ? {
              ...att,
              aiCorrectAnswer: aiItem.correctAnswer,
              aiExplanation: aiItem.explanation,
              aiIsCorrect: aiItem.isCorrect,
              aiLoading: false,
            }
          : { ...att, aiLoading: false };
      });

      setAttempts(updated);
    } catch {
      const stopped = attempts.map((a) => ({ ...a, aiLoading: false }));
      setAttempts(stopped);
    }
  }, [attempts]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  useEffect(() => {
    if (attempts.length > 0 && !aiGenerated) {
      generateAI();
      setAiGenerated(true);
    }
  }, [attempts, aiGenerated, generateAI]);

  const renderTextArray = (arr: TextBlock[] | null) =>
    Array.isArray(arr)
      ? arr.map((item, idx) => (
          <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {item.value}
          </p>
        ))
      : null;

  const grouped = attempts.reduce(
    (acc, attempt) => {
      const key = JSON.stringify(attempt.question);
      if (!acc[key]) acc[key] = { main: attempt, subs: [] };
      acc[key].subs.push(attempt);
      return acc;
    },
    {} as Record<string, { main: Attempt; subs: Attempt[] }>,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Answer Review
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {email && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-600 dark:text-slate-400">{email}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-600 dark:text-slate-400">{date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        {attempts.length > 0 && (
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-semibold text-xl text-white">
                  Performance Summary
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Correct</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{totalCorrect}</p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Wrong</span>
                  </div>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">{totalWrong}</p>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Accuracy</span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{accuracy}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your answers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl p-6">
            <p className="text-red-700 dark:text-red-400 font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </p>
          </div>
        )}

        {/* No Data State */}
        {!loading && attempts.length === 0 && !error && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No attempts found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Try selecting a different date or email</p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {Object.values(grouped).map((group, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="bg-indigo-600 dark:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm">
                    Q{index + 1}
                  </span>
                  {group.main.section}
                </h2>
              </div>

              {/* Main Question */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <strong className="text-slate-900 dark:text-white">Main Question</strong>
                </div>
                <div className="ml-8 space-y-2">
                  {renderTextArray(group.main.question)}
                </div>
              </div>

              {/* Sub Questions */}
              <div className="p-6 space-y-5">
                {group.subs.map((sub, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
                    {/* Sub Question Text */}
                    <div>
                      <strong className="text-slate-900 dark:text-white text-sm block mb-2">Sub Question {idx + 1}:</strong>
                      <div className="space-y-2 pl-4">
                        {renderTextArray(sub.subQuestion)}
                      </div>
                    </div>

                    {/* Answer Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Correct Answer
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">{sub.correctAnswer}</p>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" />
                          Your Answer
                        </p>
                        <p className={`font-semibold ${sub.answer ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                          {sub.answer ?? 'Not Attempted'}
                        </p>
                      </div>
                    </div>

                    {/* Result Badge */}
                    <div className="flex items-center justify-between pt-2">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border-2 ${
                        sub.correct
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}>
                        {sub.correct ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Correct Answer
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            Wrong Answer
                          </>
                        )}
                      </span>

                      {sub.timeRemaining > 0 && (
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {Math.floor(sub.timeRemaining / 60)}m {sub.timeRemaining % 60}s remaining
                        </span>
                      )}
                    </div>

                    {/* AI Explanation Box */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <strong className="text-sm text-indigo-900 dark:text-indigo-300">AI Explanation</strong>
                      </div>

                      {!sub.aiExplanation && sub.aiLoading && (
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                          <div className="h-5 w-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin rounded-full"></div>
                          <span className="text-sm font-medium">Analyzing your answer...</span>
                        </div>
                      )}

                      {sub.aiExplanation && !sub.aiLoading && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {sub.aiExplanation}
                        </p>
                      )}

                      {!sub.aiExplanation && !sub.aiLoading && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                          Unable to generate explanation at this time
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}