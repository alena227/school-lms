"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/upload-client";

type Subject = { id: string; name: string };
type LessonFile = {
  id?: string;
  kind: "CLASSWORK" | "HOMEWORK";
  url: string;
  fileName: string;
};
const MAX_FILES_PER_SECTION = 5;

type InitialLesson = {
  id: string;
  subjectId: string;
  subjectName: string;
  number: number;
  title: string;
  youtubeUrl: string;
  files: LessonFile[];
};

export default function LessonForm({
  initialLesson,
}: {
  initialLesson?: InitialLesson;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialLesson);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState(initialLesson?.subjectId ?? "");
  const [number, setNumber] = useState(
    initialLesson ? String(initialLesson.number) : ""
  );
  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(
    initialLesson?.youtubeUrl ?? ""
  );
  const [classworkFiles, setClassworkFiles] = useState<LessonFile[]>(
    initialLesson?.files.filter((f) => f.kind === "CLASSWORK") ?? []
  );
  const [homeworkFiles, setHomeworkFiles] = useState<LessonFile[]>(
    initialLesson?.files.filter((f) => f.kind === "HOMEWORK") ?? []
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      fetch("/api/admin/subjects")
        .then((r) => r.json())
        .then((d) => {
          setSubjects(d.subjects ?? []);
          if (d.subjects?.[0]) setSubjectId(d.subjects[0].id);
        });
    }
  }, [isEdit]);

  async function handleFileAdd(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "CLASSWORK" | "HOMEWORK"
  ) {
    const inputFiles = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (inputFiles.length === 0) return;

    const currentCount =
      kind === "CLASSWORK" ? classworkFiles.length : homeworkFiles.length;
    if (currentCount + inputFiles.length > MAX_FILES_PER_SECTION) {
      setError(
        `Можно загрузить не более ${MAX_FILES_PER_SECTION} файлов в один раздел`
      );
      return;
    }

    setUploading(kind);
    setError("");
    try {
      for (const file of inputFiles) {
        const uploaded = await uploadFile(file);
        const newFile: LessonFile = { kind, ...uploaded };

        if (isEdit && initialLesson) {
          const res = await fetch(
            `/api/admin/lessons/${initialLesson.id}/files`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newFile),
            }
          );
          const data = await res.json();
          newFile.id = data.file?.id;
        }

        if (kind === "CLASSWORK") {
          setClassworkFiles((prev) => [...prev, newFile]);
        } else {
          setHomeworkFiles((prev) => [...prev, newFile]);
        }
      }
    } catch {
      setError("Не удалось загрузить файл");
    } finally {
      setUploading(null);
    }
  }

  async function handleFileRemove(
    file: LessonFile,
    kind: "CLASSWORK" | "HOMEWORK"
  ) {
    if (isEdit && initialLesson && file.id) {
      await fetch(
        `/api/admin/lessons/${initialLesson.id}/files/${file.id}`,
        { method: "DELETE" }
      );
    }
    if (kind === "CLASSWORK") {
      setClassworkFiles((prev) => prev.filter((f) => f !== file));
    } else {
      setHomeworkFiles((prev) => prev.filter((f) => f !== file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      subjectId,
      number: Number(number),
      title,
      youtubeUrl,
      files: [...classworkFiles, ...homeworkFiles].map((f) => ({
        kind: f.kind,
        url: f.url,
        fileName: f.fileName,
      })),
    };

    const res = await fetch(
      isEdit ? `/api/admin/lessons/${initialLesson!.id}` : "/api/admin/lessons",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Не удалось сохранить урок");
      return;
    }

    router.push("/admin/lessons");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {isEdit ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Предмет
          </label>
          <p className="text-sm text-slate-900">{initialLesson!.subjectName}</p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Предмет
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            required
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4">
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Номер урока
          </label>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Тема урока
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Ссылка на видео (YouTube)
        </label>
        <input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          required
        />
      </div>

      <FileSection
        label="Классная работа"
        files={classworkFiles}
        uploading={uploading === "CLASSWORK"}
        onAdd={(e) => handleFileAdd(e, "CLASSWORK")}
        onRemove={(f) => handleFileRemove(f, "CLASSWORK")}
      />

      <FileSection
        label="Домашняя работа"
        files={homeworkFiles}
        uploading={uploading === "HOMEWORK"}
        onAdd={(e) => handleFileAdd(e, "HOMEWORK")}
        onRemove={(f) => handleFileRemove(f, "HOMEWORK")}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 px-4 hover:bg-slate-800 disabled:opacity-60"
      >
        {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать урок"}
      </button>
    </form>
  );
}

function FileSection({
  label,
  files,
  uploading,
  onAdd,
  onRemove,
}: {
  label: string;
  files: LessonFile[];
  uploading: boolean;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (f: LessonFile) => void;
}) {
  const atLimit = files.length >= MAX_FILES_PER_SECTION;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{" "}
        <span className="font-normal text-slate-400">
          ({files.length}/{MAX_FILES_PER_SECTION})
        </span>
      </label>
      <div className="space-y-2">
        {files.map((f, i) => (
          <div
            key={f.id ?? i}
            className="flex items-center justify-between bg-slate-100 rounded-md px-3 py-2 text-sm"
          >
            <span className="truncate">{f.fileName}</span>
            <button
              type="button"
              onClick={() => onRemove(f)}
              className="text-red-600 hover:text-red-800 text-xs ml-2"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
      {!atLimit && (
        <input
          type="file"
          multiple
          onChange={onAdd}
          className="mt-2 text-sm text-slate-900"
          disabled={uploading}
        />
      )}
      {uploading && (
        <p className="text-xs text-slate-500 mt-1">Загрузка файла...</p>
      )}
      {atLimit && (
        <p className="text-xs text-slate-500 mt-1">
          Достигнут лимит в {MAX_FILES_PER_SECTION} файлов
        </p>
      )}
    </div>
  );
}
