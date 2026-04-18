import { Loader } from 'lucide-react';

/**
 * Full-viewport loading screen.
 * Use for any page-level data fetch so no partial layout flashes.
 */
export default function FullPageLoader({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-blue-100 animate-pulse" />
                    <Loader
                        className="absolute inset-0 m-auto animate-spin text-blue-600"
                        size={36}
                    />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{message}</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Please wait a moment…
                    </p>
                </div>
            </div>
        </div>
    );
}
