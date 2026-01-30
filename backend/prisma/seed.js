const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@blog.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@blog.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'Site administrator',
    },
  });

  console.log('Seeded admin user:', admin.email);
  console.log('Password: admin123');

  // Seed default pages
  const pages = [
    {
      slug: 'about',
      title: 'About',
      content: `<h2>We believe in the power of words</h2>
<p>Flavor Journal is a curated space for stories, ideas, and insights. We bring together writers and readers who share a passion for thoughtful, well-crafted content.</p>
<h2>Quality Content</h2>
<p>Every article is carefully crafted and edited to ensure the highest quality reading experience.</p>
<h2>Diverse Voices</h2>
<p>We celebrate diverse perspectives and welcome writers from all backgrounds.</p>
<h2>Global Reach</h2>
<p>Our content reaches readers around the world, connecting ideas across borders.</p>
<h2>Our Story</h2>
<p>Founded with a simple belief that great writing deserves a great platform, Flavor Journal has grown into a vibrant community of thinkers, creators, and curious minds.</p>
<p>Whether you are here to read, write, or simply explore, we are glad you found us. Every story has the power to change a perspective, and we are here to make sure those stories reach the people who need them.</p>`,
      metaTitle: 'About Flavor Journal - Our Mission & Story',
      metaDescription: 'Learn more about Flavor Journal - a curated space for stories, ideas, and insights. Discover our mission, values, and the team behind the platform.',
      metaKeywords: 'about, flavor journal, mission, blog platform, writing community',
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: `<h2>Introduction</h2>
<p>Welcome to Flavor Journal. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p>
<h2>Information We Collect</h2>
<ul><li>Personal information you voluntarily provide (name, email address) when contacting us</li><li>Usage data collected automatically (IP address, browser type, pages visited, time spent)</li><li>Cookies and similar tracking technologies</li></ul>
<h2>How We Use Your Information</h2>
<ul><li>To provide and maintain our website</li><li>To improve user experience and content</li><li>To respond to your inquiries and communications</li><li>To display relevant advertisements through Google AdSense</li><li>To analyze website traffic and usage patterns</li></ul>
<h2>Google AdSense</h2>
<p>We use Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits. You may opt out of personalized advertising by visiting Google Ads Settings.</p>
<h2>Cookies</h2>
<p>We use cookies to enhance your browsing experience, analyze site traffic, and serve targeted advertisements. You can control cookie preferences through your browser settings.</p>
<h2>Data Security</h2>
<p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
<h2>Your Rights</h2>
<p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving communications from us at any time.</p>
<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at hello@flavorjournal.com.</p>`,
      metaTitle: 'Privacy Policy - Flavor Journal',
      metaDescription: 'Read the Flavor Journal privacy policy. Learn how we collect, use, and protect your personal data when you visit our website.',
      metaKeywords: 'privacy policy, data protection, cookies, personal data',
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: `<h2>Acceptance of Terms</h2>
<p>By accessing and using Flavor Journal, you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
<h2>Use of Content</h2>
<p>All content published on Flavor Journal is protected by copyright. You may read and share our content for personal, non-commercial purposes. Reproduction without written permission is prohibited.</p>
<h2>User Conduct</h2>
<ul><li>You agree not to use our website for any unlawful purposes</li><li>You will not attempt to gain unauthorized access to our systems</li><li>You will not interfere with the proper functioning of the website</li><li>You will not post or transmit any harmful, offensive, or misleading content</li></ul>
<h2>Intellectual Property</h2>
<p>The Flavor Journal name, logo, and all related content are the intellectual property of Flavor Journal. All trademarks, service marks, and trade names are owned by their respective holders.</p>
<h2>Disclaimer</h2>
<p>Content on Flavor Journal is provided for informational purposes only. We make no warranties about the accuracy or reliability of any content. Your use of information from our website is at your own risk.</p>
<h2>Limitation of Liability</h2>
<p>Flavor Journal shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our website.</p>
<h2>Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of modified terms.</p>
<h2>Contact</h2>
<p>For questions about these Terms of Service, contact us at hello@flavorjournal.com.</p>`,
      metaTitle: 'Terms of Service - Flavor Journal',
      metaDescription: 'Read the Flavor Journal terms of service. Understand your rights and responsibilities when using our website.',
      metaKeywords: 'terms of service, terms and conditions, user agreement',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  console.log('Seeded default pages: about, privacy-policy, terms');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
