import { extractYoutubeId } from "@/lib/youtube";
import { extractRutube } from "@/lib/rutube";

export type VideoInfo =
  | { platform: "youtube"; id: string }
  | { platform: "rutube"; id: string; embedUrl: string };

export function extractVideo(url: string): VideoInfo | null {
  const youtubeId = extractYoutubeId(url);
  if (youtubeId) return { platform: "youtube", id: youtubeId };

  const rutube = extractRutube(url);
  if (rutube) return { platform: "rutube", id: rutube.id, embedUrl: rutube.embedUrl };

  return null;
}
