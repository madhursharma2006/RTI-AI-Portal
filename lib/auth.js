import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDB } from './db';

export const COOKIE = 'rti_session';
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

export async function createSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return getDB().users.find((u) => u.id === payload.uid) || null;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE);
}
