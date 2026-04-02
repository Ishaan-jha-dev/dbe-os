"use client";

import { useState, useEffect, useCallback } from "react";

export interface QuizAttempt {
    id: string;
    subjectId: string;
    moduleId: number;
    mode: "practice" | "exam";
    score: number;
    total: number;
    timeSpent: number; // seconds
    timestamp: string; // ISO
}

export interface ModuleStats {
    attempts: number;
    bestAccuracy: number;
    totalTimeSpent: number;
    lastAttempt: string | null;
}

const HISTORY_KEY = "dbe_os_quiz_history";

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function useQuizHistory() {
    const [history, setHistory] = useState<QuizAttempt[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch {
                setHistory([]);
            }
        }
        setIsLoaded(true);
    }, []);

    const persist = useCallback((next: QuizAttempt[]) => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    }, []);

    const saveAttempt = useCallback(
        (attempt: Omit<QuizAttempt, "id" | "timestamp">) => {
            setHistory((prev) => {
                const next = [
                    ...prev,
                    { ...attempt, id: generateId(), timestamp: new Date().toISOString() },
                ];
                persist(next);
                return next;
            });
        },
        [persist]
    );

    const getModuleStats = useCallback(
        (subjectId: string, moduleId: number): ModuleStats => {
            const attempts = history.filter(
                (a) => a.subjectId === subjectId && a.moduleId === moduleId
            );

            if (attempts.length === 0) {
                return { attempts: 0, bestAccuracy: 0, totalTimeSpent: 0, lastAttempt: null };
            }

            const bestAccuracy = Math.max(
                ...attempts.map((a) => Math.round((a.score / a.total) * 100))
            );
            const totalTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
            const lastAttempt = attempts.sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0].timestamp;

            return {
                attempts: attempts.length,
                bestAccuracy,
                totalTimeSpent,
                lastAttempt,
            };
        },
        [history]
    );

    const getAttempts = useCallback(
        (subjectId?: string, moduleId?: number): QuizAttempt[] => {
            return history
                .filter((a) => {
                    if (subjectId && a.subjectId !== subjectId) return false;
                    if (moduleId !== undefined && a.moduleId !== moduleId) return false;
                    return true;
                })
                .sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
        },
        [history]
    );

    return { history, isLoaded, saveAttempt, getModuleStats, getAttempts };
}
