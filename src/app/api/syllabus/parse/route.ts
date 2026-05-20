import { NextResponse } from "next/server";
import { z } from "zod";
import { parseSyllabusHtml, syllabusTextToJson } from "@/features/syllabus-parser/parser";

const schema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  if (input.html) {
    return NextResponse.json(parseSyllabusHtml(input.html));
  }
  if (input.text) {
    return NextResponse.json(syllabusTextToJson(input.text));
  }
  return NextResponse.json({ error: "Provide text or html" }, { status: 400 });
}
