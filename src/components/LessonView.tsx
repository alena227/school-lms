"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile, type UploadedFile } from "@/lib/upload-client";

type LessonFile = { id: string; kind: "CLASSWORK" | "HOMEWORK"; url: string; fileName: string };
type SubmissionFile = { id: string; url: string; fileName: string; mimeType: string };

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string,
        opts: {
          videoId: string;
          events?: { onStateChange?: (e: { data: number }) => void };
        }
      ) => unknown;
      PlayerState?: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function LessonView({
  lessonId,
  youtubeId,
  classworkFiles,
  homeworkFiles,
  initialWatched,
  initialText,
  initialFiles,
}: {
  lessonId: string;
  youtubeId: string;
  classworkFiles: LessonFile[];
  homeworkFiles: LessonFile[];
  initialWatched: boolean;
  initialText: string;
  initialFiles: SubmissionFile[];
}) {
  const [watched, setWatched] = useState(initialWatched);
  const [text, setText] = useState(initialText);
  const [files, setFiles] = useState<(SubmissionFile | UploadedFile)[]>(
    initialFiles
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const watchedRef = useRef(initialWatched);
  const router = useRouter();

  async function markWatched() {
    if (watchedRef.current) return;
    watchedRef.current = true;
    setWatched(true);
    await fetch("/api/video-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    router.refresh();
  }

  useEffect(() => {
    const playerId = `yt-player-${lessonId}`;

    function initPlayer() {
      if (!window.YT) return;
      new window.YT.Player(playerId, {
        videoId: youtubeId,
        events: {
          onStateChange: (e) => {
            if (window.YT?.PlayerState && e.data === window.YT.PlayerState.ENDED) {
              markWatched();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const existing = document.getElementById("youtube-iframe-api");
      if (!existing) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, youtubeId]);

  async function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (inputFiles.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of inputFiles) {
        const uploaded = await uploadFile(file);
        setFiles((prev) => [...prev, uploaded]);
      }
    } catch {
      setError("Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  }

  function handleFileRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavedMsg("");
    setSaving(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        text,
        files: files.map((f) => ({
          url: f.url,
          fileName: f.fileName,
          mimeType: "mimeType" in f ? f.mimeType : "application/octet-stream",
        })),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось отправить ответ");
      return;
    }
    setSavedMsg("Ответ сохранён");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        <div id={`yt-player-${lessonId}`} className="w-full h-full" />
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs rounded-full px-3 py-1 font-medium ${
            watched
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {watched ? "✓ Видео просмотрено" : "Видео ещё не просмотрено"}
        </span>
        {!watched && (
          <button
            onClick={markWatched}
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-900"
          >
            Отметить просмотренным
          </button>
        )}
      </div>

      <FileList label="Классная работа" files={classworkFiles} />
      <FileList label="Домашнее задание" files={homeworkFiles} />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <h2 className="font-medium text-slate-900">Ответ на домашнее задание</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Напишите ответ здесь..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
        />

        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-slate-100 rounded-md px-3 py-2 text-sm"
            >
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="truncate hover:underline"
              >
                {f.fileName}
              </a>
              <button
                type="button"
                onClick={() => handleFileRemove(i)}
                className="text-red-600 hover:text-red-800 text-xs ml-2"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={handleFileAdd}
          disabled={uploading}
          className="text-sm text-slate-900"
        />
        {uploading && (
          <p className="text-xs text-slate-500">Загрузка файла...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {savedMsg && <p className="text-sm text-emerald-600">{savedMsg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-900 text-white text-sm font-medium py-2 px-4 hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Отправка..." : "Отправить ответ"}
        </button>
      </form>
    </div>
  );
}

function FileList({ label, files }: { label: string; files: LessonFile[] }) {
  if (files.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-700 mb-2">{label}</h3>
      <div className="space-y-2">
        {files.map((f) => (
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
    </div>
  );
}
