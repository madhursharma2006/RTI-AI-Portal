'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Scale, LogOut, Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/submit', label: 'File RTI' },
  { href: '/track', label: 'Track' },
  { href: '/archive', label: 'Archive' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const path = usePathname();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setScrolled(h.scrollTop > 10);
      setPct((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
      <div className={`border-b transition duration-300 ${scrolled ? 'border-slate-200 bg-white/85 shadow-lg shadow-indigo-900/5 backdrop-blur-xl' : 'border-transparent bg-white/40 backdrop-blur'}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <Scale size={18} />
            </span>
            RTI<span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">·AI</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${path === l.href ? 'text-indigo-700' : 'text-slate-600 hover:text-indigo-600'}`}>
                {l.label}
                <span className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gradient-to-r from-orange-500 to-indigo-600 transition-transform duration-300 ${path === l.href ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-indigo-600 text-sm font-bold text-white">{user.name[0]}</span>
                <div className="leading-tight">
                  <p className="max-w-[160px] truncate text-sm font-semibold">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.role}</p>
                </div>
                <button onClick={logout} className="btn-ghost !px-3" title="Logout"><LogOut size={16} /></button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Login</Link>
                <Link href="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </nav>

        {open && (
          <div className="space-y-1 border-t bg-white px-4 pb-4 md:hidden">
            {links.map((l) => <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">{l.label}</Link>)}
            {user
              ? <button onClick={logout} className="btn-ghost w-full">Logout ({user.name})</button>
              : <div className="flex gap-2 pt-2"><Link href="/login" className="btn-ghost flex-1">Login</Link><Link href="/register" className="btn-primary flex-1">Register</Link></div>}
          </div>
        )}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 via-indigo-600 to-green-600 transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
