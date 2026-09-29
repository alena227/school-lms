import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/storage";

const SAFE_KEY = /^[\w.\-()а-яА-ЯёЁ ]+$/u;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { key } = await params;
  const decoded = decodeURIComponent(key);

  if (!SAFE_KEY.test(decoded) || decoded.includes("..")) {
    return NextResponse.json({ error: "Недопустимое имя файла" }, { status: 400 });
  }

  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой" }, { status: 400 });
  }

  const destination = path.join(process.cwd(), "public", "uploads", decoded);
  await writeFile(destination, buffer);

  return NextResponse.json({ ok: true });
}
