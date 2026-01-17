'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnalysisResult, CareerPathway } from '@/types';
import RoadmapView from '@/components/RoadmapView';

interface ResultsDisplayProps {
  result: AnalysisResult;
  onStartOver: () => void;
}

const pathwayStyles = {
  'fast-income': {
    badge: 'bg-emerald-600',
    accent: 'from-emerald-50 via-white to-white',
    border: 'border-emerald-200',
  },
  balanced: {
    badge: 'bg-blue-600',
    accent: 'from-blue-50 via-white to-white',
    border: 'border-blue-200',
  },
  'max-upside': {
    badge: 'bg-indigo-600',
    accent: 'from-indigo-50 via-white to-white',
    border: 'border-indigo-200',
  },
  default: {
    badge: 'bg-slate-600',
    accent: 'from-slate-50 via-white to-white',
    border: 'border-slate-200',
  },
} as const;

const getPathwayLabel = (type: string) => {
  switch (type) {
    case 'fast-income':
      return 'Fast Income';
    case 'balanced':
      return 'Balanced Growth';
    case 'max-upside':
      return 'Maximum Upside';
    default:
      return type;
  }
};

const getPathwayStyles = (type: CareerPathway['type']) =>
  pathwayStyles[type] ?? pathwayStyles.default;

interface SectionProps {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

function Section({ title, summary, defaultOpen, children }: SectionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-slate-200 bg-white/80 shadow-sm"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-slate-900">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {summary ? (
            <div className="mt-1 truncate text-xs font-medium text-slate-500 group-open:hidden">
              {summary}
            </div>
          ) : null}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-180">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="px-4 pb-4 pt-1 text-sm text-slate-700">{children}</div>
    </details>
  );
}

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

const parseDurationRange = (value: string) => {
  const lower = value.toLowerCase();
  const matches = value.match(/[\d.]+/g);
  if (!matches) return null;

  const values = matches
    .map((match) => Number.parseFloat(match))
    .filter((val) => !Number.isNaN(val));
  if (!values.length) return null;

  let multiplier = 1;
  if (lower.includes('year')) {
    multiplier = 12;
  } else if (lower.includes('week')) {
    multiplier = 1 / 4;
  }

  const min = Math.min(...values) * multiplier;
  const max = Math.max(...values) * multiplier;

  return { min, max };
};

const formatDurationRange = (range: { min: number; max: number } | null) => {
  if (!range) return null;

  const min = Math.round(range.min * 10) / 10;
  const max = Math.round(range.max * 10) / 10;
  if (max < 12) {
    const minLabel = Number.isInteger(min) ? `${min}` : `${min}`.replace(/\.0$/, '');
    const maxLabel = Number.isInteger(max) ? `${max}` : `${max}`.replace(/\.0$/, '');
    return minLabel === maxLabel ? `${minLabel} months` : `${minLabel}–${maxLabel} months`;
  }

  const minYears = min / 12;
  const maxYears = max / 12;
  const formatYears = (value: number) => `${Math.round(value * 10) / 10}`.replace(/\.0$/, '');

  return formatYears(minYears) === formatYears(maxYears)
    ? `${formatYears(minYears)} years`
    : `${formatYears(minYears)}–${formatYears(maxYears)} years`;
};

const parseCostValue = (value: string) => {
  const matches = value.match(/[\d,.]+/g);
  if (!matches) return null;
  const numberValue = Number.parseFloat(matches[0].replace(/,/g, ''));
  return Number.isNaN(numberValue) ? null : numberValue;
};

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;

const getWhyBullets = (whyThisPath: string) =>
  whyThisPath
    .replace(/\s+/g, ' ')
    .split(/\. |\n|; /)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

function PathwayCard({ pathway }: { pathway: CareerPathway }) {
  const style = getPathwayStyles(pathway.type);
  const totalSteps = pathway.roadmap.reduce((sum, phase) => sum + phase.steps.length, 0);
  const roadmapDuration = pathway.roadmap.reduce<{ min: number; max: number } | null>(
    (acc, phase) => {
      const range = parseDurationRange(phase.duration);
      if (!range) return acc;
      if (!acc) return { ...range };
      return { min: acc.min + range.min, max: acc.max + range.max };
    },
    null
  );
  const roadmapSummaryParts = [
    pluralize(pathway.roadmap.length, 'phase', 'phases'),
    pluralize(totalSteps, 'step', 'steps'),
    formatDurationRange(roadmapDuration),
  ].filter(Boolean);
  const roadmapSummary = roadmapSummaryParts.join(' · ');

  const credentialCosts = pathway.requiredCredentials
    .map((credential) => parseCostValue(credential.cost))
    .filter((value): value is number => value !== null);
  const totalCredentialCost = credentialCosts.reduce((sum, value) => sum + value, 0);
  const credentialTimelineRange = pathway.requiredCredentials.reduce<{
    min: number;
    max: number;
  } | null>((acc, credential) => {
    const range = parseDurationRange(credential.timeline);
    if (!range) return acc;
    if (!acc) return { ...range };
    return { min: Math.min(acc.min, range.min), max: Math.max(acc.max, range.max) };
  }, null);
  const credentialSummaryParts = [
    pluralize(pathway.requiredCredentials.length, 'credential', 'credentials'),
    totalCredentialCost > 0 ? `est ${formatCurrency(totalCredentialCost)}` : null,
    formatDurationRange(credentialTimelineRange),
  ].filter(Boolean);
  const credentialSummary = credentialSummaryParts.join(' · ');

  const familySummary = [
    `Time ${pathway.familyImpact.timeCommitment}`,
    `Flex ${pathway.familyImpact.flexibility}`,
    `Stability ${pathway.familyImpact.stability}`,
  ].join(' · ');

  const whyBullets = getWhyBullets(pathway.whyThisPath);
  const shouldRenderWhyBullets = whyBullets.length >= 3;
  const whySummary = whyBullets[0] ?? pathway.whyThisPath;

  return (
    <article
      className={`flex h-full flex-col gap-5 rounded-2xl border ${style.border} bg-gradient-to-br ${style.accent} p-6 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center rounded-full ${style.badge} px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white`}
          >
            {getPathwayLabel(pathway.type)}
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900">{pathway.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{pathway.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Year 1</p>
          <p className="mt-1 font-semibold text-slate-900">{pathway.incomeTrajectory.year1}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Year 3</p>
          <p className="mt-1 font-semibold text-slate-900">{pathway.incomeTrajectory.year3}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Year 5</p>
          <p className="mt-1 font-semibold text-emerald-700">{pathway.incomeTrajectory.year5}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Time</p>
          <p className="mt-1 font-semibold text-slate-900">{pathway.familyImpact.timeCommitment}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Section title="Step-by-Step Roadmap" summary={roadmapSummary} defaultOpen>
          <RoadmapView roadmap={pathway.roadmap} />
        </Section>
        <Section title="Required Credentials" summary={credentialSummary}>
          {pathway.requiredCredentials.length ? (
            <div className="space-y-3">
              {pathway.requiredCredentials.map((cred, idx) => (
                <div
                  key={`${cred.name}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white/80 p-3"
                >
                  <div className="text-sm font-semibold text-slate-900">{cred.name}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>Timeline: {cred.timeline}</span>
                    <span>Cost: {cred.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">No required credentials listed.</p>
          )}
        </Section>
        <Section title="Family Impact" summary={familySummary}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Flexibility</span>
              <span className="font-medium text-slate-900">{pathway.familyImpact.flexibility}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Stability</span>
              <span className="font-medium text-slate-900">{pathway.familyImpact.stability}</span>
            </div>
            <p className="rounded-lg border border-slate-200 bg-white/80 p-3 text-sm text-slate-600">
              {pathway.familyImpact.notes}
            </p>
          </div>
        </Section>
        <Section title="Why This Path" summary={whySummary}>
          {shouldRenderWhyBullets ? (
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {whyBullets.slice(0, 3).map((bullet, idx) => (
                <li key={`${bullet}-${idx}`}>{bullet}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-slate-700">{pathway.whyThisPath}</p>
          )}
        </Section>
      </div>
    </article>
  );
}

export default function ResultsDisplay({ result, onStartOver }: ResultsDisplayProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const pathways = useMemo(() => result.pathways ?? [], [result.pathways]);

  if (!pathways.length) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">No pathways generated</h2>
          <p className="mt-3 text-sm text-slate-600">
            We could not assemble recommendations for this profile yet. Please try again or adjust
            your inputs.
          </p>
          <button
            onClick={onStartOver}
            className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const activePathway = pathways[Math.min(activeIndex, pathways.length - 1)];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-4">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Career Pathways
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            Your Transition Intelligence
          </h1>
        </div>
        <button
          onClick={onStartOver}
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900"
        >
          Start Over
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="max-w-3xl text-base leading-relaxed text-slate-700">{result.summary}</p>
      </div>

      <div className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Compare Pathways</h2>
          <p className="text-xs text-slate-500 md:hidden">Tap a tab to compare on mobile</p>
        </div>

        <div className="md:hidden">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white/80 p-2">
            {pathways.map((pathway, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={`${pathway.type}-${idx}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                  type="button"
                >
                  {getPathwayLabel(pathway.type)}
                </button>
              );
            })}
          </div>
          <PathwayCard pathway={activePathway} />
        </div>

        <div className="hidden md:grid md:grid-cols-3 md:gap-6">
          {pathways.map((pathway, index) => (
            <PathwayCard key={`${pathway.type}-${index}`} pathway={pathway} />
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
        <h3 className="text-xl font-semibold">Ready to Take the Next Step?</h3>
        <p className="mt-2 text-sm text-slate-200">
          Save these pathways and review them with a mentor, counselor, or spouse before you commit.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={onStartOver}
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white hover:border-slate-500"
          >
            Generate New Pathways
          </button>
        </div>
      </div>
    </div>
  );
}
