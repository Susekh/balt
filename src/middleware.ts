import { NextRequest, NextResponse } from 'next/server'
import { tokenValidation } from '../services/token-validation-service';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicPath = path === '/'

  const token = request.cookies.get('auth-token')?.value || ''

  const tokenData = await tokenValidation(token);
  console.log('payload::', tokenData?.payload)
  if (!isPublicPath && !tokenData?.success) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  const userRole = tokenData?.payload?.role;

  if (path === '/admin/dashboard' && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next()
}

 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/exam/:path*',
    '/instructions/:path*',
    '/odsic',
    '/dashboard',
    '/admin/dashboard'
  ]
}