import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/forum — list all posts with reply counts
export async function GET() {
    const posts = await prisma.forumPost.findMany({
        include: { replies: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
}

// POST /api/forum — create a new post
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { title, body: postBody, category, postType, author } = body;

    if (!title || !postBody) {
        return NextResponse.json(
            { error: "Title and body are required" },
            { status: 400 }
        );
    }

    const post = await prisma.forumPost.create({
        data: {
            title,
            body: postBody,
            category: category || "general",
            postType: postType || "question",
            author: author || "Anonymous",
        },
        include: { replies: true },
    });

    return NextResponse.json(post, { status: 201 });
}
