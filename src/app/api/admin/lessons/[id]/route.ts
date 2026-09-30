import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { extractVideo } from "@/lib/video";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { files: true, subject: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }
  return NextResponse.json({ lesson });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json().catch(() => null);

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const youtubeUrl =
    typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
  const number = Number(body?.number);

  if (!title || !youtubeUrl || !Number.isInteger(number)) {
    return NextResponse.json(
      { error: "Заполните номер, тему и ссылку на видео" },
      { status: 400 }
    );
  }
  if (!extractVideo(youtubeUrl)) {
    return NextResponse.json(
      { error: "Не удалось распознать ссылку на видео (поддерживаются YouTube, Rutube и Educontent)" },
      { status: 400 }
    );
  }

  const existing = await db.lesson.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }

  if (number !== existing.number) {
    const duplicate = await db.lesson.findUnique({
      where: {
        subjectId_number: { subjectId: existing.subjectId, number },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Урок с таким номером уже существует в этом предмете" },
        { status: 409 }
      );
    }
  }

  const lesson = await db.lesson.update({
    where: { id },
    data: { title, youtubeUrl, number },
    include: { files: true },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const existing = await db.lesson.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }
  await db.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
