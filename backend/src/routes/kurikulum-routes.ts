import { Router } from 'express';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { authorize } from '../middleware/auth';
import { validate, createKurikulumSchema } from '../lib/validators';
import { seedTemplateData } from '../lib/kurikulum-template';

import { getUploadsDir } from '../lib/uploads';

const router = Router();

const upload = multer({ dest: getUploadsDir() });

// GET /api/kurikulum — list all
router.get('/', async (req, res) => {
  try {
    const kurikulum = await prisma.kurikulum.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(kurikulum);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data kurikulum' });
  }
});

// GET /api/kurikulum/:id — get single kurikulum
router.get('/:id', async (req, res) => {
  try {
    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: req.params.id }
    });
    if (!kurikulum) return res.status(404).json({ error: 'Kurikulum tidak ditemukan' });
    res.json(kurikulum);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data kurikulum' });
  }
});

// POST /api/kurikulum — create
router.post('/', authorize('KAPRODI', 'ADMIN'), async (req, res) => {
  try {
    const v = validate(createKurikulumSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });
    const { nama, prodi, tahunMulai, tahunSelesai, deskripsi } = v.data;
    const newKurikulum = await prisma.kurikulum.create({
      data: {
        nama,
        prodi,
        tahunMulai,
        tahunSelesai,
        deskripsi
      }
    });
    // Auto-seed template data for the new kurikulum
    await seedTemplateData(newKurikulum.id);
    res.status(201).json(newKurikulum);
  } catch (error) {
    console.error('Create kurikulum error:', error);
    res.status(500).json({ error: 'Gagal membuat kurikulum' });
  }
});

// POST /api/kurikulum/duplicate
router.post('/duplicate', authorize('KAPRODI'), async (req, res) => {
  try {
    const { sourceKurikulumId, nama, tahunMulai, tahunSelesai, deskripsi } = req.body;
    
    // 1. Create new Kurikulum with unique name
    const finalNama = nama || `${(await prisma.kurikulum.findUnique({ where: { id: sourceKurikulumId } }))?.nama} (Salinan)`;
    const newKurikulum = await prisma.kurikulum.create({
      data: {
        nama: finalNama,
        prodi: 'Sistem Informasi',
        tahunMulai,
        tahunSelesai,
        deskripsi,
        status: 'DRAFT'
      }
    });

    const newId = newKurikulum.id;

    // Helper maps
    const plMap = new Map();
    const cplMap = new Map();
    const bkMap = new Map();
    const mkMap = new Map();
    const cpmkMap = new Map();

    // 2. Clone Profil Lulusan
    const oldPls = await prisma.profilLulusan.findMany({ where: { kurikulumId: sourceKurikulumId } });
    for (const pl of oldPls) {
      const newPl = await prisma.profilLulusan.create({ data: { kurikulumId: newId, kode: pl.kode, deskripsi: pl.deskripsi, referensi: pl.referensi }});
      plMap.set(pl.id, newPl.id);
    }

    // 3. Clone CPL
    const oldCpls = await prisma.cPL.findMany({ where: { kurikulumId: sourceKurikulumId } });
    for (const cpl of oldCpls) {
      const newCpl = await prisma.cPL.create({ data: { kurikulumId: newId, kode: cpl.kode, deskripsi: cpl.deskripsi, kategori: cpl.kategori }});
      cplMap.set(cpl.id, newCpl.id);
    }

    // 4. Clone BK
    const oldBks = await prisma.bahanKajian.findMany({ where: { kurikulumId: sourceKurikulumId } });
    for (const bk of oldBks) {
      const newBk = await prisma.bahanKajian.create({ data: { kurikulumId: newId, kode: bk.kode, nama: bk.nama, deskripsi: bk.deskripsi }});
      bkMap.set(bk.id, newBk.id);
    }

    // 5. Clone MK
    const oldMks = await prisma.mataKuliah.findMany({ where: { kurikulumId: sourceKurikulumId } });
    for (const mk of oldMks) {
      const newMk = await prisma.mataKuliah.create({ data: { kurikulumId: newId, kode: mk.kode, nama: mk.nama, sks: mk.sks, semester: mk.semester, tipe: mk.tipe }});
      mkMap.set(mk.id, newMk.id);
    }

    // 6. Clone CPMK
    const oldCpmks = await prisma.cPMK.findMany({ where: { cpl: { kurikulumId: sourceKurikulumId } }, include: { cpl: true } });
    for (const cpmk of oldCpmks) {
      const mappedCplId = cplMap.get(cpmk.cplId);
      if (mappedCplId) {
        const newCpmk = await prisma.cPMK.create({ data: { cplId: mappedCplId, kode: cpmk.kode, deskripsi: cpmk.deskripsi }});
        cpmkMap.set(cpmk.id, newCpmk.id);
      }
    }

    // Sub-CPMK (Indikator) NOT cloned — Kaprodi must review & complete Plan
    // Kelas, RPS, Penilaian NOT cloned — Dosen must redo Do phase

    // 8. Clone Pemetaan
    const pl_cpls = await prisma.pemetaanPLCPL.findMany({ where: { pl: { kurikulumId: sourceKurikulumId } } });
    for (const p of pl_cpls) {
      if (plMap.has(p.plId) && cplMap.has(p.cplId)) {
        await prisma.pemetaanPLCPL.create({ data: { plId: plMap.get(p.plId), cplId: cplMap.get(p.cplId) }});
      }
    }

    const cpl_bks = await prisma.pemetaanCPLBK.findMany({ where: { cpl: { kurikulumId: sourceKurikulumId } } });
    for (const p of cpl_bks) {
      if (cplMap.has(p.cplId) && bkMap.has(p.bkId)) {
        await prisma.pemetaanCPLBK.create({ data: { cplId: cplMap.get(p.cplId), bkId: bkMap.get(p.bkId) }});
      }
    }

    const bk_mks = await prisma.pemetaanBKMK.findMany({ where: { bk: { kurikulumId: sourceKurikulumId } } });
    for (const p of bk_mks) {
      if (bkMap.has(p.bkId) && mkMap.has(p.mkId)) {
        await prisma.pemetaanBKMK.create({ data: { bkId: bkMap.get(p.bkId), mkId: mkMap.get(p.mkId) }});
      }
    }

    const cpl_mks = await prisma.pemetaanCPLMK.findMany({ where: { cpl: { kurikulumId: sourceKurikulumId } } });
    for (const p of cpl_mks) {
      if (cplMap.has(p.cplId) && mkMap.has(p.mkId)) {
        await prisma.pemetaanCPLMK.create({ data: { cplId: cplMap.get(p.cplId), mkId: mkMap.get(p.mkId) }});
      }
    }

    const pl_mks = await prisma.pemetaanPLMK.findMany({ where: { pl: { kurikulumId: sourceKurikulumId } } });
    for (const p of pl_mks) {
      if (plMap.has(p.plId) && mkMap.has(p.mkId)) {
        await prisma.pemetaanPLMK.create({ data: { plId: plMap.get(p.plId), mkId: mkMap.get(p.mkId) }});
      }
    }

    const mk_cpmks = await prisma.pemetaanMKCPMK.findMany({ where: { mk: { kurikulumId: sourceKurikulumId } } });
    for (const p of mk_cpmks) {
      if (mkMap.has(p.mkId) && cpmkMap.has(p.cpmkId)) {
        await prisma.pemetaanMKCPMK.create({ data: { mkId: mkMap.get(p.mkId), cpmkId: cpmkMap.get(p.cpmkId) }});
      }
    }

    res.status(201).json(newKurikulum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menduplikasi kurikulum' });
  }
});

// POST /api/kurikulum/import
router.post('/import', authorize('KAPRODI', 'ADMIN'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet) as any[];

    let importedCount = 0;

    for (const row of data) {
      // Expecting columns: Nama, Prodi, Tahun Mulai, Tahun Selesai, Deskripsi, Status
      if (row['Nama'] && row['Prodi']) {
        await prisma.kurikulum.create({
          data: {
            nama: row['Nama'],
            prodi: row['Prodi'],
            tahunMulai: parseInt(row['Tahun Mulai']) || new Date().getFullYear(),
            tahunSelesai: parseInt(row['Tahun Selesai']) || new Date().getFullYear() + 4,
            deskripsi: row['Deskripsi'] || 'Kurikulum hasil import Excel',
            status: row['Status'] || 'Draft'
          }
        });
        importedCount++;
      }
    }

    res.json({ success: true, count: importedCount, message: `${importedCount} kurikulum berhasil diimport.` });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Gagal mengimport kurikulum' });
  }
});

export default router;
