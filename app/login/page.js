'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LogIn, User, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await res.json();
    if (!res.ok) { setErr(d.error); setLoading(false); return; }
    const next = new URLSearchParams(window.location.search).get('next');
    window.location.href = next || '/dashboard';
  };

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Login as a citizen or a department officer.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost !text-xs" onClick={() => setF({ email: 'citizen@example.com', password: 'citizen123' })}><User size={14} /> Citizen demo</button>
          <button type="button" className="btn-ghost !text-xs" onClick={() => setF({ email: 'officer.health@gov.in', password: 'officer123' })}><ShieldCheck size={14} /> Officer demo</button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}><LogIn size={16} /> {loading ? 'Signing in…' : 'Login'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">New here? <Link href="/register" className="font-semibold text-indigo-600">Create an account</Link></p>
        <p className="mt-3 text-center text-xs text-slate-400">Officer emails: officer.&lt;dept&gt;@gov.in (health, education, works, municipal, water, power, police, revenue, transport, food, welfare, agri, finance)</p>
      </div>
    </div>
  );
}
