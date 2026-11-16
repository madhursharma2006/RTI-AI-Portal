import { NextResponse } from 'next/server';
import { getDB, saveDB, nextRtiId } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { analyzeRTI, generateDraft } from '@/lib/ai';
import { findSimilar, toSimilar, citizenView } from '@/lib/rti';
import { getDepartment } from '@/lib/departments';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDB();
  let list;
  if (user.role === 'officer') list = db.records.filter((r) => r.departmentId === user.departmentId);
  else list = db.records.filter((r) => r.userId === user.id).map(citizenView);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ records: list });
}

export async function POST(req) {
  const user = await getSession();
  if (!user || user.role !== 'citizen') return NextResponse.json({ error: 'Only citizens can file RTI applications.' }, { status: 403 });

  const { subject, description, bpl, urgent } = await req.json();
  if ((subject || '').trim().length < 8) return NextResponse.json({ error: 'Subject must be at least 8 characters.' }, { status: 400 });
  if ((description || '').trim().length < 30) return NextResponse.json({ error: 'Please describe the information you need (30+ characters).' }, { status: 400 });

  const db = getDB();

  // 1. AI categorisation
  const analysis = await analyzeRTI({ subject, description });

  // 2. Semantic search of previous RTI records
  const hits = findSimilar(db, `${subject} ${description}`);

  // 3. Use precedent to correct low-confidence routing
  let departmentId = analysis.departmentId;
  let routingNote = `Routed to ${getDepartment(departmentId).name} by AI triage (${analysis.engine}, ${analysis.confidence}% confidence)`;
  if (hits[0] && hits[0].score > 0.4 && analysis.confidence < 75 && hits[0].record.departmentId !== departmentId) {
    departmentId = hits[0].record.departmentId;
    routingNote = `Routed to ${getDepartment(departmentId).name} based on similar past RTI ${hits[0].id}`;
  }

  const now = new Date();
  const rti = {
    id: nextRtiId(db),
    userId: user.id,
    applicantName: user.name,
    applicantEmail: user.email,
    subject: subject.trim(),
    description: description.trim(),
    bpl: !!bpl,
    urgent: !!urgent || analysis.priority === 'urgent',
    fee: bpl ? 0 : 10,
    createdAt: now.toISOString(),
    dueDate: new Date(now.getTime() + ((urgent ? 2 : 30) * 86400000)).toISOString(),
    status: 'under_review',
    departmentId,
    ai: { ...analysis, departmentId: analysis.departmentId, similar: toSimilar(hits) },
    draft: '',
    finalResponse: null,
    timeline: [
      { at: now.toISOString(), status: 'submitted', note: 'Application received' },
      { at: now.toISOString(), status: 'under_review', note: routingNote },
    ],
  };

  // 4. AI draft for the officer
  rti.draft = await generateDraft({ rti, department: getDepartment(departmentId), similar: hits });

  db.records.push(rti);
  saveDB(db);
  return NextResponse.json({ record: citizenView(rti), similarCount: hits.length, confidence: analysis.confidence, engine: analysis.engine });
}
