import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// POST: Upload avatar (stores as base64 data URL in database)
export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("avatar") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Format invalide. Utilisez JPG, PNG, GIF ou WebP" }, { status: 400 });
        }

        // Validate file size (max 500KB for base64 storage)
        if (file.size > 500 * 1024) {
            return NextResponse.json({ error: "Fichier trop volumineux. Maximum 500 Ko" }, { status: 400 });
        }

        // Convert to base64 data URL
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Update user's image in database
        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: dataUrl },
        });

        return NextResponse.json({ success: true, imageUrl: dataUrl });
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// DELETE: Remove avatar
export async function DELETE() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Set image to null
        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing avatar:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
