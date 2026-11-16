import Link from 'next/link';
import { FilePlus2, Search, Brain, ShieldCheck, Clock, Sparkles, Route, FileText, ArrowRight, Mic, BarChart3, Languages, CheckCircle2, User, Landmark, Bell } from 'lucide-react';
import { getStats } from '@/lib/db';
import { DEPARTMENTS } from '@/lib/departments';
import Reveal from '@/components/Reveal';
import Counter from '@/components/Counter';
import RotatingWord from '@/components/RotatingWord';
import LiveDemo from '@/components/LiveDemo';
import FAQ from '@/components/FAQ';

export const dynamic = 'force-dynamic';

export default function Home() {
  const s = getStats();
  const stats = [
    { n: s.total, suf: '+', l: 'RTI Applications' },
    { n: s.responded, suf: '', l: 'Responses Issued' },
    { n: s.avgDays, suf: ' days', l: 'Avg. Response Time' },
    { n: s.departments, suf: '', l: 'Departments Connected' },
  ];
  const steps = [
    { i: FilePlus2, t: 'Submit', d: 'Describe what you need in plain words — type or speak.' },
    { i: Brain, t: 'AI Triage', d: 'AI categorises the request and picks the right department.' },
    { i: Search, t: 'Precedent Search', d: 'Semantic search surfaces similar past RTI replies.' },
    { i: FileText, t: 'Officer Review', d: 'A draft is prepared; the PIO reviews and approves it.' },
  ];
  const feats = [
    { i: Route, t: 'Smart routing', d: 'Keyword, concept and precedent-based routing cuts wrongly addressed RTIs.', c: 'from-indigo-500 to-violet-600' },
    { i: Sparkles, t: 'AI-drafted replies', d: 'Formal, Act-compliant drafts with placeholders — never auto-sent.', c: 'from-orange-500 to-amber-500' },
    { i: ShieldCheck, t: 'Exemption alerts', d: 'Flags possible Section 8 exemptions so officers decide with confidence.', c: 'from-emerald-500 to-green-600' },
    { i: Clock, t: 'Deadline tracking', d: '30-day and 48-hour deadlines with live countdowns and overdue flags.', c: 'from-rose-500 to-pink-600' },
    { i: Mic, t: 'Voice input', d: 'Dictate your request instead of typing — great on mobile.', c: 'from-sky-500 to-cyan-500' },
    { i: BarChart3, t: 'Live analytics', d: 'Dashboards with status split, department breakdown and due-soon lists.', c: 'from-fuchsia-500 to-purple-600' },
  ];
  const loop = [...DEPARTMENTS, ...DEPARTMENTS];

  return (
    <div className="space-y-28">
      {/* HERO */}
      <section className="grid items-center gap-14 pt-6 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="animate-pulse-ring h-2 w-2 rounded-full bg-emerald-500" /> AI-assisted • Human-approved
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Your <RotatingWord />,<br /> answered faster.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            File an RTI in minutes, track it live and receive official responses. Our AI routes your request to the right
            department and helps officers prepare accurate replies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="btn-primary !px-7 !py-3.5 text-base">File an RTI <ArrowRight size={18} /></Link>
            <Link href="/track" className="btn-ghost !px-7 !py-3.5 text-base">Track application</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {['Free for BPL citizens', '30-day deadline tracking', 'Officer-approved replies'].map((x) => (
              <span key={x} className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> {x}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-orange-300/40 via-indigo-300/40 to-green-300/40 blur-2xl" />
          <div className="card animate-float p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">RTI-2026-0042</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Under Review</span>
            </div>
            <p className="font-semibold">Status of repair work on city bypass road</p>
            <div className="mt-4 space-y-3 rounded-xl bg-indigo-50/70 p-4 text-sm">
              <p className="flex items-center gap-2"><Brain size={16} className="text-indigo-600" /> Routed to <b>Public Works</b> • 92%</p>
              <p className="flex items-center gap-2"><Search size={16} className="text-indigo-600" /> 3 similar past RTIs found</p>
              <p className="flex items-center gap-2"><FileText size={16} className="text-indigo-600" /> Draft ready for PIO review</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="animate-grow h-full w-2/3 rounded-full bg-gradient-to-r from-orange-500 to-green-600" /></div>
            <p className="mt-2 text-xs text-slate-500">21 days left of 30</p>
          </div>
          <div className="card absolute -left-6 -top-5 hidden animate-float items-center gap-2 px-4 py-2.5 text-xs font-semibold sm:flex" style={{ animationDelay: '-2s' }}><Bell size={14} className="text-orange-500" /> Reply due in 3 days</div>
          <div className="card absolute -bottom-5 -right-4 hidden animate-float items-center gap-2 px-4 py-2.5 text-xs font-semibold sm:flex" style={{ animationDelay: '-4s' }}><CheckCircle2 size={14} className="text-emerald-500" /> Response approved</div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="marquee-mask overflow-hidden">
        <div className="animate-marquee flex w-max gap-3">
          {loop.map((d, i) => (
            <span key={i} className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm">{d.emoji} {d.name}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <Reveal>
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((x) => (
            <div key={x.l} className="card card-hover p-6 text-center">
              <p className="gradient-text text-4xl font-extrabold"><Counter to={x.n} suffix={x.suf} /></p>
              <p className="mt-1 text-sm text-slate-500">{x.l}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* HOW IT WORKS */}
      <section>
        <Reveal><h2 className="text-center text-3xl font-extrabold">How it works</h2><p className="mt-2 text-center text-slate-500">Four steps from question to answer</p></Reveal>
        <div className="relative mt-12 grid gap-5 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-12 hidden h-0.5 bg-gradient-to-r from-orange-400 via-indigo-500 to-green-500 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 120}>
              <div className="card card-hover relative h-full p-6 text-center">
                <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"><s.i size={24} /></span>
                <span className="absolute right-4 top-3 text-5xl font-black text-slate-100">{i + 1}</span>
                <h3 className="mt-4 font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
      <section>
        <Reveal><h2 className="text-center text-3xl font-extrabold">See the AI in action</h2><p className="mb-8 mt-2 text-center text-slate-500">Type a request — routing, keywords and precedents appear instantly</p></Reveal>
        <Reveal delay={100}><LiveDemo /></Reveal>
      </section>

      {/* FEATURES */}
      <section>
        <Reveal><h2 className="text-center text-3xl font-extrabold">Everything in one portal</h2></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 100}>
              <div className="card card-hover group h-full p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.c} text-white shadow-lg transition duration-300 group-hover:rotate-6 group-hover:scale-110`}><f.i size={22} /></span>
                <h3 className="mt-4 font-bold">{f.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="card card-hover h-full p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-orange-600"><User size={22} /></span>
            <h3 className="mt-4 text-xl font-extrabold">For citizens</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {['File and pay online in minutes', 'Live status timeline and countdown', 'Read official replies in your dashboard', 'Search the public archive of past replies'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />{x}</li>)}
            </ul>
            <Link href="/register" className="btn-saffron mt-6">Create account</Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card card-hover h-full p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><Landmark size={22} /></span>
            <h3 className="mt-4 text-xl font-extrabold">For officers (PIO)</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {['AI insights, confidence and exemption alerts', 'Editable AI draft with precedent guidance', 'Approve, reject or transfer under Sec 6(3)', 'Overdue and urgent filters at a glance'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />{x}</li>)}
            </ul>
            <Link href="/login" className="btn-primary mt-6">Officer demo login</Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section>
        <Reveal><h2 className="mb-8 text-center text-3xl font-extrabold">Frequently asked questions</h2></Reveal>
        <Reveal delay={100}><FAQ /></Reveal>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-900 p-12 text-center text-white shadow-2xl">
          <div className="animate-blob absolute -left-10 -top-10 h-56 w-56 rounded-full bg-orange-400/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-green-400/30 blur-3xl" style={{ animationDelay: '-6s' }} />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Transparency starts with a question.</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-indigo-100">Demo logins — Citizen: citizen@example.com / citizen123 • Officer: officer.health@gov.in / officer123</p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="btn bg-white !px-8 !py-3 text-indigo-700 hover:bg-indigo-50">Try the demo</Link>
            <Link href="/submit" className="btn border border-white/40 !px-8 !py-3 text-white hover:bg-white/10">File an RTI</Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
