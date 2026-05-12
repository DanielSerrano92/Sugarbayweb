import type { VideoPlatform } from "@/app/generated/prisma/client";

const YOUTUBE_I_ENDPOINT = "https://www.youtube.com/youtubei/v1/player";
const YOUTUBE_CLIENT_VERSION = "2.20260501.00.00";
const VIDEO_REQUEST_TIMEOUT_MS = 3500;

const youtubeDurationCache = new Map<string, number | null>();

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "").trim();
      return videoId || null;
    }

    if (!parsed.hostname.includes("youtube.com")) return null;

    if (parsed.pathname.startsWith("/shorts/")) {
      const videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0]?.trim();
      return videoId || null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      const videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.trim();
      return videoId || null;
    }

    const queryVideoId = parsed.searchParams.get("v")?.trim();
    return queryVideoId || null;
  } catch {
    return null;
  }
}

function toYouTubeEmbed(url: string): string | null {
  const videoId = parseYouTubeVideoId(url);
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

async function fetchYouTubeDurationFromPlayerApi(videoId: string): Promise<number | null> {
  const response = await fetchWithTimeout(
    YOUTUBE_I_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: YOUTUBE_CLIENT_VERSION,
            hl: "es",
            gl: "ES",
          },
        },
        videoId,
      }),
    },
    VIDEO_REQUEST_TIMEOUT_MS,
  );

  if (!response.ok) return null;
  const payload = (await response.json()) as unknown;

  const raw = (payload as { videoDetails?: { lengthSeconds?: unknown } })?.videoDetails
    ?.lengthSeconds;

  const seconds =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
      ? Number.parseInt(raw, 10)
      : Number.NaN;

  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

async function fetchYouTubeDurationFromWatchPage(videoId: string): Promise<number | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetchWithTimeout(
    watchUrl,
    {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 },
    },
    VIDEO_REQUEST_TIMEOUT_MS,
  );

  if (!response.ok) return null;
  const html = await response.text();

  const match =
    html.match(/"lengthSeconds":"(\d+)"/) ??
    html.match(/"approxDurationMs":"(\d+)"/);

  if (!match?.[1]) return null;

  if (match[0].includes("approxDurationMs")) {
    const ms = Number.parseInt(match[1], 10);
    return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 1000) : null;
  }

  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

async function resolveYouTubeDurationSeconds(videoId: string): Promise<number | null> {
  if (youtubeDurationCache.has(videoId)) {
    return youtubeDurationCache.get(videoId) ?? null;
  }

  let resolved: number | null = null;

  try {
    resolved = await fetchYouTubeDurationFromPlayerApi(videoId);
  } catch {
    resolved = null;
  }

  if (resolved === null) {
    try {
      resolved = await fetchYouTubeDurationFromWatchPage(videoId);
    } catch {
      resolved = null;
    }
  }

  youtubeDurationCache.set(videoId, resolved);
  return resolved;
}

export async function resolveVideoDurationSeconds(
  platform: VideoPlatform,
  videoUrl: string,
  durationSeconds: number | null,
): Promise<number | null> {
  if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds) && durationSeconds > 0) {
    return durationSeconds;
  }

  if (platform !== "YOUTUBE") return durationSeconds;

  const videoId = parseYouTubeVideoId(videoUrl);
  if (!videoId) return durationSeconds;

  return await resolveYouTubeDurationSeconds(videoId);
}

export function resolveVideoPreviewImageUrl(
  platform: VideoPlatform,
  videoUrl: string,
  thumbnailUrl: string | null,
): string | null {
  if (thumbnailUrl) return thumbnailUrl;

  if (platform === "YOUTUBE") {
    const videoId = parseYouTubeVideoId(videoUrl);
    if (!videoId) return null;
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  return null;
}

