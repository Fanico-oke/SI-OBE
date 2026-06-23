import { Router } from 'express';
import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';

const router = Router();

// Helper: get kurikulum by ID or fallback to ACTIVE, then latest
async function resolveKurikulum(kurikulumId?: string) {
  if (kurikulumId) {
    return prisma.kurikulum.findUnique({ where: { id: kurikulumId } });
  }
  // Fallback: ACTIVE first, then latest regardless of status
  const active = await prisma.kurikulum.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });
  if (active) return active;

  return prisma.kurikulum.findFirst({
    orderBy: { createdAt: 'desc' }
  });
}


// GET Ketercapaian Lulusan Angkatan (Real Data from NilaiSoal → SubCPMK → CPMK → CPL)
router.get('/ketercapaian', async (req, res) => {
  try {
    const kurikulumId = req.query.kurikulumId as string | undefined;
    const angkatan = req.query.angkatan as string | undefined;

    const kurikulum = await resolveKurikulum(kurikulumId);
    if (!kurikulum) {
      return res.json([]);
    }

    // Build NilaiSoal filter based on angkatan
    const nilaiWhere: any = {};
    if (angkatan) {
      // Filter by mahasiswa angkatan
      const mahasiswaIds = await prisma.mahasiswa.findMany({
        where: { angkatan: parseInt(angkatan) },
        select: { id: true }
      });
      if (mahasiswaIds.length > 0) {
        nilaiWhere.mahasiswaId = { in: mahasiswaIds.map(m => m.id) };
      } else {
        // No students in this angkatan → return empty scores
        const cpls = await prisma.cPL.findMany({
          where: { kurikulumId: kurikulum.id },
          orderBy: { kode: 'asc' }
        });
        return res.json(cpls.map(cpl => ({
          subject: cpl.kode, A: 0, fullMark: 100, deskripsi: cpl.deskripsi, hasData: false
        })));
      }
    }

    // Query CPL with nested CPMK → SubCPMK → AsesmenSoal → NilaiSoal
    const cpls = await prisma.cPL.findMany({
      where: { kurikulumId: kurikulum.id },
      include: {
        cpmk: {
          include: {
            subCpmk: {
              include: {
                asesmenSoal: {
                  include: {
                    nilai: nilaiWhere.mahasiswaId ? { where: nilaiWhere } : true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { kode: 'asc' }
    });

    const data = cpls.map(cpl => {
      let totalScore = 0;
      let count = 0;

      cpl.cpmk.forEach(c => {
        c.subCpmk.forEach(sc => {
          sc.asesmenSoal.forEach(soal => {
            soal.nilai.forEach(n => {
              totalScore += n.nilai;
              count += 1;
            });
          });
        });
      });

      const average = count > 0 ? Math.round(totalScore / count) : 0;

      return {
        subject: cpl.kode,
        A: average,
        fullMark: 100,
        deskripsi: cpl.deskripsi,
        hasData: count > 0
      };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data ketercapaian' });
  }
});

// GET Evaluasi Mata Kuliah (Real Data from NilaiSoal via Kelas → Asesmen → AsesmenSoal → NilaiSoal)
router.get('/evaluasi-mk', async (req, res) => {
  try {
    const kurikulumId = req.query.kurikulumId as string | undefined;

    const kurikulum = await resolveKurikulum(kurikulumId);
    if (!kurikulum) {
      return res.json([]);
    }

    const mks = await prisma.mataKuliah.findMany({
      where: { kurikulumId: kurikulum.id },
      include: {
        kelas: {
          include: {
            asesmen: {
              include: {
                soal: {
                  include: {
                    nilai: true
                  }
                }
              }
            },
            dosen: { select: { nama: true } }
          }
        }
      },
      orderBy: { semester: 'asc' }
    });

    const target = 70;

    const data = mks.map(mk => {
      let totalScore = 0;
      let count = 0;
      let dosenName = 'Tim Dosen';

      mk.kelas.forEach(kelas => {
        if (kelas.dosen?.nama) dosenName = kelas.dosen.nama;
        kelas.asesmen.forEach(asesmen => {
          asesmen.soal.forEach(soal => {
            soal.nilai.forEach(n => {
              totalScore += n.nilai;
              count += 1;
            });
          });
        });
      });

      const successRate = count > 0 ? Math.round(totalScore / count) : 0;

      return {
        id: mk.id,
        kode: mk.kode,
        nama: mk.nama,
        semester: mk.semester,
        dosen: dosenName,
        successRate,
        target,
        status: count === 0 ? 'Belum Ada Data' : (successRate >= target ? 'Tercapai' : 'Perlu Evaluasi'),
        hasData: count > 0
      };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil evaluasi MK' });
  }
});

// GET Portofolio Mahasiswa (Real Data from NilaiSoal)
router.get('/portofolio/:nim', async (req, res) => {
  try {
    const nim = req.params.nim;
    const kurikulumId = req.query.kurikulumId as string | undefined;

    // Cari data mahasiswa
    const mahasiswa = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (!mahasiswa) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    }

    // Cari user untuk nama
    const mhsUser = await prisma.user.findFirst({ where: { username: nim } });
    const nama = mhsUser ? mhsUser.nama : mahasiswa.nama;

    const kurikulum = await resolveKurikulum(kurikulumId);
    if (!kurikulum) {
      return res.status(404).json({ error: 'Tidak ada kurikulum tersedia' });
    }

    // Query CPL → CPMK → SubCPMK → AsesmenSoal → NilaiSoal (filtered by this student)
    const cpls = await prisma.cPL.findMany({
      where: { kurikulumId: kurikulum.id },
      include: {
        cpmk: {
          include: {
            subCpmk: {
              include: {
                asesmenSoal: {
                  include: {
                    nilai: {
                      where: { mahasiswaId: mahasiswa.id }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { kode: 'asc' }
    });

    const scores = cpls.map(cpl => {
      let totalScore = 0;
      let count = 0;

      cpl.cpmk.forEach(c => {
        c.subCpmk.forEach(sc => {
          sc.asesmenSoal.forEach(soal => {
            soal.nilai.forEach(n => {
              totalScore += n.nilai;
              count += 1;
            });
          });
        });
      });

      const score = count > 0 ? Math.round(totalScore / count) : 0;

      return {
        kode: cpl.kode,
        deskripsi: cpl.deskripsi,
        score,
        hasData: count > 0
      };
    });

    const scoredCpls = scores.filter(s => s.hasData);
    const totalScore = scoredCpls.reduce((sum, s) => sum + s.score, 0);
    const averageScore = scoredCpls.length > 0 ? (totalScore / scoredCpls.length).toFixed(1) : '0';

    res.json({
      nim,
      nama,
      programStudi: 'Sistem Informasi',
      angkatan: String(mahasiswa.angkatan),
      averageScore,
      cplScores: scores,
      recommendation: scoredCpls.length === 0 ? 'Belum Ada Data' :
        Number(averageScore) > 80 ? 'Sangat Direkomendasikan' : 'Direkomendasikan'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memuat portofolio' });
  }
});

// GET /export-pdf — generate Laporan OBE PDF
router.get('/export-pdf', async (req, res) => {
  try {
    const kurikulumId = req.query.kurikulumId as string | undefined;

    const kurikulum = await resolveKurikulum(kurikulumId);
    if (!kurikulum) return res.status(404).json({ error: 'Tidak ada kurikulum tersedia' });

    // Get CPL data (same as /ketercapaian)
    const cpls = await prisma.cPL.findMany({
      where: { kurikulumId: kurikulum.id },
      include: {
        cpmk: { include: { subCpmk: { include: { asesmenSoal: { include: { nilai: true } } } } } }
      },
      orderBy: { kode: 'asc' }
    });

    const cplData = cpls.map(cpl => {
      let totalScore = 0, count = 0;
      cpl.cpmk.forEach(c => c.subCpmk.forEach(sc => sc.asesmenSoal.forEach(soal => soal.nilai.forEach(n => { totalScore += n.nilai; count++; }))));
      return { kode: cpl.kode, deskripsi: cpl.deskripsi, average: count > 0 ? Math.round(totalScore / count) : 0, hasData: count > 0 };
    });

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_OBE.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('LAPORAN CAPAIAN OBE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(kurikulum.nama, { align: 'center' });
    doc.fontSize(10).text(`Program Studi: ${kurikulum.prodi}`, { align: 'center' });
    doc.text(`Periode: ${kurikulum.tahunMulai} - ${kurikulum.tahunSelesai}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary
    const withData = cplData.filter(c => c.hasData);
    const avgAll = withData.length > 0 ? Math.round(withData.reduce((s, c) => s + c.average, 0) / withData.length) : 0;
    const achieved = withData.filter(c => c.average >= 70).length;

    doc.fontSize(12).font('Helvetica-Bold').text('Ringkasan Capaian');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total CPL: ${cplData.length}`);
    doc.text(`CPL Terukur: ${withData.length}`);
    doc.text(`CPL Tercapai (≥70): ${achieved}`);
    doc.text(`Rata-rata Capaian: ${avgAll}%`);
    doc.moveDown(1);

    // Table header
    doc.fontSize(12).font('Helvetica-Bold').text('Detail Capaian per CPL');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 50, col2 = 120, col3 = 420, col4 = 480;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('CPL', col1, tableTop);
    doc.text('Deskripsi', col2, tableTop);
    doc.text('Capaian', col3, tableTop);
    doc.text('Status', col4, tableTop);
    doc.moveTo(col1, tableTop + 14).lineTo(545, tableTop + 14).stroke();

    let y = tableTop + 20;
    doc.font('Helvetica').fontSize(8);
    for (const cpl of cplData) {
      if (y > 750) { doc.addPage(); y = 50; }
      doc.text(cpl.kode, col1, y, { width: 60 });
      doc.text(cpl.deskripsi.substring(0, 55) + '...', col2, y, { width: 290 });
      doc.text(`${cpl.average}%`, col3, y, { width: 50 });
      doc.text(cpl.hasData ? (cpl.average >= 70 ? 'Tercapai' : 'Belum') : 'N/A', col4, y, { width: 60 });
      y += 18;
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').text(`Digenerate oleh SI-OBE pada ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menggenerate PDF' });
  }
});

export default router;
