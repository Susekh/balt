// app/api/v1/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../services/token-validation-service';

interface Attempt {
  qid: string;
  answer: string | null;
  section: string;
  questionNo: number;
  correct: boolean;
  correctAnswer: string;
  timeRemaining: number;
  attemptedAt: string;
  regNo: string;
}

interface SectionReport {
  section: string;
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  marks: number;
}

interface Report {
  email: string;
  name: string;
  branch: string;
  date: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  marks: number;
  sectionReports: SectionReport[];
  attempts: Attempt[];
  regNo: string;
  lastSubmittedAt: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const tokenData = await tokenValidation(token);
    if (
      !tokenData?.success ||
      !tokenData.payload?.id ||
      tokenData.payload.role !== 'admin'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date)
      return NextResponse.json(
        { message: 'Date parameter is required' },
        { status: 400 },
      );

    const resultKey = `results:${date}`;
    const results = await redis.lrange(resultKey, 0, -1);
    if (!results.length)
      return NextResponse.json(
        { message: 'No results found', data: [] },
        { status: 200 },
      );
    let lastSubmittedAt: string | null = null;

    const parsedResults = results.map((r) => JSON.parse(r));
    const reports: Report[] = [];

    for (const entry of parsedResults) {
      const email: string = entry.email;
      lastSubmittedAt = entry.submittedAt
        ? new Date(entry.submittedAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, 
          })
        : null;

      const name: string = entry.name ?? 'Unknown';
      const branch: string = entry.branch ?? 'Unknown';

      const attemptsKey = `attempts:${email}:${date}`;
      const attemptsData = await redis.lrange(attemptsKey, 0, -1);
      if (!attemptsData.length) continue;

      const parsedAttempts: Attempt[] = attemptsData.map((a) => JSON.parse(a));

      console.log("parsed attempts : :", parsedAttempts);
      

      // Section-wise aggregation
      const sectionMap: Record<string, SectionReport> = {};
      parsedAttempts.forEach((a) => {
        if (!sectionMap[a.section]) {
          sectionMap[a.section] = {
            section: a.section,
            attemptedQuestions: 0,
            correctQuestions: 0,
            wrongQuestions: 0,
            marks: 0,
          };
        }
        const sec = sectionMap[a.section];
        if (a.answer !== null) {
          sec.attemptedQuestions += 1;
          if (a.correct) sec.correctQuestions += 1;
          else sec.wrongQuestions += 1;
        }
      });

      Object.values(sectionMap).forEach((sec) => {
        sec.marks = sec.correctQuestions * 1 - sec.wrongQuestions * 0.25;
      });
      const attemptedQuestions = parsedAttempts.filter(
        (a) => a.answer !== null,
      ).length;
      const correctQuestions = parsedAttempts.filter((a) => a.correct).length;
      const wrongQuestions = attemptedQuestions - correctQuestions;
      const marks = correctQuestions * 1 - wrongQuestions * 0.25;

      const regNo = parsedAttempts[0]?.regNo ?? 'Unknown';

      // // 🔹 Get last submitted info
      // const lastResultKey = `student:${regNo}`;
      // const lastResultData = await redis.get(lastResultKey);
      // if (lastResultData) {
      //   const parsedUser = JSON.parse(lastResultData);
      //   if (parsedUser.isFinalSubmit) lastSubmittedAt = parsedUser.submittedAt ?? null;
      //   console.log("user submitted at", parsedUser.submittedAt);
      // }

      reports.push({
        email,
        name,
        branch,
        date,
        totalQuestions : 52,
        attemptedQuestions,
        correctQuestions,
        wrongQuestions,
        marks,
        sectionReports: Object.values(sectionMap),
        attempts: parsedAttempts,
        regNo,
        lastSubmittedAt,
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
