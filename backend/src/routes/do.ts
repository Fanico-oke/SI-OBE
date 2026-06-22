import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();


// Ambil semua kelas (DOSEN hanya melihat kelas miliknya, filter kurikulumId lewat MK)
router.get('/kelas', async (req, res) => {
  try {
    const { kurikulumId } = req.query;
    const where: any = {};
    if (req.user?.role === 'DOSEN') where.dosenId = req.user.id;
    if (kurikulumId) where.mk = { kurikulumId: String(kurikulumId) };
    const data = await prisma.kelas.findMany({
      where,
      include: { mk: true, dosen: { select: { id: true, nama: true } } }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data kelas' }); }
});


// Ambil detail satu kelas beserta mahasiswa dan sub-cpmk (dari mk -> cpmk -> subcpmk)
router.get('/kelas/:kelasId', async (req, res) => {
  try {
    const data = await prisma.kelas.findUnique({
      where: { id: req.params.kelasId },
      include: { 
        mk: {
          include: {
            pemetaanCPMK: {
              include: {
                cpmk: {
                  include: { subCpmk: true, cpl: true }
                }
              }
            }
          }
        },
        enrollments: {
          include: { mahasiswa: true }
        }
      }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil detail kelas' }); }
});

// Ambil semua nilai di satu kelas
router.get('/kelas/:kelasId/penilaian', async (req, res) => {
  try {
    const data = await prisma.penilaian.findMany({
      where: { kelasId: req.params.kelasId }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data penilaian' }); }
});

// Simpan/Update nilai (bulk)
router.post('/penilaian', async (req, res) => {
  const { kelasId, nilaiData } = req.body;
  // nilaiData: [{ mahasiswaId, subCpmkId, nilai }, ...]
  
  try {
    // Upsert each grade
    const results = await Promise.all(nilaiData.map((n: any) => 
      prisma.penilaian.upsert({
        where: {
          mahasiswaId_kelasId_subCpmkId: {
            mahasiswaId: n.mahasiswaId,
            kelasId: kelasId,
            subCpmkId: n.subCpmkId
          }
        },
        update: { nilai: parseFloat(n.nilai) || 0 },
        create: {
          mahasiswaId: n.mahasiswaId,
          kelasId: kelasId,
          subCpmkId: n.subCpmkId,
          nilai: parseFloat(n.nilai) || 0
        }
      })
    ));
    res.json({ success: true, count: results.length });
  } catch (error) { res.status(500).json({ error: 'Gagal menyimpan nilai' }); }
});

// Seed Kelas for a given MK (creates Kelas + enrolls dummy Mahasiswa)
router.post('/seed', async (req, res) => {
  try {
    const { mkId } = req.body;
    if (!mkId) return res.status(400).json({ error: 'mkId diperlukan' });

    const mk = await prisma.mataKuliah.findUnique({ 
      where: { id: mkId },
      include: { kurikulum: true }
    });
    if (!mk) return res.status(400).json({ error: 'Mata Kuliah tidak ditemukan' });

    // Build tahunAjaran from kurikulum
    const tahunAjaran = mk.kurikulum 
      ? `${mk.kurikulum.tahunMulai}/${mk.kurikulum.tahunSelesai}` 
      : '2024/2025';

    // Find or create Kelas for this specific MK
    let kelas = await prisma.kelas.findFirst({ where: { mkId: mk.id, ...(req.user?.id ? { dosenId: req.user.id } : {}) } });
    if (!kelas) {
      kelas = await prisma.kelas.create({
        data: {
          mkId: mk.id,
          nama: mk.kode + ' - 01',
          tahunAjaran,
          semester: 'Ganjil',
          ...(req.user?.id ? { dosenId: req.user.id } : {})
        }
      });
    }

    // Inject Mahasiswa if no enrollments
    const enrollments = await prisma.kelasEnrollment.count({ where: { kelasId: kelas.id } });
    if (enrollments === 0) {
      const dummyStudents = [
        { nim: '1301210001', nama: 'Budi Santoso', angkatan: 2021 },
        { nim: '1301210002', nama: 'Siti Aminah', angkatan: 2021 },
        { nim: '1301210003', nama: 'Andi Wijaya', angkatan: 2021 }
      ];
      
      for (const m of dummyStudents) {
        let mhs = await prisma.mahasiswa.findUnique({ where: { nim: m.nim } });
        if (!mhs) {
          mhs = await prisma.mahasiswa.create({ data: m });
        }
        await prisma.kelasEnrollment.create({
          data: { kelasId: kelas.id, mahasiswaId: mhs.id }
        });
      }
    }

    res.json({ success: true, message: 'Kelas dan Mahasiswa berhasil dimuat', kelasId: kelas.id });
  } catch (error) { res.status(500).json({ error: 'Gagal seed data' }); }
});

// AMBIL ASESMEN DI KELAS
router.get('/kelas/:kelasId/asesmen', async (req, res) => {
  try {
    const data = await prisma.asesmen.findMany({
      where: { kelasId: req.params.kelasId },
      include: { 
        soal: {
          include: { subCpmk: true, nilai: true }
        } 
      }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil data asesmen' }); }
});

// SIMPAN ASESMEN BARU
router.post('/asesmen', async (req, res) => {
  const { kelasId, nama, bobot, soal } = req.body;
  // soal: [{ nomorSoal, bobotSoal, subCpmkId }]
  try {
    const asesmen = await prisma.asesmen.create({
      data: {
        kelasId, nama, bobot: parseFloat(bobot) || 0,
        soal: {
          create: soal.map((s: any) => ({
            nomorSoal: s.nomorSoal,
            bobotSoal: parseFloat(s.bobotSoal) || 0,
            subCpmkId: s.subCpmkId
          }))
        }
      }
    });
    res.json(asesmen);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat asesmen' }); }
});

// SIMPAN NILAI SOAL
router.post('/nilai-soal', async (req, res) => {
  const { nilaiData } = req.body; 
  // [{ mahasiswaId, asesmenSoalId, nilai, kelasId, subCpmkId }]
  try {
    const results = await Promise.all(nilaiData.map(async (n: any) => {
      // 1. Simpan NilaiSoal
      const ns = await prisma.nilaiSoal.upsert({
        where: { mahasiswaId_asesmenSoalId: { mahasiswaId: n.mahasiswaId, asesmenSoalId: n.asesmenSoalId } },
        update: { nilai: parseFloat(n.nilai) || 0 },
        create: { mahasiswaId: n.mahasiswaId, asesmenSoalId: n.asesmenSoalId, nilai: parseFloat(n.nilai) || 0 }
      });
      // 2. Agregasi ke Penilaian (SubCPMK) - Untuk Backward Compatibility
      await prisma.penilaian.upsert({
        where: { mahasiswaId_kelasId_subCpmkId: { mahasiswaId: n.mahasiswaId, kelasId: n.kelasId, subCpmkId: n.subCpmkId } },
        update: { nilai: parseFloat(n.nilai) || 0 }, // Sederhananya kita overwrite (asumsi 1 soal per subCPMK untuk prototype ini)
        create: { mahasiswaId: n.mahasiswaId, kelasId: n.kelasId, subCpmkId: n.subCpmkId, nilai: parseFloat(n.nilai) || 0 }
      });
      return ns;
    }));
    res.json({ success: true, count: results.length });
  } catch (error) { res.status(500).json({ error: 'Gagal menyimpan nilai soal' }); }
});

// -------------------------
// RPS ENDPOINTS
// -------------------------
router.get('/kelas/:kelasId/rps', async (req, res) => {
  try {
    const data = await prisma.rPSPertemuan.findMany({
      where: { kelasId: req.params.kelasId },
      orderBy: { mingguKe: 'asc' },
      include: { subCpmk: { include: { cpmk: true } } }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil RPS' }); }
});

router.post('/rps', async (req, res) => {
  const { kelasId, rpsData } = req.body;
  // rpsData: [{ mingguKe, materi, metode, waktu, subCpmkId }]
  try {
    let count = 0;
    await prisma.$transaction(async (tx) => {
      await tx.rPSPertemuan.deleteMany({ where: { kelasId } }); // Replace all
      for (const r of rpsData) {
        await tx.rPSPertemuan.create({
          data: {
            kelasId,
            mingguKe: parseInt(r.mingguKe),
            materi: r.materi,
            metode: r.metode,
            waktu: r.waktu,
            subCpmkId: r.subCpmkId || null
          }
        });
        count++;
      }
    });
    res.json({ success: true, count });
  } catch (error) { res.status(500).json({ error: 'Gagal menyimpan RPS' }); }
});

// -------------------------
// RUBRIK ENDPOINTS
// -------------------------
router.get('/kelas/:kelasId/rubrik', async (req, res) => {
  try {
    const data = await prisma.rubrik.findMany({
      where: { kelasId: req.params.kelasId },
      include: { kriteria: true }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Gagal mengambil Rubrik' }); }
});

router.post('/rubrik', async (req, res) => {
  const { kelasId, nama, deskripsi, kriteria } = req.body;
  // kriteria: [{ aspek, bobot, sangatBaik, baik, cukup, kurang }]
  try {
    const rubrik = await prisma.rubrik.create({
      data: {
        kelasId, nama, deskripsi,
        kriteria: {
          create: kriteria.map((k: any) => ({
            aspek: k.aspek,
            bobot: parseFloat(k.bobot) || 0,
            sangatBaik: k.sangatBaik,
            baik: k.baik,
            cukup: k.cukup,
            kurang: k.kurang
          }))
        }
      }
    });
    res.json(rubrik);
  } catch (error) { res.status(500).json({ error: 'Gagal membuat Rubrik' }); }
});


// -------------------------
// FINALIZE DO (Selesaikan Do)
// -------------------------
router.post('/finalize-do', async (req, res) => {
  try {
    const { kelasId } = req.body;
    if (!kelasId) return res.status(400).json({ error: 'kelasId diperlukan' });

    // Fetch kelas with all related data needed for validation
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        mk: true,
        dosen: { select: { id: true, nama: true } },
        rpsPertemuan: true,
        asesmen: {
          include: {
            soal: {
              include: { nilai: true }
            }
          }
        },
        enrollments: {
          include: { mahasiswa: true }
        }
      }
    });

    if (!kelas) return res.status(404).json({ error: 'Kelas tidak ditemukan' });

    // Already completed?
    if (kelas.completedAt) {
      return res.status(400).json({ error: 'Kelas sudah diselesaikan sebelumnya', completedAt: kelas.completedAt });
    }

    // --- Validation checklist ---
    const checklist: { item: string; passed: boolean; detail?: string }[] = [];

    // 1. RPS >= 14 pertemuan
    const rpsCount = kelas.rpsPertemuan.length;
    checklist.push({
      item: 'RPS memiliki minimal 14 pertemuan',
      passed: rpsCount >= 14,
      detail: `Saat ini: ${rpsCount} pertemuan`
    });

    // 2. At least 1 asesmen
    const asesmenCount = kelas.asesmen.length;
    checklist.push({
      item: 'Minimal 1 asesmen',
      passed: asesmenCount >= 1,
      detail: `Saat ini: ${asesmenCount} asesmen`
    });

    // 3. All asesmen have at least 1 soal
    const asesmenWithoutSoal = kelas.asesmen.filter(a => a.soal.length === 0);
    checklist.push({
      item: 'Semua asesmen memiliki minimal 1 soal',
      passed: asesmenWithoutSoal.length === 0,
      detail: asesmenWithoutSoal.length > 0
        ? `Asesmen tanpa soal: ${asesmenWithoutSoal.map(a => a.nama).join(', ')}`
        : 'OK'
    });

    // 4. All enrolled students have nilai for all soal
    const enrolledStudentIds = kelas.enrollments.map(e => e.mahasiswaId);
    const allSoal = kelas.asesmen.flatMap(a => a.soal);
    let missingNilaiCount = 0;

    if (enrolledStudentIds.length > 0 && allSoal.length > 0) {
      for (const soal of allSoal) {
        const nilaiStudentIds = new Set(soal.nilai.map(n => n.mahasiswaId));
        for (const studentId of enrolledStudentIds) {
          if (!nilaiStudentIds.has(studentId)) {
            missingNilaiCount++;
          }
        }
      }
    }

    const totalExpected = enrolledStudentIds.length * allSoal.length;
    checklist.push({
      item: 'Semua mahasiswa memiliki nilai untuk semua soal',
      passed: missingNilaiCount === 0 && totalExpected > 0,
      detail: totalExpected === 0
        ? 'Tidak ada mahasiswa atau soal'
        : missingNilaiCount > 0
          ? `${missingNilaiCount} nilai belum diisi dari total ${totalExpected}`
          : 'OK'
    });

    // Check if all passed
    const allPassed = checklist.every(c => c.passed);

    if (!allPassed) {
      return res.status(400).json({
        error: 'Validasi belum lengkap. Periksa checklist berikut:',
        checklist
      });
    }

    // --- All valid: mark as completed ---
    await prisma.kelas.update({
      where: { id: kelasId },
      data: { completedAt: new Date() }
    });

    // --- Create notification for KAPRODI users ---
    const dosenNama = kelas.dosen?.nama || 'Dosen';
    const kelasNama = `${kelas.mk.nama} - ${kelas.nama}`;

    const kaprodiUsers = await prisma.user.findMany({
      where: { role: 'KAPRODI' },
      select: { id: true }
    });

    if (kaprodiUsers.length > 0) {
      await prisma.notification.createMany({
        data: kaprodiUsers.map(u => ({
          userId: u.id,
          title: 'Fase Do Selesai',
          message: `Dosen ${dosenNama} telah menyelesaikan fase Do untuk kelas ${kelasNama}`,
          type: 'SUCCESS'
        }))
      });
    }

    res.json({
      success: true,
      message: `Fase Do untuk kelas ${kelasNama} berhasil diselesaikan`,
      checklist
    });
  } catch (error) {
    console.error('Finalize Do error:', error);
    res.status(500).json({ error: 'Gagal menyelesaikan fase Do' });
  }
});

export default router;
