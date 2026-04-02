"use client";

import { useState, useEffect, useCallback } from "react";

export interface Deadline {
    id: string;
    title: string;
    subject: string;
    type: "assignment" | "quiz" | "exam";
    dueDate: string; // ISO string
    completed: boolean;
}

export type DeadlineStatus = "overdue" | "due-today" | "upcoming" | "completed";

export function getDeadlineStatus(deadline: Deadline): DeadlineStatus {
    if (deadline.completed) return "completed";

    const now = new Date();
    const due = new Date(deadline.dueDate);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    if (due < now) return "overdue";
    if (due >= todayStart && due < todayEnd) return "due-today";
    return "upcoming";
}

export function useDeadlines() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchDeadlines = useCallback(async () => {
        try {
            const res = await fetch("/api/deadlines");
            if (res.ok) {
                const data = await res.json();
                setDeadlines(data.map((d: Record<string, unknown>) => ({
                    ...d,
                    dueDate: typeof d.dueDate === "string" ? d.dueDate : new Date(d.dueDate as string).toISOString(),
                })));
            }
        } catch {
            // fallback silently
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        fetchDeadlines();
    }, [fetchDeadlines]);

    const addDeadline = useCallback(async (deadline: Omit<Deadline, "id" | "completed">) => {
        try {
            const res = await fetch("/api/deadlines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deadline),
            });
            if (res.ok) {
                const newDeadline = await res.json();
                setDeadlines((prev) => [...prev, {
                    ...newDeadline,
                    dueDate: typeof newDeadline.dueDate === "string" ? newDeadline.dueDate : new Date(newDeadline.dueDate).toISOString(),
                }]);
            }
        } catch {
            // handle silently
        }
    }, []);

    const toggleComplete = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/deadlines/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggleComplete" }),
            });
            if (res.ok) {
                const updated = await res.json();
                setDeadlines((prev) =>
                    prev.map((d) => d.id === id ? { ...d, completed: updated.completed } : d)
                );
            }
        } catch {
            // handle silently
        }
    }, []);

    const deleteDeadline = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
            if (res.ok) {
                setDeadlines((prev) => prev.filter((d) => d.id !== id));
            }
        } catch {
            // handle silently
        }
    }, []);

    const getNearestDeadline = useCallback(() => {
        const now = new Date();
        const upcoming = deadlines
            .filter((d) => !d.completed && new Date(d.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        return upcoming[0] || null;
    }, [deadlines]);

    const getGroupedBySubject = useCallback(() => {
        const groups: Record<string, Deadline[]> = {};
        deadlines.forEach((d) => {
            if (!groups[d.subject]) groups[d.subject] = [];
            groups[d.subject].push(d);
        });
        return groups;
    }, [deadlines]);

    return {
        deadlines,
        isLoaded,
        addDeadline,
        toggleComplete,
        deleteDeadline,
        getNearestDeadline,
        getGroupedBySubject,
    };
}
