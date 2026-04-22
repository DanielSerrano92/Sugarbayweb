import type { VideoPlatform } from "@/app/generated/prisma/client";

function toYouTubeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "").trim();
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/shorts/")[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
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

