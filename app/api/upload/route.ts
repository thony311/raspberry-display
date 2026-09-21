import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const publicationsFile = path.join(dataDir, "publications.json");

async function readPublications() {
  try {
    const data = await readFile(publicationsFile, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const startAt = formData.get("startAt");
    const endAt = formData.get("endAt");
    const durationValue = formData.get("duration");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: "Le fichier doit être une image ou un PDF." },
        { status: 400 }
      );
    }

    if (typeof startAt !== "string" || typeof endAt !== "string") {
      return NextResponse.json(
        { error: "La date de début et la date de fin sont obligatoires." },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début." },
        { status: 400 }
      );
    }

    const duration = Number(durationValue) || 10;

    if (duration < 5) {
      return NextResponse.json(
        { error: "La durée doit être d’au moins 5 secondes." },
        { status: 400 }
      );
    }

    await mkdir(dataDir, { recursive: true });
    await mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(file.name).toLowerCase();

    const cleanName = path
      .basename(file.name, extension)
      .replaceAll(" ", "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    const finalName = `${Date.now()}-${cleanName || "fichier"}${extension}`;
    const filePath = path.join(uploadsDir, finalName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    const publications = await readPublications();

    const newPublication = {
      id: randomUUID(),
      title: file.name,
      type: isPdf ? "pdf" : "image",
      fileName: finalName,
      fileUrl: `/uploads/${finalName}`,
      startAt,
      endAt,
      duration,
      createdAt: new Date().toISOString(),
    };

    publications.push(newPublication);

    await writeFile(
      publicationsFile,
      JSON.stringify(publications, null, 2)
    );

    return NextResponse.json({
      success: true,
      publication: newPublication,
    });
  } catch (error) {
    console.error("ERREUR UPLOAD :", error);

    return NextResponse.json(
      { error: "Erreur serveur pendant l’upload." },
      { status: 500 }
    );
  }
}