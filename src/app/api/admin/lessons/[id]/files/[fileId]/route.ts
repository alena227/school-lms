import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  await requireAdmin();
  const { id, fileId } = await params;

  const file = await db.lessonFile.findUnique({ where: { id: fileId } });
  if (!file || file.lessonId !== id) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  await db.lessonFile.delete({ where: { id: fileId } });
  return NextResponse.json({ ok: true });
}
