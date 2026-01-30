import { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getPage() {
  try {
    const res = await fetch(`${API_URL}/pages/terms`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.page;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage();
  const title = page?.metaTitle || "Terms of Service";
  const description =
    page?.metaDescription || "Read the Flavor Journal terms of service.";

  return {
    title: page?.title || "Terms of Service",
    description,
    keywords: page?.metaKeywords?.split(",").map((k: string) => k.trim()),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/terms`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/terms`,
    },
  };
}

export default async function TermsPage() {
  const page = await getPage();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/terms`,
        url: `${SITE_URL}/terms`,
        name: page?.metaTitle || "Terms of Service - Flavor Journal",
        description:
          page?.metaDescription || "Read the Flavor Journal terms of service.",
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
            name: "Terms of Service",
            item: `${SITE_URL}/terms`,
          },
        ],
      },
    ],
  };

  if (page?.content) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {page.title}
          </h1>
          <p className="text-[12px] text-muted-foreground mb-8 uppercase tracking-wide">
            Last updated: {new Date(page.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </>
    );
  }

  // Fallback: hardcoded content
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Terms of Service
        </h1>
        <p className="text-[12px] text-muted-foreground mb-8 uppercase tracking-wide">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-6 text-[14px] text-muted-foreground leading-relaxed">
          {[
            { title: "Acceptance of Terms", content: "By accessing and using Flavor Journal, you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website." },
            { title: "Use of Content", content: "All content published on Flavor Journal is protected by copyright. You may read and share our content for personal, non-commercial purposes. Reproduction without written permission is prohibited." },
            { title: "User Conduct", content: null, list: ["You agree not to use our website for any unlawful purposes", "You will not attempt to gain unauthorized access to our systems", "You will not interfere with the proper functioning of the website", "You will not post or transmit any harmful, offensive, or misleading content"] },
            { title: "Intellectual Property", content: "The Flavor Journal name, logo, and all related content are the intellectual property of Flavor Journal. All trademarks, service marks, and trade names are owned by their respective holders." },
            { title: "Disclaimer", content: "Content on Flavor Journal is provided for informational purposes only. We make no warranties about the accuracy or reliability of any content. Your use of information from our website is at your own risk." },
            { title: "Limitation of Liability", content: "Flavor Journal shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our website." },
            { title: "Changes to Terms", content: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of modified terms." },
            { title: "Contact", content: "For questions about these Terms of Service, contact us at hello@flavorjournal.com." },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {section.title}
              </h2>
              {section.content && <p>{section.content}</p>}
              {section.list && (
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {section.list.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
