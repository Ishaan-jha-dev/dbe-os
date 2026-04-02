"use client";

import { useState } from "react";
import { Volume2, BookOpen, Clock, Flame, ChevronRight, Maximize, X, ShieldAlert } from "lucide-react";
import { getAllSubjects } from "@/data/db";
import { useStudySessions } from "@/hooks/useStudySessions";
import { useFarmStore } from "@/hooks/useFarmStore";
import PomodoroTimer from "@/components/PomodoroTimer";

const ROOMS = [
    { id: "silent", name: "Silent Room", description: "Zero distractions. Pure focus.", icon: Volume2, color: "from-secondary to-error-dim" },
];

export default function StudyPage() {
    const subjects = getAllSubjects();
    const { addSession, getWeeklyStats, getRecentSessions, isLoaded } = useStudySessions();
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.title || "General");

    const weeklyStats = getWeeklyStats();
    const recent = getRecentSessions(5);

    const allRooms = [
        ...ROOMS,
        ...subjects.map((s) => ({
            id: s.id,
            name: `${s.title || s.id}`,
            description: `Focus on ${s.title || s.id}`,
            icon: BookOpen,
            color: "from-primary-dim to-primary",
        })),
    ];

    const { earnTomatoes, plots } = useFarmStore();

    const handleSessionComplete = (duration: number) => {
        addSession({
            room: activeRoom || "silent",
            subject: selectedSubject,
            duration,
        });
        const targetPlot = plots.find(p => p.subject.toLowerCase() === selectedSubject.toLowerCase()) 
                          || plots.find(p => p.id === "plot_general");
        const earned = Math.max(1, Math.round((duration / 25) * 2));
        earnTomatoes(earned, targetPlot?.id);
        alert(`🍅 Harvest! You earned ${earned} Tomatoes for focusing!`);
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (activeRoom) {
        const room = allRooms.find((r) => r.id === activeRoom);
        return (
            <div className="flex flex-col md:flex-row min-h-[85vh] -mx-4 sm:-mx-6 -my-8 sm:-my-10 animate-in fade-in duration-700 bg-surface">
                {/* Main Content Area (The Digital Greenhouse) */}
                <main className="flex-grow relative flex flex-col items-center justify-center p-6 md:p-12">
                    {/* Top Bar / Header */}
                    <header className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-20 pointer-events-none">
                        <div className="pointer-events-auto bg-surface-container/70 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3 shadow-sm border border-outline-variant/20">
                            <ShieldAlert className="w-4 h-4 text-secondary object-contain" />
                            <span className="text-xs font-bold font-headline uppercase tracking-tighter text-on-surface">Anti-Cheat Active</span>
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </div>
                        <div className="pointer-events-auto flex items-center gap-4">
                            <button onClick={() => setActiveRoom(null)} className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors font-bold text-on-surface text-sm border border-outline-variant/10">
                                <X className="w-4 h-4" /> Exit Room
                            </button>
                            <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                                <Maximize className="w-4 h-4 text-on-surface" />
                            </button>
                        </div>
                    </header>

                    {/* Room Info */}
                    <div className="absolute top-24 z-10 text-center animate-in slide-in-from-top-4 duration-500 text-on-surface/80">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            Session Live
                        </span>
                        <h1 className="text-2xl font-bold font-headline">{room?.name || "Study Room"}</h1>
                    </div>

                    <PomodoroTimer onComplete={handleSessionComplete} subject={selectedSubject} />
                </main>

                {/* Farmers in the Room Sidebar */}
                <aside className="w-full md:w-80 h-auto md:min-h-screen bg-surface-container-high/50 backdrop-blur-sm p-8 flex flex-col shrink-0 border-l border-outline-variant/10 shadow-[-16px_0_32px_rgba(66,40,32,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold font-headline text-on-surface tracking-tight">Active Farmers</h3>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">14 Online</span>
                    </div>
                    
                    <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-6 flex-grow">
                        {/* Mock Farmer 1 */}
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-primary-dim text-white flex justify-center items-center font-bold text-lg grayscale group-hover:grayscale-0 transition-all duration-300">
                                    M
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-container rounded-full flex items-center justify-center border-2 border-surface shadow-sm text-[10px]">
                                    🌱
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold font-headline text-on-surface">Marcus L.</p>
                                <p className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Thriving • 18m left
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs font-bold text-primary">Lv. 42</p>
                            </div>
                        </div>

                        {/* Mock Farmer 2 */}
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-tertiary-dim text-white flex justify-center items-center font-bold text-lg grayscale group-hover:grayscale-0 transition-all duration-300">
                                    S
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-tertiary-container rounded-full flex items-center justify-center border-2 border-surface shadow-sm text-[10px]">
                                    📘
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold font-headline text-on-surface">Sophia Chen</p>
                                <p className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Thriving • 04m left
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs font-bold text-primary">Lv. 15</p>
                            </div>
                        </div>

                        {/* Mock Farmer 3 */}
                        <div className="flex items-center gap-4 group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-secondary-dim text-white flex justify-center items-center font-bold text-lg grayscale group-hover:grayscale-0 transition-all duration-300">
                                    A
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary-container rounded-full flex items-center justify-center border-2 border-surface shadow-sm text-[10px]">
                                    ⚡
                                </div>
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold font-headline text-on-surface">Arjun Patel</p>
                                <p className="text-[10px] font-medium text-on-surface-variant flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Wilting • 12m left
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs font-bold text-primary">Lv. 88</p>
                            </div>
                        </div>
                    </div>

                    {/* Tip Card */}
                    <div className="mt-auto bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 shadow-sm mt-4">
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                <span className="font-bold text-on-surface">Tip:</span> Avoid switching browser tabs to keep your seedling's growth multiplier active.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            {/* Header */}
            <section className="space-y-3">
                <h1 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter text-on-surface">
                    Study Room
                </h1>
                <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                    Focus, study, repeat. Cultivate your mind and grow your virtual farm. Pick a room to nurture your crop.
                </p>
            </section>

            {/* Weekly stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover-lift">
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-secondary" />
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">This Week</span>
                    </div>
                    <p className="text-4xl font-black font-headline text-on-surface">{weeklyStats.totalSessions}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">harvests completed</p>
                </div>
                <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover-lift md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-tertiary" />
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Focus Time</span>
                    </div>
                    <p className="text-4xl font-black font-headline text-on-surface">
                        {weeklyStats.totalMinutes >= 60
                            ? `${Math.floor(weeklyStats.totalMinutes / 60)}h ${weeklyStats.totalMinutes % 60}m`
                            : `${weeklyStats.totalMinutes}m`
                        }
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">deep work minutes cultivated this week</p>
                </div>
            </div>

            {/* Subject selector */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
                <label className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest">
                    Select The Crop (Subject) To Nurture:
                </label>
                <div className="flex flex-wrap gap-2">
                    {subjects.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedSubject(s.title || s.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${selectedSubject === (s.title || s.id)
                                    ? "bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface"
                                    : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20 hover-lift"
                                }`}
                        >
                            {s.title || s.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room grid */}
            <section className="space-y-5">
                <h2 className="text-2xl font-black font-headline text-on-surface tracking-tight">Focus Greenhouses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allRooms.map((room) => {
                        const Icon = room.icon;
                        return (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room.id)}
                                className="group p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 transition-all text-left hover-lift shadow-[0_8px_16px_rgba(66,40,32,0.04)] hover:shadow-[0_12px_24px_rgba(66,40,32,0.08)]"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${room.color} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg font-headline text-on-surface group-hover:text-primary transition-colors">{room.name}</h3>
                                <p className="text-xs text-on-surface-variant mt-1 font-medium">{room.description}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Recent sessions */}
            {recent.length > 0 && (
                <section className="space-y-4 pt-4 border-t border-outline-variant/10">
                    <h2 className="text-xl font-bold font-headline text-on-surface">Recent Harvests</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recent.map((s) => (
                            <div
                                key={s.id}
                                className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 flex items-center gap-4 hover-lift shadow-sm"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-container/50 flex items-center justify-center border border-primary/20">
                                   <span className="material-symbols-outlined text-[1rem] text-primary">eco</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-on-surface text-sm uppercase tracking-wide">{s.subject}</p>
                                    <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 uppercase tracking-widest">
                                        {new Date(s.completedAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric"
                                        })}
                                    </p>
                                </div>
                                <span className="text-sm font-black text-primary tabular-nums">
                                    {s.duration}m
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
