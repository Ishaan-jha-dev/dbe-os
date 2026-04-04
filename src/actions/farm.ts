"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_USER_EMAIL = "scholar@dbe-os.com";

// Helper to get or create the default user (mocking auth)
async function getDefaultUser() {
    let user = await prisma.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: DEFAULT_USER_EMAIL,
                name: "Scholar",
                farmName: "My Digital Greenhouse",
                streak: 1,
                tomatoesBalance: 0,
                totalTomatoesEarned: 0,
                plots: {
                    create: [
                        { subject: "General", treeStage: 1, healthPct: 100, tomatoesFromPlot: 0 }
                    ]
                }
            }
        });
    }
    return user;
}

export async function getFarmState() {
    const user = await getDefaultUser();
    const plots = await prisma.plot.findMany({ where: { userId: user.id } });
    
    return {
        totalTomatoesEarned: user.totalTomatoesEarned,
        tomatoesBalance: user.tomatoesBalance,
        streak: user.streak,
        farmName: user.farmName,
        plots: plots.map(p => ({
            id: p.id,
            subject: p.subject,
            treeStage: p.treeStage,
            healthPct: p.healthPct,
            lastWateredAt: p.lastWateredAt.toISOString(),
            tomatoesFromPlot: p.tomatoesFromPlot,
            treeSkin: p.treeSkin
        }))
    };
}

export async function updateTomatoes(amount: number, plotId?: string) {
    const user = await getDefaultUser();
    
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            tomatoesBalance: { increment: amount },
            totalTomatoesEarned: amount > 0 ? { increment: amount } : undefined
        }
    });

    if (plotId && amount > 0) {
        // Find existing plot health to calculate new health safely (max 100)
        let newHealth = 100;
        try {
            const currentPlot = await prisma.plot.findUnique({ where: { id: plotId } });
            if (currentPlot) {
               newHealth = Math.min(100, currentPlot.healthPct + 20);
            }
        } catch (e) {}

        await prisma.plot.update({
            where: { id: plotId },
            data: {
                tomatoesFromPlot: { increment: amount },
                healthPct: newHealth,
            }
        });
    }

    return updatedUser.tomatoesBalance;
}

export async function spendTomatoesAction(amount: number) {
    const user = await getDefaultUser();
    if (user.tomatoesBalance < amount) return false;
    
    await prisma.user.update({
        where: { id: user.id },
        data: { tomatoesBalance: { decrement: amount } }
    });
    return true;
}

export async function waterPlotAction(plotId: string) {
    await prisma.plot.update({
        where: { id: plotId },
        data: {
            healthPct: 100,
            lastWateredAt: new Date()
        }
    });
}

export async function unlockPlotAction(subject: string) {
    const user = await getDefaultUser();
    
    const newPlot = await prisma.plot.create({
        data: {
            userId: user.id,
            subject,
            treeStage: 1,
            healthPct: 100,
            tomatoesFromPlot: 0
        }
    });

    return {
        id: newPlot.id,
        subject: newPlot.subject,
        treeStage: newPlot.treeStage,
        healthPct: newPlot.healthPct,
        lastWateredAt: newPlot.lastWateredAt.toISOString(),
        tomatoesFromPlot: newPlot.tomatoesFromPlot,
        treeSkin: newPlot.treeSkin
    };
}
