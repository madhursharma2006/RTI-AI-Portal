import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getDepartment } from '@/lib/departments';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const id = (new URL(req.url).searchParams.get('id') || '').trim().toUpperCase();
  const r = getDB().records.find((x) => x.id === id);
  if (!r) return NextResponse.json({ error: 'No application found with this ID.' }, { status: 404 });
  const dept = getDepartment(r.departmentId);
  return NextResponse.json({
    id: r.id,
    status: r.status,
    department: `${dept.emoji} ${dept.name}`,
    createdAt: r.createdAt,
    dueDate: r.dueDate,
    responseDate: r.responseDate || null,
    urgent: r.urgent,
    timeline: r.timeline,
  });
}
