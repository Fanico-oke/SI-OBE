import { Router } from 'express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadsDir } from '../lib/uploads';

const router = Router();


// Multer config for materi uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadsDir('materi');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// GET / — list materi (optional filter by kelasId)
router.get('/', async (req, res) => {
  try {
    const { kelasId } = req.query;
    const data = await prisma.materiPembelajaran.findMany({
      where: kelasId ? { kelasId: String(kelasId) } : undefined,
      include: { kelas: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data materi' });
  }
});

// POST / — create materi with file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { kelasId, nama, tipe } = req.body;
    const fileUrl = req.file ? `/uploads/materi/${req.file.filename}` : (req.body.fileUrl || null);
    const fileSize = req.file ? req.file.size : null;

    const materi = await prisma.materiPembelajaran.create({
      data: {
        kelasId,
        nama,
        tipe: tipe || 'Dokumen',
        fileUrl,
        fileSize
      }
    });

    res.status(201).json(materi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat materi' });
  }
});

// DELETE /:id — delete materi and remove file from disk
router.delete('/:id', async (req, res) => {
  try {
    const materi = await prisma.materiPembelajaran.findUnique({
      where: { id: req.params.id }
    });

    if (!materi) {
      return res.status(404).json({ error: 'Materi tidak ditemukan' });
    }

    // Delete file from disk if it exists
    if (materi.fileUrl) {
      const filePath = path.join(__dirname, '../../', materi.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.materiPembelajaran.delete({ where: { id: req.params.id } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus materi' });
  }
});

export default router;
