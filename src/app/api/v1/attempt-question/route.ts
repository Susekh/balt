import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { baselineAnswersV3 as baselineAnswers } from "@/misc/baselineQuestionsV3";

interface AttemptBody {
  qid: string;
  answer: string | null;
  question?: string | null;
  subQuestion?: string | null;
  timeRemaining: number;
}

type AttemptRecord = {
  qid: string;
  answer: string | null;
  correct: boolean | null;
  correctAnswer: string | null;
  question?: string | null;
  subQuestion?: string | null;
  timeRemaining: number;
  attemptedAt: string;
};

/** Helper: safely decode JSON cookie */
function parseJsonCookie<T>(cookieValue: string | undefined): T | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as T;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;

    // Extract User Session Cookie: email
    const session = parseJsonCookie<{ email?: string }>(
      cookies.get("user-session")?.value
    );

    const email = session?.email ?? null;
    if (!email) {
      return NextResponse.json(
        { message: "Invalid or missing user-session cookie (email not found)" },
        { status: 400 }
      );
    }

    // Test Identification Cookie
    const parsedTest = parseJsonCookie<{ id: string; title: string; duration: string }>(
      cookies.get("active_test")?.value
    );

    if (!parsedTest) {
      return NextResponse.json(
        { message: "Missing or invalid active_test cookie" },
        { status: 400 }
      );
    }

    // Parse Body
    const { qid, answer, question, subQuestion, timeRemaining }: AttemptBody =
      await request.json();

    if (!qid) {
      return NextResponse.json(
        { message: "qid is required in body" },
        { status: 400 }
      );
    }

    // Validate correctness
    const normalizedAnswer = answer?.trim() || null;
    const correctAnswer = baselineAnswers[qid] || null;
    const correct =
      normalizedAnswer !== null ? normalizedAnswer === correctAnswer : null;

    const redisKey = `attempts:${email}:${parsedTest.id}`;

    const attempt: AttemptRecord = {
      qid,
      answer: normalizedAnswer,
      correct,
      correctAnswer,
      question: question ?? null,
      subQuestion: subQuestion ?? null,
      timeRemaining,
      attemptedAt: new Date().toISOString(),
    };

    // Fetch attempts from Redis
    const attempts = await redis.lrange(redisKey, 0, -1);
    let updated = false;

    for (let i = 0; i < attempts.length; i++) {
      const existing = JSON.parse(attempts[i]) as AttemptRecord;
      if (existing.qid === qid) {
        await redis.lset(redisKey, i, JSON.stringify(attempt));
        updated = true;
        break;
      }
    }

    // If not found, insert new attempt
    if (!updated) {
      await redis.rpush(redisKey, JSON.stringify(attempt));
    }

    return NextResponse.json({
      message: updated ? "Attempt updated" : "Attempt saved",
      attempt,
    });
  } catch (err) {
    console.error(":: api/attempt-question ::", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
