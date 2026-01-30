import { Metadata } from "next";
import { BookOpen, Users, Globe } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getPage() {
  try {
    const res = await fetch(`${API_URL}/pages/about`, {
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
  const title = page?.metaTitle || "About Flavor Journal";
  const description =
    page?.metaDescription ||
    "Learn more about Flavor Journal - our mission and story.";

  return {
    title: page?.title || "About",
    description,
    keywords: page?.metaKeywords?.split(",").map((k: string) => k.trim()),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/about`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
  };
}

export default async function AboutPage() {
  const page = await getPage();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/about`,
        url: `${SITE_URL}/about`,
        name: page?.metaTitle || "About Flavor Journal",
        description:
          page?.metaDescription ||
          "Learn more about Flavor Journal - our mission and story.",
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
            name: "About",
            item: `${SITE_URL}/about`,
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
          <h1
            className="text-3xl md:text-4xl font-bold mb-6 leading-[1.15]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {page.title}
          </h1>
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
        <div className="max-w-xl mb-10 animate-fade-up">
          <p className="text-primary font-semibold text-[11px] tracking-[0.2em] uppercase mb-3">About Us</p>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4 leading-[1.15]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We believe in the power of words
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Flavor Journal is a curated space for stories, ideas, and insights. We bring together
            writers and readers who share a passion for thoughtful, well-crafted content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, title: "Quality Content", desc: "Every article is carefully crafted and edited to ensure the highest quality reading experience." },
            { icon: Users, title: "Diverse Voices", desc: "We celebrate diverse perspectives and welcome writers from all backgrounds." },
            { icon: Globe, title: "Global Reach", desc: "Our content reaches readers around the world, connecting ideas across borders." },
          ].map((item, i) => (
            <div key={item.title} className={`p-5 bg-card rounded-xl border border-border animate-fade-up stagger-${i + 1}`}>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-3">
                <item.icon size={16} />
              </div>
              <h3 className="font-bold text-[15px] mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                {item.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-card rounded-xl border border-border animate-fade-up stagger-4">
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Our Story
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
            Founded with a simple belief that great writing deserves a great platform,
            Flavor Journal has grown into a vibrant community of thinkers, creators, and
            curious minds.
          </p>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            Whether you are here to read, write, or simply explore, we are glad you found us.
            Every story has the power to change a perspective, and we are here to make sure
            those stories reach the people who need them.
          </p>
        </div>
      </div>
    </>
  );
}
