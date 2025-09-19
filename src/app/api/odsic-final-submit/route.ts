import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../services/token-validation-service';
import { emailSender } from '../../../../services/email-sender-service';

interface RequestBody {
  testId: number;
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

    //@ts-expect-error: id exists in payload
    const id: string = tokenData.payload.id;
    const body: RequestBody = await request.json();
    const { testId } = body;
    const examUserId = id + testId.toString();
    const userData = await redis.get(`student:${id}`);

    if (!userData)
      return NextResponse.json({ message: 'No user found' }, { status: 404 });
    const parsedData = JSON.parse(userData);

    const examData = await redis.get(examUserId);

    if (!examData)
      return NextResponse.json({ message: 'No data found' }, { status: 404 });

    const parsedExamData = JSON.parse(examData);
    const eData = {
      ...parsedExamData,
      isFinalSubmit: true,
    };

    let score = 0;

    for (const question of parsedExamData.questions) {
      const correctOptionId = parsedExamData.conf[question.question_id];
      if (
        question.answeredOption !== null &&
        question.answeredOption === correctOptionId
      ) {
        score++;
      }
    }

    const data = {
      ...parsedData,
      isFinalSubmit: true,
      score,
    };
    const emailPromise = emailSender(id, parsedData.name, parsedData.collegeName, parsedData.branch)
    await Promise.all([
      await redis.set(`student:${id}`, JSON.stringify(data)),
      await redis.set(examUserId, JSON.stringify(eData)),
    ])
    let emaiSuccess = await emailPromise
    let retryCount = 0

    while(emaiSuccess === '2' && retryCount < 2){
      console.log('Email sending failed retry attempt ', retryCount)
      emaiSuccess = await emailSender(id, parsedData.name, parsedData.collegeName, parsedData.branch)
      retryCount++
    }

    if(emaiSuccess === '2')
    {
      console.error(`Failed to send email after ${retryCount} attempts for user: ${id}`)
    }

    const response = NextResponse.json(
      { message: 'Exam successfully submitted' },
      { status: 200 },
    )
    response.cookies.delete('auth-token')
    return response
  } catch (err) {
    console.log('::api/odsic-final-submit:: ', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
