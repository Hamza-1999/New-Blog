const slugify = require('slugify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateUniqueSlug(title, existingId = null) {
  let slug = slugify(title, { lower: true, strict: true, trim: true });

  const where = existingId
    ? { slug, id: { not: existingId } }
    : { slug };

  const existing = await prisma.blog.findFirst({ where });

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  return slug;
}

module.exports = { generateUniqueSlug };
