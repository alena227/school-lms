import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await requireUser();
  const body = await request.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId обязателен" }, { status: 400 });
  }

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }

  await db.videoProgress.upsert({
    where: {
      lessonId_studentId: { lessonId, studentId: session.userId },
    },
    update: { watched: true, watchedAt: new Date() },
    create: {
      lessonId,
      studentId: session.userId,
      watched: true,
      watchedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
