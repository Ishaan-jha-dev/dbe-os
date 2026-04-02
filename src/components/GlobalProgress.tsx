"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { CheckCircle2 } from "lucide-react";

export default function GlobalProgress() {
    const { getGlobalProgress, isLoaded } = useProgress();
    const [progressData, setProgressData] = useState({ totalModules: 0, completedModules: 0, percentage: 0 });

    const hydrateProgress = () => {
        setProgressData(getGlobalProgress());
    };

    useEffect(() => {
        if (isLoaded) {
            hydrateProgress();
        }

        // Listen for progress updates from other components
        const handleProgressUpdate = () => {
            // Need to wait briefly for localStorage to sync across the dispatch
            setTimeout(hydrateProgress, 50);
        };

        window.addEventListener("dbe_progress_updated", handleProgressUpdate);

        return () => window.removeEventListener("dbe_progress_updated", handleProgressUpdate);
    }, [isLoaded, getGlobalProgress]);

    if (!isLoaded) {
        return <div className="animate-pulse w-32 h-8 bg-white/5 rounded-full" />;
    }

    if (progressData.totalModules === 0) return null;

    return (
        <div className="flex items-center gap-3 bg-surface-container-high border border-outline-variant/20 px-3 py-1.5 rounded-full shadow-sm transition-all hover:bg-surface-container-highest">
            <div className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${progressData.percentage === 100 ? 'text-primary' : 'text-secondary'}`} />
                <span className="text-sm font-bold font-headline text-on-surface">
                    {progressData.percentage}%
                </span>
            </div>

            <div className="w-16 sm:w-24 h-2 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10">
                <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${progressData.percentage}%` }}
                />
            </div>

            <span className="text-xs font-bold text-on-surface-variant hidden sm:inline-block">
                {progressData.completedModules}/{progressData.totalModules}
            </span>
        </div>
    );
}
