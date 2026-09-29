import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function LessonSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { subject: true },
  });
  if (!lesson) notFound();

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { fullName: "asc" },
    include: {
      videoProgress: { where: { lessonId } },
      submissions: {
        where: { lessonId },
        include: { files: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/lessons"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Уроки
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">
          Сдачи: Урок {lesson.number}. {lesson.title}
        </h1>
        <p className="text-sm text-slate-500">{lesson.subject.name}</p>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-slate-500">Учеников пока нет.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {students.map((student) => {
            const watched = student.videoProgress[0]?.watched ?? false;
            const submission = student.submissions[0];
            return (
              <details key={student.id} className="group">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <Badge ok={watched} label="Видео" />
                    <Badge ok={!!submission} label="ДЗ" />
                  </div>
                </summary>
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  {!submission ? (
                    <p className="text-sm text-slate-500">
                      Домашнее задание не сдано.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">
                        Сдано:{" "}
                        {new Date(submission.submittedAt).toLocaleString(
                          "ru-RU"
                        )}
                        {submission.updatedAt > submission.submittedAt &&
                          ` (обновлено: ${new Date(
                            submission.updatedAt
                          ).toLocaleString("ru-RU")})`}
                      </p>
                      {submission.text && (
                        <p className="text-sm text-slate-900 whitespace-pre-wrap bg-slate-50 rounded-md p-3">
                          {submission.text}
                        </p>
                      )}
                      {submission.files.length > 0 && (
                        <div className="space-y-2">
                          {submission.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block bg-white border border-slate-200 rounded-md px-3 py-2 text-sm hover:border-slate-400"
                            >
                              {f.fileName}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </details>
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
