import * as jose from 'jose';

interface Payload{
  id: number,
  name: string,
  iat: number,
  jti: string,
  exp: number
}

export const tokenValidation = async (token: string) => {
  const secret:string = process.env.JWT_SECRET || 'secret';
  try {
    //@ts-ignore
    const { payload } = await jose.jwtVerify(
      token,
      {
        k: secret,
        alg: 'HS256',
        kty: 'oct'
      }
    );
    // @ts-ignore
    if(payload) return { payload, success: true }
  
  } catch (error) {
    console.log('Token is invalid:', error);
    return { success: false }
  }
}