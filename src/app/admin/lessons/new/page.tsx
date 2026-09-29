import LessonForm from "@/components/admin/LessonForm";

export default function NewLessonPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Новый урок
      </h1>
      <LessonForm />
    </div>
  );
}
