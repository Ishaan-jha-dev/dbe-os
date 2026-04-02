"use client";

import { useState, useEffect, useCallback } from "react";

interface DailyData {
    minutes: number;
    goal: number; // in hours
    date: string;
}

const PROGRESS_KEY = "dbe_os_daily_progress";
const STREAK_KEY = "dbe_os_streak";

function todayKey(): string {
    return new Date().toISOString().split("T")[0];
}

function yesterdayKey(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
}

function getAllData(): Record<string, DailyData> {
    if (typeof window === "undefined") return {};
    try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function persistAll(data: Record<string, DailyData>) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function calcStreak(all: Record<string, DailyData>): number {
    let streak = 0;
    const d = new Date();
    // Start from yesterday (today is still in progress)
    d.setDate(d.getDate() - 1);

    while (true) {
        const key = d.toISOString().split("T")[0];
        const dayData = all[key];
        if (dayData && dayData.minutes > 0) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

export function useDailyProgress() {
    const [todayMinutes, setTodayMinutes] = useState(0);
    const [yesterdayMinutes, setYesterdayMinutes] = useState(0);
    const [goalHours, setGoalHours] = useState(8);
    const [streak, setStreak] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const all = getAllData();
        const tk = todayKey();
        const yk = yesterdayKey();

        const today = all[tk] || { minutes: 0, goal: 8, date: tk };
        const yesterday = all[yk];

        setTodayMinutes(today.minutes);
        setGoalHours(today.goal);
        setYesterdayMinutes(yesterday?.minutes || 0);
        setStreak(calcStreak(all));
        setIsLoaded(true);
    }, []);

    const addMinutes = useCallback((mins: number) => {
        const all = getAllData();
        const tk = todayKey();
        const current = all[tk] || { minutes: 0, goal: 8, date: tk };
        current.minutes += mins;
        all[tk] = current;
        persistAll(all);
        setTodayMinutes(current.minutes);
        setStreak(calcStreak(all));
    }, []);

    const updateGoal = useCallback((hours: number) => {
        const all = getAllData();
        const tk = todayKey();
        const current = all[tk] || { minutes: 0, goal: hours, date: tk };
        current.goal = hours;
        all[tk] = current;
        persistAll(all);
        setGoalHours(hours);
    }, []);

    const progressPercent = Math.min(100, (todayMinutes / (goalHours * 60)) * 100);

    return {
        todayMinutes,
        yesterdayMinutes,
        goalHours,
        streak,
        progressPercent,
        addMinutes,
        updateGoal,
        isLoaded,
    };
}
