const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const ALLOWED_SLUGS = ['about', 'privacy-policy', 'terms'];

// Get all pages (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      select: { id: true, title: true, slug: true, metaTitle: true, updatedAt: true },
      orderBy: { title: 'asc' },
    });
    res.json({ pages });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get page by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update page by slug (admin only)
router.put('/:slug', authenticate, requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;

    if (!ALLOWED_SLUGS.includes(slug)) {
      return res.status(400).json({ error: 'Invalid page slug' });
    }

    const { title, content, metaTitle, metaDescription, metaKeywords } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        title,
        content,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
      },
      create: {
        slug,
        title,
        content,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
      },
    });

    res.json({ page });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
