import { Check, Circle } from 'lucide-react';
import { STAGE_ORDER, STAGE_LABELS, type ParcelStage, type StageEvent } from '../../types';

interface Props {
  currentStage: ParcelStage;
  events: StageEvent[];
  compact?: boolean;
}

export function StageTimeline({ currentStage, events, compact = false }: Props) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const eventByStage = new Map(events.map((e) => [e.stage, e]));

  if (compact) {
    const pct = ((currentIndex + 1) / STAGE_ORDER.length) * 100;
    return (
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Survey</span>
          <span className="font-display text-indigo-700">{STAGE_LABELS[currentStage]}</span>
          <span>Possession</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <ol className="flex min-w-[900px] items-start">
        {STAGE_ORDER.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const event = eventByStage.get(stage);
          return (
            <li key={stage} className="flex flex-1 flex-col items-center text-center">
              <div className="relative flex w-full items-center">
                <div
                  className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : done || active ? 'bg-indigo-500' : 'bg-slate-200'}`}
                />
                <div
                  className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : active
                      ? 'border-indigo-500 bg-white text-indigo-600 ring-4 ring-indigo-100'
                      : 'border-slate-300 bg-white text-slate-300'
                  }`}
                >
                  {done ? <Check size={16} /> : <Circle size={10} fill="currentColor" />}
                </div>
                <div
                  className={`h-0.5 flex-1 ${
                    i === STAGE_ORDER.length - 1 ? 'opacity-0' : done ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                />
              </div>
              <p className={`mt-2 font-display text-[11px] font-bold uppercase tracking-wide ${active ? 'text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                {STAGE_LABELS[stage]}
              </p>
              {event && (
                <div className="mt-1 max-w-[110px] text-[10px] text-slate-500">
                  <p className="font-mono-data">{event.date}</p>
                  <p className="truncate" title={event.actor}>{event.actor}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
