import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authorize } from '../middleware/auth';

const router = Router();


// --- GET Pemetaan ---

// Pemetaan CPL ↔ MK
router.get('/cpl-mk', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanCPLMK.findMany({
      include: { cpl: true, mk: true },
      where: kurikulumId ? { cpl: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan CPL-MK' }); }
});

// Pemetaan BK ↔ MK
router.get('/bk-mk', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanBKMK.findMany({
      include: { bk: true, mk: true },
      where: kurikulumId ? { bk: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan BK-MK' }); }
});

// Pemetaan PL ↔ CPL
router.get('/pl-cpl', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanPLCPL.findMany({
      include: { pl: true, cpl: true },
      where: kurikulumId ? { pl: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan PL-CPL' }); }
});

// Pemetaan CPL ↔ BK
router.get('/cpl-bk', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanCPLBK.findMany({
      include: { cpl: true, bk: true },
      where: kurikulumId ? { cpl: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan CPL-BK' }); }
});

// Pemetaan SN-DIKTI ↔ CPL
router.get('/sn-dikti-cpl', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanSnDiktiCPLProdi.findMany({
      include: { snDikti: true, cpl: true },
      where: kurikulumId ? { cpl: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan SN-DIKTI ↔ CPL' }); }
});

// Pemetaan PL ↔ MK
router.get('/pl-mk', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanPLMK.findMany({
      include: { pl: true, mk: true },
      where: kurikulumId ? { pl: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan PL ↔ MK' }); }
});

// Pemetaan MK ↔ CPMK
router.get('/mk-cpmk', async (req, res) => {
  const { kurikulumId } = req.query;
  try {
    const data = await prisma.pemetaanMKCPMK.findMany({
      include: { mk: true, cpmk: true },
      where: kurikulumId ? { mk: { kurikulumId: String(kurikulumId) } } : undefined
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil pemetaan MK ↔ CPMK' }); }
});

// --- POST Toggle Pemetaan ---

router.post('/pl-cpl/toggle', authorize('KAPRODI'), async (req, res) => {
  const { plId, cplId } = req.body;
  try {
    const existing = await prisma.pemetaanPLCPL.findFirst({ where: { plId, cplId } });
    if (existing) {
      await prisma.pemetaanPLCPL.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanPLCPL.create({ data: { plId, cplId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/cpl-bk/toggle', authorize('KAPRODI'), async (req, res) => {
  const { cplId, bkId } = req.body;
  try {
    const existing = await prisma.pemetaanCPLBK.findFirst({ where: { cplId, bkId } });
    if (existing) {
      await prisma.pemetaanCPLBK.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanCPLBK.create({ data: { cplId, bkId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/bk-mk/toggle', authorize('KAPRODI'), async (req, res) => {
  const { bkId, mkId } = req.body;
  try {
    const existing = await prisma.pemetaanBKMK.findFirst({ where: { bkId, mkId } });
    if (existing) {
      await prisma.pemetaanBKMK.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanBKMK.create({ data: { bkId, mkId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/cpl-mk/toggle', authorize('KAPRODI'), async (req, res) => {
  const { cplId, mkId } = req.body;
  try {
    const existing = await prisma.pemetaanCPLMK.findFirst({ where: { cplId, mkId } });
    if (existing) {
      // Remove CPL↔MK
      await prisma.pemetaanCPLMK.delete({ where: { id: existing.id } });
      // Auto-sync: remove MK↔CPMK for all CPMKs under this CPL
      const cpmks = await prisma.cPMK.findMany({ where: { cplId }, select: { id: true } });
      const cpmkIds = cpmks.map(c => c.id);
      if (cpmkIds.length > 0) {
        await prisma.pemetaanMKCPMK.deleteMany({ where: { mkId, cpmkId: { in: cpmkIds } } });
      }
      res.json({ action: 'removed', synced: cpmkIds.length });
    } else {
      // Add CPL↔MK
      await prisma.pemetaanCPLMK.create({ data: { cplId, mkId } });
      // Auto-sync: add MK↔CPMK for all CPMKs under this CPL
      const cpmks = await prisma.cPMK.findMany({ where: { cplId }, select: { id: true } });
      let synced = 0;
      for (const cpmk of cpmks) {
        const exists = await prisma.pemetaanMKCPMK.findFirst({ where: { mkId, cpmkId: cpmk.id } });
        if (!exists) {
          await prisma.pemetaanMKCPMK.create({ data: { mkId, cpmkId: cpmk.id } });
          synced++;
        }
      }
      res.json({ action: 'added', synced });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/sn-dikti-cpl/toggle', authorize('KAPRODI'), async (req, res) => {
  const { snDiktiId, cplId } = req.body;
  try {
    const existing = await prisma.pemetaanSnDiktiCPLProdi.findFirst({ where: { snDiktiId, cplId } });
    if (existing) {
      await prisma.pemetaanSnDiktiCPLProdi.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanSnDiktiCPLProdi.create({ data: { snDiktiId, cplId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/pl-mk/toggle', authorize('KAPRODI'), async (req, res) => {
  const { plId, mkId } = req.body;
  try {
    const existing = await prisma.pemetaanPLMK.findFirst({ where: { plId, mkId } });
    if (existing) {
      await prisma.pemetaanPLMK.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanPLMK.create({ data: { plId, mkId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

router.post('/mk-cpmk/toggle', authorize('KAPRODI'), async (req, res) => {
  const { mkId, cpmkId } = req.body;
  try {
    const existing = await prisma.pemetaanMKCPMK.findFirst({ where: { mkId, cpmkId } });
    if (existing) {
      await prisma.pemetaanMKCPMK.delete({ where: { id: existing.id } });
      res.json({ action: 'removed' });
    } else {
      await prisma.pemetaanMKCPMK.create({ data: { mkId, cpmkId } });
      res.json({ action: 'added' });
    }
  } catch (e) { res.status(500).json({ error: 'Toggle failed' }); }
});

// --- POST Sync CPL↔MK → MK↔CPMK for entire kurikulum ---
router.post('/sync-to-do', authorize('KAPRODI'), async (req, res) => {
  const { kurikulumId } = req.body;
  if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId diperlukan' });

  try {
    // Get all MK IDs for this kurikulum
    const mkIds = await prisma.mataKuliah.findMany({
      where: { kurikulumId },
      select: { id: true }
    }).then(r => r.map(x => x.id));

    // Clear existing MK↔CPMK for this kurikulum
    const deleted = await prisma.pemetaanMKCPMK.deleteMany({
      where: { mkId: { in: mkIds } }
    });

    // Rebuild from CPL↔MK
    const cplmkMappings = await prisma.pemetaanCPLMK.findMany({
      where: { mkId: { in: mkIds } },
      include: {
        cpl: {
          select: { cpmk: { select: { id: true } } }
        }
      }
    });

    let created = 0;
    const seen = new Set<string>();
    for (const m of cplmkMappings) {
      for (const cpmk of m.cpl.cpmk) {
        const key = `${m.mkId}-${cpmk.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          await prisma.pemetaanMKCPMK.create({
            data: { mkId: m.mkId, cpmkId: cpmk.id }
          });
          created++;
        }
      }
    }

    res.json({
      success: true,
      message: `Sinkronisasi berhasil! ${deleted.count} mapping lama dihapus, ${created} mapping baru dibuat dari ${cplmkMappings.length} CPL↔MK.`,
      deleted: deleted.count,
      created
    });
  } catch (e: any) {
    console.error('Sync error:', e);
    res.status(500).json({ error: 'Gagal sinkronisasi: ' + e.message });
  }
});

export default router;
