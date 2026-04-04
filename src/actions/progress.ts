"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEMP_USER_ID = "default-user";

export async function getProgressAction() {
    const progressRecords = await prisma.moduleProgress.findMany({
        where: { userId: TEMP_USER_ID }
    });
    
    // Transform flat table rows into the ProgressData nested object shape
    const progressResult: any = {};
    for (const record of progressRecords) {
        if (!progressResult[record.subjectId]) {
            progressResult[record.subjectId] = {};
        }
        progressResult[record.subjectId][record.moduleId] = {
            score: record.score,
            total: record.total,
            completed: record.completed
        };
    }
    return progressResult;
}

export async function markModuleCompleteAction(subjectId: string, moduleId: number, score: number, total: number) {
    await prisma.moduleProgress.upsert({
        where: {
            userId_subjectId_moduleId: {
                userId: TEMP_USER_ID,
                subjectId,
                moduleId
            }
        },
        update: {
            score,
            total,
            completed: true
        },
        create: {
            userId: TEMP_USER_ID,
            subjectId,
            moduleId,
            score,
            total,
            completed: true
        }
    });
}
