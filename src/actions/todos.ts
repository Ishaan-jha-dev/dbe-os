"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTodosAction(dateStr: string) {
    const todos = await prisma.todo.findMany({
        where: { date: dateStr },
        orderBy: { time: 'asc' }
    });
    
    return todos;
}

export async function addTodoAction(data: {
    title: string;
    subject: string;
    time: string;
    date: string;
}) {
    const newTodo = await prisma.todo.create({
        data: {
            title: data.title,
            subject: data.subject,
            time: data.time,
            date: data.date,
            completed: false
        }
    });

    return newTodo;
}

export async function toggleTodoAction(id: string, completed: boolean) {
    await prisma.todo.update({
        where: { id },
        data: { completed }
    });
}

export async function deleteTodoAction(id: string) {
    await prisma.todo.delete({
        where: { id }
    });
}
