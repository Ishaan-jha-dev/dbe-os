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
            <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 fade-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Add Deadline</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Marketing Assignment 3"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm appearance-none cursor-pointer"
                            >
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id} className="bg-[#111] text-white">
                                        {s.title || s.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as "assignment" | "quiz" | "exam")}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="assignment" className="bg-[#111]">Assignment</option>
                                <option value="quiz" className="bg-[#111]">Quiz</option>
                                <option value="exam" className="bg-[#111]">Exam</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Due Date & Time</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm [color-scheme:dark]"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm hover-lift"
                        >
                            Add Deadline
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
