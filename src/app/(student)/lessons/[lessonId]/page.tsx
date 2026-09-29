import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { extractYoutubeId } from "@/lib/youtube";
import LessonView from "@/components/LessonView";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const session = await requireUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      subject: true,
      files: true,
      videoProgress: { where: { studentId: session.userId } },
      submissions: {
        where: { studentId: session.userId },
        include: { files: true },
      },
    },
  });

  if (!lesson) notFound();

  const youtubeId = extractYoutubeId(lesson.youtubeUrl);
  const submission = lesson.submissions[0];

  return (
    <div>
      <Link
        href={`/subjects/${lesson.subjectId}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← {lesson.subject.name}
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mt-2 mb-6">
        Урок {lesson.number}: {lesson.title}
      </h1>

      {!youtubeId ? (
        <p className="text-sm text-red-600">Не удалось загрузить видео.</p>
      ) : (
        <LessonView
          lessonId={lesson.id}
          youtubeId={youtubeId}
          classworkFiles={lesson.files.filter((f) => f.kind === "CLASSWORK")}
          homeworkFiles={lesson.files.filter((f) => f.kind === "HOMEWORK")}
          initialWatched={lesson.videoProgress[0]?.watched ?? false}
          initialText={submission?.text ?? ""}
          initialFiles={submission?.files ?? []}
        />
      )}
    </div>
  );
}
