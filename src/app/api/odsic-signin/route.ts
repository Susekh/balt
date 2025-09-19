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

    // MUST BE REMOVED LATER
    //temporary admin login logic to view result

    if (sanitizedEmail === 'sumant12345@gmail.com') {
      const jwt = await generateJWT({
        id: sanitizedEmail,
        role: 'admin'
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
    let userData;

    if (existingData) {
      // User exists – reuse data
      userData = JSON.parse(existingData);
    } else {
      // New user – create and store
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
        createdAt: new Date().toISOString(),
      };

      await redis.set(`student:${sanitizedEmail}`, JSON.stringify(userData));
    }

    // Generate JWT
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
      // secure: false,
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
