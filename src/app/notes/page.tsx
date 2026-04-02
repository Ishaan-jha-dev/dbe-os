"use client";

import { useState } from "react";
import {
    FileText,
    Plus,
    ThumbsUp,
    ChevronRight,
    BookOpen,
    User,
    Clock,
} from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { getAllSubjects } from "@/data/db";
import ContributeNoteModal from "@/components/ContributeNoteModal";
import Link from "next/link";

type SortMode = "newest" | "popular";

export default function NotesPage() {
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sort, setSort] = useState<SortMode>("newest");
    const [showModal, setShowModal] = useState(false);

    const { notes, isLoaded, createNote, toggleUpvote } = useNotes(
        categoryFilter === "all" ? undefined : categoryFilter
    );

    const subjects = getAllSubjects();
    const categories = [
        { id: "all", label: "All" },
        ...subjects.map((s) => ({ id: s.id, label: s.title || s.id })),
    ];

    const sorted = [...notes].sort((a, b) => {
        if (sort === "popular") return b.upvotes - a.upvotes;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        Notes
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                        Community-contributed notes and study resources. Share your knowledge — help others ace their exams.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm hover-lift flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Contribute Notes
                </button>
            </section>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCategoryFilter(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === c.id
                                    ? "bg-white/10 text-white"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSort("newest")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === "newest" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSort("popular")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === "popular" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        Popular
                    </button>
                </div>
            </div>

            {/* Notes grid */}
            {sorted.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No notes yet</p>
                    <p className="text-sm mt-1">Be the first to contribute!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sorted.map((note) => {
                        const subjectTitle = subjects.find((s) => s.id === note.subject)?.title || note.subject;
                        return (
                            <Link
                                key={note.id}
                                href={`/notes/${note.id}`}
                                className="group glass-panel rounded-xl p-5 border border-white/5 hover:border-indigo-500/20 transition-all hover-lift flex flex-col justify-between h-48"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            {subjectTitle}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 text-sm">
                                        {note.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                        {note.content.replace(/[#*>`\-_]/g, "").slice(0, 120)}...
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" /> {note.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {timeAgo(note.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleUpvote(note.id);
                                            }}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${note.upvotedByMe
                                                    ? "bg-indigo-500/20 text-indigo-400"
                                                    : "bg-white/5 text-gray-500 hover:text-indigo-400"
                                                }`}
                                        >
                                            <ThumbsUp className="w-3 h-3" /> {note.upvotes}
                                        </button>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <ContributeNoteModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={createNote}
            />
        </div>
    );
}
