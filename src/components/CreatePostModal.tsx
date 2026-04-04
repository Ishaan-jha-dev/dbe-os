"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { getAllSubjects } from "@/data/db";

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (post: {
        title: string;
        body: string;
        category: string;
        postType: "question" | "answer";
    }) => void;
}

export default function CreatePostModal({ open, onClose, onCreate }: CreatePostModalProps) {
    const subjects = getAllSubjects();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("general");
    const [postType, setPostType] = useState<"question" | "answer">("question");
    const [error, setError] = useState("");

    if (!open) return null;

    const categories = [
        { id: "general", label: "General" },
        ...subjects.map((s) => ({ id: s.id, label: s.title || s.id })),
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (!body.trim()) {
            setError("Body is required");
            return;
        }

        onCreate({ title: title.trim(), body: body.trim(), category, postType });
        setTitle("");
        setBody("");
        setCategory("general");
        setPostType("question");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/15">
                    <h2 className="text-xl font-bold font-headline text-on-surface">New Post</h2>
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
                            placeholder="What's your question?"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant">Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Describe your question or share your answer..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-on-surface-variant">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none cursor-pointer"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-on-surface-variant">Type</label>
                            <select
                                value={postType}
                                onChange={(e) => setPostType(e.target.value as "question" | "answer")}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="question">Question</option>
                                <option value="answer">Tip / Answer</option>
                            </select>
                        </div>
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
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
