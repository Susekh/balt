import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../../services/token-validation-service';
import { baselineAnswersV3 as baselineAnswers } from '@/misc/baselineQuestionsV3';

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
  isFinalSubmit?: boolean;
  [key: string]: unknown;
}

// 🔹 Section mapping for s1, s2, s3
const sectionPrefixMap: Record<string, string> = {
  s1: 'Verbal Ability',
  s2: 'Analytical & Numerical Ability',
  s3: 'General Mental Ability',
};

// 🔹 Dynamic scoring logic (returns section key-based scores)
function calculateScores(answers: Record<string, string | null>) {
  let finalScore = 0;
  let finalMarks = 0;
  const sectionScores: Record<string, number> = {};
  const attemptedPerSection: Record<string, number> = {};
  let totalAttempted = 0;

  for (const qid in answers) {
    const submitted = answers[qid];
    if (submitted !== null) {
      totalAttempted++;

      const sectionKey = qid.split('-')[0]; // s1, s2, s3
      sectionScores[sectionKey] ??= 0;
      attemptedPerSection[sectionKey] ??= 0;
      attemptedPerSection[sectionKey]++;

      if (submitted === baselineAnswers[qid]) {
        finalScore++;
        finalMarks++;
        sectionScores[sectionKey]++;
      } else {
        finalMarks -= 0.25;
      }
    }
  }

  return { finalScore, finalMarks, sectionScores, attemptedPerSection, totalAttempted };
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
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Validate token
    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // @ts-expect-error: id exists in payload
    const id: string = tokenData.payload.id;

    // Parse body
    const body: RequestBody = await request.json();
    const { answers, timeSpent, tabSwitches, suspiciousActivity, focusWarnings } = body;

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ message: 'No answers submitted' }, { status: 400 });
    }

    // Fetch user from Redis
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }

    const parsedUser = JSON.parse(userData) as ParsedUser;

    // Prevent double submission
    if (parsedUser.isFinalSubmit) {
      return NextResponse.json({ message: 'Already submitted' }, { status: 403 });
    }

    // Merge old and new answers
    const mergedAnswers = { ...(parsedUser.answers || {}), ...answers };

    // Calculate scores dynamically
    const { finalScore, finalMarks, sectionScores, attemptedPerSection, totalAttempted } =
      calculateScores(mergedAnswers);

    const totalScore = Object.keys(baselineAnswers).length; // auto from baseline
    const submittedAt = new Date().toISOString();

    // Prepare result object
    const updatedUserData = {
      ...parsedUser,
      answers: mergedAnswers,
      isFinalSubmit: true,
      sectionScores,
      totalScore,
      timeSpent,
      finalScore,
      finalMarks,
      totalAttempted,
      attemptedPerSection,
      tabSwitches,
      suspiciousActivity,
      focusWarnings,
      submittedAt,
    };

    await redis.set(`student:${id}`, JSON.stringify(updatedUserData));

    // Save results list by date
    const dateKey = new Date().toISOString().split('T')[0];
    const resultKey = `results:${dateKey}`;

    const resultData = {
      id,
      regNo: parsedUser.regNo,
      name: parsedUser.name,
      email: parsedUser.email,
      collegeName: parsedUser.collegeName,
      branch: parsedUser.branch,
      contactNo: parsedUser.contactNo,
      sectionScores,
      tabSwitches,
      attemptedPerSection,
      totalAttempted,
      totalScore,
      finalScore,
      finalMarks,
      submittedAt,
    };

    await redis.rpush(resultKey, JSON.stringify(resultData));

    // Response formatting with section mapping
    const responseData = {
      message: 'Exam successfully submitted',
      finalScore,
      finalMarks,
      totalAttempted,
      sectionScores,
      sectionMap: sectionPrefixMap, // <- 🔹 added mapping for frontend clarity
    };

    const response = NextResponse.json(responseData, { status: 200 });
    response.cookies.delete('auth-token');
    return response;
  } catch (err) {
    console.error('::api/submit-answers::', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
