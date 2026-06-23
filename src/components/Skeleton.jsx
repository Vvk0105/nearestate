/**
 * Reusable skeleton primitives and composed skeletons.
 *
 * Usage:
 *   <SkeletonCard />              — single event card skeleton
 *   <EventGridSkeleton count={6} /> — grid of n skeletons
 *   <EventDetailSkeleton />       — full event detail page skeleton
 */

// ─── Base ────────────────────────────────────────────────────────────────────
function Bone({ className = '' }) {
    return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

// ─── Event Card Skeleton ──────────────────────────────────────────────────────
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            {/* Image area */}
            <Bone className="h-48 w-full rounded-none" />
            <div className="p-5 flex-1 flex flex-col gap-3">
                {/* Title */}
                <Bone className="h-5 w-3/4" />
                {/* Description lines */}
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-5/6" />
                {/* Meta */}
                <div className="flex flex-col gap-2 mt-1">
                    <Bone className="h-3.5 w-1/2" />
                    <Bone className="h-3.5 w-2/3" />
                </div>
                {/* CTA */}
                <Bone className="h-9 w-full mt-auto" />
            </div>
        </div>
    );
}

// ─── Event Grid Skeleton ──────────────────────────────────────────────────────
export function EventGridSkeleton({ count = 6 }) {
    return (
        <div className="space-y-10 pb-16 animate-fade-in">
            {/* Banner skeleton */}
            <Bone className="h-72 md:h-96 w-full rounded-2xl" />

            {/* Filter pills skeleton */}
            <div className="flex gap-2">
                {[80, 72, 88, 64].map((w, i) => (
                    <Bone key={i} className={`h-9 rounded-full`} style={{ width: w }} />
                ))}
            </div>

            {/* Section header */}
            <div className="space-y-6">
                <Bone className="h-7 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: count }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Event Detail Skeleton ────────────────────────────────────────────────────
export function EventDetailSkeleton() {
    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Hero banner */}
            <Bone className="h-72 md:h-96 w-full rounded-2xl" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-slate-200 pb-3">
                        <Bone className="h-5 w-28" />
                        <Bone className="h-5 w-24" />
                    </div>

                    {/* Content card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-6">
                        <div className="space-y-3">
                            <Bone className="h-6 w-40" />
                            <Bone className="h-4 w-full" />
                            <Bone className="h-4 w-11/12" />
                            <Bone className="h-4 w-4/5" />
                        </div>
                        <div className="space-y-2">
                            <Bone className="h-5 w-32" />
                            <Bone className="h-4 w-24" />
                        </div>
                        {/* Map area */}
                        <div className="space-y-3">
                            <Bone className="h-6 w-28" />
                            <Bone className="h-56 w-full rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5">
                        <Bone className="h-6 w-32" />
                        <Bone className="h-16 w-full rounded-xl" />
                        <Bone className="h-16 w-full rounded-xl" />
                        <Bone className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── My Events / Simple List Skeleton ────────────────────────────────────────
export function ListSkeleton({ count = 4 }) {
    return (
        <div className="space-y-4 animate-fade-in">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex gap-4">
                    <Bone className="h-16 w-16 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Bone className="h-4 w-1/2" />
                        <Bone className="h-3.5 w-3/4" />
                        <Bone className="h-3.5 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
