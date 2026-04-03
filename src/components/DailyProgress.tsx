"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { useDailyProgress } from "@/hooks/useDailyProgress";

export default function DailyProgress() {
    const { todayMinutes, yesterdayMinutes, goalHours, streak, progressPercent, updateGoal, isLoaded } = useDailyProgress();
    const [editingGoal, setEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(goalHours);

    if (!isLoaded) return null;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercent / 100) * circumference;

    const saveGoal = () => {
        updateGoal(tempGoal);
        setEditingGoal(false);
    };

    const hrs = Math.floor(todayMinutes / 60);
    const mins = todayMinutes % 60;
    const completedLabel = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} minutes`;

    return (
        <div className="glass-panel rounded-2xl border border-white/5 p-5 relative">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white">Daily progress</h3>
                {!editingGoal ? (
                    <button
                        onClick={() => { setTempGoal(goalHours); setEditingGoal(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={tempGoal}
                            onChange={(e) => setTempGoal(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 px-1.5 py-1 rounded bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none"
                            min={1}
                            max={24}
                        />
                        <span className="text-[10px] text-gray-500">hrs</span>
                        <button onClick={saveGoal} className="p-1 rounded hover:bg-green-500/10 text-green-400">
                            <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingGoal(false)} className="p-1 rounded hover:bg-red-500/10 text-red-400">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                {/* Yesterday */}
                <div className="text-center flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Yesterday</p>
                    <p className="text-2xl font-black text-white">{yesterdayMinutes}</p>
                    <p className="text-[10px] text-gray-600">minutes</p>
                </div>

                {/* Ring */}
                <div className="flex-shrink-0 relative">
                    <svg width="160" height="160" className="transform -rotate-90">
                        <circle
                            cx="80" cy="80" r={radius}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="80" cy="80" r={radius}
                            stroke="url(#progress-gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Daily goal</p>
                        <p className="text-3xl font-black text-white">{goalHours}</p>
                        <p className="text-[10px] text-gray-500">hours</p>
                    </div>
                </div>

                {/* Streak */}
                <div className="text-center flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Streak</p>
                    <p className="text-2xl font-black text-white">{streak}</p>
                    <p className="text-[10px] text-gray-600">days</p>
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
                Completed: <span className="text-white font-medium">{completedLabel}</span>
            </p>
        </div>
    );
}
