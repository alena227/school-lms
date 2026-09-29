export type UploadedFile = {
  url: string;
  fileName: string;
  mimeType: string;
};

export async function uploadFile(file: File): Promise<UploadedFile> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Не удалось загрузить файл");
  }

  const { uploadUrl, publicUrl } = await presignRes.json();

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("Не удалось загрузить файл");
  }

  return {
    url: publicUrl,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}
