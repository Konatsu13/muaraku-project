import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Halaman tidak ditemukan | MuaraKu",
  description: "Halaman yang kamu cari tidak ditemukan.",
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-12">
          <p className="text-8xl font-extrabold tracking-tighter text-orange-500 sm:text-9xl">
            404
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Alamat yang kamu buka mungkin salah atau halaman tersebut sudah
            dipindahkan. Mari kembali ke titik temu MuaraKu.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <House aria-hidden="true" className="size-4" />
              Kembali ke beranda
            </Link>
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Buka aplikasi
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
