import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";


export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Publication = {
  id: string;
  title: string;
  type: "image" | "pdf";
  fileName: string;
  fileUrl: string;
  startAt: string;
  endAt: string;
  duration: number;
  createdAt: string;
};

const publicationsFile = path.join(
  process.cwd(),
  "data",
  "publications.json"
);

export async function GET() {
  try {
    const data = await readFile(publicationsFile, "utf-8");
    const publications: Publication[] = JSON.parse(data);

    const now = new Date();

    const activePublications = publications
      .filter((publication) => {
        const start = new Date(publication.startAt);
        const end = new Date(publication.endAt);

        return start <= now && now <= end;
      })
      .sort((a, b) => {
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });

    return NextResponse.json(activePublications);
  } catch (error) {
    console.error("Erreur /api/screen :", error);
    return NextResponse.json([]);
  }
}