import { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Flavor Journal team. Have a question or suggestion? Drop us a message and we'll get back to you.",
  openGraph: {
    title: "Contact Flavor Journal",
    description:
      "Get in touch with the Flavor Journal team. Have a question or suggestion? Drop us a message.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Flavor Journal",
    description:
      "Get in touch with the Flavor Journal team. Have a question or suggestion? Drop us a message.",
  },
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact`,
        url: `${SITE_URL}/contact`,
        name: "Contact Flavor Journal",
        description:
          "Get in touch with the Flavor Journal team.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact",
            item: `${SITE_URL}/contact`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="max-w-xl mb-8 animate-fade-up">
          <p className="text-primary font-semibold text-[11px] tracking-[0.2em] uppercase mb-3">
            Get in Touch
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4 leading-[1.15]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We'd love to hear from you
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Have a question or suggestion? Drop us a message and we'll get back
            to you.
          </p>
        </div>

        <ContactForm />
      </div>
    </>
  );
}
