import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../../services/token-validation-service';
import { questionList } from '@/misc/questionList';

interface RequestBody {
  answers: Record<string, string | null>;
  timeSpent: string | number;
  tabSwitches: number;
  suspiciousActivity?: number;
  focusWarnings?: number;
  submittedAt?: string;
  totalQuestions?: number;
  answeredQuestions?: number;
}

interface ParsedUser {
  name: string;
  collegeName: string;
  branch: string;
  regNo?: string;
  contactNo?: string;
  email?: string;
  answers?: Record<string, string | null>;
  completedTests?: string[]; // Array of completed test IDs
  testResults?: Record<string, TestResult>; // Results per test ID
  [key: string]: unknown;
}

interface TestResult {
  testId: string;
  testTitle: string;
  finalScore: number;
  finalMarks: number;
  totalScore: number;
  totalAttempted: number;
  sectionScores: Record<string, number>;
  attemptedPerSection: Record<string, number>;
  timeSpent: string | number;
  tabSwitches: number;
  suspiciousActivity?: number;
  focusWarnings?: number;
  submittedAt: string;
  answers: Record<string, string | null>;
}

interface ActiveTest {
  id: string;
  title: string;
  duration: string;
}

interface SubQuestion {
  id: string;
  correctAnswer: string;
  marks?: number;
}

interface Question {
  id: string;
  subQuestions: SubQuestion[];
}

interface Section {
  section: string;
  questions: Question[];
}

// 🔹 Dynamic scoring logic based on test's correct answers
function calculateScores(
  answers: Record<string, string | null>,
  correctAnswers: Record<string, string>,
  sectionMap: Record<string, string>
) {
  let finalScore = 0;
  let finalMarks = 0;
  const sectionScores: Record<string, number> = {};
  const attemptedPerSection: Record<string, number> = {};
  let totalAttempted = 0;

  for (const qid in answers) {
    const submitted = answers[qid];
    if (submitted !== null && submitted !== undefined && submitted !== '') {
      totalAttempted++;

      // Extract section prefix (e.g., "s1" from "s1-q1-sq1")
      const sectionKey = qid.split('-')[0];
      const sectionName = sectionMap[sectionKey] || sectionKey;

      sectionScores[sectionName] ??= 0;
      attemptedPerSection[sectionName] ??= 0;
      attemptedPerSection[sectionName]++;

      if (submitted === correctAnswers[qid]) {
        finalScore++;
        finalMarks += 1; // You can make this dynamic based on marks per question
        sectionScores[sectionName]++;
      } else {
        finalMarks -= 0.25; // Negative marking
      }
    }
  }

  return { finalScore, finalMarks, sectionScores, attemptedPerSection, totalAttempted };
}

// 🔹 Extract correct answers and section mapping from questions
function extractAnswersAndSections(questions: Section[]) {
  const correctAnswers: Record<string, string> = {};
  const sectionMap: Record<string, string> = {};

  questions.forEach((section, sectionIndex) => {
    const sectionPrefix = `s${sectionIndex + 1}`;
    sectionMap[sectionPrefix] = section.section || `Section ${sectionIndex + 1}`;

    // Ensure questions exist
    const sectionQuestions = Array.isArray(section.questions) ? section.questions : [];

    sectionQuestions.forEach((question, questionIndex) => {
      const subQuestions = Array.isArray(question.subQuestions) ? question.subQuestions : [];
      subQuestions.forEach((subQ, subQIndex) => {
        const qid = `${sectionPrefix}-q${questionIndex + 1}-sq${subQIndex + 1}`;
        correctAnswers[qid] = subQ.correctAnswer;
      });
    });
  });

  return { correctAnswers, sectionMap };
}


export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from cookie
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
    }

    // Validate token
    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.json({ success: false, msg: 'Invalid token' }, { status: 401 });
    }
    // @ts-expect-error: id exists in payload
    const userId: string = tokenData.payload.id;

    // 🔹 Extract active_test from cookies
    const activeTestCookie = authHeader
      ?.split(';')
      .find((c) => c.trim().startsWith('active_test='))
      ?.split('=')[1];

    if (!activeTestCookie) {
      return NextResponse.json(
        { success: false, msg: 'No active test found' },
        { status: 404 }
      );
    }

    let activeTest: ActiveTest;
    try {
      activeTest = JSON.parse(decodeURIComponent(activeTestCookie));
    } catch (err) {
      console.error('❌ Failed to parse active_test:', err);
      return NextResponse.json(
        { success: false, msg: 'Invalid test cookie' },
        { status: 400 }
      );
    }

    console.log('📝 Active Test:', activeTest);

    // 🔹 Find test definition
    const testInfo = questionList.find((t) => t.id === activeTest.id);
    if (!testInfo) {
      return NextResponse.json(
        { success: false, msg: 'Test not found' },
        { status: 404 }
      );
    }

    // 🔹 Load questions dynamically
    let questions: Section[];
    try {
      const cleanPath = testInfo.questionSource.replace(/\.(ts|tsx|js|jsx)$/, '');
      const questionsModule = await import(`@/misc/${cleanPath}`);
      const rawQuestions = questionsModule.default || questionsModule.questions || questionsModule;

      if (!Array.isArray(rawQuestions)) {
        throw new Error('Invalid question format');
      }

      questions = rawQuestions as Section[];
      console.log('✅ Questions loaded:', questions.length, 'sections');
    } catch (importErr) {
      console.error('❌ Failed to import questions:', importErr);
      return NextResponse.json(
        { success: false, msg: 'Failed to load test questions' },
        { status: 500 }
      );
    }

    // 🔹 Extract correct answers and section mapping
    const { correctAnswers, sectionMap } = extractAnswersAndSections(questions);
    console.log('✅ Extracted', Object.keys(correctAnswers).length, 'correct answers');

    // Parse body
    const body: RequestBody = await request.json();
    const { answers, timeSpent, tabSwitches, suspiciousActivity, focusWarnings } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, msg: 'No answers submitted' }, { status: 400 });
    }

    // Fetch user from Redis
    const userData = await redis.get(`student:${userId}`);
    if (!userData) {
      return NextResponse.json({ success: false, msg: 'User not found' }, { status: 404 });
    }

    const parsedUser = JSON.parse(userData) as ParsedUser;

    // 🔹 Check if user has already completed this test
    const completedTests = parsedUser.completedTests || [];
    if (completedTests.includes(activeTest.id)) {
      return NextResponse.json(
        { success: false, msg: 'Test already submitted' },
        { status: 403 }
      );
    }

    // Calculate scores dynamically
    const { finalScore, finalMarks, sectionScores, attemptedPerSection, totalAttempted } =
      calculateScores(answers, correctAnswers, sectionMap);

    const totalScore = Object.keys(correctAnswers).length;
    const submittedAt = new Date().toISOString();

    // 🔹 Prepare test result
    const testResult: TestResult = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      finalScore,
      finalMarks,
      totalScore,
      totalAttempted,
      sectionScores,
      attemptedPerSection,
      timeSpent,
      tabSwitches: Math.max(0, tabSwitches - 1),
      suspiciousActivity,
      focusWarnings,
      submittedAt,
      answers,
    };

    // 🔹 Update user data
    const updatedUserData = {
      ...parsedUser,
      completedTests: [...completedTests, activeTest.id],
      testResults: {
        ...(parsedUser.testResults || {}),
        [activeTest.id]: testResult,
      },
    };

    await redis.set(`student:${userId}`, JSON.stringify(updatedUserData));
    console.log('✅ User data updated with test result');

    // 🔹 Save to results list by date
    const dateKey = new Date().toISOString().split('T')[0];
    const resultKey = `results:${dateKey}`;

    const resultData = {
      userId,
      testId: activeTest.id,
      testTitle: activeTest.title,
      regNo: parsedUser.regNo,
      name: parsedUser.name,
      email: parsedUser.email,
      collegeName: parsedUser.collegeName,
      branch: parsedUser.branch,
      contactNo: parsedUser.contactNo,
      sectionScores,
      attemptedPerSection,
      totalAttempted,
      totalScore,
      finalScore,
      finalMarks,
      tabSwitches: Math.max(0, tabSwitches - 1),
      submittedAt,
    };

    await redis.rpush(resultKey, JSON.stringify(resultData));
    console.log('✅ Result saved to daily results list');

    // 🔹 Response
    const responseData = {
      success: true,
      message: 'Exam successfully submitted',
      testId: activeTest.id,
      testTitle: activeTest.title,
      finalScore,
      finalMarks,
      totalScore,
      totalAttempted,
      sectionScores,
      sectionMap,
    };

    const response = NextResponse.json(responseData, { status: 200 });
    
    // 🔹 Clear active_test cookie after submission
    response.cookies.delete('active_test');
    
    return response;
  } catch (err) {
    console.error('::api/submit-answers::', err);
    return NextResponse.json(
      { success: false, msg: 'Internal server error' },
      { status: 500 }
    );
  }
}