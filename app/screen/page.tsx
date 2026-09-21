"use client";

import { useEffect, useState } from "react";

type Publication = {
  id: string;
  title: string;
  type: "image" | "pdf";
  fileName: string;
  fileUrl: string;
  startAt?: string;
  endAt?: string;
  duration: number;
  createdAt?: string;
};

export default function Page() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [index, setIndex] = useState(0);

  async function fetchPublications() {
    try {
      const response = await fetch(`/api/screen?t=${Date.now()}`, {
        cache: "no-store",
      });

      const data: Publication[] = await response.json();

      setPublications(data);

      setIndex((currentIndex) => {
        if (data.length === 0) return 0;
        if (currentIndex >= data.length) return 0;
        return currentIndex;
      });
    } catch (error) {
      console.error("Erreur /api/screen :", error);
      setPublications([]);
      setIndex(0);
    }
  }

  useEffect(() => {
    fetchPublications();

    const interval = setInterval(() => {
      fetchPublications();
    }, 900000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publications.length === 0) return;

    const current = publications[index];

    if (!current) {
      setIndex(0);
      return;
    }

    const duration = Number(current.duration) || 10;

    const timer = setTimeout(() => {
      setIndex((previousIndex) => {
        return (previousIndex + 1) % publications.length;
      });
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [publications, index]);

  const current = publications[index];

  if (!current) {
    return (
      <main className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <p className="text-3xl">Aucune publication active</p>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      {current.type === "image" && (
        <img
          src={current.fileUrl}
          alt={current.title}
          className="h-full w-full object-contain"
        />
      )}

      {current.type === "pdf" && (
        <iframe
          src={current.fileUrl}
          title={current.title}
          className="h-full w-full border-0 bg-white"
        />
      )}
    </main>
  );
}