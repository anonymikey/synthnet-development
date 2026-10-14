export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading the dashboard</span>
      <div className="h-9 w-72 animate-pulse rounded-md bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg border border-line bg-surface" />
    </div>
  );
}
