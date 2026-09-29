"use client";

import { useRouter } from "next/navigation";

export default function DeleteLessonButton({
  lessonId,
}: {
  lessonId: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Удалить урок вместе с файлами и сдачами учеников?")) return;
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800"
    >
      Удалить
    </button>
  );
}
