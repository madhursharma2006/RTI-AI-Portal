import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { findSimilar } from '@/lib/rti';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  const db = getDB();
  const shape = (r, score) => ({
    id: r.id, subject: r.subject, departmentId: r.departmentId,
    response: (r.finalResponse || '').slice(0, 320), date: r.responseDate, score,
  });

  if (!q) {
    const latest = db.records.filter((r) => r.status === 'responded')
      .sort((a, b) => new Date(b.responseDate) - new Date(a.responseDate)).slice(0, 12);
    return NextResponse.json({ results: latest.map((r) => shape(r, null)) });
  }
  const hits = findSimilar(db, q, null, 10);
  return NextResponse.json({ results: hits.map((h) => shape(h.record, Math.round(h.score * 100))) });
}
