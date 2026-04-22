const biographySectionImageBySlug: Record<string, string> = {
  origin: "https://ik.imagekit.io/sugarbay/bio/origin.jpg",
  breakthrough: "https://ik.imagekit.io/sugarbay/bio/breakthrough.jpg",
  "current-era": "https://ik.imagekit.io/sugarbay/bio/current-era.jpg",
};

export function getBiographySectionImage(slug: string): string | null {
  return biographySectionImageBySlug[slug] ?? null;
}
