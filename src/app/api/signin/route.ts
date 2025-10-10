import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { randomUUID } from "crypto";

const prisma = new PrismaClient()

interface RequestBody {
  userName: string;
  password: string;
};

const sanitizeEmail = (email: string) => {
  let sanitized = email.trim().toLowerCase();

  sanitized = sanitized
  .replace(/['";]/g, '')
  .replace(/--/g, '');

  sanitized = sanitized.replace(/\\/g, '');

  return sanitized;
}

const isValidEmail = (email: string) => {

  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(email);

}

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET;

  const jwk = await importJWK({ k: secret, alg: 'HS256', kty: 'oct' });

  const jwt = await new SignJWT({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    jti: randomUUID()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('3h')
    .sign(jwk);

  return jwt;
};

export async function POST(request: NextRequest) {
  try{

    const body: RequestBody = await request.json();
    const {userName, password} = body;

    if (!userName || !password || typeof userName !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ status: 400, message: 'Invalid data provided' }, { status: 400 });
    };

    const sanitizedEmail = sanitizeEmail(userName)

    if(!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({status: 400, message: 'Invalid email format' }, { status: 400})
    };

    const existringUser = await prisma.onlineUser.findFirst({
      where: {
        email: sanitizedEmail
      },
    });

    if(!existringUser) {
      return NextResponse.json({status: 404, message: 'No such user exists' }, { status: 404});
    };

    const isCorrectPassword = password === existringUser.password;

    if(!isCorrectPassword) {
      return NextResponse.json({status: 400, message: 'Incorrect credentials' }, { status: 400})
    };

    const jwt = await generateJWT({
      id: existringUser.uid,
      name: existringUser.username
    });

    const response = NextResponse.json({status: 200, message: 'Success' }, {status: 200});

    response.cookies.set('auth-token', jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === 'production'
    });
    
    return response
  }catch(error){
    console.error('::api/signin::', error)
    return NextResponse.json({status: 500, message: 'Something Went Wrong' }, {status: 500});
  }
}