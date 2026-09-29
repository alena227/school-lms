import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    { name: "Русский язык", order: 1 },
    { name: "Профильная математика", order: 2 },
    { name: "Физика", order: 3 },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: { order: subject.order },
      create: subject,
    });
  }

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const adminFullName = process.env.ADMIN_FULLNAME ?? "Администратор";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash,
      fullName: adminFullName,
      role: "ADMIN",
    },
  });

  console.log(`Seed complete. Admin login: ${adminUsername} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
