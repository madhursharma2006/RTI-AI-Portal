import './globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Scale } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RTI·AI – Smart Right to Information Portal',
  description: 'File, track and receive RTI responses faster with AI-assisted triage and drafting.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="bg-grid absolute inset-0" />
          <div className="animate-blob absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-300/40 blur-3xl" />
          <div className="animate-blob absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-orange-200/50 blur-3xl" style={{ animationDelay: '-4s' }} />
          <div className="animate-blob absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-200/40 blur-3xl" style={{ animationDelay: '-8s' }} />
        </div>
        <Navbar />
        <main className="mx-auto min-h-[75vh] max-w-7xl px-4 py-10">{children}</main>
        <footer className="mt-10 border-t bg-white/60 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-500 md:grid-cols-3">
            <div>
              <p className="flex items-center gap-2 text-lg font-extrabold text-slate-800"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white"><Scale size={16} /></span>RTI·AI</p>
              <p className="mt-3">AI-assisted, human-approved transparency for every citizen. Built around the Right to Information Act, 2005.</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Quick links</p>
              <ul className="mt-3 space-y-1.5">
                <li><Link href="/submit" className="hover:text-indigo-600">File an RTI</Link></li>
                <li><Link href="/track" className="hover:text-indigo-600">Track application</Link></li>
                <li><Link href="/archive" className="hover:text-indigo-600">Public archive</Link></li>
                <li><Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-slate-800">Timelines</p>
              <ul className="mt-3 space-y-1.5">
                <li>Reply within 30 days</li>
                <li>48 hours for life &amp; liberty</li>
                <li>First appeal within 30 days (Sec 19)</li>
                <li>Fee ₹10, BPL exempt</li>
              </ul>
            </div>
          </div>
          <p className="border-t py-4 text-center text-xs text-slate-400">© RTI·AI Portal • College project demo</p>
        </footer>
      </body>
    </html>
  );
}
