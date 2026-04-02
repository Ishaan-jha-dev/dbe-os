import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions — list all sessions
export async function GET() {
    const sessions = await prisma.studySession.findMany({
        orderBy: { completedAt: "desc" },
    });

    return NextResponse.json(sessions);
}

// POST /api/sessions — log a new session
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { room, subject, duration } = body;

    if (!room || !subject || !duration) {
        return NextResponse.json(
            { error: "Room, subject, and duration are required" },
            { status: 400 }
        );
    }

    const session = await prisma.studySession.create({
        data: { room, subject, duration },
    });

    return NextResponse.json(session, { status: 201 });
}
