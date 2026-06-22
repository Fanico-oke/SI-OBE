import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();


// GET / — get all settings (optional filter by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const data = await prisma.systemSetting.findMany({
      where: category ? { category: String(category) } : undefined,
      orderBy: { key: 'asc' }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data settings' });
  }
});

// PUT / — upsert a setting by key
router.put('/', async (req, res) => {
  try {
    const { key, value, category } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Field key dan value wajib diisi' });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: String(value),
        ...(category !== undefined && { category })
      },
      create: {
        key,
        value: String(value),
        category: category || 'general'
      }
    });

    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan setting' });
  }
});

export default router;
