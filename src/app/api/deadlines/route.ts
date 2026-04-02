import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/deadlines — list all deadlines
export async function GET() {
    const deadlines = await prisma.deadline.findMany({
        orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(deadlines);
}

// POST /api/deadlines — create a new deadline
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { title, subject, type, dueDate } = body;

    if (!title || !subject || !dueDate) {
        return NextResponse.json(
            { error: "Title, subject, and dueDate are required" },
            { status: 400 }
        );
    }

    const deadline = await prisma.deadline.create({
        data: {
            title,
            subject,
            type: type || "assignment",
            dueDate: new Date(dueDate),
        },
    });

    return NextResponse.json(deadline, { status: 201 });
}
