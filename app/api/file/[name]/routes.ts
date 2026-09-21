import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const uploadDir = path.join(process.cwd(), "public", "uploads");
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
  const formData = await request.formData();

  const file = formData.get("file");
  const title = formData.get("title");
  const duration = formData.get("duration");
  const startAt = formData.get("startAt");
  const endAt = formData.get("endAt");

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

  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = path.extname(file.name).toLowerCase();

  const baseName = path
    .basename(file.name, extension)
    .replaceAll(" ", "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");

  const safeBaseName = baseName || "fichier";
  const fileName = `${Date.now()}-${safeBaseName}${extension}`;

  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, buffer);

  const publications = await readPublications();

  const newPublication = {
    id: randomUUID(),
    title:
      typeof title === "string" && title.trim() !== ""
        ? title
        : file.name,
    type: isPdf ? "pdf" : "image",
    fileName,

    // ICI c’est le bon URL maintenant.
    // L’image est dans public/uploads,
    // donc elle est accessible avec /uploads/nom-du-fichier.
    fileUrl: `/uploads/${encodeURIComponent(fileName)}`,

    duration: Number(duration) || 10,
    startAt: typeof startAt === "string" ? startAt : "",
    endAt: typeof endAt === "string" ? endAt : "",
    createdAt: new Date().toISOString(),
  };

  publications.push(newPublication);

  await writeFile(publicationsFile, JSON.stringify(publications, null, 2));

  return NextResponse.json({
    success: true,
    publication: newPublication,
  });
}