'use client';
import { useEffect, useState } from 'react';
import { Brain, Search, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { getDepartment } from '@/lib/departments';

const SAMPLES = [
  'Please share tender and contractor details for repair of the pothole road near Rampur village',
  'List of pending scholarship applications of SC/ST students in the government college',
  'Number of transformer failures and restoration time in our electricity sub-division',
  'Stock of medicines and doctors posted at the community health centre',
];

export default function LiveDemo() {
  const [text, setText] = useState(SAMPLES[0]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text.trim().length < 12) { setRes(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        setRes(await r.json());
      } catch {}
      setLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className="card glow-ring grid gap-6 p-6 md:p-8 lg:grid-cols-2">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-indigo-600"><Zap size={16} /> Try the AI triage — type any RTI request</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="input mt-3 min-h-[150px]" placeholder="Describe the information you want…" />
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => setText(s)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50">Sample {i + 1}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
        {!res?.ready ? (
          <p className="grid h-full min-h-[150px] place-items-center text-sm text-slate-500">Start typing to see the AI analysis…</p>
        ) : (
          <div className={`space-y-4 transition ${loading ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow">{res.department.emoji}</span>
              <div><p className="text-xs text-slate-500">Routed to</p><p className="font-bold">{res.department.name}</p></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs"><span className="flex items-center gap-1"><Brain size={13} /> Confidence</span><b>{res.confidence}%</b></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white"><div className="animate-grow h-full rounded-full bg-gradient-to-r from-orange-500 via-indigo-500 to-green-500" style={{ width: `${res.confidence}%` }} /></div>
            </div>
            {res.keywords?.length > 0 && <div className="flex flex-wrap gap-1.5">{res.keywords.map((k) => <span key={k} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-indigo-700 shadow-sm">{k}</span>)}</div>}
            {res.exemptionFlag && <p className="flex gap-2 rounded-xl bg-amber-100 p-3 text-xs text-amber-800"><ShieldAlert size={15} className="shrink-0" /> {res.exemptionFlag}</p>}
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600"><Search size={13} /> Similar past RTIs</p>
              {res.similar?.length ? res.similar.map((s) => (
                <p key={s.id} className="mb-1 flex justify-between gap-3 rounded-lg bg-white px-3 py-1.5 text-xs"><span className="truncate">{getDepartment(s.departmentId).emoji} {s.subject}</span><b className="text-emerald-600">{s.score}%</b></p>
              )) : <p className="text-xs text-slate-500">No precedent yet.</p>}
            </div>
            <p className="flex items-center gap-1 text-[11px] text-slate-500"><Sparkles size={12} /> A draft reply is then prepared for the officer to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
