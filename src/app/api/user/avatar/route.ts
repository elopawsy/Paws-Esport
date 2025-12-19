import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST: Upload avatar
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

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: "Fichier trop volumineux. Maximum 2 Mo" }, { status: 400 });
        }

        // Create unique filename
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${session.user.id}-${Date.now()}.${ext}`;

        // Create directory if doesn't exist
        const avatarsDir = path.join(process.cwd(), "public", "avatars");
        await mkdir(avatarsDir, { recursive: true });

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = path.join(avatarsDir, filename);
        await writeFile(filepath, buffer);

        // Update user's image in database
        const imageUrl = `/avatars/${filename}`;
        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: imageUrl },
        });

        return NextResponse.json({ success: true, imageUrl });
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
