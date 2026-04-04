"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getAllSubjects } from "@/data/db";

interface AddDeadlineModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (deadline: {
        title: string;
        subject: string;
        type: "assignment" | "quiz" | "exam";
        dueDate: string;
    }) => void;
}

export default function AddDeadlineModal({ open, onClose, onAdd }: AddDeadlineModalProps) {
    const subjects = getAllSubjects();
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState(subjects[0]?.id || "");
    const [type, setType] = useState<"assignment" | "quiz" | "exam">("assignment");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!dueDate) {
            setError("Due date is required");
            return;
        }
        if (new Date(dueDate) < new Date()) {
            setError("Due date must be in the future");
            return;
        }

        onAdd({
            title: title.trim(),
            subject,
            type,
            dueDate: new Date(dueDate).toISOString(),
        });

        // Reset
        setTitle("");
        setDueDate("");
        setType("assignment");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
                    <h2 className="text-xl font-bold font-headline text-on-surface">Add Deadline</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-variant hover:bg-surface-container-highest flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-on-surface-variant" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Marketing Assignment 3"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-on-surface-variant">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none cursor-pointer"
                            >
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title || s.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-on-surface-variant">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "assignment" | "quiz" | "exam")}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
                                <option value="exam">Exam</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant">Due Date & Time</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm [color-scheme:light]"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest font-medium transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all text-sm hover-lift"
                        >
                            Add Deadline
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
