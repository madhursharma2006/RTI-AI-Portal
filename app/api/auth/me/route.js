import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { safeUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user: safeUser(user) });
}
