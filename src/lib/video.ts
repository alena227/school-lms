import { extractYoutubeId } from "@/lib/youtube";
import { extractRutube } from "@/lib/rutube";
import { extractEducontent } from "@/lib/educontent";

export type VideoInfo =
  | { platform: "youtube"; id: string }
  | { platform: "rutube"; id: string; embedUrl: string }
  | { platform: "educontent"; id: string; embedUrl: string };

export function extractVideo(url: string): VideoInfo | null {
  const youtubeId = extractYoutubeId(url);
  if (youtubeId) return { platform: "youtube", id: youtubeId };

  const rutube = extractRutube(url);
  if (rutube) return { platform: "rutube", id: rutube.id, embedUrl: rutube.embedUrl };

  const educontent = extractEducontent(url);
  if (educontent)
    return { platform: "educontent", id: educontent.id, embedUrl: educontent.embedUrl };

  return null;
}
