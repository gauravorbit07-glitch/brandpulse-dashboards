import { Skeleton } from "@/components/ui/skeleton";

export const OverviewSkeleton = () => {
  return (
    <div className="w-full max-w-full p-4 md:p-6 lg:p-8 space-y-10 animate-fade-in">
      {/* Brand Info Bar */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 md:p-6 shadow-card">
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl p-6 md:p-8 lg:p-10 bg-gradient-to-br from-muted/40 to-muted/20 border border-border/60">
        <div className="flex items-start gap-5">
          <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border/60 p-6 space-y-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-12 rounded" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Section divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <Skeleton className="h-3 w-40" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border/60 p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};
