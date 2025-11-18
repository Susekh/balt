// app/api/v1/questions/route.ts
import { NextResponse, NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { tokenValidation } from "../../../../../services/token-validation-service";
import { questionList } from "@/misc/questionList";

type ActiveTest = {
  id: string;
  title: string;
  duration: string;
};

type SubQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
};

type Question = {
  id: string;
  content: string;
  subQuestions: SubQuestion[];
};

type Section = {
  section: string;
  questions: Question[];
};

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie");

    if (!cookies) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract user token
    const token = cookies
      .split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized - No token found" },
        { status: 401 }
      );
    }

    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.json(
        { success: false, msg: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = tokenData.payload.id;
    const userData = await redis.get(`student:${userId}`);

    if (!userData) {
      return NextResponse.json(
        { success: false, msg: "User not found" },
        { status: 404 }
      );
    }

    // Extract active test cookie
    const activeTestCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("active_test="))
      ?.split("=")[1];

    if (!activeTestCookie) {
      return NextResponse.json(
        { success: false, msg: "No active test found" },
        { status: 404 }
      );
    }

    let activeTest: ActiveTest | null = null;

    try {
      activeTest = JSON.parse(decodeURIComponent(activeTestCookie));
    } catch (err) {
      console.error("❌ Failed to parse active_test:", err);
      return NextResponse.json(
        { success: false, msg: "Invalid test cookie" },
        { status: 400 }
      );
    }

    // Locate test definition
    const testInfo = questionList.find((t) => t.id === activeTest!.id);

    if (!testInfo) {
      return NextResponse.json(
        { success: false, msg: "Test not found in question list" },
        { status: 404 }
      );
    }

    console.log("📋 Test Info:", testInfo);
    console.log("📂 Loading questions from:", testInfo.questionSource);

    // Dynamically import questions using @/ alias
    let questions: Section[];
    
    try {
      // Remove file extension if present
      const cleanPath = testInfo.questionSource.replace(/\.(ts|tsx|js|jsx)$/, "");
      
      // Use dynamic import with template literal
      // Webpack/Next.js will resolve @/ at build time
      const questionsModule = await import(`@/misc/${cleanPath}`);
      
      console.log("📦 Module loaded:", Object.keys(questionsModule));
      
      // Handle both default and named exports
      const rawQuestions = questionsModule.default[0];
      
      // Validate it's an array
      if (!Array.isArray(rawQuestions)) {
        console.error("❌ Invalid format. Expected array, got:", typeof rawQuestions);
        return NextResponse.json(
          { 
            success: false, 
            msg: "Question format invalid. Expected Section[] array." 
          },
          { status: 500 }
        );
      }

      questions = rawQuestions as Section[];
      
      console.log("✅ Questions loaded:", questions.length, "sections");
      
    } catch (importErr) {
      console.error("❌ Failed to import questions:", importErr);
      console.error("Stack:", importErr instanceof Error ? importErr.stack : "N/A");
      
      return NextResponse.json(
        { 
          success: false, 
          msg: `Failed to load test questions from: ${testInfo.questionSource}` 
        },
        { status: 500 }
      );
    }

    // Validate structure matches frontend expectations
    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, msg: "No sections found in test questions" },
        { status: 404 }
      );
    }

    // Validate first section has expected structure
    const firstSection = questions[0];
    if (!firstSection.section || !Array.isArray(firstSection.questions)) {
      console.error("❌ Invalid section structure:", firstSection);
      return NextResponse.json(
        { 
          success: false, 
          msg: "Invalid section structure. Expected {section, questions}[]" 
        },
        { status: 500 }
      );
    }

    // Count total subquestions for logging
    const totalSubQuestions = questions.reduce((acc, section) => {
      return acc + section.questions.reduce((qAcc, q) => {
        return qAcc + (q.subQuestions?.length || 0);
      }, 0);
    }, 0);

    console.log(`✅ Returning ${questions.length} sections with ${totalSubQuestions} total subquestions`);

    return NextResponse.json({
      success: true,
      test: activeTest,
      questions, // Section[] format matching frontend
    });
    
  } catch (err) {
    console.error(":: /api/v1/questions :: ERROR ::", err);
    console.error("Stack:", err instanceof Error ? err.stack : "N/A");
    
    return NextResponse.json(
      { success: false, msg: "Internal server error" },
      { status: 500 }
    );
  }
}