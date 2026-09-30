export type RutubeInfo = { id: string; embedUrl: string };

export function extractRutube(url: string): RutubeInfo | null {
  try {
    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProtocol);

    if (!u.hostname.endsWith("rutube.ru")) return null;

    const patterns = [
      /^\/play\/embed\/([a-zA-Z0-9]+)\/?$/,
      /^\/video\/(?:private\/)?([a-zA-Z0-9]+)\/?$/,
      /^\/shorts\/([a-zA-Z0-9]+)\/?$/,
    ];

    for (const pattern of patterns) {
      const match = u.pathname.match(pattern);
      if (match) {
        const id = match[1];
        const p = u.searchParams.get("p");
        const embedUrl = p
          ? `https://rutube.ru/play/embed/${id}?p=${encodeURIComponent(p)}`
          : `https://rutube.ru/play/embed/${id}`;
        return { id, embedUrl };
      }
    }

    return null;
  } catch {
    return null;
  }
}
