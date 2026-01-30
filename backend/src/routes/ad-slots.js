const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const VALID_PLACEMENTS = [
  'home_after_featured',
  'home_below_grid',
  'blog_above_content',
  'blog_below_content',
  'blog_sidebar',
  'home_sidebar',
];

const VALID_FORMATS = ['horizontal', 'rectangle', 'square'];

// GET /api/ad-slots - Public: get all active slots (or filter by placement)
router.get('/', async (req, res) => {
  try {
    const { placement } = req.query;
    if (placement) {
      const slot = await prisma.adSlot.findFirst({
        where: { placement, isActive: true },
      });
      return res.json({ slot });
    }
    const slots = await prisma.adSlot.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ slots });
  } catch (error) {
    console.error('Get ad slots error:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/admin - Admin only: get all slots (including inactive)
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
  try {
    const slots = await prisma.adSlot.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json({ slots });
  } catch (error) {
    console.error('Get admin ad slots error:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// POST /api/ad-slots - Admin only: create a slot
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slotId, format, placement, isActive } = req.body;

    if (!name || !slotId || !format || !placement) {
      return res.status(400).json({ error: 'Name, slotId, format, and placement are required' });
    }

    if (!VALID_FORMATS.includes(format)) {
      return res.status(400).json({ error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}` });
    }

    if (!VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: `Invalid placement. Must be one of: ${VALID_PLACEMENTS.join(', ')}` });
    }

    const existing = await prisma.adSlot.findUnique({ where: { placement } });
    if (existing) {
      return res.status(400).json({ error: 'A slot with this placement already exists' });
    }

    const slot = await prisma.adSlot.create({
      data: {
        name,
        slotId,
        format,
        placement,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json({ slot });
  } catch (error) {
    console.error('Create ad slot error:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// PUT /api/ad-slots/:id - Admin only: update a slot
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slotId, format, placement, isActive } = req.body;

    if (format && !VALID_FORMATS.includes(format)) {
      return res.status(400).json({ error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}` });
    }

    if (placement && !VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: `Invalid placement. Must be one of: ${VALID_PLACEMENTS.join(', ')}` });
    }

    if (placement) {
      const existing = await prisma.adSlot.findUnique({ where: { placement } });
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'A slot with this placement already exists' });
      }
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (slotId !== undefined) data.slotId = slotId;
    if (format !== undefined) data.format = format;
    if (placement !== undefined) data.placement = placement;
    if (isActive !== undefined) data.isActive = isActive;

    const slot = await prisma.adSlot.update({
      where: { id },
      data,
    });
    res.json({ slot });
  } catch (error) {
    console.error('Update ad slot error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ad slot not found' });
    }
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - Admin only: delete a slot
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.adSlot.delete({ where: { id } });
    res.json({ message: 'Ad slot deleted' });
  } catch (error) {
    console.error('Delete ad slot error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ad slot not found' });
    }
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

module.exports = router;
