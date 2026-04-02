"use client";

import { useState, useEffect, useCallback } from "react";

export interface TodoTask {
    id: string;
    title: string;
    subject: string;
    time: string; // "09:00", "14:30" etc
    completed: boolean;
    date: string; // "2026-03-03" ISO date string
}

const TODOS_KEY = "dbe_os_todos";

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStoredTodos(): Record<string, TodoTask[]> {
    if (typeof window === "undefined") return {};
    try {
        const stored = localStorage.getItem(TODOS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function persistTodos(all: Record<string, TodoTask[]>) {
    localStorage.setItem(TODOS_KEY, JSON.stringify(all));
}

export function formatDateKey(d: Date): string {
    return d.toISOString().split("T")[0];
}

export function useTodos(date: Date) {
    const dateKey = formatDateKey(date);
    const [tasks, setTasks] = useState<TodoTask[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const all = getStoredTodos();
        setTasks(all[dateKey] || []);
        setIsLoaded(true);
    }, [dateKey]);

    const persist = useCallback(
        (next: TodoTask[]) => {
            const all = getStoredTodos();
            all[dateKey] = next;
            persistTodos(all);
        },
        [dateKey]
    );

    const addTask = useCallback(
        (task: { title: string; subject: string; time: string }) => {
            setTasks((prev) => {
                const next = [
                    ...prev,
                    {
                        id: generateId(),
                        ...task,
                        completed: false,
                        date: dateKey,
                    },
                ].sort((a, b) => a.time.localeCompare(b.time));
                persist(next);
                return next;
            });
        },
        [dateKey, persist]
    );

    const toggleTask = useCallback(
        (id: string) => {
            setTasks((prev) => {
                const next = prev.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                );
                persist(next);
                return next;
            });
        },
        [persist]
    );

    const deleteTask = useCallback(
        (id: string) => {
            setTasks((prev) => {
                const next = prev.filter((t) => t.id !== id);
                persist(next);
                return next;
            });
        },
        [persist]
    );

    const completedCount = tasks.filter((t) => t.completed).length;

    return { tasks, isLoaded, addTask, toggleTask, deleteTask, completedCount, total: tasks.length };
}
