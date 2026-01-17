'use client';

export default function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-12 pt-4">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <p>Generating your pathways...</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full bg-slate-200" />
            <div className="h-8 w-64 rounded-xl bg-slate-200" />
          </div>
          <div className="h-9 w-28 rounded-full bg-slate-200" />
        </div>

        <div className="h-24 rounded-2xl bg-slate-100" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded-lg bg-slate-200" />
            <div className="h-3 w-36 rounded-full bg-slate-100" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-6 w-28 rounded-full bg-slate-200" />
                <div className="h-6 w-48 rounded-lg bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                  <div className="h-16 rounded-xl bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-10 rounded-xl bg-slate-100" />
                  <div className="h-10 rounded-xl bg-slate-100" />
                  <div className="h-10 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
