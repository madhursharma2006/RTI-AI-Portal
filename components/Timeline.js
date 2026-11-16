import { fmtDateTime } from '@/lib/utils';

const DOT = {
  submitted: 'bg-sky-500',
  under_review: 'bg-amber-500',
  responded: 'bg-emerald-500',
  rejected: 'bg-rose-500',
};

export default function Timeline({ items = [] }) {
  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-slate-200">
      {items.map((t, i) => (
        <li key={i} className="ml-6">
          <span className={`absolute -left-[9px] mt-1 h-4 w-4 rounded-full ring-4 ring-white ${DOT[t.status] || 'bg-slate-400'}`} />
          <p className="text-sm font-semibold text-slate-800">{t.note}</p>
          <p className="text-xs text-slate-500">{fmtDateTime(t.at)}</p>
        </li>
      ))}
    </ol>
  );
}
