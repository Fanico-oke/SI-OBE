import express from 'express';
import { prisma } from '../lib/prisma';
import { authorize } from '../middleware/auth';

const router = express.Router();


// ==========================================
// TUJUAN PEMBELAJARAN (Kurikulum metadata)
// ==========================================

// GET /tujuan?kurikulumId=xxx — Load tujuan, level KKNI, referensi, peta okupasi
router.get('/tujuan', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const kur = kurikulumId
      ? await prisma.kurikulum.findUnique({ where: { id: String(kurikulumId) } })
      : await prisma.kurikulum.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } })
        ?? await prisma.kurikulum.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!kur) return res.status(404).json({ error: 'Kurikulum tidak ditemukan' });
    res.json({
      kurikulumId: kur.id,
      tujuan: kur.tujuan || '',
      levelKkni: kur.levelKkni || 'Level 6',
      referensiAcuan: kur.referensiAcuan ? JSON.parse(kur.referensiAcuan) : ['SN-DIKTI'],
      petaOkupasi: kur.petaOkupasi ? JSON.parse(kur.petaOkupasi) : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data tujuan' });
  }
});

// PUT /tujuan — Save tujuan, level KKNI, referensi, peta okupasi
router.put('/tujuan', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, tujuan, levelKkni, referensiAcuan, petaOkupasi } = req.body;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId wajib diisi' });
    const updated = await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: {
        tujuan,
        levelKkni,
        referensiAcuan: JSON.stringify(referensiAcuan || []),
        petaOkupasi: JSON.stringify(petaOkupasi || []),
      }
    });
    res.json({ message: 'Tujuan berhasil disimpan', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan tujuan' });
  }
});


// ==========================================
// PROFIL LULUSAN (PL)
// ==========================================
router.post('/profil-lulusan', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, kode, deskripsi, referensi } = req.body;
    const result = await prisma.profilLulusan.create({
      data: { kurikulumId, kode, deskripsi, referensi }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat Profil Lulusan' }); }
});

router.put('/profil-lulusan/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { kode, deskripsi, referensi } = req.body;
    const result = await prisma.profilLulusan.update({
      where: { id },
      data: { kode, deskripsi, referensi }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah Profil Lulusan' }); }
});

router.delete('/profil-lulusan/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.profilLulusan.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus Profil Lulusan' }); }
});


// ==========================================
// CAPAIAN PEMBELAJARAN LULUSAN (CPL)
// ==========================================
router.post('/cpl', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, kode, deskripsi, kategori } = req.body;
    const result = await prisma.cPL.create({
      data: { kurikulumId, kode, deskripsi, kategori }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat CPL' }); }
});

router.put('/cpl/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { kode, deskripsi, kategori } = req.body;
    const result = await prisma.cPL.update({
      where: { id },
      data: { kode, deskripsi, kategori }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah CPL' }); }
});

router.delete('/cpl/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.cPL.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus CPL' }); }
});


// ==========================================
// CPL SN-DIKTI
// ==========================================
router.post('/cpl-sn-dikti', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, kode, deskripsi, kategori } = req.body;
    const result = await prisma.cPLSnDikti.create({
      data: { kurikulumId, kode, deskripsi, kategori }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat CPL SN-DIKTI' }); }
});

router.put('/cpl-sn-dikti/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { kode, deskripsi, kategori } = req.body;
    const result = await prisma.cPLSnDikti.update({
      where: { id },
      data: { kode, deskripsi, kategori }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah CPL SN-DIKTI' }); }
});

router.delete('/cpl-sn-dikti/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.cPLSnDikti.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus CPL SN-DIKTI' }); }
});


// ==========================================
// BAHAN KAJIAN (BK)
// ==========================================
router.post('/bahan-kajian', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, kode, nama, deskripsi } = req.body;
    const result = await prisma.bahanKajian.create({
      data: { kurikulumId, kode, nama, deskripsi }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat Bahan Kajian' }); }
});

router.put('/bahan-kajian/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { kode, nama, deskripsi } = req.body;
    const result = await prisma.bahanKajian.update({
      where: { id },
      data: { kode, nama, deskripsi }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah Bahan Kajian' }); }
});

router.delete('/bahan-kajian/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.bahanKajian.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus Bahan Kajian' }); }
});


// ==========================================
// MATA KULIAH (MK)
// ==========================================
router.post('/mata-kuliah', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId, kode, nama, sks, semester, tipe } = req.body;
    const result = await prisma.mataKuliah.create({
      data: { 
        kurikulumId, 
        kode, 
        nama, 
        sks: parseInt(sks), 
        semester: parseInt(semester), 
        tipe 
      }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat Mata Kuliah' }); }
});

router.put('/mata-kuliah/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { kode, nama, sks, semester, tipe } = req.body;
    const result = await prisma.mataKuliah.update({
      where: { id },
      data: { 
        kode, 
        nama, 
        sks: parseInt(sks), 
        semester: parseInt(semester), 
        tipe 
      }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah Mata Kuliah' }); }
});

router.delete('/mata-kuliah/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.mataKuliah.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus Mata Kuliah' }); }
});


// ==========================================
// CPMK (Capaian Pembelajaran Mata Kuliah)
// ==========================================
router.post('/cpmk', authorize('KAPRODI'), async (req, res) => {
  try {
    const { cplId, kode, deskripsi } = req.body;
    const result = await prisma.cPMK.create({
      data: { cplId, kode, deskripsi }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat CPMK' }); }
});

router.put('/cpmk/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { cplId, kode, deskripsi } = req.body;
    const result = await prisma.cPMK.update({
      where: { id },
      data: { cplId, kode, deskripsi }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah CPMK' }); }
});

router.delete('/cpmk/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.cPMK.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus CPMK' }); }
});

// ==========================================
// SUB-CPMK
// ==========================================
router.post('/sub-cpmk', authorize('KAPRODI'), async (req, res) => {
  try {
    const { cpmkId, kode, deskripsi } = req.body;
    const result = await prisma.subCPMK.create({
      data: { cpmkId, kode, deskripsi }
    });
    res.status(201).json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat Sub-CPMK' }); }
});

router.put('/sub-cpmk/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { cpmkId, kode, deskripsi } = req.body;
    const result = await prisma.subCPMK.update({
      where: { id },
      data: { cpmkId, kode, deskripsi }
    });
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Gagal mengubah Sub-CPMK' }); }
});

router.delete('/sub-cpmk/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.subCPMK.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Gagal menghapus Sub-CPMK' }); }
});


// ==========================================
// PLAN COMPLETENESS CHECK
// ==========================================
router.get('/plan-completeness', async (req, res) => {
  try {
    const kurikulumId = req.query.kurikulumId as string;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId wajib' });

    const [plCount, cplCount, cpmkCount, bkCount, mkCount, matriksCount, subCpmkCount] = await Promise.all([
      prisma.profilLulusan.count({ where: { kurikulumId } }),
      prisma.cPL.count({ where: { kurikulumId } }),
      prisma.cPMK.count({ where: { cpl: { kurikulumId } } }),
      prisma.bahanKajian.count({ where: { kurikulumId } }),
      prisma.mataKuliah.count({ where: { kurikulumId } }),
      prisma.pemetaanCPLMK.count({ where: { cpl: { kurikulumId } } }),
      prisma.subCPMK.count({ where: { cpmk: { cpl: { kurikulumId } } } }),
    ]);

    const checklist = {
      pl: plCount > 0,
      cpl: cplCount > 0,
      cpmk: cpmkCount > 0,
      bk: bkCount > 0,
      mk: mkCount > 0,
      matriks: matriksCount > 0,
      indikator: subCpmkCount > 0,
    };

    res.json({
      ...checklist,
      counts: { pl: plCount, cpl: cplCount, cpmk: cpmkCount, bk: bkCount, mk: mkCount, matriks: matriksCount, indikator: subCpmkCount },
      allComplete: Object.values(checklist).every(Boolean),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengecek kelengkapan plan' });
  }
});


// ==========================================
// FINALIZE PLAN — Mark kurikulum as ACTIVE & notify Dosen
// ==========================================
router.post('/finalize-plan', authorize('KAPRODI'), async (req, res) => {
  try {
    const { kurikulumId } = req.body;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId wajib' });

    // 1. Archive any existing ACTIVE kurikulum (only 1 ACTIVE allowed)
    const oldActive = await prisma.kurikulum.findFirst({ where: { status: 'ACTIVE' } });
    if (oldActive) {
      await prisma.kurikulum.update({
        where: { id: oldActive.id },
        data: { status: 'ARCHIVED' },
      });
      console.log(`[Finalize] Kurikulum "${oldActive.nama}" → ARCHIVED`);
    }

    // 2. Set new kurikulum to ACTIVE
    const kur = await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: { status: 'ACTIVE' },
    });

    // 3. Notify all DOSEN
    const dosenUsers = await prisma.user.findMany({ where: { role: 'DOSEN' }, select: { id: true } });
    const notifications = dosenUsers.map(d => ({
      userId: d.id,
      title: 'Kurikulum Baru Aktif — Silakan Mulai Do',
      message: `Kaprodi telah menyelesaikan Plan untuk "${kur.nama}".${oldActive ? ` Kurikulum sebelumnya "${oldActive.nama}" telah diarsipkan.` : ''} Silakan masuk ke menu Do untuk mengisi RPS, Asesmen, dan Penilaian.`,
      type: 'SYSTEM',
    }));
    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    res.json({ 
      message: `Plan berhasil diselesaikan! "${kur.nama}" sekarang ACTIVE.${oldActive ? ` "${oldActive.nama}" diarsipkan.` : ''}`,
      data: kur,
      archivedKurikulum: oldActive ? { id: oldActive.id, nama: oldActive.nama } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyelesaikan plan' });
  }
});

export default router;
