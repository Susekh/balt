import { NextRequest, NextResponse } from 'next/server';
import { tokenValidation } from '../../../../services/token-validation-service';
// import { PrismaClient } from '@prisma/client';
import { redis } from '@/lib/redis';
import { OSDICQuestions } from '@/misc/OSDICQuestions';
import { OSDICAnswers } from '@/misc/OSDICAnswers';

// const prisma = new PrismaClient();

// type RawRow = {
//   result: Result;
// };

// type Result = {
//   duration: number;
//   questions: QuestionGroup[];
// };

// type Option = {
//   option_id: number;
//   text: string;
// };

// type QuestionGroup = {
//   question_id: number;
//   question: string;
//   options: Option[];
// };

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  const searchParams = request.nextUrl.searchParams;
  

  if (!token) {
    return NextResponse.json({ message: 'Token unavailable' }, { status: 403 });
  }

  const tokenData = await tokenValidation(token);

  if (!tokenData?.success) {
    return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
  }
  try {
    //@ts-expect-error: id exists in payload
    const id: number = tokenData.payload.id;
    const examId = searchParams.get('examId');

    if (!examId)
      return NextResponse.json(
        { message: 'Provide essential data' },
        { status: 404 },
      );

    const examUserId = id.toString() + examId.toString();

    const cachedData = await redis.get(examUserId);

    if (cachedData !== null) {
      const parsedCachedData = JSON.parse(cachedData);
      console.log('sent cached data');
      console.log(parsedCachedData)
      if(parsedCachedData.isFinalSubmit){
        return NextResponse.json(
          {
            data: ''
          },
          {
            status: 408
          }
        )
      }
      return NextResponse.json(
        {
          questions: parsedCachedData.questions,
          duration: parsedCachedData.duration,
          timeElapsed: parsedCachedData.time_elapsed,
          timeRemaining: parsedCachedData.timeRemaining,
          keysPressed: parsedCachedData.countKeysPressed,
        },
        { status: 200 },
      );
    }
    const questions = [...OSDICQuestions.questions];

    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    const randomizedQuestions = questions.map((q, index) => ({
      slNo: index + 1,
      ...q,
    }));

    await redis.set(
      examUserId,
      JSON.stringify({
        questions: randomizedQuestions,
        conf: OSDICAnswers,
        duration: 30,
        exam_status: 0,
        time_elapsed: null,
        timeRemaining: 30,
        countKeysPressed: 0,
      }),
    );

    const examData = await redis.get(examUserId);

    if (examData === null) return;

    const parsedExamData = JSON.parse(examData);

    return NextResponse.json(
      {
        questions: parsedExamData.questions,
        duration: parsedExamData.duration,
        timeElapsed: parsedExamData.time_elapsed,
        timeRemaining: parsedExamData.timeRemaining,
        keysPressed: parsedExamData.countKeysPressed,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('::api/get-questions-by-id::', err);
    return NextResponse.json(
      { message: 'Something Went Wrong ' },
      { status: 500 },
    );
  }
}
