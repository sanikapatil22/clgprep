import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const input = loginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(user.id, user.email);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, token });
}
