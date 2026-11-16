import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { ruleBasedAnalyze } from '@/lib/ai';
import { findSimilar, toSimilar } from '@/lib/rti';
import { getDepartment } from '@/lib/departments';

export const dynamic = 'force-dynamic';

// Public, lightweight preview: rule-based triage + semantic search (no AI key used, no data saved)
export async function POST(req) {
  const { text = '' } = await req.json();
  if (text.trim().length < 12) return NextResponse.json({ ready: false });

  const a = ruleBasedAnalyze({ subject: text.slice(0, 120), description: text });
  const hits = findSimilar(getDB(), text, null, 3);
  const d = getDepartment(a.departmentId);

  return NextResponse.json({
    ready: true,
    department: { id: d.id, name: d.name, emoji: d.emoji },
    confidence: a.confidence,
    keywords: a.keywords,
    exemptionFlag: a.exemptionFlag,
    priority: a.priority,
    similar: toSimilar(hits),
  });
}
