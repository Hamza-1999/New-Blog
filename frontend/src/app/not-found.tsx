import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-up">
        <h1
          className="text-7xl font-bold text-primary/15 mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </h1>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Page not found
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
