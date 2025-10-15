import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../services/token-validation-service';
import { baselineAnswersV3 as baselineAnswers } from '@/misc/baselineQuestionsV3';

interface AttemptBody {
  qid: string;
  answer: string | null;
  timeRemaining: number;
}

// 🔹 Section mapping
// const sectionMap: Record<string, string> = {
//   e: "English",
//   a: "Analytical Ability",
//   q: "Quantitative Ability",
// };

const sectionMap: Record<string, string> = {
  s1: 'Verbal Ability',
  s2: 'Analytical & Numerical Ability',
  s3: 'General Mental Ability',
};

// 🔹 Precompute sequential numbering for each section
// const questionNumberMap: Record<string, number> = (() => {
//   const map: Record<string, number> = {};
//   const counters: Record<string, number> = { e: 1, a: 1, q: 1 };

//   for (const qid of Object.keys(baselineAnswers)) {
//     const prefix = qid.charAt(0); // e / a / q
//     if (counters[prefix] !== undefined) {
//       map[qid] = counters[prefix]++;
//     }
//   }
//   return map;
// })();

const questionNumberMap: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  const counters: Record<string, number> = { s1: 1, s2: 1, s3: 1 };

  for (const qid of Object.keys(baselineAnswers)) {
    const prefix = qid.split('-')[0]; // s1 / s2 / s3
    if (counters[prefix] !== undefined) {
      map[qid] = counters[prefix]++;
    }
  }
  return map;
})();

export async function POST(request: NextRequest) {
  try {
    // 🔹 Auth
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) return NextResponse.redirect(new URL('/', request.url));

    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // @ts-expect-error id exists
    const id: string = tokenData.payload.id;

    // 🔹 Get student data (for email)
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const parsedUser = JSON.parse(userData) as { email: string; regNo: string };

    // 🔹 Parse body
    const { qid, answer, timeRemaining }: AttemptBody = await request.json();
    if (!qid) {
      return NextResponse.json({ message: 'qid required' }, { status: 400 });
    };

    const prefix = qid.charAt(0) + qid.charAt(1);
    
    const section = sectionMap[prefix] || 'section';
    const questionNo = questionNumberMap[qid] || 0;

    // 🔹 Correctness
    // const correct = answer !== null && baselineAnswers[qid] === answer;
    const normalizedAnswer = answer?.trim() || null;
    const correct =
      normalizedAnswer !== null && baselineAnswers[qid] === normalizedAnswer;

    // 🔹 Build attempt entry
    const attempt = {
      qid,
      section,
      questionNo,
      answer,
      correct,
      regNo: parsedUser.regNo,
      correctAnswer: baselineAnswers[qid],
      timeRemaining,
      attemptedAt: new Date().toISOString(),
    };

    console.log("attempt ::", attempt);
    
    // 🔹 Save/update separately by email + date
    const dateKey = new Date().toISOString().split('T')[0];
    const attemptsKey = `attempts:${parsedUser.email}:${dateKey}`;

    // Fetch existing attempts
    const attemptsRaw = await redis.lrange(attemptsKey, 0, -1);
    let updated = false;

    for (let i = 0; i < attemptsRaw.length; i++) {
      const existingAttempt = JSON.parse(attemptsRaw[i]) as typeof attempt;
      if (existingAttempt.qid === qid) {
        // Update this attempt
        await redis.lset(attemptsKey, i, JSON.stringify(attempt));
        updated = true;
        break;
      }
    }

    if (!updated) {
      // Push new attempt
      await redis.rpush(attemptsKey, JSON.stringify(attempt));
    }

    return NextResponse.json({
      message: updated ? 'Attempt updated' : 'Attempt saved',
      ...attempt,
    });
  } catch (err) {
    console.error('::api/attempt-question::', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
