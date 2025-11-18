import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type AttemptRecord = {
  qid: string;
  answer: string | null;
  correct: boolean | null;
  question?: string | null;
  subQuestion?: string | null;
  timeRemaining: number;
  attemptedAt: string;
};

/** Safely decode JSON cookie */
function parseJsonCookie<T>(cookieValue: string | undefined): T | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as T;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;

    // Extract session, get email
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

    // Extract active test cookie
    const parsedTest = parseJsonCookie<{ id: string; title: string }>(
      cookies.get("active_test")?.value
    );

    if (!parsedTest?.id) {
      return NextResponse.json(
        { message: "Missing or invalid active_test cookie" },
        { status: 400 }
      );
    }

    const attemptsKey = `attempts:${email}:${parsedTest.id}`;
    const attempts = await redis.lrange(attemptsKey, 0, -1);

    if (attempts.length === 0) {
      return NextResponse.json(
        { message: "No attempts found", attempts: [] },
        { status: 200 }
      );
    }

    const parsedAttempts: AttemptRecord[] = attempts.map((entry) =>
      JSON.parse(entry) as AttemptRecord
    );
    console.log("attempts ::", parsedAttempts);
    

    return NextResponse.json({
      email,
      testId: parsedTest.id,
      attempts: parsedAttempts,
    });
  } catch (err) {
    console.error(":: api/get-attempts ::", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
