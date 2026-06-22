import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();


// Multer config for referensi uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/referensi');
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

// GET / — list all referensi (optional filter by kurikulumId)
router.get('/', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    const data = await prisma.referensi.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      include: { kurikulum: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data referensi' });
  }
});

// POST / — create referensi with file upload
router.post('/', authorize('KAPRODI'), upload.single('file'), async (req, res) => {
  try {
    const { kurikulumId, nama, kategori, tipe, status, uploadedBy } = req.body;
    const fileUrl = req.file ? `/uploads/referensi/${req.file.filename}` : (req.body.fileUrl || null);
    const fileSize = req.file ? req.file.size : null;

    const referensi = await prisma.referensi.create({
      data: {
        kurikulumId,
        nama,
        kategori: kategori || 'Internal',
        tipe: tipe || 'PDF',
        fileUrl,
        fileSize,
        status: status || 'Draft',
        uploadedBy: uploadedBy || null
      }
    });

    res.status(201).json(referensi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat referensi' });
  }
});

// PUT /:id — update referensi
router.put('/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const { nama, kategori, tipe, status, uploadedBy } = req.body;

    const referensi = await prisma.referensi.update({
      where: { id: req.params.id as string },
      data: {
        ...(nama !== undefined && { nama }),
        ...(kategori !== undefined && { kategori }),
        ...(tipe !== undefined && { tipe }),
        ...(status !== undefined && { status }),
        ...(uploadedBy !== undefined && { uploadedBy })
      }
    });

    res.json(referensi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengupdate referensi' });
  }
});

// DELETE /:id — delete referensi and remove file from disk
router.delete('/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    // Fetch the record first to get the file path
    const referensi = await prisma.referensi.findUnique({
      where: { id: req.params.id as string }
    });

    if (!referensi) {
      return res.status(404).json({ error: 'Referensi tidak ditemukan' });
    }

    // Delete file from disk if it exists
    if (referensi.fileUrl) {
      const filePath = path.join(__dirname, '../../', referensi.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.referensi.delete({ where: { id: req.params.id as string } });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus referensi' });
  }
});

export default router;
