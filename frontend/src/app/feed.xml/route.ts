const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export async function GET() {
  let blogs: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    author: { name: string };
    createdAt: string;
  }[] = [];

  try {
    const res = await fetch(`${API_URL}/blogs/public?limit=50`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      blogs = data.blogs;
    }
  } catch {
    // API might not be available
  }

  const items = blogs
    .map(
      (blog) => `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${SITE_URL}/blog/${blog.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${blog.slug}</guid>
      <description>${escapeXml(blog.excerpt || stripHtml(blog.content).substring(0, 200))}</description>
      <author>${escapeXml(blog.author.name)}</author>
      <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Flavor Journal</title>
    <link>${SITE_URL}</link>
    <description>A curated space for stories, ideas, and insights. Discover thoughtfully written articles on topics that matter.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
