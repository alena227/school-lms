import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type FileInput = { url: string; fileName: string; mimeType: string };

export async function POST(request: NextRequest) {
  const session = await requireUser();
  const body = await request.json().catch(() => null);

  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const text = typeof body?.text === "string" ? body.text : "";
  const files: FileInput[] = Array.isArray(body?.files) ? body.files : [];

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId обязателен" }, { status: 400 });
  }
  if (!text.trim() && files.length === 0) {
    return NextResponse.json(
      { error: "Добавьте текст ответа или прикрепите файл" },
      { status: 400 }
    );
  }

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }

  const existing = await db.submission.findUnique({
    where: {
      lessonId_studentId: { lessonId, studentId: session.userId },
    },
  });

  if (existing) {
    await db.submissionFile.deleteMany({ where: { submissionId: existing.id } });
  }

  const submission = await db.submission.upsert({
    where: {
      lessonId_studentId: { lessonId, studentId: session.userId },
    },
    update: {
      text,
      files: {
        create: files.map((f) => ({
          url: f.url,
          fileName: f.fileName,
          mimeType: f.mimeType,
        })),
      },
    },
    create: {
      lessonId,
      studentId: session.userId,
      text,
      files: {
        create: files.map((f) => ({
          url: f.url,
          fileName: f.fileName,
          mimeType: f.mimeType,
        })),
      },
    },
    include: { files: true },
  });

  return NextResponse.json({ submission });
}
