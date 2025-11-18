import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { randomUUID } from 'crypto';
import { redis } from '@/lib/redis';

interface RequestBody {
  fullName: string;
  phone: string;
  email: string;
  regNo: string;
  branch: string;
}

const sanitizeEmail = (email: string) => {
  return email
    .trim()
    .toLowerCase()
    .replace(/['";\\]/g, '')
    .replace(/--/g, '');
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(email);
};

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');

  const jwk = await importJWK({ k: secret, alg: 'HS256', kty: 'oct' });

  return new SignJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: randomUUID(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('3h')
    .sign(jwk);
};

// Convert UTC date to IST (yyyy-mm-dd)
const toISTDateString = (date: Date) => {
  const utcMillis = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcMillis + istOffset);
  return istDate.toISOString().split('T')[0];
};

const isSameISTDay = (date1: string, date2: string) => {
  const d1IST = toISTDateString(new Date(date1));
  const d2IST = toISTDateString(new Date(date2));
  return d1IST === d2IST;
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { fullName, phone, email, branch, regNo } = body;

    if (
      !fullName ||
      typeof fullName !== 'string' ||
      !phone ||
      typeof phone !== 'string' ||
      !email ||
      typeof email !== 'string' ||
      !branch ||
      typeof branch !== 'string' ||
      typeof regNo !== 'string' ||
      !regNo
    ) {
      return NextResponse.json(
        { message: 'Invalid data provided' },
        { status: 400 },
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 },
      );
    }

    // ✅ Admin login logic
    if (sanitizedEmail === 'sumant12345@gmail.com') {

      const adminData = await redis.get(`student:${sanitizedEmail}`);

      if (!adminData) {
        const now = new Date().toISOString();

        const adminRecord = {
          uid: randomUUID(),
          email: sanitizedEmail,
          name: "Admin User",
          branch: "ADMIN",
          regNo: "N/A",
          contactNo: "N/A",
          collegeName: "Admin Control",
          semester: "N/A",
          type: "admin",
          lastLogin: now,
          totalScore: 0,
          isFinalSubmit: false,
          score: null,
          createdAt: now,
          compltedTests: []
        };

        await redis.set(`student:${sanitizedEmail}`, JSON.stringify(adminRecord));
      }
      const jwt = await generateJWT({
        id: sanitizedEmail,
        role: 'admin',
      });

      const response = NextResponse.json(
        { message: 'Success' },
        { status: 210 },
      );

      response.cookies.set('auth-token', jwt, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 24 * 60 * 60,
      });

      //  NEW SEPARATE COOKIE
      response.cookies.set(
        'user-session',
        JSON.stringify({
          email: sanitizedEmail,
          loginDate: new Date().toISOString(),
        }),
        {
          httpOnly: false,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 24 * 60 * 60,
        },
      );

      return response;
    }

    const existingData = await redis.get(`student:${sanitizedEmail}`);
    const now = new Date();
    const currentLoginTime = now.toISOString();
    let userData;

    if (existingData) {
      userData = JSON.parse(existingData);

      if (userData.lastLogin) {
        const sameISTDay = isSameISTDay(userData.lastLogin, currentLoginTime);

        if (userData.isFinalSubmit && !sameISTDay) {
          userData.isFinalSubmit = false;
        }
      } else {
        userData.lastLogin = currentLoginTime;
      }
    } else {
      userData = {
        uid: randomUUID(),
        email: sanitizedEmail,
        name: fullName.trim(),
        branch: branch.trim(),
        contactNo: phone.trim(),
        regNo: regNo.trim(),
        collegeName: 'Trident Academy of Technology',
        semester: '7th',
        type: 'baseline',
        lastLogin: currentLoginTime,
        totalScore: 52,
        isFinalSubmit: false,
        score: null,
        createdAt: new Date().toISOString(),
      };
    }

    // const sameISTDay = userData.lastLogin
    //   ? isSameISTDay(userData.lastLogin, currentLoginTime)
    //   : false;

    // if (userData.isFinalSubmit && sameISTDay) {
    //   return NextResponse.json(
    //     {
    //       message:
    //         'You have already submitted the exam today and cannot log in again.',
    //     },
    //     { status: 403 },
    //   );
    // }

    userData.lastLogin = currentLoginTime;

    await redis.set(`student:${sanitizedEmail}`, JSON.stringify(userData));

    const jwt = await generateJWT({
      id: sanitizedEmail,
    });

    const response = NextResponse.json(
      {
        message: 'Success',
        user: {
          email: sanitizedEmail,
          fullName: userData.name,
          branch: userData.branch,
          compltedTests : userData.compltedTests
        },
      },
      { status: existingData ? 200 : 201 },
    );

    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 6 * 60 * 60,
    });

    // ✅ NEW SEPARATE COOKIE
    response.cookies.set(
      'user-session',
      JSON.stringify({
        email: sanitizedEmail,
        loginDate: new Date().toISOString(),
      }),
      {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 24 * 60 * 60,
      },
    );

    return response;
  } catch (error) {
    console.error('::auth/signup-login::', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
