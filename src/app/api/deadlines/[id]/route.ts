import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/deadlines/:id — toggle complete
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    if (body.action === "toggleComplete") {
        const existing = await prisma.deadline.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const deadline = await prisma.deadline.update({
            where: { id },
            data: { completed: !existing.completed },
        });
        return NextResponse.json(deadline);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE /api/deadlines/:id
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await prisma.deadline.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
