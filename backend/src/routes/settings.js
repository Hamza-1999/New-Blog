const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/settings - Public: get all settings (or specific key)
router.get('/', async (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      const setting = await prisma.siteSetting.findUnique({ where: { key } });
      return res.json({ setting });
    }
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    res.json({ settings: result });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Admin only: upsert a setting
router.put('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value || '' },
      create: { key, value: value || '' },
    });
    res.json({ setting });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
