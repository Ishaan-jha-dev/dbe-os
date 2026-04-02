"use client";

import { useState, useEffect, useCallback } from "react";

export interface Reply {
    id: string;
    body: string;
    author: string;
    timestamp: string;
    upvotes: number;
    upvotedByMe: boolean;
}

export interface Post {
    id: string;
    title: string;
    body: string;
    category: string;
    postType: "question" | "answer";
    author: string;
    timestamp: string;
    upvotes: number;
    upvotedByMe: boolean;
    reported: boolean;
    replies: Reply[];
}

const AUTHOR_KEY = "dbe_os_username";

function mapPost(raw: Record<string, unknown>): Post {
    const replies = Array.isArray(raw.replies) ? raw.replies : [];
    return {
        id: raw.id as string,
        title: raw.title as string,
        body: raw.body as string,
        category: (raw.category as string) || "general",
        postType: (raw.postType as "question" | "answer") || "question",
        author: (raw.author as string) || "Anonymous",
        timestamp: (raw.createdAt as string) || new Date().toISOString(),
        upvotes: (raw.upvotes as number) || 0,
        upvotedByMe: false,
        reported: (raw.reported as boolean) || false,
        replies: replies.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            body: r.body as string,
            author: (r.author as string) || "Anonymous",
            timestamp: (r.createdAt as string) || new Date().toISOString(),
            upvotes: (r.upvotes as number) || 0,
            upvotedByMe: false,
        })),
    };
}

export function useForum() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [username, setUsername] = useState<string>("Anonymous");

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch("/api/forum");
            if (res.ok) {
                const data = await res.json();
                setPosts(data.map(mapPost));
            }
        } catch {
            // silently fail
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        fetchPosts();
        const storedName = localStorage.getItem(AUTHOR_KEY);
        if (storedName) setUsername(storedName);
    }, [fetchPosts]);

    const updateUsername = useCallback((name: string) => {
        setUsername(name);
        localStorage.setItem(AUTHOR_KEY, name);
    }, []);

    const createPost = useCallback(
        async (post: { title: string; body: string; category: string; postType: "question" | "answer" }) => {
            try {
                const res = await fetch("/api/forum", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...post, author: username }),
                });
                if (res.ok) {
                    const newPost = await res.json();
                    setPosts((prev) => [mapPost(newPost), ...prev]);
                }
            } catch {
                // silently fail
            }
        },
        [username]
    );

    const addReply = useCallback(
        async (postId: string, body: string) => {
            try {
                const res = await fetch(`/api/forum/${postId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ body, author: username }),
                });
                if (res.ok) {
                    const newReply = await res.json();
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p.id !== postId) return p;
                            return {
                                ...p,
                                replies: [
                                    ...p.replies,
                                    {
                                        id: newReply.id,
                                        body: newReply.body,
                                        author: newReply.author,
                                        timestamp: newReply.createdAt,
                                        upvotes: 0,
                                        upvotedByMe: false,
                                    },
                                ],
                            };
                        })
                    );
                }
            } catch {
                // silently fail
            }
        },
        [username]
    );

    const toggleUpvotePost = useCallback(
        async (postId: string) => {
            const post = posts.find((p) => p.id === postId);
            if (!post) return;

            const action = post.upvotedByMe ? "downvote" : "upvote";
            try {
                const res = await fetch(`/api/forum/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action }),
                });
                if (res.ok) {
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p.id !== postId) return p;
                            return {
                                ...p,
                                upvotes: p.upvotedByMe ? p.upvotes - 1 : p.upvotes + 1,
                                upvotedByMe: !p.upvotedByMe,
                            };
                        })
                    );
                }
            } catch {
                // silently fail
            }
        },
        [posts]
    );

    const toggleUpvoteReply = useCallback(
        async (postId: string, replyId: string) => {
            const post = posts.find((p) => p.id === postId);
            const reply = post?.replies.find((r) => r.id === replyId);
            if (!reply) return;

            const action = reply.upvotedByMe ? "downvoteReply" : "upvoteReply";
            try {
                const res = await fetch(`/api/forum/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action, replyId }),
                });
                if (res.ok) {
                    setPosts((prev) =>
                        prev.map((p) => {
                            if (p.id !== postId) return p;
                            return {
                                ...p,
                                replies: p.replies.map((r) => {
                                    if (r.id !== replyId) return r;
                                    return {
                                        ...r,
                                        upvotes: r.upvotedByMe ? r.upvotes - 1 : r.upvotes + 1,
                                        upvotedByMe: !r.upvotedByMe,
                                    };
                                }),
                            };
                        })
                    );
                }
            } catch {
                // silently fail
            }
        },
        [posts]
    );

    const reportPost = useCallback(
        async (postId: string) => {
            try {
                const res = await fetch(`/api/forum/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "report" }),
                });
                if (res.ok) {
                    setPosts((prev) =>
                        prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
                    );
                }
            } catch {
                // silently fail
            }
        },
        []
    );

    const getPost = useCallback(
        (postId: string): Post | undefined => {
            return posts.find((p) => p.id === postId);
        },
        [posts]
    );

    return {
        posts,
        isLoaded,
        username,
        updateUsername,
        createPost,
        addReply,
        toggleUpvotePost,
        toggleUpvoteReply,
        reportPost,
        getPost,
    };
}
