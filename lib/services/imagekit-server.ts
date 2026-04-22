import "server-only";

import ImageKit from "@imagekit/nodejs";

import { env, requireEnv } from "@/lib/env";

let imageKitClient: ImageKit | null = null;

export function getImageKitClient(): ImageKit {
  if (imageKitClient) return imageKitClient;

  imageKitClient = new ImageKit({
    privateKey: requireEnv(env.IMAGEKIT_PRIVATE_KEY, "IMAGEKIT_PRIVATE_KEY"),
  });

  return imageKitClient;
}
