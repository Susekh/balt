import { NextRequest, NextResponse } from 'next/server';
import { tokenValidation } from '../../../../services/token-validation-service';
import { redis } from '@/lib/redis';

interface RequestBody {
  name: string;
  branch: string;
  collegeName: string;
  contactNo: string;
  semester: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Token unavailable' },
        { status: 403 },
      );
    }

    const tokenData = await tokenValidation(token);

    if (!tokenData?.success) {
      return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
    }

    //@ts-expect-error: id exists in payload
    const id: number = tokenData.payload.id;

    const userData = await redis.get(`student:${id.toString()}`);

    if (!userData)
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
    const parsedData = JSON.parse(userData);
    const data = {
      name: parsedData.name,
      branch: parsedData.branch,
      collegeName: parsedData.collegeName,
      contactNo: parsedData.contactNo,
      semester: parsedData.semester,
      isFinalSubmit: parsedData.isFinalSubmit,
      loginCount: parsedData.loginCount??0
    };

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log('::api/get-user-profile:: ', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 200 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('cookie');
    const token = authHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('auth-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Token unavailable' },
        { status: 403 },
      );
    }

    const tokenData = await tokenValidation(token);

    if (!tokenData?.success) {
      return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
    }

    //@ts-expect-error: id exists in payload
    const id: number = tokenData.payload.id;
    const body: RequestBody = await request.json();
    const { name, branch, collegeName, contactNo, semester } = body;

    const userData = await redis.get(`student:${id.toString()}`);

    if (!userData)
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
    const parsedData = JSON.parse(userData);
    const loginCount = await redis.incr(`loginCount:student:${id.toString()}`);
    const data = {
      ...parsedData,
      name: name,
      branch: branch,
      collegeName: collegeName,
      contactNo: contactNo,
      semester: semester,
      loginCount,
    };

    await redis.set(`student:${id.toString()}`, JSON.stringify(data));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.log('::api/get-user-profile:: ', err);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 200 },
    );
  }
}
