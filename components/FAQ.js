'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ITEMS = [
  ['What is an RTI application?', 'Under the Right to Information Act, 2005 any citizen can ask a public authority for information held by it. The authority must reply within 30 days.'],
  ['How much does it cost?', 'The application fee is ₹10. Citizens below the poverty line (BPL) are exempt. Extra charges may apply for photocopies or large records.'],
  ['What if my matter is about life or liberty?', 'Tick the urgent option while filing. Information concerning the life or liberty of a person must be provided within 48 hours.'],
  ['Does AI send my reply?', 'Never. AI only classifies the request, finds similar past replies and prepares a draft. A Public Information Officer reviews, edits and approves every response.'],
  ['What if I am not satisfied with the reply?', 'You can file a first appeal under Section 19(1) with the First Appellate Authority within 30 days of receiving the reply.'],
  ['Can any information be refused?', 'Yes. Section 8 lists exemptions such as national security, personal information or matters that would impede an investigation. The officer must cite the section used.'],
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {ITEMS.map(([q, a], i) => (
        <div key={q} className={`card overflow-hidden transition ${open === i ? 'ring-2 ring-indigo-200' : ''}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold">
            {q}
            <ChevronDown size={18} className={`shrink-0 text-indigo-600 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{a}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
