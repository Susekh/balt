import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!email || !date) {
      return NextResponse.json(
        { message: "email and date are required" },
        { status: 400 }
      );
    }

    const attemptsKey = `attempts:${email}:${date}`;
    const attempts = await redis.lrange(attemptsKey, 0, -1);

    if (!attempts.length) {
      return NextResponse.json(
        { message: "No attempts found", attempts: [] },
        { status: 404 }
      );
    }

    const parsedAttempts = attempts.map((a) => JSON.parse(a));

    return NextResponse.json({ email, date, attempts: parsedAttempts });
  } catch (err) {
    console.error("::api/get-attempts::", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
