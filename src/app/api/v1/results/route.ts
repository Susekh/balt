import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { tokenValidation } from '../../../../../services/token-validation-service';

export async function GET(request: NextRequest) {
  try {
    // 🔹 Extract JWT token from cookie (assuming admin token check here)
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = await tokenValidation(token);
    if (!tokenData?.success || !tokenData.payload?.id || tokenData.payload.role !== 'admin') {
      // assuming role check
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 🔹 Get date from query params
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ message: 'Date parameter is required' }, { status: 400 });
    }

    const resultKey = `results:${date}`;
    const results = await redis.lrange(resultKey, 0, -1);

    if (!results.length) {
      return NextResponse.json({ message: 'No results found for this date', data: [] }, { status: 200 });
    }

    const parsedResults = results.map((res) => JSON.parse(res));

    return NextResponse.json({ data: parsedResults }, { status: 200 });
  } catch (err) {
    console.error('::api/admin/results::', err);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
