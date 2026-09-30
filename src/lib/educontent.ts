export type EducontentInfo = { id: string; embedUrl: string };

export function extractEducontent(url: string): EducontentInfo | null {
  try {
    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProtocol);

    if (!u.hostname.endsWith("educontent.cloud")) return null;

    const match = u.pathname.match(
      /^\/(?:watch|embed|player)\/([a-zA-Z0-9-]+)\/?$/
    );
    if (!match) return null;

    const id = match[1];
    const partner = u.searchParams.get("partner");
    const embedUrl = partner
      ? `https://educontent.cloud/watch/${id}?partner=${encodeURIComponent(partner)}`
      : `https://educontent.cloud/watch/${id}`;
    return { id, embedUrl };
  } catch {
    return null;
  }
}
