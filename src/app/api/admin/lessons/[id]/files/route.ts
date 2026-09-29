import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const kind = body?.kind === "HOMEWORK" ? "HOMEWORK" : body?.kind === "CLASSWORK" ? "CLASSWORK" : null;
  const url = typeof body?.url === "string" ? body.url : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";

  if (!kind || !url || !fileName) {
    return NextResponse.json({ error: "Некорректные данные файла" }, { status: 400 });
  }

  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }

  const file = await db.lessonFile.create({
    data: { lessonId: id, kind, url, fileName },
  });

  return NextResponse.json({ file });
}
