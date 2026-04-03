import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notes/:id
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(note);
}

// PATCH /api/notes/:id — upvote or update
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "upvote") {
        const note = await prisma.note.update({
            where: { id },
            data: { upvotes: { increment: 1 } },
        });
        return NextResponse.json(note);
    }

    if (body.action === "downvote") {
        const note = await prisma.note.update({
            where: { id },
            data: { upvotes: { decrement: 1 } },
        });
        return NextResponse.json(note);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE /api/notes/:id
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await prisma.note.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
