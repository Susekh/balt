'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  User as UserIcon,
  CheckCircle2,
  Ban,
  AlarmClock,
  Clock,
  Mail,
  Hash,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type TestMeta = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  duration: string;
  active: boolean;
};

type User = {
  uid: string;
  name: string;
  email: string;
  regNo: string;
  branch?: string;
  completedTests?: string[];
  contactNo?: string;
  collegeName?: string;
  semester?: string;
  totalScore?: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [testMeta, setTestMeta] = useState<TestMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

const handleLogout = async () => {
  try {
    // Call server-side logout API to remove cookies
    const res = await fetch("/api/v1/baseline-logout", { method: "POST" });
    if (!res.ok) throw new Error("Logout failed");

    // Redirect to root after successful logout
    router.push("/");
  } catch (error) {
    console.error("Failed to logout:", error);
  }
};


  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/v1/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setTestMeta(data.questionList || []);
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function handleTestClick(test: TestMeta, isCompleted: boolean) {
    try {
      Cookies.set(
        'active_test',
        JSON.stringify({
          id: test.id,
          title: test.title,
          duration: test.duration,
          date: test.date,
        }),
        {
          expires: 1,
          secure: true,
          sameSite: 'strict',
        },
      );

      if (isCompleted) {
        router.push('/baseline/answers');
      } else {
        router.push('/welcome');
      }
    } catch (error) {
      console.error('Failed to set test cookie:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-2xl p-8 max-w-md">
          <p className="text-red-700 dark:text-red-400 font-semibold text-lg text-center">
            Unauthorized — Please login to continue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2 md:space-y-0 md:flex-row">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back, {user.name.split(' ')[0]}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* USER CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="font-semibold text-xl text-white">
                Profile Information
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Registration Number
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.regNo}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* {user.collegeName && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      College
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user.collegeName}
                    </p>
                  </div>
                </div>
              )} */}

              {user.semester && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Semester
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user.semester}
                    </p>
                  </div>
                </div>
              )}

              {/* {user.completedTests && user.completedTests.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:col-span-2">
                  <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Completed Tests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.completedTests.map((testId) => (
                        <span key={testId} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {testId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* TEST LIST */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-700 p-2 rounded-lg">
              <AlarmClock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Aptitude Tests
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testMeta.length > 0 ? (
              testMeta.map((test) => {
                const isCompleted = user?.completedTests?.includes(test.id);
                return (
                  <div
                    key={test.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                      test.active
                        ? 'border-indigo-200 dark:border-indigo-800'
                        : 'border-slate-200 dark:border-slate-800'
                    } ${isCompleted ? 'ring-2 ring-emerald-500 dark:ring-emerald-600' : ''}`}
                  >
                    <div
                      className={`px-6 py-4 ${test.active ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                    >
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {test.title}
                      </h3>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{test.duration}</span>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-4 w-4" />
                            Completed
                          </span>
                        ) : test.active ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            <CheckCircle2 className="h-4 w-4" />
                            Active Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Ban className="h-4 w-4" />
                            Not Active
                          </span>
                        )}
                      </div>

                      <button
                        disabled={!test.active && !isCompleted}
                        onClick={() =>
                          handleTestClick(test, isCompleted ?? false)
                        }
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isCompleted || test.active
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm hover:shadow-md'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted
                          ? 'View Results'
                          : test.active
                            ? 'Start Test'
                            : 'Not Available'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <AlarmClock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  No tests available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
