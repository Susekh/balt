import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, 
});

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    const prompt = `
    You will receive an array of objects. Each object has:
    {
      id: string,
      question: string,
      userAnswer: string
    }

    For each item, return:
    {
      id: string,
      question: string,
      userAnswer: string,
      correctAnswer: string,
      isCorrect: boolean,
      explanation: string
    }
    in the explanation properly explanation why it is wrong or right with the question.

    Only output valid JSON array. No markdown. No extra text.
    Here is the data: ${JSON.stringify(data)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]") + 1;
    const cleanJson = text.slice(start, end);

    const result = JSON.parse(cleanJson);

    return NextResponse.json({ result });
  } catch (error) {
    console.log("AI ERROR:", error);
    return NextResponse.json(
      { message: "Gemini processing failed", error },
      { status: 500 }
    );
  }
}
