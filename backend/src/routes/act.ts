import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();


// Ambil semua Action Plan
router.get('/action-plan', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    const data = await prisma.actionPlan.findMany({
      where: kurikulumId ? { kurikulumId: String(kurikulumId) } : undefined,
      include: { cpl: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil action plan' }); }
});

// Ambil satu Action Plan berdasarkan ID
router.get('/action-plan/:id', async (req, res) => {
  try {
    const data = await prisma.actionPlan.findUnique({
      where: { id: req.params.id },
      include: { cpl: true, kurikulum: true }
    });
    if (!data) return res.status(404).json({ error: 'Action plan tidak ditemukan' });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil detail action plan' }); }
});

// Buat Action Plan baru (CQI)
router.post('/action-plan', async (req, res) => {
  const { kurikulumId, title, context, assignedTo, priority, cplId } = req.body;
  try {
    const data = await prisma.actionPlan.create({
      data: { kurikulumId, title, context, assignedTo, priority, cplId, status: 'Active' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat action plan' }); }
});

// Update status Action Plan
router.put('/action-plan/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const data = await prisma.actionPlan.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal update status action plan' }); }
});

// GET /api/act/cpl-red-flags — CPL yang di bawah target (untuk Papan Evaluasi Act)
router.get('/cpl-red-flags', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    const where: any = {};
    if (kurikulumId) where.kurikulumId = String(kurikulumId);

    const cpls = await prisma.cPL.findMany({
      where,
      include: {
        cpmk: {
          include: {
            subCpmk: {
              include: {
                asesmenSoal: { include: { nilai: true } }
              }
            }
          }
        }
      }
    });

    const results = cpls.map(cpl => {
      let totalScore = 0, count = 0;
      cpl.cpmk.forEach(c => c.subCpmk.forEach(sc => sc.asesmenSoal.forEach(as => as.nilai.forEach(n => { totalScore += n.nilai; count++; }))));
      const average = count > 0 ? Math.round(totalScore / count) : 0;
      return {
        id: cpl.id, kode: cpl.kode, deskripsi: cpl.deskripsi,
        attainment: average, target: 75, fullMark: 100, hasData: count > 0
      };
    });

    // Only return red flags (below target)
    const redFlags = results.filter(r => r.hasData && r.attainment < r.target);
    res.json(redFlags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil CPL red flags' });
  }
});

// GET /api/act/pdca-summary — Ringkasan lengkap siklus PDCA
router.get('/pdca-summary', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });
    const kId = String(kurikulumId);

    // PLAN: Count CPL, CPMK, MK
    const cplCount = await prisma.cPL.count({ where: { kurikulumId: kId } });
    const cpmkCount = await prisma.cPMK.count({ where: { cpl: { kurikulumId: kId } } });
    const mkCount = await prisma.mataKuliah.count({ where: { kurikulumId: kId } });

    // DO: Count kelas with nilai
    const kelasTotal = await prisma.kelas.count({ where: { mk: { kurikulumId: kId } } });
    const kelasWithNilai = await prisma.kelas.count({
      where: {
        mk: { kurikulumId: kId },
        completedAt: { not: null }
      }
    });

    // CHECK: CPL attainment summary
    const cpls = await prisma.cPL.findMany({
      where: { kurikulumId: kId },
      include: {
        cpmk: { include: { subCpmk: { include: { asesmenSoal: { include: { nilai: { select: { nilai: true } } } } } } } }
      }
    });

    let cplWithData = 0, cplLulus = 0, cplGagal = 0;
    cpls.forEach(cpl => {
      let total = 0, count = 0;
      cpl.cpmk.forEach(c => c.subCpmk.forEach(sc => sc.asesmenSoal.forEach(as => as.nilai.forEach(n => { total += n.nilai; count++; }))));
      if (count > 0) {
        cplWithData++;
        const avg = Math.round(total / count);
        if (avg >= 75) cplLulus++; else cplGagal++;
      }
    });

    // ACT: Action plan summary
    const actTotal = await prisma.actionPlan.count({ where: { kurikulumId: kId } });
    const actCompleted = await prisma.actionPlan.count({ where: { kurikulumId: kId, status: 'Completed' } });
    const actActive = await prisma.actionPlan.count({ where: { kurikulumId: kId, status: 'Active' } });

    // Dokumentasi count
    const dokCount = await prisma.dokumentasiKegiatan.count({ where: { kurikulumId: kId } });

    // Feedback count
    const feedbackCount = await prisma.checkFeedback.count({ where: { kurikulumId: kId } });

    res.json({
      plan: { cplCount, cpmkCount, mkCount, ready: cplCount > 0 && mkCount > 0 },
      do: { kelasTotal, kelasWithNilai, ready: kelasWithNilai > 0 },
      check: { cplTotal: cplCount, cplWithData, cplLulus, cplGagal, feedbackCount, ready: cplWithData > 0 },
      act: { actTotal, actCompleted, actActive, dokCount, ready: actTotal > 0 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil ringkasan PDCA' });
  }
});

// POST /api/act/archive — Arsipkan kurikulum (tutup siklus PDCA)
router.post('/archive', async (req, res) => {
  try {
    const { kurikulumId } = req.body;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const kur = await prisma.kurikulum.findUnique({ where: { id: kurikulumId } });
    if (!kur) return res.status(404).json({ error: 'Kurikulum tidak ditemukan' });
    if (kur.status === 'ARCHIVED') return res.status(400).json({ error: 'Kurikulum sudah diarsipkan' });

    await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: { status: 'ARCHIVED' }
    });

    res.json({ success: true, message: `Kurikulum "${kur.nama}" berhasil diarsipkan.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengarsipkan kurikulum' });
  }
});

export default router;
