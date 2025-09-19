import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify, importJWK } from 'jose';
import { redis } from '@/lib/redis';
import MediaAccess from './MediaAccess';

export default async function WelcomePage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth-token')?.value;

  if (!token) {
    redirect('/');
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Missing JWT_SECRET');

    const jwk = await importJWK({ k: secret, alg: 'HS256', kty: 'oct' });
    const { payload } = await jwtVerify(token, jwk);

    const email = payload.id as string;
    const role = payload.role as string | undefined;

    if (role === 'admin') {
      redirect('/admin/dashboard');
    }

    const userDataString = await redis.get(`student:${email}`);
    if (!userDataString) {
      redirect('/');
    }

    const userData = JSON.parse(userDataString);

    return <MediaAccess userData={userData} />;
  } catch (error) {
    console.error('::welcome/page::', error);
    redirect('/');
  }
}
