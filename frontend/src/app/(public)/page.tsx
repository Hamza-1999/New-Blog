import { Metadata } from "next";
import { HomeContent } from "@/components/home/home-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Flavor Journal - Stories, Ideas & Insights",
  description:
    "A curated collection of thoughtful articles, deep insights, and compelling narratives. Discover stories worth reading.",
  openGraph: {
    title: "Flavor Journal - Stories, Ideas & Insights",
    description:
      "A curated collection of thoughtful articles, deep insights, and compelling narratives.",
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Journal - Stories, Ideas & Insights",
    description:
      "A curated collection of thoughtful articles, deep insights, and compelling narratives.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function HomePage() {
  return <HomeContent />;
}
