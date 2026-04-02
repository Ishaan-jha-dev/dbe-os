"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getAllSubjects } from "@/data/db";

interface ContributeNoteModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (note: {
        title: string;
        content: string;
        subject: string;
        author: string;
    }) => Promise<boolean>;
    defaultSubject?: string;
}

export default function ContributeNoteModal({
    open,
    onClose,
    onSubmit,
    defaultSubject,
}: ContributeNoteModalProps) {
    const subjects = getAllSubjects();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [subject, setSubject] = useState(defaultSubject || subjects[0]?.id || "general");
    const [author, setAuthor] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("dbe_os_username") || "";
        }
        return "";
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) { setError("Title is required"); return; }
        if (!content.trim()) { setError("Content is required"); return; }
        if (!author.trim()) { setError("Your name is required"); return; }

        setSubmitting(true);
        const success = await onSubmit({
            title: title.trim(),
            content: content.trim(),
            subject,
            author: author.trim(),
        });
        setSubmitting(false);

        if (success) {
            setTitle("");
            setContent("");
            onClose();
        } else {
            setError("Failed to submit. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold text-white">Contribute Notes</h2>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Your Name</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="e.g. Ishaan J."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
                            />
                        </div>
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
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Module 3 — Key Formulas & Concepts"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-300">Content</label>
                            <span className="text-[10px] text-gray-600 font-mono">Markdown supported</span>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={"# Module 3: Key Concepts\n\n## 1. Supply and Demand\n- **Law of Demand**: Price ↑ → Quantity Demanded ↓\n- **Formula**: Qd = a - bP\n\n## 2. Important Formulas\n- Elasticity = %ΔQd / %ΔP\n\n> Pro tip: Focus on the graphical analysis!"}
                            rows={12}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm resize-none font-mono leading-relaxed"
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
                            disabled={submitting}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Contribute"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
