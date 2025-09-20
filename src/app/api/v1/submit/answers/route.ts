import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../../services/token-validation-service';
import { baselineAnswersV2 as baselineAnswers } from '@/misc/baselineQuestionsV2';

interface RequestBody {
  answers: Record<string, string | null>; // submitted answers
  timeSpent : string,
  tabSwitches : number
}

export async function POST(request: NextRequest) {
  try {
    // 🔹 Extract JWT token from cookie
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 🔹 Validate token
    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // @ts-expect-error: id exists in payload
    const id: string = tokenData.payload.id;

    // 🔹 Parse submitted answers
    const body: RequestBody = await request.json();
    const { answers, timeSpent, tabSwitches } = body;

    // 🔹 Fetch user from Redis
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }
    const parsedUser = JSON.parse(userData) as {
      name: string;
      collegeName: string;
      branch: string;
      regNo?: string;
      contactNo?: string;
      answers?: Record<string, string | null>;
      [key: string]: unknown;
    };

    // 🔹 Initialize scoring
    let finalScore = 0; // Correct answers count
    let finalMarks = 0; // Score with negative marking
    const sectionScores: Record<string, number> = {
      English: 0,
      'Analytical Ability': 0,
      'Quantitative Ability': 0,
    };
    const attemptedPerSection: Record<string, number> = {
      English: 0,
      'Analytical Ability': 0,
      'Quantitative Ability': 0,
    };
    let totalAttempted = 0;

    const sectionMap: Record<string, string> = {
      e: 'English',
      a: 'Analytical Ability',
      q: 'Quantitative Ability',
    };

    for (const qid in answers) {
      const submitted = answers[qid];
      if (submitted !== null) {
        totalAttempted++; // Count this as attempted
        const prefix = qid.charAt(0) as keyof typeof sectionMap;
        const section = sectionMap[prefix];
        if (section) {
          attemptedPerSection[section]++; // Increment section-specific attempt count
        }

        if (submitted === baselineAnswers[qid]) {
          finalScore++;
          finalMarks++;
          if (section) {
            sectionScores[section]++;
          }
        } else {
          finalMarks -= 0.25;
        }
      }
    }

    const totalScore = 52;
    const submittedAt = new Date().toISOString();

    // 🔹 Update user data
    const updatedUserData = {
      ...parsedUser,
      answers,
      isFinalSubmit: true,
      sectionScores,
      totalScore,
      timeSpent,
      tabSwitches,
      finalScore,
      totalAttempted,
      attemptedPerSection,
      submittedAt,
    };
    await redis.set(`student:${id}`, JSON.stringify(updatedUserData));

    // 🔹 Store result separately by date
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
      attemptedPerSection,
      totalAttempted,
      totalScore,
      finalScore,
      finalMarks,
      submittedAt,
    };

    await redis.rpush(resultKey, JSON.stringify(resultData));

    // 🔹 Respond and clear cookie
    const response = NextResponse.json(
      { message: 'Exam successfully submitted', finalScore, totalAttempted, attemptedPerSection },
      { status: 200 },
    );
    response.cookies.delete('auth-token');

    return response;
  } catch (err) {
    console.error('::api/submit-answers::', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
