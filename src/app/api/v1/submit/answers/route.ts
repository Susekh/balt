import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../../services/token-validation-service';
import { baselineAnswersV2 as baselineAnswers } from '@/misc/baselineQuestionsV2';

interface RequestBody {
  answers: Record<string, string | null>; // submitted answers
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
      return NextResponse.redirect(new URL('/', request.url)); // redirect if no token
    }

    // 🔹 Validate token
    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL('/', request.url)); // redirect if invalid
    }

    // @ts-expect-error: id exists in payload
    const id: string = tokenData.payload.id;

    // 🔹 Parse submitted answers
    const body: RequestBody = await request.json();
    const { answers } = body;

    // 🔹 Fetch user from Redis
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    }
    const parsedUser = JSON.parse(userData) as {
      name: string;
      collegeName: string;
      branch: string;
      answers?: Record<string, string | null>; // previous answers if any
      [key: string]: unknown;
    };

    // 🔹 Compare submitted answers with baselineAnswers and calculate scores
    let finalScore = 0; // Count of correct answers
    let finalMarks = 0; // Score with negative marking
    const sectionScores: Record<string, number> = {
      English: 0,
      'Analytical Ability': 0,
      'Quantitative Ability': 0,
    };

    // Section mapping for each question id prefix
    const sectionMap: Record<string, string> = {
      e: 'English',
      a: 'Analytical Ability',
      q: 'Quantitative Ability',
    };

    for (const qid in answers) {
      const submitted = answers[qid];
      const correct = baselineAnswers[qid];
      if (submitted !== null) {
        if (submitted === correct) {
          finalScore++;
          finalMarks++; // correct answer adds 1
          // identify section based on question id prefix
          const prefix = qid.charAt(0) as keyof typeof sectionMap;
          const section = sectionMap[prefix];
          if (section) {
            sectionScores[section]++;
          }
        } else {
          finalMarks -= 0.25; // wrong answer deducts 0.25
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
      finalScore, // same as old score
      submittedAt,
    };

    await redis.set(`student:${id}`, JSON.stringify(updatedUserData));

    // 🔹 Store result separately by date
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const resultKey = `results:${dateKey}`;

    const resultData = {
      id,
      regNo : parsedUser.regNo,
      name: parsedUser.name,
      email: parsedUser.email,
      collegeName: parsedUser.collegeName,
      branch: parsedUser.branch,
      contactNo: parsedUser.contactNo,
      sectionScores,
      totalScore,
      finalScore,
      finalMarks,
      submittedAt,
    };

    // Save in a Redis list for that date
    await redis.rpush(resultKey, JSON.stringify(resultData));

    // 🔹 Respond and clear cookie
    const response = NextResponse.json(
      { message: 'Exam successfully submitted', finalScore },
      { status: 200 },
    );
    response.cookies.delete('auth-token');

    return response;
  } catch (err) {
    console.error('::api/submit-answers::', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
