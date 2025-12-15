import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const blob = await response.blob();
        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Content-Type", response.headers.get("Content-Type") || "image/png");

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error("Proxy error:", error);
        return new NextResponse("Failed to fetch image", { status: 500 });
    }
}
