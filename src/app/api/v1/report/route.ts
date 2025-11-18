// app/api/v1/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../services/token-validation-service';
import { questionList } from '@/misc/questionList';

interface Attempt {
  qid: string;
  answer: string | null;
  correct: boolean | null;
  correctAnswer: string | null;
  question?: string | null;
  subQuestion?: string | null;
  timeRemaining: number;
  attemptedAt: string;
}

interface Sections {
  verbal: string[];
  analytical: string[];
  numerical: string[];
}

interface Report {
  email: string;
  name: string;
  testId: string;
  testTitle: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  regNo: string;
  branch : string;
  sections: Sections;
  wrongQuestions: number;
  marks: number;
  attempts: Attempt[];
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token=')) 
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = await tokenValidation(token);
    if (
      !tokenData?.success ||
      !tokenData.payload?.id ||
      tokenData.payload.role !== 'admin'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { message: 'testId parameter is required' },
        { status: 400 },
      );
    }

    // Get all users who attempted the test
    const pattern = `attempts:*:${testId}`;
    const keys = await redis.keys(pattern);

    if (!keys.length) {
      return NextResponse.json(
        { message: 'No results found', data: [] },
        { status: 200 },
      );
    }

    const reports: Report[] = [];

    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length !== 3) continue;

      const email = parts[1];

      // Fetch user details
      const userKey = `student:${email}`;
      const userData = await redis.get(userKey);

      let name = 'Unknown';
      let regNo = '';
      let branch = '';

      if (userData) {
        const parsedUser = JSON.parse(userData);
        name = parsedUser.name || parsedUser.username || 'Unknown';
        regNo = parsedUser.regNo;
        branch = parsedUser.branch;
      }

      // Fetch attempts
      const attemptsData = await redis.lrange(key, 0, -1);
      if (!attemptsData.length) continue;

      const parsedAttempts: Attempt[] = attemptsData.map((a) => JSON.parse(a));

      // Calculate stats
      const attemptedQuestions = parsedAttempts.filter((a) => a.answer !== null)
        .length;

      const correctQuestions = parsedAttempts.filter((a) => a.correct === true)
        .length;

      const wrongQuestions = parsedAttempts.filter(
        (a) => a.answer !== null && a.correct === false,
      ).length;

      const marks = correctQuestions * 1 - wrongQuestions * 0.25;

      const test = questionList.find((e) => e.id === testId);

      // FIXED SECTION GROUPING
      const sectionWise: Sections = {
        verbal: parsedAttempts
          .filter((a) => a.qid.startsWith('s1'))
          .map((a) => a.qid),

        analytical: parsedAttempts
          .filter((a) => a.qid.startsWith('s2'))
          .map((a) => a.qid),

        numerical: parsedAttempts
          .filter((a) => a.qid.startsWith('s3'))
          .map((a) => a.qid),
      };

      // Build report entry
      reports.push({
        email,
        name,
        testId,
        testTitle: test?.title || "Unknown Test",
        totalQuestions: parsedAttempts.length,
        attemptedQuestions,
        regNo,
        branch,
        correctQuestions,
        wrongQuestions,
        marks,
        attempts: parsedAttempts,
        sections: sectionWise,
      });
    }

    return NextResponse.json({ data: reports }, { status: 200 });
  } catch (err) {
    console.error('::api/admin/reports::', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
