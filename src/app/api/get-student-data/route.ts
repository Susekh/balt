import { NextRequest, NextResponse } from 'next/server';
import { tokenValidation } from '../../../../services/token-validation-service';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Token unavailable' }, { status: 403 });
  }

  const tokenData = await tokenValidation(token);

  if (!tokenData?.success) {
    return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
  }

  try {
    const studentKeys = await redis.keys('student:*');
    const students = [];

    for (const key of studentKeys) {
      const data = await redis.get(key);
      if (data) {
        const student = JSON.parse(data);
        students.push(student); // Push the entire student object
      }
    }

    return NextResponse.json(
      {
        success: true,
        students,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('::api/get-student-data::', err);
    return NextResponse.json(
      { message: 'Something Went Wrong' },
      { status: 500 },
    );
  }
}
