import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, safeUser } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const user = getDB().users.find((u) => u.email === (email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash))
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  await createSession(user);
  return NextResponse.json({ user: safeUser(user) });
}
