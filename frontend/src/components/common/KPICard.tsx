import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
}

const toneStyles: Record<NonNullable<Props['tone']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

export function KPICard({ label, value, sublabel, icon: Icon, tone = 'indigo' }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`rounded-lg p-1.5 ${toneStyles[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-slate-900 font-mono-data">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
