"use client";

import { useState, useEffect, useCallback } from "react";

export interface Note {
    id: string;
    title: string;
    content: string;
    subject: string;
    author: string;
    upvotes: number;
    upvotedByMe: boolean;
    createdAt: string;
}

function mapNote(raw: Record<string, unknown>): Note {
    return {
        id: raw.id as string,
        title: raw.title as string,
        content: raw.content as string,
        subject: raw.subject as string,
        author: (raw.author as string) || "Anonymous",
        upvotes: (raw.upvotes as number) || 0,
        upvotedByMe: false,
        createdAt: (raw.createdAt as string) || new Date().toISOString(),
    };
}

export function useNotes(subjectFilter?: string) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const fetchNotes = useCallback(async () => {
        try {
            const url = subjectFilter
                ? `/api/notes?subject=${encodeURIComponent(subjectFilter)}`
                : "/api/notes";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setNotes(data.map(mapNote));
            }
        } catch {
            // silently fail
        }
        setIsLoaded(true);
    }, [subjectFilter]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = useCallback(
        async (note: { title: string; content: string; subject: string; author: string }) => {
            try {
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(note),
                });
                if (res.ok) {
                    const newNote = await res.json();
                    setNotes((prev) => [mapNote(newNote), ...prev]);
                    return true;
                }
            } catch {
                // silently fail
            }
            return false;
        },
        []
    );

    const toggleUpvote = useCallback(
        async (noteId: string) => {
            const note = notes.find((n) => n.id === noteId);
            if (!note) return;

            const action = note.upvotedByMe ? "downvote" : "upvote";
            try {
                const res = await fetch(`/api/notes/${noteId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action }),
                });
                if (res.ok) {
                    setNotes((prev) =>
                        prev.map((n) => {
                            if (n.id !== noteId) return n;
                            return {
                                ...n,
                                upvotes: n.upvotedByMe ? n.upvotes - 1 : n.upvotes + 1,
                                upvotedByMe: !n.upvotedByMe,
                            };
                        })
                    );
                }
            } catch {
                // silently fail
            }
        },
        [notes]
    );

    const deleteNote = useCallback(
        async (noteId: string) => {
            try {
                const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
                if (res.ok) {
                    setNotes((prev) => prev.filter((n) => n.id !== noteId));
                }
            } catch {
                // silently fail
            }
        },
        []
    );

    const getNote = useCallback(
        (noteId: string): Note | undefined => {
            return notes.find((n) => n.id === noteId);
        },
        [notes]
    );

    return {
        notes,
        isLoaded,
        createNote,
        toggleUpvote,
        deleteNote,
        getNote,
        refetch: fetchNotes,
    };
}
