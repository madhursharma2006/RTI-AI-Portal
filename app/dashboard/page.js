'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, Inbox, AlertTriangle, CheckCircle2, Clock, ArrowRight, Search } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Counter from '@/components/Counter';
import { getDepartment } from '@/lib/departments';
import { fmtDate, daysLeft } from '@/lib/utils';

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card card-hover flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}><Icon size={22} /></span>
      <div><p className="text-2xl font-extrabold"><Counter to={value} duration={900} /></p><p className="text-xs text-slate-500">{label}</p></div>
    </div>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [list, setList] = useState(null);
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/auth/me').then((r) => r.json()), fetch('/api/rti').then((r) => r.json())]).then(([m, l]) => {
      setMe(m.user); setList(l.records || []);
    });
  }, []);

  if (!me || !list) return <div className="grid place-items-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>;

  const isOfficer = me.role === 'officer';
  const now = Date.now();
  const open = list.filter((r) => r.status === 'under_review');
  const responded = list.filter((r) => r.status === 'responded');
  const rejected = list.filter((r) => r.status === 'rejected');
  const overdue = open.filter((r) => new Date(r.dueDate) < now);
  const urgent = open.filter((r) => r.urgent);
  const done = [...responded, ...rejected];
  const dept = isOfficer ? getDepartment(me.departmentId) : null;

  const filtered = list
    .filter((r) =>
      f === 'all' || (f === 'pending' && r.status === 'under_review') || (f === 'urgent' && r.urgent && r.status === 'under_review') ||
      (f === 'overdue' && r.status === 'under_review' && new Date(r.dueDate) < now) || (f === 'done' && ['responded', 'rejected'].includes(r.status)))
    .filter((r) => !q || `${r.id} ${r.subject}`.toLowerCase().includes(q.toLowerCase()));

  // analytics
  const total = Math.max(1, list.length);
  const p1 = (open.length / total) * 100;
  const p2 = p1 + (responded.length / total) * 100;
  const donut = `conic-gradient(#f59e0b 0 ${p1}%, #10b981 ${p1}% ${p2}%, #f43f5e ${p2}% 100%)`;
  const byDept = Object.entries(list.reduce((a, r) => ({ ...a, [r.departmentId]: (a[r.departmentId] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const dueSoon = [...open].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="card relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 p-7 text-white">
        <div className="animate-blob absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">{isOfficer ? `${dept.emoji} ${dept.name}` : `Namaste, ${me.name.split(' ')[0]} 👋`}</h1>
            <p className="text-indigo-100">{isOfficer ? 'Public Information Officer console' : 'Your RTI applications at a glance'}</p>
          </div>
          {!isOfficer && <Link href="/submit" className="btn bg-white text-indigo-700 hover:bg-indigo-50"><FilePlus2 size={16} /> New RTI</Link>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Inbox} label={isOfficer ? 'Total received' : 'Total filed'} value={list.length} color="bg-indigo-100 text-indigo-600" />
        <Stat icon={Clock} label="Pending" value={open.length} color="bg-amber-100 text-amber-600" />
        <Stat icon={isOfficer ? AlertTriangle : CheckCircle2} label={isOfficer ? `Overdue • ${urgent.length} urgent` : 'Responded'} value={isOfficer ? overdue.length : responded.length} color={isOfficer ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} />
        <Stat icon={CheckCircle2} label="Closed" value={done.length} color="bg-emerald-100 text-emerald-600" />
      </div>

      {list.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card flex items-center gap-6 p-6">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: donut }}>
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><p className="text-xl font-extrabold leading-none">{list.length}<span className="block text-[10px] font-medium text-slate-500">total</span></p></div>
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending ({open.length})</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Responded ({responded.length})</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Rejected ({rejected.length})</li>
            </ul>
          </div>

          <div className="card p-6 lg:col-span-2">
            <h3 className="mb-3 font-bold">{isOfficer ? 'Due soonest' : 'By department'}</h3>
            {isOfficer ? (
              dueSoon.length ? (
                <ul className="space-y-2">
                  {dueSoon.map((r) => { const l = daysLeft(r.dueDate); return (
                    <li key={r.id}><Link href={`/application/${r.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm transition hover:bg-indigo-50">
                      <span className="truncate font-medium">{r.subject}</span>
                      <b className={l < 0 ? 'text-rose-600' : l <= 5 ? 'text-amber-600' : 'text-slate-500'}>{l < 0 ? `${-l}d overdue` : `${l}d left`}</b>
                    </Link></li>
                  ); })}
                </ul>
              ) : <p className="text-sm text-slate-500">No pending applications. 🎉</p>
            ) : (
              <div className="space-y-3">
                {byDept.map(([id, n]) => { const d = getDepartment(id); return (
                  <div key={id}>
                    <div className="mb-1 flex justify-between text-xs"><span>{d.emoji} {d.name}</span><b>{n}</b></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="animate-grow h-full rounded-full bg-gradient-to-r from-orange-500 to-indigo-600" style={{ width: `${(n / byDept[0][1]) * 100}%` }} /></div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isOfficer ? (
          <div className="flex flex-wrap gap-2">
            {[['all', 'All'], ['pending', 'Pending'], ['urgent', 'Urgent'], ['overdue', 'Overdue'], ['done', 'Closed']].map(([k, l]) => (
              <button key={k} onClick={() => setF(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${f === k ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{l}</button>
            ))}
          </div>
        ) : <h2 className="text-lg font-bold">My applications</h2>}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search by ID or subject…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => {
          const d = getDepartment(r.departmentId);
          const left = daysLeft(r.dueDate);
          const isOpen = r.status === 'under_review';
          return (
            <Link key={r.id} href={`/application/${r.id}`} className="card card-hover group flex flex-wrap items-center justify-between gap-4 border-l-4 p-5" style={{ borderLeftColor: r.status === 'responded' ? '#10b981' : r.status === 'rejected' ? '#f43f5e' : '#f59e0b' }}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600">{r.id}</span>
                  {r.urgent && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">URGENT</span>}
                  {isOfficer && r.ai?.confidence != null && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">AI {r.ai.confidence}%</span>}
                </div>
                <p className="mt-1 truncate font-semibold">{r.subject}</p>
                <p className="text-xs text-slate-500">{isOfficer ? `By ${r.applicantName}` : `${d.emoji} ${d.name}`} • Filed {fmtDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                {isOpen && <span className={`text-sm font-semibold ${left < 0 ? 'text-rose-600' : left <= 5 ? 'text-amber-600' : 'text-slate-500'}`}>{left < 0 ? `${-left}d overdue` : `${left}d left`}</span>}
                <StatusBadge status={r.status} />
                <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
        {!filtered.length && (
          <div className="card p-12 text-center text-slate-500">
            <p className="text-4xl">📭</p>
            <p className="mt-2">Nothing here yet. {!isOfficer && <Link href="/submit" className="font-semibold text-indigo-600">File your first RTI →</Link>}</p>
          </div>
        )}
      </div>
    </div>
  );
}
