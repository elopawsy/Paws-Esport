import { NextResponse } from "next/server";
import { getCacheStats, clearAllCache, clearCacheByPrefix } from "@/infrastructure/pandascore/cache";

export async function GET() {
  const stats = getCacheStats();
  return NextResponse.json({
    ...stats,
    timestamp: new Date().toISOString(),
  });
}

// POST to clear cache
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.prefix) {
      clearCacheByPrefix(body.prefix);
      return NextResponse.json({ message: `Cleared cache for prefix: ${body.prefix}` });
    } else if (body.clearAll) {
      clearAllCache();
      return NextResponse.json({ message: "All cache cleared" });
    }
    
    return NextResponse.json({ error: "Specify 'prefix' or 'clearAll'" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
