import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateDraft } from '@/lib/ai';
import { findSimilar, toSimilar, citizenView } from '@/lib/rti';
import { getDepartment, DEPARTMENTS } from '@/lib/departments';

export const dynamic = 'force-dynamic';

const canAccess = (r, u) => (u.role === 'officer' ? u.departmentId === r.departmentId : r.userId === u.id);
const ev = (status, note) => ({ at: new Date().toISOString(), status, note });

export async function GET(_req, { params }) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const r = getDB().records.find((x) => x.id === params.id);
  if (!r || !canAccess(r, user)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ record: user.role === 'officer' ? r : citizenView(r), role: user.role });
}

export async function PATCH(req, { params }) {
  const user = await getSession();
  if (!user || user.role !== 'officer') return NextResponse.json({ error: 'Officers only.' }, { status: 403 });

  const db = getDB();
  const r = db.records.find((x) => x.id === params.id);
  if (!r || !canAccess(r, user)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (r.status !== 'under_review') return NextResponse.json({ error: 'This application is already closed.' }, { status: 400 });

  const body = await req.json();
  let message = 'Saved';

  switch (body.action) {
    case 'save_draft':
      r.draft = body.draft || '';
      message = 'Draft saved';
      break;

    case 'regenerate': {
      const hits = findSimilar(db, `${r.subject} ${r.description}`, r.id);
      r.ai.similar = toSimilar(hits);
      r.draft = await generateDraft({ rti: r, department: getDepartment(r.departmentId), similar: hits });
      message = 'AI draft regenerated';
      break;
    }

    case 'approve':
      if ((body.finalResponse || '').trim().length < 20) return NextResponse.json({ error: 'Response is too short.' }, { status: 400 });
      r.draft = body.finalResponse;
      r.finalResponse = body.finalResponse;
      r.status = 'responded';
      r.responseDate = new Date().toISOString();
      r.assignedOfficerId = user.id;
      r.timeline.push(ev('responded', `Response approved and sent by ${user.name}`));
      message = 'Response approved and sent to applicant';
      break;

    case 'reject':
      if ((body.reason || '').trim().length < 10) return NextResponse.json({ error: 'Please give a reason (10+ characters).' }, { status: 400 });
      r.status = 'rejected';
      r.rejectionReason = body.reason;
      r.finalResponse = body.reason;
      r.responseDate = new Date().toISOString();
      r.timeline.push(ev('rejected', `Rejected: ${body.reason}`));
      message = 'Application rejected';
      break;

    case 'transfer': {
      if (!DEPARTMENTS.some((d) => d.id === body.departmentId) || body.departmentId === r.departmentId)
        return NextResponse.json({ error: 'Choose a different valid department.' }, { status: 400 });
      const from = getDepartment(r.departmentId).name;
      r.departmentId = body.departmentId;
      r.timeline.push(ev('under_review', `Transferred from ${from} to ${getDepartment(body.departmentId).name} under Section 6(3)`));
      message = 'Transferred under Section 6(3)';
      break;
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  saveDB(db);
  return NextResponse.json({ record: r, message });
}
