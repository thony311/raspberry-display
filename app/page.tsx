import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">Raspberry Display</h1>

        <div className="mt-6 flex gap-4">
          <Link
            href="/admin"
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white"
          >
            Admin
          </Link>

          <Link
            href="/screen"
            className="rounded bg-black px-4 py-2 font-bold text-white"
          >
            Écran
          </Link>
        </div>
      </div>
    </main>
  );
}