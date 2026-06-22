import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();


// GET /api/check/cpl-attainment
// Mengembalikan agregasi nilai rata-rata per CPL berdasarkan data nyata dari NilaiSoal
router.get('/cpl-attainment', async (req, res) => {
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
                asesmenSoal: {
                  include: {
                    nilai: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const results = cpls.map(cpl => {
      let totalScore = 0;
      let count = 0;

      // Kumpulkan semua NilaiSoal dari AsesmenSoal yang terhubung ke SubCPMK → CPMK → CPL
      cpl.cpmk.forEach(c => {
        c.subCpmk.forEach(sc => {
          sc.asesmenSoal.forEach(as => {
            as.nilai.forEach(n => {
              totalScore += n.nilai;
              count += 1;
            });
          });
        });
      });

      const average = count > 0 ? Math.round(totalScore / count) : 0;

      return {
        id: cpl.id,
        kode: cpl.kode,
        deskripsi: cpl.deskripsi,
        attainment: average,
        target: 75,
        fullMark: 100,
        hasData: count > 0
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghitung capaian CPL' });
  }
});

import * as xlsx from 'xlsx';

// GET /api/check/export-excel
// Mengunduh rekapitulasi capaian CPL dalam format Excel
router.get('/export-excel', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    const where: any = {};
    if (kurikulumId) where.kurikulumId = String(kurikulumId);

    const cpls = await prisma.cPL.findMany({
      where,
      include: {
        cpmk: { include: { subCpmk: { include: { asesmenSoal: { include: { nilai: true } } } } } }
      }
    });

    const dataRows = cpls.map(cpl => {
      let totalScore = 0;
      let count = 0;
      cpl.cpmk.forEach(c => c.subCpmk.forEach(sc => sc.asesmenSoal.forEach(as => as.nilai.forEach(n => { totalScore += n.nilai; count++; }))));
      
      const average = count > 0 ? Math.round(totalScore / count) : 0;
      const status = average >= 75 ? 'Memenuhi Target' : 'Di Bawah Target';

      return {
        'Kode CPL': cpl.kode,
        'Deskripsi': cpl.deskripsi,
        'Capaian (%)': average,
        'Target (%)': 75,
        'Status Lulus': status,
        'Jumlah Data Dinilai': count
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(dataRows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Rekap CPL');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Capaian_CPL.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Gagal generate Excel' });
  }
});

// POST /api/check/complete — Tandai Check selesai
router.post('/complete', async (req, res) => {
  try {
    const { kurikulumId } = req.body;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const kur = await prisma.kurikulum.update({
      where: { id: kurikulumId },
      data: { checkCompletedAt: new Date() }
    });

    res.json({ success: true, checkCompletedAt: kur.checkCompletedAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menandai Check selesai' });
  }
});

// GET /api/check/status?kurikulumId=xxx — Cek status Check
router.get('/status', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const kur = await prisma.kurikulum.findUnique({
      where: { id: String(kurikulumId) },
      select: { checkCompletedAt: true }
    });

    res.json({ 
      completed: !!kur?.checkCompletedAt,
      checkCompletedAt: kur?.checkCompletedAt || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal cek status' });
  }
});

// ========================
// FEEDBACK & REKOMENDASI
// ========================

// GET /api/check/feedback?kurikulumId=xxx
router.get('/feedback', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const feedbacks = await prisma.checkFeedback.findMany({
      where: { kurikulumId: String(kurikulumId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil feedback' });
  }
});

// POST /api/check/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { kurikulumId, tipe, isi, sumber, prioritas } = req.body;
    if (!kurikulumId || !tipe || !isi) {
      return res.status(400).json({ error: 'kurikulumId, tipe, dan isi wajib diisi' });
    }

    const feedback = await prisma.checkFeedback.create({
      data: { kurikulumId, tipe, isi, sumber: sumber || 'Kaprodi', prioritas: prioritas || 'Medium' }
    });

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan feedback' });
  }
});

// PUT /api/check/feedback/:id
router.put('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isi, sumber, prioritas } = req.body;

    const feedback = await prisma.checkFeedback.update({
      where: { id },
      data: { isi, sumber, prioritas }
    });

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengupdate feedback' });
  }
});

// DELETE /api/check/feedback/:id
router.delete('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.checkFeedback.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus feedback' });
  }
});

// GET /api/check/status — Cek apakah fase Check sudah bisa/sudah dilakukan
// Check dianggap "completed" jika semua CPL sudah punya data nilai (dari Do)
router.get('/status', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    if (!kurikulumId) return res.status(400).json({ error: 'kurikulumId required' });

    const cpls = await prisma.cPL.findMany({
      where: { kurikulumId: String(kurikulumId) },
      include: {
        cpmk: {
          include: {
            subCpmk: {
              include: {
                asesmenSoal: { include: { nilai: { select: { id: true }, take: 1 } } }
              }
            }
          }
        }
      }
    });

    const totalCpls = cpls.length;
    let cplsWithData = 0;

    cpls.forEach(cpl => {
      let hasData = false;
      cpl.cpmk.forEach(c => {
        c.subCpmk.forEach(sc => {
          sc.asesmenSoal.forEach(as => {
            if (as.nilai.length > 0) hasData = true;
          });
        });
      });
      if (hasData) cplsWithData++;
    });

    // Check completed if at least 80% CPL punya data nilai
    const completed = totalCpls > 0 && (cplsWithData / totalCpls) >= 0.8;

    res.json({
      completed,
      totalCpls,
      cplsWithData,
      message: completed 
        ? 'Fase Check sudah selesai. Semua CPL sudah dievaluasi.' 
        : `Baru ${cplsWithData}/${totalCpls} CPL yang memiliki data penilaian. Selesaikan fase Do terlebih dahulu.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengecek status check' });
  }
});

export default router;
