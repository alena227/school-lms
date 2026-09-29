import Link from "next/link";
import { db } from "@/lib/db";
import DeleteLessonButton from "@/components/admin/DeleteLessonButton";

export default async function AdminLessonsPage() {
  const subjects = await db.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { number: "asc" },
        include: { _count: { select: { submissions: true } } },
      },
    },
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Уроки</h1>
        <Link
          href="/admin/lessons/new"
          className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 px-4 hover:bg-slate-800"
        >
          + Новый урок
        </Link>
      </div>

      {subjects.map((subject) => (
        <div key={subject.id}>
          <h2 className="text-lg font-medium text-slate-900 mb-3">
            {subject.name}
          </h2>
          {subject.lessons.length === 0 ? (
            <p className="text-sm text-slate-500">Уроков пока нет.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {subject.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Урок {lesson.number}: {lesson.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      Сдач: {lesson._count.submissions}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Link
                      href={`/admin/lessons/${lesson.id}/submissions`}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Сдачи
                    </Link>
                    <Link
                      href={`/admin/lessons/${lesson.id}/edit`}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Изменить
                    </Link>
                    <DeleteLessonButton lessonId={lesson.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
