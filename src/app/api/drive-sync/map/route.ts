import { NextResponse } from "next/server";
import { z } from "zod";
import { mapDriveFilesToTopicResources } from "@/features/drive-sync/drive-sync";

const schema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      webViewLink: z.string().url(),
      mimeType: z.string(),
      path: z.array(z.string()),
    }),
  ),
});

export async function POST(request: Request) {
  const input = schema.parse(await request.json());
  return NextResponse.json({ resources: mapDriveFilesToTopicResources(input.files) });
}
