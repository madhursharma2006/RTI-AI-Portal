import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, saveDB, safeUser } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  const { name, email, password } = await req.json();
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6)
    return NextResponse.json({ error: 'Enter a valid name, email and a password of 6+ characters.' }, { status: 400 });

  const db = getDB();
  if (db.users.some((u) => u.email === email.toLowerCase()))
    return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

  const user = { id: 'u_' + Date.now().toString(36), name: name.trim(), email: email.toLowerCase(), role: 'citizen', passwordHash: bcrypt.hashSync(password, 10) };
  db.users.push(user);
  saveDB(db);
  await createSession(user);
  return NextResponse.json({ user: safeUser(user) });
}
