"use client";

import { useState } from "react";
import {
    MessageSquare,
    Plus,
    ThumbsUp,
    MessageCircle,
    ChevronRight,
    HelpCircle,
    Lightbulb,
    Flag,
    User,
} from "lucide-react";
import { useForum, Post } from "@/hooks/useForum";
import { getAllSubjects } from "@/data/db";
import CreatePostModal from "@/components/CreatePostModal";
import Link from "next/link";

type SortMode = "newest" | "popular";

export default function ForumPage() {
    const {
        posts,
        isLoaded,
        username,
        updateUsername,
        createPost,
        toggleUpvotePost,
    } = useForum();
    const [showModal, setShowModal] = useState(false);
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
    const [tempName, setTempName] = useState(username);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sort, setSort] = useState<SortMode>("newest");

    const subjects = getAllSubjects();
    const categories = [
        { id: "all", label: "All" },
        { id: "general", label: "General" },
        ...subjects.map((s) => ({ id: s.id, label: s.title || s.id })),
    ];

    const filtered = posts
        .filter((p) => categoryFilter === "all" || p.category === categoryFilter)
        .sort((a, b) => {
            if (sort === "popular") return b.upvotes - a.upvotes;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

    const handleNewPost = () => {
        if (username === "Anonymous") {
            setShowUsernamePrompt(true);
        } else {
            setShowModal(true);
        }
    };

    const confirmUsername = () => {
        if (tempName.trim()) {
            updateUsername(tempName.trim());
        }
        setShowUsernamePrompt(false);
        setShowModal(true);
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-on-surface">
                        Forum
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed font-medium">
                        Ask questions, share tips, and learn together with your peers.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => { setTempName(username); setShowUsernamePrompt(true); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-on-surface/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-sm transition-all font-bold"
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">{username}</span>
                    </button>
                    <button
                        onClick={handleNewPost}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg hover:shadow-primary/25 transition-all text-sm hover-lift"
                    >
                        <Plus className="w-4 h-4" />
                        New Post
                    </button>
                </div>
            </section>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCategoryFilter(c.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === c.id
                                    ? "bg-slate-900/10 text-slate-900"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-900/5"
                                }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSort("newest")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === "newest" ? "bg-slate-900/10 text-slate-900" : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSort("popular")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sort === "popular" ? "bg-slate-900/10 text-slate-900" : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Popular
                    </button>
                </div>
            </div>

            {/* Post list */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No posts yet</p>
                    <p className="text-sm mt-1">Be the first to start a discussion!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((post) => (
                        <Link
                            key={post.id}
                            href={`/forum/${post.id}`}
                            className="block glass-panel rounded-xl p-5 border border-slate-900/5 hover:border-indigo-500/20 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Upvote */}
                                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleUpvotePost(post.id);
                                        }}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${post.upvotedByMe
                                                ? "bg-indigo-500/20 text-indigo-400"
                                                : "bg-slate-900/5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                                            }`}
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <span className={`text-xs font-bold ${post.upvotedByMe ? "text-indigo-400" : "text-slate-500"}`}>
                                        {post.upvotes}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${post.postType === "question"
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-green-500/10 text-green-400 border-green-500/20"
                                            }`}>
                                            {post.postType === "question" ? <HelpCircle className="w-3 h-3" /> : <Lightbulb className="w-3 h-3" />}
                                            {post.postType}
                                        </span>
                                        {post.category !== "general" && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/5 text-slate-600 border border-slate-900/10">
                                                {subjects.find(s => s.id === post.category)?.title || post.category}
                                            </span>
                                        )}
                                        {post.reported && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                <Flag className="w-3 h-3 inline mr-0.5" />Reported
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-on-surface group-hover:text-primary transition-colors line-clamp-2 text-lg tracking-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 font-medium">{post.body}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                                        <span>{post.author}</span>
                                        <span>{timeAgo(post.timestamp)}</span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3 h-3" />
                                            {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-2" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Username prompt modal */}
            {showUsernamePrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowUsernamePrompt(false)} />
                    <div className="relative w-full max-w-sm glass-panel rounded-2xl border border-slate-900/10 shadow-2xl p-8 animate-in zoom-in-95 fade-in duration-300">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Set Your Name</h3>
                        <p className="text-slate-600 text-sm mb-5">This name will appear on your posts.</p>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/5 border border-slate-900/10 text-slate-900 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm mb-5"
                            onKeyDown={(e) => e.key === "Enter" && confirmUsername()}
                        />
                        <button
                            onClick={confirmUsername}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-900 font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm hover-lift"
                        >
                            Save & Continue
                        </button>
                    </div>
                </div>
            )}

            <CreatePostModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onCreate={createPost}
            />
        </div>
    );
}
