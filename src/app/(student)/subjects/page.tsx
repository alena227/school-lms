import Link from "next/link";
import { db } from "@/lib/db";

export default async function SubjectsPage() {
  const subjects = await db.subject.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Предметы</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-400 transition-colors"
          >
            <h2 className="font-medium text-slate-900">{subject.name}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {subject._count.lessons} уроков
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
