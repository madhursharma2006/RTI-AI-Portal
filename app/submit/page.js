'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, Brain, Search, CheckCircle2, Info, Mic, Sparkles, ShieldAlert, Lightbulb } from 'lucide-react';
import { getDepartment } from '@/lib/departments';
import { fmtDate } from '@/lib/utils';

const EXAMPLES = [
  { s: 'Road repair status near Rampur village', d: 'Please provide the tender details, contractor name, sanctioned amount and current status of repair work of the pothole-ridden road connecting Rampur village to the district highway.' },
  { s: 'Pending scholarship applications at Govt College', d: 'Kindly provide the list of pending scholarship applications of SC/ST students at the Government College for the last academic year along with reasons for delay.' },
  { s: 'Medicine stock at community health centre', d: 'Please provide the month-wise stock position of essential medicines and the number of doctors and nurses posted at the Community Health Centre for the last financial year.' },
];

const COLORS = ['#f97316', '#6366f1', '#16a34a', '#eab308', '#ec4899', '#06b6d4'];

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {Array.from({ length: 48 }).map((_, i) => (
        <span key={i} className="confetti" style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % COLORS.length], animationDelay: `${(i % 12) * 0.1}s`, animationDuration: `${2.4 + (i % 5) * 0.35}s` }} />
      ))}
    </div>
  );
}

export default function Submit() {
  const [f, setF] = useState({ subject: '', description: '', bpl: false, urgent: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pLoading, setPLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // live AI preview while typing
  useEffect(() => {
    const text = `${f.subject} ${f.description}`.trim();
    if (text.length < 20) { setPreview(null); return; }
    const t = setTimeout(async () => {
      setPLoading(true);
      try {
        const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        setPreview(await r.json());
      } catch {}
      setPLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [f.subject, f.description]);

  const startVoice = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return setErr('Voice input is not supported in this browser. Please use Google Chrome.');
    setErr('');
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onresult = (e) => setF((p) => ({ ...p, description: `${p.description} ${e.results[0][0].transcript}`.trim() }));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const r = await fetch('/api/rti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setErr(d.error);
    setRes(d);
  };

  if (res) {
    const dept = getDepartment(res.record.departmentId);
    return (
      <div className="mx-auto max-w-2xl animate-fade-up">
        <Confetti />
        <div className="card glow-ring p-8 text-center">
          <CheckCircle2 className="mx-auto text-emerald-500" size={60} />
          <h1 className="mt-3 text-2xl font-extrabold">Application submitted!</h1>
          <p className="text-slate-500">Save your tracking ID</p>
          <p className="gradient-text mx-auto mt-3 w-fit rounded-xl bg-indigo-50 px-6 py-3 text-3xl font-extrabold tracking-wider">{res.record.id}</p>

          <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-left text-sm">
            <p className="flex items-center gap-2"><Brain size={16} className="text-indigo-600" /> AI routed your request to <b>{dept.emoji} {dept.name}</b> ({res.confidence}% confidence)</p>
            <p className="flex items-center gap-2"><Search size={16} className="text-indigo-600" /> {res.similarCount} similar past RTI record(s) found for the officer</p>
            <p className="flex items-center gap-2"><Info size={16} className="text-indigo-600" /> Reply due by <b>{fmtDate(res.record.dueDate)}</b> • Fee: ₹{res.record.fee}</p>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Link href={`/application/${res.record.id}`} className="btn-primary">View application</Link>
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const len = f.description.trim().length;
  const pct = Math.min(100, Math.round((len / 30) * 100));
  const dept = preview?.ready ? preview.department : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
      <form onSubmit={submit} className="card animate-fade-up space-y-5 p-8 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-extrabold">File a new <span className="gradient-text">RTI application</span></h1>
          <p className="text-sm text-slate-500">Ask for specific, existing information held by a public authority.</p>
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Status of repair work on city bypass road" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Information requested</label>
            <button type="button" onClick={startVoice} className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${listening ? 'animate-pulse-ring bg-rose-500 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
              <Mic size={13} /> {listening ? 'Listening…' : 'Speak'}
            </button>
          </div>
          <textarea className="input min-h-[180px]" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe exactly what records, documents or data you need, and the period they relate to…" />
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-indigo-500'}`} style={{ width: `${pct}%` }} /></div>
            <span className="text-xs text-slate-400">{len} chars {pct >= 100 ? '✓' : '(min 30)'}</span>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={f.bpl} onChange={(e) => setF({ ...f, bpl: e.target.checked })} /> I belong to a Below Poverty Line (BPL) family — fee exempted</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-rose-600" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> Concerns the life or liberty of a person (reply within 48 hours)</label>
        {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
        <button className="btn-primary w-full !py-3" disabled={loading}><Send size={16} /> {loading ? 'AI is analysing your request…' : `Submit (Fee ₹${f.bpl ? 0 : 10})`}</button>
      </form>

      <aside className="space-y-4">
        <div className="card glow-ring p-5">
          <h3 className="flex items-center gap-2 font-bold"><Sparkles size={16} className="text-violet-600" /> Live AI preview</h3>
          {!dept ? (
            <p className="mt-3 text-sm text-slate-500">Start describing your request — the AI will show the likely department as you type.</p>
          ) : (
            <div className={`mt-3 space-y-3 transition ${pLoading ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 rounded-xl bg-indigo-50 p-3">
                <span className="text-2xl">{dept.emoji}</span>
                <div><p className="text-xs text-slate-500">Likely department</p><p className="text-sm font-bold">{dept.name}</p></div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Confidence</span><b>{preview.confidence}%</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="animate-grow h-full rounded-full bg-gradient-to-r from-orange-500 to-green-600" style={{ width: `${preview.confidence}%` }} /></div>
              </div>
              {preview.exemptionFlag && <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><ShieldAlert size={15} className="shrink-0" /> May be partly exempt: {preview.exemptionFlag}</p>}
              <p className="text-xs font-semibold text-slate-600">{preview.similar?.length || 0} similar past RTI(s) found</p>
            </div>
          )}
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Quick examples</h3>
          <div className="mt-3 space-y-2">
            {EXAMPLES.map((x) => (
              <button key={x.s} type="button" onClick={() => setF({ ...f, subject: x.s, description: x.d })} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50">{x.s}</button>
            ))}
          </div>
        </div>
        <div className="card p-5 text-sm text-slate-600">
          <h3 className="flex items-center gap-2 font-bold text-slate-800"><Lightbulb size={16} className="text-amber-500" /> Tips</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Ask for records, not opinions.</li>
            <li>Mention dates, places and scheme names.</li>
            <li>Avoid personal data of third parties.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
