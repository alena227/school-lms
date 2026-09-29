import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createUploadTarget, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const contentType =
    typeof body?.contentType === "string" ? body.contentType : "";
  const size = typeof body?.size === "number" ? body.size : 0;

  if (!fileName) {
    return NextResponse.json({ error: "Не указано имя файла" }, { status: 400 });
  }
  if (size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Файл больше ${MAX_UPLOAD_BYTES / 1024 / 1024}MB` },
      { status: 400 }
    );
  }

  const target = await createUploadTarget(fileName, contentType);
  return NextResponse.json(target);
}
