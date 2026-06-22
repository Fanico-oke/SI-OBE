import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize } from '../middleware/auth';
import { validate, createModulSchema, createActionPlanSchema } from '../lib/validators';

const router = Router();


// --- Profil Lulusan ---
router.get('/profil-lulusan', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.profilLulusan.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data PL' }); }
});

// --- CPL SN-DIKTI ---
router.get('/cpl-sn-dikti', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.cPLSnDikti.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data CPL SN-DIKTI' }); }
});

// --- CPL ---
router.get('/cpl', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.cPL.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      include: { 
        cpmk: {
          include: {
            subCpmk: true
          }
        } 
      },
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data CPL' }); }
});

// --- Bahan Kajian ---
router.get('/bahan-kajian', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.bahanKajian.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data BK' }); }
});

// --- Mata Kuliah ---
router.get('/mata-kuliah', async (req, res) => {
  const { kurikulumId, semester } = req.query;
  try {
    const data = await prisma.mataKuliah.findMany({
      where: {
        ...(kurikulumId ? { kurikulumId: String(kurikulumId) } : {}),
        ...(semester ? { semester: parseInt(String(semester)) } : {})
      },
      orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data MK' }); }
});

// --- CPMK ---
router.get('/cpmk', async (req, res) => {
  const { cplId, kurikulumId } = req.query;
  try {
    const data = await prisma.cPMK.findMany({
      where: {
        ...(cplId ? { cplId: String(cplId) } : {}),
        ...(kurikulumId ? { cpl: { kurikulumId: String(kurikulumId) } } : {}),
      },
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data CPMK' }); }
});

// --- SUB-CPMK ---
router.get('/sub-cpmk', async (req, res) => {
  const { cpmkId } = req.query;
  try {
    const data = await prisma.subCPMK.findMany({
      where: cpmkId ? { cpmkId: String(cpmkId) } : undefined,
      orderBy: { kode: 'asc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data Sub-CPMK' }); }
});

// --- Modul ---
router.get('/modul', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const moduls = await prisma.modul.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      orderBy: { semester: 'asc' }
    });
    res.json(moduls);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data modul' });
  }
});

router.post('/modul', authorize('KAPRODI'), async (req, res) => {
  try {
    const v = validate(createModulSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });
    const { kurikulumId, kode, nama, sks, semester, koordinator, status } = v.data;
    const newModul = await prisma.modul.create({
      data: {
        kurikulumId,
        kode,
        nama,
        sks,
        semester,
        koordinator,
        status
      }
    });
    res.status(201).json(newModul);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat modul' });
  }
});

router.delete('/modul/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.modul.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus modul' });
  }
});

// --- Tugas ---
router.get('/tugas', async (req, res) => {
  const { modulId } = req.query;
  try {
    const tugas = await prisma.tugas.findMany({
      where: modulId ? { modulId: String(modulId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(tugas);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data tugas' });
  }
});

router.post('/tugas', authorize('KAPRODI'), async (req, res) => {
  try {
    const { modulId, nama, tipe, bobot, deadline } = req.body;
    const newTugas = await prisma.tugas.create({
      data: {
        modulId,
        nama,
        tipe,
        bobot: parseFloat(bobot) || 0,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    res.status(201).json(newTugas);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat tugas' });
  }
});

router.delete('/tugas/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.tugas.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus tugas' });
  }
});

// --- Action Plans ---
router.get('/action-plans', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const actions = await prisma.actionPlan.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data action plans' });
  }
});

router.post('/action-plans', authorize('KAPRODI'), async (req, res) => {
  try {
    const v = validate(createActionPlanSchema, req.body);
    if (!v.success) return res.status(400).json({ error: v.error });
    const { kurikulumId, title, context, assignedTo, priority, status } = v.data;
    const newAction = await prisma.actionPlan.create({
      data: {
        kurikulumId: kurikulumId || '',
        title,
        context: context || '',
        assignedTo,
        priority: priority || 'Medium',
        status: status || 'Draft'
      }
    });
    res.status(201).json(newAction);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat action plan' });
  }
});

router.delete('/action-plans/:id', authorize('KAPRODI'), async (req, res) => {
  try {
    await prisma.actionPlan.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus action plan' });
  }
});

export default router;
