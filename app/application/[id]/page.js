'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Save, RefreshCw, Send, XCircle, Shuffle, AlertTriangle, History, Brain, ArrowLeft } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import { DEPARTMENTS, getDepartment } from '@/lib/departments';
import { fmtDate, daysLeft } from '@/lib/utils';

export default function Application() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [role, setRole] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    const r = await fetch(`/api/rti/${id}`);
    if (!r.ok) return setNotFound(true);
    const d = await r.json();
    setRec(d.record); setRole(d.role); setDraft(d.record.draft || '');
  };
  useEffect(() => { load(); }, [id]);

  const act = async (action, extra = {}) => {
    setBusy(action); setMsg(null);
    const r = await fetch(`/api/rti/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...extra }) });
    const d = await r.json();
    setBusy('');
    if (!r.ok) return setMsg({ ok: false, t: d.error });
    setMsg({ ok: true, t: d.message });
    if (action === 'transfer') return (window.location.href = '/dashboard');
    setRec(d.record); setDraft(d.record.draft || '');
    setShowReject(false);
  };

  if (notFound) return <p className="py-20 text-center text-slate-500">Application not found or access denied.</p>;
  if (!rec) return <p className="py-20 text-center text-slate-500">Loading…</p>;

  const isOfficer = role === 'officer';
  const open = rec.status === 'under_review';
  const dept = getDepartment(rec.departmentId);
  const left = daysLeft(rec.dueDate);

  return (
    <div className="animate-fade-up space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600"><ArrowLeft size={14} /> Back to dashboard</Link>

      <div className="card flex flex-wrap items-start justify-between gap-4 p-6">
        <div className="min-w-0">
          <p className="text-xs font-bold text-indigo-600">{rec.id}</p>
          <h1 className="text-2xl font-extrabold">{rec.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">{dept.emoji} {dept.name} • Filed {fmtDate(rec.createdAt)}{isOfficer && ` • By ${rec.applicantName}`}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={rec.status} />
          {open && <p className={`mt-2 text-sm font-semibold ${left < 0 ? 'text-rose-600' : 'text-slate-500'}`}>{left < 0 ? `${-left} days overdue` : `${left} days left`}</p>}
        </div>
      </div>

      {msg && <p className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{msg.t}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="font-bold">Information requested</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{rec.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1">Fee: ₹{rec.fee}{rec.bpl && ' (BPL)'}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Due: {fmtDate(rec.dueDate)}</span>
              {rec.urgent && <span className="rounded-full bg-rose-100 px-3 py-1 font-bold text-rose-600">URGENT – Life/Liberty</span>}
            </div>
          </section>

          {/* CITIZEN: response */}
          {!isOfficer && (rec.status === 'responded' || rec.status === 'rejected') && (
            <section className={`card p-6 ${rec.status === 'rejected' ? 'border-rose-200' : 'border-emerald-200'}`}>
              <h2 className="font-bold">{rec.status === 'responded' ? '✅ Official response' : '❌ Application rejected'}</h2>
              <p className="mt-1 text-xs text-slate-500">Issued on {fmtDate(rec.responseDate)}</p>
              <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed">{rec.finalResponse}</pre>
              <p className="mt-3 text-xs text-slate-500">Not satisfied? You can file a first appeal under Section 19(1) within 30 days.</p>
            </section>
          )}
          {!isOfficer && open && <section className="card p-6 text-sm text-slate-600">⏳ Your application is being reviewed by the Public Information Officer. You’ll see the response here once approved.</section>}

          {/* OFFICER: draft editor */}
          {isOfficer && (
            <section className="card p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-violet-600" /> {open ? 'AI-generated draft response' : 'Final response'}</h2>
                {open && <button className="btn-ghost !py-1.5 text-xs" disabled={!!busy} onClick={() => act('regenerate')}><RefreshCw size={14} className={busy === 'regenerate' ? 'animate-spin' : ''} /> Regenerate</button>}
              </div>
              <textarea className="input min-h-[360px] font-mono text-[13px] leading-relaxed" value={draft} onChange={(e) => setDraft(e.target.value)} readOnly={!open} />
              {open && (
                <>
                  <p className="mt-2 text-xs text-amber-600">⚠ Review carefully. Replace every [Officer: …] placeholder and delete precedent notes before approving.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-ghost" disabled={!!busy} onClick={() => act('save_draft', { draft })}><Save size={16} /> Save draft</button>
                    <button className="btn-green" disabled={!!busy} onClick={() => act('approve', { finalResponse: draft })}><Send size={16} /> {busy === 'approve' ? 'Sending…' : 'Approve & send'}</button>
                    <button className="btn-danger" onClick={() => setShowReject(!showReject)}><XCircle size={16} /> Reject</button>
                  </div>
                  {showReject && (
                    <div className="mt-4 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <label className="label">Reason for rejection (cite section, e.g. 8(1)(j))</label>
                      <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
                      <button className="btn-danger !bg-rose-600 !text-white" onClick={() => act('reject', { reason })}>Confirm rejection</button>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                    <Shuffle size={16} className="text-slate-500" />
                    <span className="text-sm text-slate-600">Wrong department? Transfer (Sec 6(3)):</span>
                    <select className="input !w-auto" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                      <option value="">Select…</option>
                      {DEPARTMENTS.filter((d) => d.id !== rec.departmentId).map((d) => <option key={d.id} value={d.id}>{d.emoji} {d.name}</option>)}
                    </select>
                    <button className="btn-ghost !py-2" disabled={!transferTo || !!busy} onClick={() => act('transfer', { departmentId: transferTo })}>Transfer</button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* OFFICER: AI insights */}
          {isOfficer && rec.ai && (
            <section className="card space-y-4 p-6">
              <h2 className="flex items-center gap-2 font-bold"><Brain size={18} className="text-indigo-600" /> AI insights <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase">{rec.ai.engine}</span></h2>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Routing confidence</span><b>{rec.ai.confidence}%</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-600" style={{ width: `${rec.ai.confidence}%` }} /></div>
              </div>
              <p className="text-sm"><b>Category:</b> {rec.ai.category}</p>
              <p className="text-sm"><b>Summary:</b> {rec.ai.summary}</p>
              {rec.ai.keywords?.length > 0 && <div className="flex flex-wrap gap-1.5">{rec.ai.keywords.map((k) => <span key={k} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{k}</span>)}</div>}
              {rec.ai.exemptionFlag && <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><AlertTriangle size={16} className="shrink-0" /> Possible exemption: {rec.ai.exemptionFlag}</p>}
              {rec.ai.isValidRequest === false && <p className="flex gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700"><AlertTriangle size={16} className="shrink-0" /> May be an opinion/hypothetical rather than a request for existing information.</p>}
            </section>
          )}

          {isOfficer && (
            <section className="card p-6">
              <h2 className="mb-3 flex items-center gap-2 font-bold"><History size={18} className="text-indigo-600" /> Similar past RTIs</h2>
              {rec.ai?.similar?.length ? (
                <ul className="space-y-3">
                  {rec.ai.similar.map((s) => (
                    <li key={s.id} className="rounded-xl bg-slate-50 p-3 text-xs">
                      <div className="flex justify-between"><b className="text-indigo-600">{s.id}</b><span className="font-bold text-emerald-600">{s.score}%</span></div>
                      <p className="mt-1 text-slate-600">{s.subject}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No precedent found.</p>}
            </section>
          )}

          <section className="card p-6">
            <h2 className="mb-4 font-bold">Activity timeline</h2>
            <Timeline items={rec.timeline} />
          </section>
        </div>
      </div>
    </div>
  );
}
