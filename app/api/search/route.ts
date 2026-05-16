import { NextResponse } from "next/server";

import { searchHeaderContent } from "@/lib/repositories/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.trim().slice(0, 80);
  const result = await searchHeaderContent(query, { limit: 120 });

  return NextResponse.json(
    {
      query,
      quickLinks: result.quickLinks,
      items: result.items,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

