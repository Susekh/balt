import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { randomUUID } from 'crypto';
import { redis } from '@/lib/redis';

interface RequestBody {
  userName: string;
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

// Helper to check if two dates are on the same day
const isSameDay = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { userName } = body;
    console.log(userName);

    if (!userName || typeof userName !== 'string') {
      return NextResponse.json(
        { message: 'Invalid data provided' },
        { status: 400 },
      );
    }

    const sanitizedEmail = sanitizeEmail(userName);

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 },
      );
    }

    // ✅ Admin logic (no restrictions)
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

    // ✅ Student logic
    const existingData = await redis.get(`student:${sanitizedEmail}`);
    const today = new Date().toISOString();
    let userData;

    if (existingData) {
      userData = JSON.parse(existingData);

      if (userData.lastLogin && isSameDay(userData.lastLogin, today)) {
        // 🚫 Already logged in today
        return NextResponse.json(
          { message: 'You can only login once per day.' },
          { status: 403 },
        );
      }

      // ✅ Update lastLogin to today
      userData.lastLogin = today;
      await redis.set(`student:${sanitizedEmail}`, JSON.stringify(userData));
    } else {
      // 🆕 New user – create record
      userData = {
        uid: randomUUID(),
        email: sanitizedEmail,
        name: null,
        branch: null,
        collegeName: null,
        contactNo: null,
        semester: null,
        isFinalSubmit: false,
        score: null,
        createdAt: today,
        lastLogin: today,
      };

      await redis.set(`student:${sanitizedEmail}`, JSON.stringify(userData));
    }

    // ✅ Generate JWT
    const jwt = await generateJWT({
      id: userData.email,
    });

    // Increment login count
    await redis.incr(`loginCount:student:${sanitizedEmail}`);

    const response = NextResponse.json(
      { message: 'Success', isNewUser: !existingData },
      { status: 200 },
    );

    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('::auth/signin-signup::', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
