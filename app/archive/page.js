'use client';
import { useEffect, useState } from 'react';
import { Search, Brain } from 'lucide-react';
import { getDepartment } from '@/lib/departments';
import { fmtDate } from '@/lib/utils';

export default function Archive() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const run = async (query) => {
    setLoading(true);
    const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const d = await r.json();
    setResults(d.results);
    setSearched(!!query);
    setLoading(false);
  };

  useEffect(() => { run(''); }, []);

  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-extrabold">Public RTI Archive</h1>
        <p className="text-sm text-slate-500">Semantic search across previously answered RTI requests — search by meaning, not just keywords.</p>
        <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="mt-5 flex gap-2">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. hospital medicine stock, damaged roads, pension list…" />
          <button className="btn-primary" disabled={loading}><Search size={16} /> Search</button>
        </form>
      </div>

      <p className="flex items-center gap-2 text-sm text-slate-500"><Brain size={16} /> {searched ? `${results.length} semantic matches` : 'Recently answered RTIs'}</p>

      <div className="space-y-4">
        {results.map((r) => {
          const d = getDepartment(r.departmentId);
          return (
            <article key={r.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-indigo-600">{r.id}</span>
                <div className="flex items-center gap-2">
                  {r.score != null && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{r.score}% match</span>}
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs">{d.emoji} {d.name}</span>
                </div>
              </div>
              <h3 className="mt-2 font-bold">{r.subject}</h3>
              <p className="mt-2 text-sm text-slate-600">{r.response}{r.response.length >= 320 && '…'}</p>
              <p className="mt-3 text-xs text-slate-400">Answered on {fmtDate(r.date)}</p>
            </article>
          );
        })}
        {!loading && searched && !results.length && <p className="card p-8 text-center text-slate-500">No similar records found.</p>}
      </div>
    </div>
  );
}
