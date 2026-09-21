"use client";

import { useState } from "react";

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Erreur pendant l’envoi.");
        setIsLoading(false);
        return;
      }

      setMessage("Fichier ajouté avec succès.");
      form.reset();
    } catch (error) {
      console.error(error);
      setMessage("Erreur pendant l’envoi.");
    }

    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Admin</h1>

        <p className="mt-2 text-slate-600">
          Ajoute une image ou un PDF à afficher sur l’écran.
        </p>

        {message && (
          <p className="mt-4 rounded bg-slate-200 p-3">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="block font-medium">Image ou PDF</label>

            <input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              Date et heure de début
            </label>

            <input
              type="datetime-local"
              name="startAt"
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              Date et heure de fin
            </label>

            <input
              type="datetime-local"
              name="endAt"
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              Durée d’apparition en secondes
            </label>

            <input
              type="number"
              name="duration"
              min="5"
              defaultValue="10"
              className="w-full rounded border p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white disabled:bg-slate-400"
          >
            {isLoading ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
    </main>
  );
}