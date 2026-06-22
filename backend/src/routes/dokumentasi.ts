import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';

import { getUploadsDir } from '../lib/uploads';

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getUploadsDir('dokumentasi');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipe file ${ext} tidak diizinkan`));
    }
  }
});

// GET /api/dokumentasi?kurikulumId=xxx
router.get('/', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const docs = await prisma.dokumentasiKegiatan.findMany({
      where: { kurikulumId: String(kurikulumId) },
      orderBy: { tanggal: 'desc' }
    });

    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil dokumentasi' });
  }
});

// POST /api/dokumentasi — create with file upload
router.post('/', upload.array('files', 5), async (req, res) => {
  try {
    const { kurikulumId, judul, kategori, deskripsi, tanggal, peserta, lokasi, hasil, tindakLanjut } = req.body;

    if (!kurikulumId || !judul || !kategori || !deskripsi || !tanggal) {
      return res.status(400).json({ error: 'Judul, kategori, deskripsi, dan tanggal wajib diisi' });
    }

    // Process uploaded files
    const files = (req.files as Express.Multer.File[]) || [];
    const lampiran = files.map(f => ({
      originalName: f.originalname,
      fileName: f.filename,
      size: f.size,
      mimetype: f.mimetype
    }));

    const doc = await prisma.dokumentasiKegiatan.create({
      data: {
        kurikulumId,
        judul,
        kategori,
        deskripsi,
        tanggal: new Date(tanggal),
        peserta: peserta || null,
        lokasi: lokasi || null,
        hasil: hasil || null,
        tindakLanjut: tindakLanjut || null,
        lampiran: lampiran.length > 0 ? JSON.stringify(lampiran) : null
      }
    });

    res.json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan dokumentasi' });
  }
});

// PUT /api/dokumentasi/:id — update
router.put('/:id', upload.array('files', 5), async (req, res) => {
  try {
    const id = String(req.params.id);
    const { judul, kategori, deskripsi, tanggal, peserta, lokasi, hasil, tindakLanjut, existingLampiran } = req.body;

    // Keep existing files + add new ones
    let lampiran: any[] = [];
    try { lampiran = JSON.parse(existingLampiran || '[]'); } catch { }

    const newFiles = (req.files as Express.Multer.File[]) || [];
    const newLampiran = newFiles.map(f => ({
      originalName: f.originalname,
      fileName: f.filename,
      size: f.size,
      mimetype: f.mimetype
    }));

    lampiran = [...lampiran, ...newLampiran];

    const doc = await prisma.dokumentasiKegiatan.update({
      where: { id },
      data: {
        judul, kategori, deskripsi,
        tanggal: new Date(tanggal),
        peserta: peserta || null,
        lokasi: lokasi || null,
        hasil: hasil || null,
        tindakLanjut: tindakLanjut || null,
        lampiran: lampiran.length > 0 ? JSON.stringify(lampiran) : null
      }
    });

    res.json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengupdate dokumentasi' });
  }
});

// DELETE /api/dokumentasi/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    // Delete associated files
    const doc = await prisma.dokumentasiKegiatan.findUnique({ where: { id } });
    if (doc?.lampiran) {
      try {
        const files = JSON.parse(doc.lampiran);
        for (const f of files) {
          const filePath = path.join(getUploadsDir('dokumentasi'), f.fileName);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      } catch { }
    }

    await prisma.dokumentasiKegiatan.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus dokumentasi' });
  }
});

// GET /api/dokumentasi/file/:filename — serve uploaded file
router.get('/file/:filename', (req, res) => {
  const filePath = path.join(getUploadsDir('dokumentasi'), req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath);
});

export default router;
