import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { extractVideo } from "@/lib/video";

export async function GET() {
  await requireAdmin();
  const lessons = await db.lesson.findMany({
    include: { subject: true, files: true },
    orderBy: [{ subject: { order: "asc" } }, { number: "asc" }],
  });
  return NextResponse.json({ lessons });
}

type FileInput = { kind: "CLASSWORK" | "HOMEWORK"; url: string; fileName: string };

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => null);

  const subjectId = typeof body?.subjectId === "string" ? body.subjectId : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const youtubeUrl =
    typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
  const number = Number(body?.number);
  const files: FileInput[] = Array.isArray(body?.files) ? body.files : [];

  if (!subjectId || !title || !youtubeUrl || !Number.isInteger(number)) {
    return NextResponse.json(
      { error: "Заполните предмет, номер, тему и ссылку на видео" },
      { status: 400 }
    );
  }

  if (!extractVideo(youtubeUrl)) {
    return NextResponse.json(
      { error: "Не удалось распознать ссылку на видео (поддерживаются YouTube, Rutube и Educontent)" },
      { status: 400 }
    );
  }

  const subject = await db.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Предмет не найден" }, { status: 404 });
  }

  const duplicate = await db.lesson.findUnique({
    where: { subjectId_number: { subjectId, number } },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "Урок с таким номером уже существует в этом предмете" },
      { status: 409 }
    );
  }

  const lesson = await db.lesson.create({
    data: {
      subjectId,
      title,
      youtubeUrl,
      number,
      files: {
        create: files
          .filter((f) => f.kind === "CLASSWORK" || f.kind === "HOMEWORK")
          .map((f) => ({ kind: f.kind, url: f.url, fileName: f.fileName })),
      },
    },
    include: { files: true },
  });

  return NextResponse.json({ lesson });
}
