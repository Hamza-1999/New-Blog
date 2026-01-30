const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { generateUniqueSlug } = require('../utils/slug');

const router = express.Router();
const prisma = new PrismaClient();

// Get all published blogs (public)
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const where = {
      status: 'published',
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get public blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by slug (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
      },
    });

    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all blogs (admin gets all, author gets own)
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const where = {
      ...(req.user.role !== 'admin' && { authorId: req.user.id }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by ID (authenticated)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Authors can only view their own blogs
    if (req.user.role !== 'admin' && blog.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, thumbnail, excerpt, metaTitle, metaDescription, metaKeywords, status, slug: customSlug } = req.body;

    if (!title || !content || !thumbnail) {
      return res.status(400).json({ error: 'Title, content, and thumbnail are required' });
    }

    const slug = customSlug
      ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : await generateUniqueSlug(title);

    // Check if slug already exists
    const existingSlug = await prisma.blog.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(400).json({ error: 'This permalink is already in use' });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
        thumbnail,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || content.replace(/<[^>]*>/g, '').substring(0, 160),
        metaKeywords: metaKeywords || '',
        status: status || 'draft',
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json({ blog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (req.user.role !== 'admin' && existing.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, content, thumbnail, excerpt, metaTitle, metaDescription, metaKeywords, status, slug: customSlug } = req.body;

    let slug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      slug = customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const existingSlug = await prisma.blog.findFirst({
        where: { slug, id: { not: req.params.id } },
      });
      if (existingSlug) {
        return res.status(400).json({ error: 'This permalink is already in use' });
      }
    } else if (title && title !== existing.title && !customSlug) {
      slug = await generateUniqueSlug(title, req.params.id);
    }

    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(thumbnail && { thumbnail }),
        slug,
        excerpt: excerpt || (content ? content.replace(/<[^>]*>/g, '').substring(0, 200) : existing.excerpt),
        metaTitle: metaTitle || title || existing.metaTitle,
        metaDescription: metaDescription || (content ? content.replace(/<[^>]*>/g, '').substring(0, 160) : existing.metaDescription),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(status && { status }),
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({ blog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (req.user.role !== 'admin' && existing.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
