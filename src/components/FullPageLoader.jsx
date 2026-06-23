/**
 * FullPageLoader — used ONLY for auth-gate / hard redirect guards.
 * For data fetching, use inline skeleton components instead.
 *
 * Renders a slim animated progress bar at the top of the page
 * plus a subtle centered pulse — much less jarring than a white overlay.
 */
export default function FullPageLoader({ message = 'Loading…' }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50/80 backdrop-blur-[2px]">
            {/* Top progress bar */}
            <div className="h-[3px] w-full overflow-hidden bg-slate-200">
                <div className="h-full animate-progress-bar bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full" />
            </div>

            {/* Centered subtle indicator */}
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-2.5 w-2.5 rounded-full bg-blue-500"
                            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                    ))}
                </div>
                <p className="text-sm font-medium text-slate-500 animate-fade-in">{message}</p>
            </div>
        </div>
    );
}
