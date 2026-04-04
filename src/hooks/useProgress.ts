"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSubjects } from "@/data/db";
import { getProgressAction, markModuleCompleteAction } from "@/actions/progress";

export type ProgressData = {
    [subjectId: string]: {
        [moduleId: number]: {
            score: number;
            total: number;
            completed: boolean;
        };
    };
};

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        getProgressAction().then(data => {
            setProgress(data);
            setIsLoaded(true);
        }).catch(e => {
            console.error("Failed to load progress from server", e);
            setIsLoaded(true);
        });
    }, []);

    const markModuleComplete = useCallback((subjectId: string, moduleId: number, score: number, total: number) => {
        setProgress((prev) => {
            const nextProgress = {
                ...prev,
                [subjectId]: {
                    ...prev[subjectId],
                    [moduleId]: {
                        score,
                        total,
                        completed: true,
                    },
                },
            };

            // Background sync
            markModuleCompleteAction(subjectId, moduleId, score, total).catch(console.error);

            // Dispatch custom event for other components
            window.dispatchEvent(new Event("dbe_progress_updated"));

            return nextProgress;
        });
    }, []);

    const getGlobalProgress = useCallback(() => {
        const subjects = getAllSubjects();
        let totalModules = 0;
        let completedModules = 0;

        subjects.forEach(subject => {
            totalModules += subject.modules.length;
            const subjectProgress = progress[subject.id];
            if (subjectProgress) {
                completedModules += Object.values(subjectProgress).filter((m: any) => m.completed).length;
            }
        });

        const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        return { totalModules, completedModules, percentage };
    }, [progress]);

    const getSubjectProgress = useCallback((subjectId: string) => {
        const subjects = getAllSubjects();
        const subject = subjects.find(s => s.id === subjectId);

        if (!subject) return { total: 0, completed: 0, percentage: 0 };

        const total = subject.modules.length;
        let completed = 0;

        const subjectData = progress[subjectId];
        if (subjectData) {
            completed = Object.values(subjectData).filter((m: any) => m.completed).length;
        }

        return {
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }, [progress]);

    return { progress, isLoaded, markModuleComplete, getGlobalProgress, getSubjectProgress };
}
