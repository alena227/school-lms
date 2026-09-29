import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({ where: { id } });
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
