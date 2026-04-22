import type { NextConfig } from "next";

const imageKitHostnames = new Set<string>(["ik.imagekit.io"]);

const configuredImageKitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
if (configuredImageKitEndpoint) {
  try {
    const { hostname } = new URL(configuredImageKitEndpoint);
    imageKitHostnames.add(hostname);
  } catch {
    // Ignorar endpoint invlido en tiempo de configuracin.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: Array.from(imageKitHostnames).map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

export default nextConfig;


