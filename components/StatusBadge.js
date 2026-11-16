import { STATUS } from '@/lib/utils';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.submitted;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>
      {s.label}
    </span>
  );
}
