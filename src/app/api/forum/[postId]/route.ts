import { prisma } from "@/lib/db.server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/forum/:postId — single post with replies
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        include: { replies: { orderBy: { createdAt: "asc" } } },
    });

    if (!post) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(post);
}

// POST /api/forum/:postId — add a reply
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const body = await req.json();

    if (!body.body) {
        return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const reply = await prisma.forumReply.create({
        data: {
            body: body.body,
            author: body.author || "Anonymous",
            postId,
        },
    });

    return NextResponse.json(reply, { status: 201 });
}

// PATCH /api/forum/:postId — upvote or report
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const body = await req.json();

    if (body.action === "upvote") {
        const post = await prisma.forumPost.update({
            where: { id: postId },
            data: { upvotes: { increment: 1 } },
        });
        return NextResponse.json(post);
    }

    if (body.action === "downvote") {
        const post = await prisma.forumPost.update({
            where: { id: postId },
            data: { upvotes: { decrement: 1 } },
        });
        return NextResponse.json(post);
    }

    if (body.action === "report") {
        const post = await prisma.forumPost.update({
            where: { id: postId },
            data: { reported: true },
        });
        return NextResponse.json(post);
    }

    // Upvote a reply
    if (body.action === "upvoteReply" && body.replyId) {
        const reply = await prisma.forumReply.update({
            where: { id: body.replyId },
            data: { upvotes: { increment: 1 } },
        });
        return NextResponse.json(reply);
    }

    if (body.action === "downvoteReply" && body.replyId) {
        const reply = await prisma.forumReply.update({
            where: { id: body.replyId },
            data: { upvotes: { decrement: 1 } },
        });
        return NextResponse.json(reply);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
