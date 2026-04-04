"use client";

import React, { useState } from "react";
import {
    ThumbsUp,
    MessageCircle,
    ChevronLeft,
    Flag,
    Send,
    HelpCircle,
    Lightbulb,
    AlertTriangle,
} from "lucide-react";
import { useForum } from "@/hooks/useForum";
import Link from "next/link";

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = React.use(params);
    const {
        getPost,
        toggleUpvotePost,
        toggleUpvoteReply,
        addReply,
        reportPost,
        isLoaded,
    } = useForum();
    const [replyText, setReplyText] = useState("");
    const [showReported, setShowReported] = useState(false);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const post = getPost(postId);

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                <h1 className="text-7xl font-black text-on-surface-variant/20 mb-4 tracking-tighter">404</h1>
                <p className="text-on-surface-variant text-lg">Post not found.</p>
                <Link href="/forum" className="mt-8 text-primary hover:text-primary-dim flex items-center font-medium transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Forum
                </Link>
            </div>
        );
    }

    const handleReply = () => {
        if (!replyText.trim()) return;
        addReply(postId, replyText.trim());
        setReplyText("");
    };

    const handleReport = () => {
        reportPost(postId);
        setShowReported(true);
        setTimeout(() => setShowReported(false), 3000);
    };

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
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <Link href="/forum" className="flex items-center text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors w-fit">
                <ChevronLeft className="w-4 h-4 mr-1" /> Forum
            </Link>

            {/* Post */}
            <article className="bg-surface-container-low rounded-2xl border border-outline-variant/15 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${post.postType === "question"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}>
                            {post.postType === "question" ? <HelpCircle className="w-3.5 h-3.5" /> : <Lightbulb className="w-3.5 h-3.5" />}
                            {post.postType}
                        </span>
                        <span className="text-xs text-on-surface-variant">{post.author}</span>
                        <span className="text-xs text-on-surface-variant/50">•</span>
                        <span className="text-xs text-on-surface-variant">{timeAgo(post.timestamp)}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-4 font-headline">
                        {post.title}
                    </h1>
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap font-medium">
                        {post.body}
                    </p>

                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-outline-variant/15">
                        <button
                            onClick={() => toggleUpvotePost(postId)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${post.upvotedByMe
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-transparent"
                                }`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            {post.upvotes}
                        </button>

                        <span className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
                            <MessageCircle className="w-4 h-4" />
                            {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                        </span>

                        <button
                            onClick={handleReport}
                            disabled={post.reported}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${post.reported
                                    ? "bg-error/10 text-error cursor-not-allowed"
                                    : "text-on-surface-variant hover:text-error hover:bg-error/10"
                                }`}
                        >
                            <Flag className="w-3.5 h-3.5" />
                            {post.reported ? "Reported" : "Report"}
                        </button>
                    </div>
                </div>
            </article>

            {/* Report toast */}
            {showReported && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <AlertTriangle className="w-4 h-4" />
                    Post has been reported
                </div>
            )}

            {/* Replies */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold font-headline text-on-surface">
                    {post.replies.length > 0 ? `${post.replies.length} ${post.replies.length === 1 ? "Reply" : "Replies"}` : "No replies yet"}
                </h2>

                {post.replies.map((reply) => (
                    <div
                        key={reply.id}
                        className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/15"
                    >
                        <div className="flex items-center gap-2 mb-3 text-xs">
                            <span className="font-bold font-headline text-on-surface">{reply.author}</span>
                            <span className="text-on-surface-variant/50">•</span>
                            <span className="text-on-surface-variant font-medium">{timeAgo(reply.timestamp)}</span>
                        </div>
                        <p className="text-on-surface-variant font-medium text-sm leading-relaxed whitespace-pre-wrap">
                            {reply.body}
                        </p>
                        <div className="mt-3">
                            <button
                                onClick={() => toggleUpvoteReply(postId, reply.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${reply.upvotedByMe
                                        ? "bg-primary/20 text-primary"
                                        : "bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/10"
                                    }`}
                            >
                                <ThumbsUp className="w-3 h-3" />
                                {reply.upvotes}
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            {/* Reply input */}
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/15 p-5">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full bg-transparent border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none text-sm leading-relaxed font-medium"
                />
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all text-sm hover-lift disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        <Send className="w-4 h-4" />
                        Reply
                    </button>
                </div>
            </div>
        </div>
    );
}
