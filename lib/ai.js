import Anthropic from '@anthropic-ai/sdk';
import { DEPARTMENTS } from './departments';

const hasKey = () => !!process.env.ANTHROPIC_API_KEY;

async function ask(system, user, max = 1500) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
    max_tokens: max,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

const EXEMPT = [
  [/national security|defen[cs]e secret|nuclear/i, 'Section 8(1)(a) – prejudicial to sovereignty/security'],
  [/cabinet (papers|notes)/i, 'Section 8(1)(i) – Cabinet papers'],
  [/trade secret|commercial confidence/i, 'Section 8(1)(d) – commercial confidence'],
  [/personal (information|details)|medical record of|bank (account|details)/i, 'Section 8(1)(j) – personal information'],
  [/ongoing investigation|under investigation/i, 'Section 8(1)(h) – impedes investigation'],
];

export function ruleBasedAnalyze({ subject, description }) {
  const text = `${subject} ${description}`.toLowerCase();
  const scored = DEPARTMENTS.map((d) => ({ d, s: d.keywords.reduce((a, k) => a + (text.includes(k) ? 1 : 0), 0) })).sort((a, b) => b.s - a.s);
  const total = scored.reduce((a, x) => a + x.s, 0);
  const top = scored[0];
  const confidence = total ? Math.min(95, Math.round((top.s / total) * 100) + 15) : 25;
  const matched = top.d.keywords.filter((k) => text.includes(k)).slice(0, 6);
  const ex = EXEMPT.find(([re]) => re.test(text));
  return {
    departmentId: top.s ? top.d.id : 'finance',
    category: top.s ? top.d.name : 'General Administration',
    priority: /life|liberty|arrest|custody|detention|emergency/i.test(text) ? 'urgent' : 'normal',
    summary: `Request for information regarding: ${subject}`.slice(0, 200),
    keywords: matched,
    confidence,
    exemptionFlag: ex ? ex[1] : null,
    isValidRequest: !/^\s*(why|should|whether)\b/i.test(subject),
    engine: 'rules',
  };
}

export async function analyzeRTI({ subject, description }) {
  const fallback = ruleBasedAnalyze({ subject, description });
  if (!hasKey()) return fallback;
  try {
    const system = `You are an RTI (Right to Information Act 2005, India) triage assistant. Classify the request.
Departments: ${DEPARTMENTS.map((d) => `${d.id} = ${d.name}`).join('; ')}.
Return ONLY a JSON object with keys: departmentId (one of the ids), category (short string), priority ("normal" or "urgent" – urgent only if life/liberty), summary (one sentence), keywords (array, max 6), confidence (0-100 integer), exemptionFlag (null or string like "Section 8(1)(j) – personal information"), isValidRequest (boolean; false if it asks for opinions/hypotheticals instead of existing information).`;
    const txt = await ask(system, `Subject: ${subject}\nDescription: ${description}`, 600);
    const parsed = JSON.parse(txt.match(/\{[\s\S]*\}/)[0]);
    if (!DEPARTMENTS.some((d) => d.id === parsed.departmentId)) throw new Error('bad dept');
    return { ...fallback, ...parsed, engine: 'claude' };
  } catch (e) {
    console.error('AI analyze failed, using rules:', e.message);
    return fallback;
  }
}

function templateDraft({ rti, department, similar }) {
  const date = new Date(rti.createdAt).toLocaleDateString('en-IN');
  const lines = [
    `To,`,
    `${rti.applicantName}`,
    ``,
    `Subject: Reply to RTI Application No. ${rti.id} dated ${date} – ${rti.subject}`,
    ``,
    `Sir/Madam,`,
    ``,
    `This refers to your application under Section 6(1) of the Right to Information Act, 2005, received in the ${department.name} Department on ${date}.`,
    ``,
    `Point-wise information:`,
    `[Officer: insert the requested information / list enclosed annexures here]`,
    ``,
  ];
  if (similar.length) {
    lines.push('--- Precedent for officer guidance (delete before sending) ---');
    similar.slice(0, 2).forEach((h) =>
      lines.push(`• ${h.record.id} (${h.record.subject}): ${h.record.finalResponse.slice(0, 220)}…`)
    );
    lines.push('---------------------------------------------------------------', '');
  }
  if (rti.ai?.exemptionFlag) {
    lines.push(`Note: Part of the requested information may be exempt – ${rti.ai.exemptionFlag}. [Officer to confirm and cite reasons.]`, '');
  }
  lines.push(
    `If you are not satisfied with this reply, you may file a first appeal under Section 19(1) of the RTI Act, 2005 before the First Appellate Authority of this department within 30 days of receipt of this reply.`,
    ``,
    `Yours faithfully,`,
    `Public Information Officer`,
    `${department.name}`
  );
  return lines.join('\n');
}

export async function generateDraft({ rti, department, similar = [] }) {
  if (!hasKey()) return templateDraft({ rti, department, similar });
  try {
    const system = `You draft replies for a Public Information Officer (PIO) under India's RTI Act 2005. Write a formal, polite letter. Do NOT invent facts, numbers, names or dates; use "[Officer to fill: …]" placeholders wherever actual data is needed. Cite relevant sections (e.g. 7(1), 8(1)(x), 6(3), 19(1)) only when applicable. Mention the first-appeal right under Section 19(1). Use earlier responses only as style/precedent guidance. Output the letter text only.`;
    const prec = similar.slice(0, 3).map((h) => `Earlier request (${h.record.id}): ${h.record.subject}\nEarlier reply: ${h.record.finalResponse}`).join('\n\n') || 'None';
    const user = `Department: ${department.name}\nRTI No.: ${rti.id}\nApplicant: ${rti.applicantName}\nDate received: ${new Date(rti.createdAt).toLocaleDateString('en-IN')}\nSubject: ${rti.subject}\nDescription: ${rti.description}\nAI exemption flag: ${rti.ai?.exemptionFlag || 'none'}\n\nPrecedents:\n${prec}`;
    return (await ask(system, user, 1500)).trim();
  } catch (e) {
    console.error('AI draft failed, using template:', e.message);
    return templateDraft({ rti, department, similar });
  }
}
