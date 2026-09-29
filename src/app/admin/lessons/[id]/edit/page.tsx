import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import LessonForm from "@/components/admin/LessonForm";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { files: true, subject: true },
  });

  if (!lesson) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Урок {lesson.number}: {lesson.title}
      </h1>
      <LessonForm
        initialLesson={{
          id: lesson.id,
          subjectId: lesson.subjectId,
          subjectName: lesson.subject.name,
          number: lesson.number,
          title: lesson.title,
          youtubeUrl: lesson.youtubeUrl,
          files: lesson.files.map((f) => ({
            id: f.id,
            kind: f.kind,
            url: f.url,
            fileName: f.fileName,
          })),
        }}
      />
    </div>
  );
}
