import { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function getPage() {
  try {
    const res = await fetch(`${API_URL}/pages/privacy-policy`, {
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
  const title = page?.metaTitle || "Privacy Policy";
  const description =
    page?.metaDescription || "Read the Flavor Journal privacy policy.";

  return {
    title: page?.title || "Privacy Policy",
    description,
    keywords: page?.metaKeywords?.split(",").map((k: string) => k.trim()),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/privacy-policy`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/privacy-policy`,
    },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getPage();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/privacy-policy`,
        url: `${SITE_URL}/privacy-policy`,
        name: page?.metaTitle || "Privacy Policy - Flavor Journal",
        description:
          page?.metaDescription || "Read the Flavor Journal privacy policy.",
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
            name: "Privacy Policy",
            item: `${SITE_URL}/privacy-policy`,
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
          Privacy Policy
        </h1>
        <p className="text-[12px] text-muted-foreground mb-8 uppercase tracking-wide">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-6 text-[14px] text-muted-foreground leading-relaxed">
          {[
            { title: "Introduction", content: "Welcome to Flavor Journal. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website." },
            { title: "Information We Collect", content: null, list: ["Personal information you voluntarily provide (name, email address) when contacting us", "Usage data collected automatically (IP address, browser type, pages visited, time spent)", "Cookies and similar tracking technologies"] },
            { title: "How We Use Your Information", content: null, list: ["To provide and maintain our website", "To improve user experience and content", "To respond to your inquiries and communications", "To display relevant advertisements through Google AdSense", "To analyze website traffic and usage patterns"] },
            { title: "Google AdSense", content: "We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits. You may opt out of personalized advertising by visiting Google Ads Settings." },
            { title: "Cookies", content: "We use cookies to enhance your browsing experience, analyze site traffic, and serve targeted advertisements. You can control cookie preferences through your browser settings." },
            { title: "Data Security", content: "We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure." },
            { title: "Your Rights", content: "You have the right to access, correct, or delete your personal information. You may also opt out of receiving communications from us at any time." },
            { title: "Contact Us", content: "If you have questions about this Privacy Policy, please contact us at hello@flavorjournal.com." },
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
