import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-content flex min-h-svh flex-col items-start justify-center gap-6">
      <p className="mono-label">404</p>
      <h1 className="font-display text-h2">Hier ist nichts.</h1>
      <Link href="/" className="text-sm underline underline-offset-4">
        Zurück zur Startseite
      </Link>
    </main>
  );
}
