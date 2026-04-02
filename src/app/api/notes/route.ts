import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notes — list all notes, optionally filter by subject
export async function GET(req: NextRequest) {
    const subject = req.nextUrl.searchParams.get("subject");

    const notes = await prisma.note.findMany({
        where: subject ? { subject } : undefined,
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
}

// POST /api/notes — create a new note
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { title, content, subject, author } = body;

    if (!title || !content || !subject) {
        return NextResponse.json(
            { error: "Title, content, and subject are required" },
            { status: 400 }
        );
    }

    const note = await prisma.note.create({
        data: {
            title,
            content,
            subject,
            author: author || "Anonymous",
        },
    });

    return NextResponse.json(note, { status: 201 });
}
