import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const progressSchema = z.object({
  userId: z.string(),
  topicId: z.string(),
  completed: z.boolean().default(false),
  xpEarned: z.number().int().min(0).default(0),
  quizScore: z.number().int().min(0).max(100).optional(),
  lastBlockIndex: z.number().int().min(0).default(0),
});

export async function POST(request: Request) {
  const input = progressSchema.parse(await request.json());
  const progress = await prisma.progress.upsert({
    where: { userId_topicId: { userId: input.userId, topicId: input.topicId } },
    update: {
      completed: input.completed,
      xpEarned: input.xpEarned,
      quizScore: input.quizScore,
      lastBlockIndex: input.lastBlockIndex,
      completedAt: input.completed ? new Date() : null,
    },
    create: {
      userId: input.userId,
      topicId: input.topicId,
      completed: input.completed,
      xpEarned: input.xpEarned,
      quizScore: input.quizScore,
      lastBlockIndex: input.lastBlockIndex,
      completedAt: input.completed ? new Date() : null,
    },
  });

  return NextResponse.json({ progress });
}
