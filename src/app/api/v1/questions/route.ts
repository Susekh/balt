// app/api/questions/route.ts
import { baselineQuestionsV3 } from '@/misc/baselineQuestionsV3';
import { NextResponse, NextRequest } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../services/token-validation-service';

export async function GET(request: NextRequest) {
  try {
    // 🔹 Extract JWT token from cookie
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url)); // redirect if no token
    }

    // 🔹 Validate token
    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id) {
      return NextResponse.redirect(new URL('/', request.url)); // redirect if invalid
    }

    const id = tokenData.payload.id;

    // 🔹 Optionally check if user exists in Redis
    const userData = await redis.get(`student:${id}`);
    if (!userData) {
      return NextResponse.redirect(new URL('/', request.url)); // redirect if no user
    }

    // 🔹 Return the baseline questions
    return NextResponse.json(baselineQuestionsV3);
  } catch (err) {
    console.error('::api/questions::', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
