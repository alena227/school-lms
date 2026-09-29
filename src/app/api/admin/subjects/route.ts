import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  const subjects = await db.subject.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ subjects });
}
