import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import { tokenValidation } from '../../../../services/token-validation-service';
import { redis } from '@/lib/redis';

// const prisma = new PrismaClient();

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

interface Answer {
  questions: Question,
  time_elapsed: number,
  timeRemaining: number,
  countKeysPressed: number
}

interface RequestBody {
  testId: number;
  answers: Answer;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Token unavailable' },
        { status: 403 },
      );
    }

    const tokenData = await tokenValidation(token);

    if (!tokenData?.success) {
      return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
    }

    // @ts-expect-error: id exists in payload
    const id: number = tokenData.payload.id;
    const body: RequestBody = await request.json();
    const { testId, answers } = body;
    const examUserId = id.toString() + testId.toString();

    const existingData = await redis.get(examUserId);
    if (!existingData) {
      return NextResponse.json(
        { message: 'No existing exam found' },
        { status: 404 },
      );
    }

    const parsed = JSON.parse(existingData);

    const updatedData = {
      ...parsed,
      questions: answers.questions,
      time_elapsed: answers.time_elapsed ?? parsed.time_elapsed,
      timeRemaining: answers.timeRemaining ?? parsed.timeRemaining,
      countKeysPressed: answers.countKeysPressed ?? parsed.countKeysPressed,
    };

    await redis.set(examUserId, JSON.stringify(updatedData));

    return NextResponse.json(
      { message: 'Saved successfully' },
      { status: 200 },
    );
  } catch (err) {
    console.log('::api/user-exam-response:: ', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
