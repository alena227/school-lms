export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/"))
        return u.pathname.replace("/embed/", "");
      if (u.pathname.startsWith("/shorts/"))
        return u.pathname.replace("/shorts/", "");
      if (u.pathname.startsWith("/live/"))
        return u.pathname.replace("/live/", "");
    }
    return null;
  } catch {
    return null;
  }
}
