import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  college: z.string().optional(),
  semester: z.number().int().min(1).max(12).default(1),
});

export async function POST(request: Request) {
  const input = signupSchema.parse(await request.json());
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      college: input.college,
      semester: input.semester,
    },
  });
  const token = await createSessionToken(user.id, user.email);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token }, { status: 201 });
}
