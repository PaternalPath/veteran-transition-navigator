'use client';

import { CareerPathway } from '@/types';

interface RoadmapViewProps {
  roadmap: CareerPathway['roadmap'];
}

export default function RoadmapView({ roadmap }: RoadmapViewProps) {
  if (!roadmap.length) {
    return <p className="text-sm text-slate-600">No roadmap steps provided yet.</p>;
  }

  return (
    <div className="space-y-4">
      {roadmap.map((phase, idx) => (
        <div key={`${phase.phase}-${idx}`} className="relative pl-5">
          <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300" />
          <div className="rounded-lg border border-slate-200 bg-white/70 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {phase.phase}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {phase.duration}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {phase.steps.map((step, stepIdx) => (
                <li key={`${phase.phase}-${stepIdx}`} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
