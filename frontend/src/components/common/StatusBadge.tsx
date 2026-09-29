import type { RiskLevel, ParcelStage } from '../../types';
import { STAGE_LABELS } from '../../types';

const riskStyles: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const riskDot: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-rose-500',
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const labels: Record<RiskLevel, string> = { LOW: 'On track', MEDIUM: 'Medium risk', HIGH: 'High risk' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${riskStyles[risk]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${riskDot[risk]}`} />
      {labels[risk]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: ParcelStage }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
      {STAGE_LABELS[stage]}
    </span>
  );
}
