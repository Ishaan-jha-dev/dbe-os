"use client";

import { useState, useEffect, useCallback } from "react";

export interface StudySession {
    id: string;
    room: string;
    subject: string;
    duration: number; // minutes
    completedAt: string; // ISO
}

export function useStudySessions() {
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch("/api/sessions");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch {
            // silently fail
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const addSession = useCallback(
        async (session: Omit<StudySession, "id" | "completedAt">) => {
            try {
                const res = await fetch("/api/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(session),
                });
                if (res.ok) {
                    const newSession = await res.json();
                    setSessions((prev) => [newSession, ...prev]);
                }
            } catch {
                // silently fail
            }
        },
        []
    );

    const getWeeklyStats = useCallback(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekSessions = sessions.filter(
            (s) => new Date(s.completedAt) >= weekAgo
        );
        const totalSessions = weekSessions.length;
        const totalMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

        return { totalSessions, totalMinutes };
    }, [sessions]);

    const getRecentSessions = useCallback(
        (count: number = 10): StudySession[] => {
            return [...sessions]
                .sort(
                    (a, b) =>
                        new Date(b.completedAt).getTime() -
                        new Date(a.completedAt).getTime()
                )
                .slice(0, count);
        },
        [sessions]
    );

    return { sessions, isLoaded, addSession, getWeeklyStats, getRecentSessions };
}
