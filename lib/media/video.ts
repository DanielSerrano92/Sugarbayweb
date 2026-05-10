import type { VideoPlatform } from "@/app/generated/prisma/client";

function normalizeYouTubeId(rawValue: string): string | null {
  const candidate = rawValue.trim();
  if (!/^[A-Za-z0-9_-]{11}$/.test(candidate)) return null;
  return candidate;
}

export function extractYouTubeVideoId(videoUrl: string): string | null {
  const directId = normalizeYouTubeId(videoUrl);
  if (directId) return directId;

  try {
    const parsed = new URL(videoUrl);

    if (parsed.hostname.includes("youtu.be")) {
      return normalizeYouTubeId(parsed.pathname.replace("/", ""));
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        const videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
        return normalizeYouTubeId(videoId);
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
        return normalizeYouTubeId(videoId);
      }

      const videoId = parsed.searchParams.get("v") ?? "";
      return normalizeYouTubeId(videoId);
    }

    return null;
  } catch {
    return null;
  }
}

export function inferYouTubeVideoType(videoUrl: string): "normal" | "short" {
  try {
    const parsed = new URL(videoUrl);
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/shorts/")
    ) {
      return "short";
    }
  } catch {
    // Ignore parsing failures. Values can be a plain YouTube ID.
  }

  return "normal";
}

function toYouTubeEmbed(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function toVimeoEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return null;
    const videoId = parsed.pathname.replaceAll("/", "").trim();
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  } catch {
    return null;
  }
}

export function resolveVideoEmbedUrl(platform: VideoPlatform, videoUrl: string): string {
  if (platform === "YOUTUBE") {
    return toYouTubeEmbed(videoUrl) ?? videoUrl;
  }

  if (platform === "VIMEO") {
    return toVimeoEmbed(videoUrl) ?? videoUrl;
  }

  return videoUrl;
}
