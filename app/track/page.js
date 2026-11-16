'use client';
import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import Timeline from '@/components/Timeline';
import StatusBadge from '@/components/StatusBadge';
import { fmtDate, daysLeft } from '@/lib/utils';

export default function Track() {
  const [id, setId] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(''); setData(null);
    const r = await fetch(`/api/track?id=${encodeURIComponent(id)}`);
    const d = await r.json();
    setLoading(false);
    r.ok ? setData(d) : setErr(d.error);
  };

  const closed = data && ['responded', 'rejected'].includes(data.status);
  const stage = !data ? 0 : closed ? 3 : 2;
  const steps = ['Submitted', 'AI Triage', 'Officer Review', data?.status === 'rejected' ? 'Rejected' : 'Responded'];

  return (
    <div className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-extrabold">Track your RTI</h1>
        <p className="text-sm text-slate-500">Enter your application ID (e.g. RTI-2025-0001)</p>
        <form onSubmit={go} className="mt-5 flex gap-2">
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="RTI-2025-0001" required />
          <button className="btn-primary" disabled={loading}><Search size={16} /> {loading ? '…' : 'Track'}</button>
        </form>
        {err && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
      </div>

      {data && (
        <div className="card space-y-6 p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs text-slate-500">Application</p><p className="text-xl font-extrabold">{data.id}</p></div>
            <StatusBadge status={data.status} />
          </div>

          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${i <= stage ? (data.status === 'rejected' && i === 3 ? 'bg-rose-500' : 'bg-gradient-to-br from-indigo-600 to-violet-600') + ' text-white' : 'bg-slate-200 text-slate-500'}`}>{i <= stage ? <Check size={16} /> : i + 1}</span>
                  <span className="mt-1 text-[11px] font-medium text-slate-600">{s}</span>
                </div>
                {i < 3 && <div className={`mx-1 mb-5 h-1 flex-1 rounded ${i < stage ? 'bg-indigo-500' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Department</p><p className="font-semibold">{data.department}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Filed on</p><p className="font-semibold">{fmtDate(data.createdAt)}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{closed ? 'Closed on' : 'Due by'}</p><p className="font-semibold">{closed ? fmtDate(data.responseDate) : `${fmtDate(data.dueDate)} (${daysLeft(data.dueDate)}d left)`}</p></div>
          </div>
          <Timeline items={data.timeline} />
          <p className="text-xs text-slate-400">Login to your dashboard to read the full response.</p>
        </div>
      )}
    </div>
  );
}
