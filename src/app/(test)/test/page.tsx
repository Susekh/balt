'use client';
import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Types
type ContentItem = {
  type: 'text' | 'image';
  hardness: string;
  value: string;
};

type SubQuestion = {
  id: string;
  hardness: string;
  content: ContentItem[];
  options: string[];
  type: 'mcq';
};

type Question = {
  id: string;
  hardness: string;
  content: ContentItem[];
  subQuestions: SubQuestion[];
};

type Section = {
  section: string;
  questions: Question[];
};

export default function ProctoredExamComponent() {
  // States
  const [questions, setQuestions] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentSubQuestionIndex, setCurrentSubQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [windowFocused, setWindowFocused] = useState(true);
  const [focusWarnings, setFocusWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Proctoring states
  const [tabSwitches, setTabSwitches] = useState(0);
  const [suspiciousActivity, setSuspiciousActivity] = useState(0);

  const router = useRouter();

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/questions', {
          credentials: 'include', // send cookies
          redirect: 'manual', // prevent automatic redirect
        });

        if (res.status === 307 || res.status === 302) {
          // User is not authenticated
          router.replace('/'); // redirect to login page
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch questions');

        const data: Section[] = await res.json();
        setQuestions(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Something went wrong while loading questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  // Flatten all subquestions for navigation
  const allSubQuestions =
    questions.flatMap((section) =>
      section.questions.flatMap((question) =>
        question.subQuestions.map((subQ) => ({
          ...subQ,
          sectionName: section.section,
          questionId: question.id,
          questionContent: question.content,
        })),
      ),
    ) || [];

  const currentSubQuestion = allSubQuestions[currentSubQuestionIndex];
  const totalQuestions = allSubQuestions.length;

  // Timer
  useEffect(() => {
    if (!testStarted || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, submitted]);

  // Proctoring listeners
  useEffect(() => {
    const handleFocus = () => setWindowFocused(true);
    const handleBlur = () => {
      setWindowFocused(false);
      setTabSwitches((prev) => prev + 1);
      setFocusWarnings((prev) => prev + 1);
      setSuspiciousActivity((prev) => prev + 1);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        setSuspiciousActivity((prev) => prev + 1);
      }
    };
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      setSuspiciousActivity((prev) => prev + 1);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setSuspiciousActivity((prev) => prev + 1);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        setSuspiciousActivity((prev) => prev + 1);
      }
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (option: string) => {
    if (!currentSubQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentSubQuestion.id]: option }));
  };

  const handleNext = () => {
    if (currentSubQuestionIndex < totalQuestions - 1) {
      setCurrentSubQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSubQuestionIndex > 0) {
      setCurrentSubQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // ✅ confirmation before submitting
    const confirmSubmit = window.confirm(
      'Are you sure you want to submit the exam? You will not be able to change your answers after submitting.',
    );
    if (!confirmSubmit) return;

    setIsSubmitting(true);

    try {
      const examData = {
        answers, // { "q1": 2, "q2": 3, ... }
        timeSpent: 3600 - timeLeft,
        tabSwitches,
        suspiciousActivity,
        focusWarnings,
        submittedAt: new Date().toISOString(),
        totalQuestions,
        answeredQuestions: Object.keys(answers).length,
      };

      const response = await fetch('/api/v1/submit/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🔑 important so cookie (auth-token) is sent
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Exam submitted:', result);

      alert(
        `Exam submitted successfully! ${
          result.score !== undefined ? `Your score: ${result.score}` : ''
        }`,
      );

      setSubmitted(true);
      setTimeout(() => {
        router.replace('/');
      }, 5000);
    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTest = () => setTestStarted(true);

  // Loading/Error states
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading questions...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Focus warning overlay
  if (!windowFocused && testStarted && !submitted) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white border-2 border-red-500 rounded-lg p-8 text-center shadow-lg max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Exam Window Not Focused!
          </h2>
          <p className="text-gray-700 mb-4">
            You must keep this window in focus to continue the exam. Tab
            switches are being monitored.
          </p>
          <p className="text-sm text-red-600">
            Focus warnings: {focusWarnings} | Tab switches: {tabSwitches}
          </p>
          <button
            onClick={() => window.focus()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Exam
          </button>
        </div>
      </div>
    );
  }

  // Test completion screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white border-2 border-green-500 rounded-lg p-8 text-center shadow-lg max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Exam Submitted Successfully!
          </h2>
          <div className="text-gray-700 space-y-2">
            <p>Total Questions: {totalQuestions}</p>
            <p>Answered: {Object.keys(answers).length}</p>
            <p>Time Spent: {formatTime(3600 - timeLeft)}</p>
            <p>Tab Switches: {tabSwitches}</p>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test instructions
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Exam Instructions
          </h1>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <p>Time limit: 60 minutes</p>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-1" />
              <p>
                Keep this window in focus at all times. Tab switching is
                monitored.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
              <p>Right-click and keyboard shortcuts are disabled.</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              Test Structure:
            </h3>
            <ul className="text-blue-700 space-y-1">
              <li>• English </li>
              <li>• Analytical ability</li>
              <li>• Quantitative </li>
            </ul>
          </div>

          <button
            onClick={startTest}
            className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // Main exam interface
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-2 mb-2">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {currentSubQuestion?.sectionName}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              Question {currentSubQuestionIndex + 1} of {totalQuestions}
            </div>
            <div
              className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Warning indicators */}
      {(tabSwitches > 0 || suspiciousActivity > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">
              Monitoring: {tabSwitches} tab switches, {suspiciousActivity}{' '}
              suspicious activities
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm p-6">
            {currentSubQuestion && (
              <>
                {/* Question content/passage */}
                {currentSubQuestion.questionContent &&
                  currentSubQuestion.questionContent.length > 0 && (
                    <div className="mb-2 p-4 bg-gray-50 rounded border">
                      {currentSubQuestion.questionContent.map((item, idx) => (
                        <div key={idx} className="mb-3 last:mb-0">
                          {item.type === 'text' ? (
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {item.value}
                            </div>
                          ) : item.type === 'image' ? (
                            <div className="text-center">
                              <Image
                                src={item.value}
                                alt={`Question content ${idx + 1}`}
                                width={800} // set a large intrinsic width
                                height={600} // set a large intrinsic height
                                className="max-w-full h-auto mx-auto rounded shadow-sm"
                                quality={100} // maximum quality
                                priority // prevents lazy loading blur
                                unoptimized // disables Next.js automatic optimization
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded p-4 text-red-700">
        <strong>Image failed to load:</strong><br>
        <span class="text-sm font-mono">${item.value}</span>
      </div>
    `;
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Display hardness level */}
                {currentSubQuestion.hardness && (
                  <div
                    className={`mb-4 inline-block px-4 py-1 text-xs font-semibold text-white rounded-full ${
                      {
                        easy: 'bg-green-500',
                        medium: 'bg-yellow-500',
                        hard: 'bg-red-500',
                      }[currentSubQuestion.hardness] || 'bg-gray-500'
                    }`}
                  >
                    {currentSubQuestion.hardness.charAt(0).toUpperCase() +
                      currentSubQuestion.hardness.slice(1)}
                  </div>
                )}

                {/* Current sub-question */}
                <div className="mb-6">
                  <div className="mb-4">
                    {currentSubQuestion.content.map((item, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        {item.type === 'text' ? (
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.value}
                          </h3>
                        ) : item.type === 'image' ? (
                          <div className="text-center mb-4">
                            <Image
                              width={800} // set a large intrinsic width
                              height={600} // set a large intrinsic height
                              className="max-w-full h-auto mx-auto rounded shadow-sm"
                              quality={100} // maximum quality
                              src={item.value}
                              alt={`Question ${currentSubQuestion.id}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `
                      <div class="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                        <strong>Image failed to load:</strong><br>
                        <span class="text-sm font-mono">${item.value}</span>
                      </div>
                    `;
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {currentSubQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                          answers[currentSubQuestion.id] === option
                            ? 'bg-blue-50 border-blue-500 text-blue-900'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentSubQuestionIndex === 0}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {currentSubQuestionIndex === totalQuestions - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Question Navigator */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold mb-4">Question Navigator</h3>
            <div className="grid grid-cols-4 gap-2">
              {allSubQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSubQuestionIndex(idx)}
                  className={`w-8 h-8 text-xs rounded ${
                    idx === currentSubQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[allSubQuestions[idx].id]
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
              <div>Answered: {Object.keys(answers).length}</div>
              <div>
                Remaining: {totalQuestions - Object.keys(answers).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
