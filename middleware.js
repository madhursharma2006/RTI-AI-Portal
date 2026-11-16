import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('rti_session')?.value;
  let ok = false;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me'));
      ok = true;
    } catch {}
  }
  if (!ok) {
    const url = req.nextUrl.clone();
    url.searchParams.set('next', req.nextUrl.pathname);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/submit/:path*', '/application/:path*'],
};
