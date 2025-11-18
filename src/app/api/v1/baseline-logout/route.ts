// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Remove cookies
  response.cookies.set('auth-token', '', { path: '/', maxAge: 0 });
  response.cookies.set('user-session', '', { path: '/', maxAge: 0 });
  response.cookies.set('active_test', '', { path: '/', maxAge: 0 });

  return response;
}
