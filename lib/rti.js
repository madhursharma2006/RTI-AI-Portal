import { semanticSearch } from './semantic';

// Search previously answered RTI records for similar requests
export function findSimilar(db, text, excludeId, k = 5) {
  const corpus = db.records
    .filter((r) => r.status === 'responded' && r.finalResponse && r.id !== excludeId)
    .map((r) => ({ id: r.id, text: `${r.subject} ${r.description}`, record: r }));
  return semanticSearch(text, corpus, k);
}

export const toSimilar = (hits) =>
  hits.map((h) => ({
    id: h.id,
    subject: h.record.subject,
    departmentId: h.record.departmentId,
    score: Math.round(h.score * 100),
  }));

// What a citizen is allowed to see (hides AI draft and internal details)
export function citizenView(r) {
  const { draft, ai, assignedOfficerId, ...rest } = r;
  return { ...rest, ai: { category: ai?.category, departmentId: ai?.departmentId } };
}
