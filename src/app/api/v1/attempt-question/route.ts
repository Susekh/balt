import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { tokenValidation } from "../../../../../services/token-validation-service";
import { baselineAnswersV2 as baselineAnswers } from "@/misc/baselineQuestionsV2";

interface AttemptBody {
  qid: string;
  answer: string | null;
  timeRemaining: number;
}

// 🔹 Section mapping
const sectionMap: Record<string, string> = {
  e: "English",
  a: "Analytical Ability",
  q: "Quantitative Ability",
};

// 🔹 Precompute sequential numbering for each section
const questionNumberMap: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  const counters: Record<string, number> = { e: 1, a: 1, q: 1 };

  for (const qid of Object.keys(baselineAnswers)) {
    const prefix = qid.charAt(0); // e / a / q
    if (counters[prefix] !== undefined) {
      map[qid] = counters[prefix]++;
    }
  }
  return map;
})();

export async function POST(request: NextRequest) {
  try {
    // 🔹 Auth
    const authHeader = request.headers.get("cookie");
    const token = authHeader
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) return NextResponse.redirect(new URL("/", request.url));

    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // @ts-expect-error id exists
    const id: string = tokenData.payload.id;

    // 🔹 Get student data (for email)
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const parsedUser = JSON.parse(userData) as { email: string, regNo : string };

    // 🔹 Parse body
    const { qid, answer, timeRemaining }: AttemptBody = await request.json();
    if (!qid) {
      return NextResponse.json({ message: "qid required" }, { status: 400 });
    }

    const prefix = qid.charAt(0);
    const section = sectionMap[prefix] || "Unknown";
    const questionNo = questionNumberMap[qid] || 0;

   // 🔹 Correctness
    const correct = answer !== null && baselineAnswers[qid] === answer;

    // 🔹 Build attempt entry
    const attempt = {
      qid,
      section,
      questionNo,
      answer,
      correct,
      regNo : parsedUser.regNo,
      correctAnswer: baselineAnswers[qid],
      timeRemaining,
      attemptedAt: new Date().toISOString(),
    };

    // 🔹 Save/update separately by email + date
    const dateKey = new Date().toISOString().split("T")[0];
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

    return NextResponse.json({ message: updated ? "Attempt updated" : "Attempt saved", ...attempt });
  } catch (err) {
    console.error("::api/attempt-question::", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
