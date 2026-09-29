import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function SubjectLessonsPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const session = await requireUser();

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    include: {
      lessons: {
        orderBy: { number: "asc" },
        include: {
          videoProgress: { where: { studentId: session.userId } },
          submissions: { where: { studentId: session.userId } },
        },
      },
    },
  });

  if (!subject) notFound();

  return (
    <div>
      <Link href="/subjects" className="text-sm text-slate-500 hover:text-slate-900">
        ← Предметы
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mt-2 mb-6">
        {subject.name}
      </h1>

      {subject.lessons.length === 0 ? (
        <p className="text-sm text-slate-500">Уроков пока нет.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {subject.lessons.map((lesson) => {
            const watched = lesson.videoProgress[0]?.watched ?? false;
            const submitted = lesson.submissions.length > 0;
            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Урок {lesson.number}: {lesson.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Badge ok={watched} label="Видео" />
                  <Badge ok={submitted} label="ДЗ" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 font-medium ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {ok ? "✓ " : ""}
      {label}
    </span>
  );
}
