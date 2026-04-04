"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDeadlinesAction() {
    const deadlines = await prisma.deadline.findMany({
        orderBy: { dueDate: 'asc' }
    });
    
    return deadlines.map(d => ({
        id: d.id,
        title: d.title,
        subject: d.subject,
        type: d.type as any,
        priority: d.priority as any,
        dueDate: d.dueDate.toISOString(),
        completed: d.completed
    }));
}

export async function addDeadlineAction(data: {
    title: string;
    subject: string;
    type: string;
    priority: string;
    dueDate: string;
}) {
    const newDeadline = await prisma.deadline.create({
        data: {
            title: data.title,
            subject: data.subject,
            type: data.type,
            priority: data.priority,
            dueDate: new Date(data.dueDate),
            completed: false
        }
    });

    return {
        ...newDeadline,
        dueDate: newDeadline.dueDate.toISOString()
    };
}

export async function toggleDeadlineAction(id: string, completed: boolean) {
    await prisma.deadline.update({
        where: { id },
        data: { completed }
    });
}

export async function deleteDeadlineAction(id: string) {
    await prisma.deadline.delete({
        where: { id }
    });
}
