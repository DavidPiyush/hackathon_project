import { Container } from "@/components/ui/Layout";

/**
 * Skeleton shown while a dashboard page streams in. Mirrors the real layout
 * (header block, stat row, two panels) so the transition does not reflow.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-line bg-surface/40 px-6 py-8 lg:px-8">
        <div className="h-3 w-28 rounded bg-raise-md" />
        <div className="mt-4 h-8 w-64 rounded bg-raise-lg" />
        <div className="mt-4 h-4 w-full max-w-xl rounded bg-raise-md" />
      </div>

      <div className="space-y-6 px-6 py-8 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 rounded-xl border border-line bg-surface/50"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-80 rounded-xl border border-line bg-surface/50" />
          <div className="h-80 rounded-xl border border-line bg-surface/50" />
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}
