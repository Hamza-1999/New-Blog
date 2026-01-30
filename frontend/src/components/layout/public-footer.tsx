import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Flavor<span className="text-primary">Journal</span>
            </span>
            <p className="mt-3 text-[13px] text-background/50 max-w-sm leading-relaxed">
              A curated space for stories, ideas, and insights. We believe in the power of words
              to inspire, inform, and connect.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[11px] uppercase tracking-[0.15em] mb-3 text-background/40">Navigate</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-background/50 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[11px] uppercase tracking-[0.15em] mb-3 text-background/40">Legal</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-background/50 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-background/10 text-center text-[11px] text-background/30 tracking-wide">
          &copy; {new Date().getFullYear()} Flavor Journal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
