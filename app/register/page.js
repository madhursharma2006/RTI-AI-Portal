'use client';
import { useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await res.json();
    if (!res.ok) { setErr(d.error); setLoading(false); return; }
    window.location.href = '/dashboard';
  };

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold">Create citizen account</h1>
        <p className="mt-1 text-sm text-slate-500">File and track RTI applications from one place.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Full name</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password (min 6)</label><input className="input" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          {err && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</p>}
          <button className="btn-primary w-full" disabled={loading}><UserPlus size={16} /> {loading ? 'Creating…' : 'Register'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-indigo-600">Login</Link></p>
      </div>
    </div>
  );
}
