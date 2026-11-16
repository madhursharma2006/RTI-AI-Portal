export const STATUS = {
  submitted: { label: 'Submitted', cls: 'bg-sky-100 text-sky-700 ring-sky-200' },
  under_review: { label: 'Under Review', cls: 'bg-amber-100 text-amber-700 ring-amber-200' },
  responded: { label: 'Responded', cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-700 ring-rose-200' },
};

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const daysLeft = (due) => Math.ceil((new Date(due) - Date.now()) / 86400000);
