import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { tokenValidation } from '../../../../services/token-validation-service';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({message: 'Token available'},{ status: 403 });
    }

    const tokenData = await tokenValidation(token);

    if (!tokenData?.success) {
      return NextResponse.json({ message: 'Session Expired' }, { status: 403 });
    }

    //@ts-expect-error: id exists in payload
    const id: number = tokenData.payload.id;

    const userData = await prisma.onlineUser.findUnique({
      where: {
        uid: id,
      },
    });

    if (!userData)
      return NextResponse.json({ message: 'No data found' }, { status: 404 });

    const data = {
      name: userData?.first_name,
      email: userData.email,
      phone: userData.contact_no,
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
