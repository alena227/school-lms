import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { generatePassword } from "@/lib/generate-password";

export async function GET() {
  await requireAdmin();
  const users = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, fullName: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const fullName =
    typeof body?.fullName === "string" ? body.fullName.trim() : "";

  if (!username || !fullName) {
    return NextResponse.json(
      { error: "Укажите логин и имя ученика" },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
    return NextResponse.json(
      {
        error:
          "Логин должен быть 3-32 символа: латинские буквы, цифры, . _ -",
      },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json(
      { error: "Такой логин уже занят" },
      { status: 409 }
    );
  }

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: { username, fullName, passwordHash, role: "STUDENT" },
    select: { id: true, username: true, fullName: true, createdAt: true },
  });

  return NextResponse.json({ user, password });
}
