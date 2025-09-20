import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { tokenValidation } from "../../../../../services/token-validation-service";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("cookie");
    const token = authHeader
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = tokenData.payload.id;
    const userData = await redis.get(`student:${id}`);

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const parsedUser = JSON.parse(userData);
    return NextResponse.json({ success: true, user: parsedUser });
  } catch (err) {
    console.error("::api/me::", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
