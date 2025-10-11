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

// Convert UTC date to IST date string (yyyy-mm-dd)
const toISTDateString = (date: Date) => {
  const utcMillis = date.getTime();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istDate = new Date(utcMillis + istOffset);
  return istDate.toISOString().split('T')[0]; // yyyy-mm-dd only
};

// Compare if two timestamps are on same IST day
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

    // Admin login logic
    if (sanitizedEmail === 'sumant12345@gmail.com') {
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
      });

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
          // Different IST day → reset submission
          userData.isFinalSubmit = false;
        }
      } else {
        // No lastLogin recorded yet
        userData.lastLogin = currentLoginTime;
      }
    } else {
      // New user
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

    // Final submit check (IST)
    const sameISTDay = userData.lastLogin
      ? isSameISTDay(userData.lastLogin, currentLoginTime)
      : false;

    if (userData.isFinalSubmit && sameISTDay) {
      return NextResponse.json(
        {
          message:
            'You have already submitted the exam today and cannot log in again.',
        },
        { status: 403 },
      );
    }

    // Update login timestamp
    userData.lastLogin = currentLoginTime;
   
    
    await redis.set(`student:${sanitizedEmail}`, JSON.stringify(userData));

    // Generate JWT
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
        },
      },
      { status: existingData ? 200 : 201 },
    );

    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('::auth/signup-login::', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
