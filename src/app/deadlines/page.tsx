"use client";

import { useState, useEffect } from "react";
import {
    CalendarClock,
    Plus,
    Download,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Trash2,
    BookOpen,
    FileText,
    GraduationCap,
} from "lucide-react";
import { useDeadlines, getDeadlineStatus, DeadlineStatus, Deadline } from "@/hooks/useDeadlines";
import { downloadICS } from "@/utils/calendarExport";
import { getAllSubjects } from "@/data/db";
import AddDeadlineModal from "@/components/AddDeadlineModal";

const statusConfig: Record<
    DeadlineStatus,
    { label: string; color: string; bg: string; border: string }
> = {
    overdue: {
        label: "Overdue",
        color: "text-error",
        bg: "bg-error/10",
        border: "border-error/20",
    },
    "due-today": {
        label: "Due Today",
        color: "text-on-surface",
        bg: "bg-tertiary/20",
        border: "border-tertiary/30",
    },
    upcoming: {
        label: "Upcoming",
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
    },
    completed: {
        label: "Completed",
        color: "text-secondary",
        bg: "bg-secondary/10",
        border: "border-secondary/20",
    },
};

const typeIcons: Record<string, React.ReactNode> = {
    assignment: <FileText className="w-4 h-4" />,
    quiz: <BookOpen className="w-4 h-4" />,
    exam: <GraduationCap className="w-4 h-4" />,
};

function CountdownTimer({ dueDate }: { dueDate: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calc = () => {
            const now = new Date();
            const due = new Date(dueDate);
            const diff = due.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Past due");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
            else setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        };

        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [dueDate]);

    return <span className="font-mono tabular-nums">{timeLeft}</span>;
}

type FilterTab = "all" | DeadlineStatus;

export default function DeadlinesPage() {
    const {
        deadlines,
        isLoaded,
        addDeadline,
        toggleComplete,
        deleteDeadline,
        getNearestDeadline,
    } = useDeadlines();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<FilterTab>("all");
    const subjects = getAllSubjects();

    const nearest = getNearestDeadline();

    const filtered = deadlines
        .filter((d) => filter === "all" || getDeadlineStatus(d) === filter)
        .sort((a, b) => {
            // Completed at the bottom
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

    // Group by subject
    const grouped: Record<string, Deadline[]> = {};
    filtered.forEach((d) => {
        const subjectName =
            subjects.find((s) => s.id === d.subject)?.title || d.subject;
        if (!grouped[subjectName]) grouped[subjectName] = [];
        grouped[subjectName].push(d);
    });

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: "all", label: "All", count: deadlines.length },
        {
            key: "overdue",
            label: "Overdue",
            count: deadlines.filter((d) => getDeadlineStatus(d) === "overdue").length,
        },
        {
            key: "due-today",
            label: "Due Today",
            count: deadlines.filter((d) => getDeadlineStatus(d) === "due-today").length,
        },
        {
            key: "upcoming",
            label: "Upcoming",
            count: deadlines.filter((d) => getDeadlineStatus(d) === "upcoming").length,
        },
        {
            key: "completed",
            label: "Completed",
            count: deadlines.filter((d) => getDeadlineStatus(d) === "completed").length,
        },
    ];

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface font-headline">
                        Deadlines
                    </h1>
                    <p className="text-on-surface-variant font-medium text-lg max-w-xl leading-relaxed">
                        Never miss a deadline. Track assignments, quizzes, and exams all in one place.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => downloadICS(deadlines)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest font-medium transition-all text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export .ics</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all text-sm hover-lift"
                    >
                        <Plus className="w-4 h-4" />
                        Add Deadline
                    </button>
                </div>
            </section>

            {/* Nearest deadline countdown */}
            {nearest && (
                <div className="bg-surface-container-high rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                                    Next Deadline
                                </p>
                                <p className="text-on-surface font-semibold text-lg">{nearest.title}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-bold text-on-surface">
                                <CountdownTimer dueDate={nearest.dueDate} />
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium mt-1">
                                {new Date(nearest.dueDate).toLocaleDateString("en-IN", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filter === tab.key
                                ? "bg-primary/10 text-primary"
                                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                            }`}
                    >
                        {tab.label}
                        <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key
                                    ? "bg-primary/20 text-primary"
                                    : "bg-surface-container text-on-surface-variant"
                                }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Grouped deadline cards */}
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-20 text-on-surface-variant">
                    <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No deadlines found</p>
                    <p className="text-sm mt-1">Add your first deadline to get started.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([subjectName, items]) => (
                        <div key={subjectName} className="space-y-3">
                            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                                {subjectName}
                            </h3>
                            <div className="space-y-2">
                                {items.map((d) => {
                                    const status = getDeadlineStatus(d);
                                    const cfg = statusConfig[status];

                                    return (
                                        <div
                                            key={d.id}
                                            className={`bg-surface-container-low rounded-xl p-4 sm:p-5 border transition-all group ${d.completed
                                                    ? "border-outline-variant/15 opacity-60"
                                                    : status === "overdue"
                                                        ? "border-error/20 hover:border-error/40"
                                                        : status === "due-today"
                                                            ? "border-tertiary/30 hover:border-tertiary/50 bg-tertiary/5"
                                                            : "border-outline-variant/20 hover:border-primary/30 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <button
                                                        onClick={() => toggleComplete(d.id)}
                                                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${d.completed
                                                                ? "border-secondary bg-secondary/20"
                                                                : "border-outline-variant/50 hover:border-primary"
                                                            }`}
                                                    >
                                                        {d.completed && (
                                                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                                                        )}
                                                    </button>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4
                                                                className={`font-semibold truncate ${d.completed
                                                                        ? "line-through text-on-surface-variant"
                                                                        : "text-on-surface"
                                                                    }`}
                                                            >
                                                                {d.title}
                                                            </h4>
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border`}
                                                            >
                                                                {status === "overdue" && (
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                )}
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant font-medium">
                                                            <span className="flex items-center gap-1">
                                                                {typeIcons[d.type]}
                                                                {d.type.charAt(0).toUpperCase() + d.type.slice(1)}
                                                            </span>
                                                            <span>
                                                                {new Date(d.dueDate).toLocaleDateString("en-IN", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                            {!d.completed && status !== "overdue" && (
                                                                <span className="text-on-surface-variant opacity-80">
                                                                    <CountdownTimer dueDate={d.dueDate} />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => deleteDeadline(d.id)}
                                                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-surface hover:bg-error/10 flex items-center justify-center transition-all flex-shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4 text-on-surface-variant hover:text-error" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddDeadlineModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onAdd={addDeadline}
            />
        </div>
    );
}
