import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();


// GET /api/dashboard/stats?kurikulumId=xxx
router.get('/stats', async (req, res) => {
  try {
    const role = req.user!.role;
    const qKurikulumId = req.query.kurikulumId as string | undefined;

    // Resolve which kurikulum to use — param or active
    const activeKurikulum = qKurikulumId
      ? await prisma.kurikulum.findUnique({ where: { id: qKurikulumId } })
      : await prisma.kurikulum.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });

    const kurikulumId = activeKurikulum?.id;

    if (role === 'KAPRODI') {
      if (!kurikulumId) {
        return res.json({
          pdca: {
            plan: { cpl: 0, mk: 0, mappings: 0, status: 'not_started' },
            do: { totalKelas: 0, kelasWithRPS: 0, kelasWithNilai: 0, status: 'not_started' },
            check: { totalCPL: 0, cplTercapai: 0, rataCapaian: 0, status: 'not_started' },
            act: { totalPlans: 0, active: 0, completed: 0, status: 'not_started' }
          }
        });
      }

      // PLAN stats — filtered by kurikulumId
      const cplCount = await prisma.cPL.count({ where: { kurikulumId } });
      const mkCount = await prisma.mataKuliah.count({ where: { kurikulumId } });
      const mappings = await prisma.pemetaanCPLMK.count({ where: { cpl: { kurikulumId } } });
      const planStatus = (cplCount > 0 && mkCount > 0 && mappings > 0) ? 'complete' : (cplCount > 0 || mkCount > 0 ? 'in_progress' : 'not_started');

      // DO stats — get kelas linked to MK of this kurikulum
      const mkIds = await prisma.mataKuliah.findMany({ where: { kurikulumId }, select: { id: true } }).then(r => r.map(x => x.id));
      const totalKelas = await prisma.kelas.count({ where: { mkId: { in: mkIds } } });
      const kelasIds = await prisma.kelas.findMany({ where: { mkId: { in: mkIds } }, select: { id: true } }).then(r => r.map(x => x.id));
      const kelasWithRPS = kelasIds.length > 0
        ? await prisma.rPSPertemuan.groupBy({ by: ['kelasId'], where: { kelasId: { in: kelasIds } } }).then(r => r.length)
        : 0;
      const kelasWithNilai = kelasIds.length > 0
        ? await prisma.nilaiSoal.findMany({
            where: { asesmenSoal: { asesmen: { kelasId: { in: kelasIds } } } },
            select: { asesmenSoal: { select: { asesmen: { select: { kelasId: true } } } } }
          }).then(rows => new Set(rows.map(r => r.asesmenSoal.asesmen.kelasId)).size)
        : 0;
      const doStatus = totalKelas > 0 ? (kelasWithRPS >= totalKelas ? 'complete' : 'in_progress') : 'not_started';

      // CHECK stats — only scores from CPLs of this kurikulum
      const allNilaiWithCPL = kelasIds.length > 0
        ? await prisma.nilaiSoal.findMany({
            where: { asesmenSoal: { asesmen: { kelasId: { in: kelasIds } } } },
            select: {
              nilai: true,
              asesmenSoal: { select: { subCpmk: { select: { cpmk: { select: { cplId: true } } } } } }
            }
          })
        : [];
      const rataCapaian = allNilaiWithCPL.length > 0
        ? Math.round((allNilaiWithCPL.reduce((s, n) => s + n.nilai, 0) / allNilaiWithCPL.length) * 10) / 10
        : 0;
      const cplScores: Record<string, number[]> = {};
      for (const n of allNilaiWithCPL) {
        const cplId = n.asesmenSoal?.subCpmk?.cpmk?.cplId;
        if (cplId) {
          if (!cplScores[cplId]) cplScores[cplId] = [];
          cplScores[cplId].push(n.nilai);
        }
      }
      let cplTercapai = 0;
      const cplAssessed = Object.keys(cplScores).length;
      for (const scores of Object.values(cplScores)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 70) cplTercapai++;
      }
      // Fetch checkCompletedAt milestone
      const kurData = await prisma.kurikulum.findUnique({ where: { id: kurikulumId }, select: { checkCompletedAt: true } });
      const checkCompleted = !!kurData?.checkCompletedAt;
      const checkStatus = checkCompleted ? 'complete' : (allNilaiWithCPL.length > 0 ? 'in_progress' : 'not_started');

      // ACT stats — filtered by kurikulumId
      const totalPlans = await prisma.actionPlan.count({ where: { kurikulumId } });
      const completedPlans = await prisma.actionPlan.count({ where: { kurikulumId, status: 'Completed' } });
      const activePlans = totalPlans - completedPlans;
      const actStatus = totalPlans > 0 ? (completedPlans === totalPlans ? 'complete' : 'in_progress') : 'not_started';

      return res.json({
        pdca: {
          plan: { cpl: cplCount, mk: mkCount, mappings, status: planStatus },
          do: { totalKelas, kelasWithRPS, kelasWithNilai, status: doStatus },
          check: { totalCPL: cplAssessed, cplTercapai, rataCapaian, status: checkStatus, checkCompletedAt: kurData?.checkCompletedAt },
          act: { totalPlans, active: activePlans, completed: completedPlans, status: actStatus }
        }
      });
    }

    if (role === 'DOSEN') {
      const dosenId = req.user!.id;
      const kelasFilter: any = { dosenId };
      // If kurikulumId is specified, only get kelas from that kurikulum's MKs
      if (kurikulumId) {
        const mkIds = await prisma.mataKuliah.findMany({ where: { kurikulumId }, select: { id: true } }).then(r => r.map(x => x.id));
        kelasFilter.mkId = { in: mkIds };
      }
      const kelasList = await prisma.kelas.findMany({ where: kelasFilter, select: { id: true } });
      const kelasIds = kelasList.map(k => k.id);
      const total = kelasIds.length;

      const withRPS = kelasIds.length > 0
        ? await prisma.rPSPertemuan.groupBy({ by: ['kelasId'], where: { kelasId: { in: kelasIds } } }).then(r => r.length)
        : 0;

      const withNilai = kelasIds.length > 0
        ? await prisma.penilaian.groupBy({ by: ['kelasId'], where: { kelasId: { in: kelasIds } } }).then(r => r.length)
        : 0;

      const mahasiswa = kelasIds.length > 0
        ? await prisma.kelasEnrollment.count({ where: { kelasId: { in: kelasIds } } })
        : 0;

      const nilaiRows = kelasIds.length > 0
        ? await prisma.nilaiSoal.findMany({
            where: { asesmenSoal: { asesmen: { kelasId: { in: kelasIds } } } },
            select: { nilai: true }
          })
        : [];
      const rataCapaian = nilaiRows.length > 0
        ? Math.round((nilaiRows.reduce((s, n) => s + n.nilai, 0) / nilaiRows.length) * 10) / 10
        : 0;

      return res.json({
        kelas: { total, withRPS, withNilai },
        mahasiswa,
        rataCapaian
      });
    }

    if (role === 'ADMIN') {
      const totalUsers = await prisma.user.count();
      const kaprodi = await prisma.user.count({ where: { role: 'KAPRODI' } });
      const dosen = await prisma.user.count({ where: { role: 'DOSEN' } });
      const admin = await prisma.user.count({ where: { role: 'ADMIN' } });
      const mahasiswaUser = await prisma.user.count({ where: { role: 'MAHASISWA' } });
      const kelas = await prisma.kelas.count();
      const mahasiswa = await prisma.mahasiswa.count();
      const kurikulumCount = await prisma.kurikulum.count();

      return res.json({
        users: { total: totalUsers, kaprodi, dosen, admin, mahasiswa: mahasiswaUser },
        kelas,
        mahasiswa,
        kurikulum: kurikulumCount
      });
    }

    if (role === 'MAHASISWA') {
      const nim = req.user!.username;
      const mhs = await prisma.mahasiswa.findUnique({ where: { nim } });
      if (!mhs) return res.json({ kelasEnrolled: 0, rataCapaian: 0, cplTercapai: 0, totalCPL: 0 });

      const kelasEnrolled = await prisma.kelasEnrollment.count({ where: { mahasiswaId: mhs.id } });
      const totalCPL = kurikulumId
        ? await prisma.cPL.count({ where: { kurikulumId } })
        : await prisma.cPL.count();

      const nilaiRows = await prisma.nilaiSoal.findMany({
        where: { mahasiswaId: mhs.id },
        select: { nilai: true }
      });
      const rataCapaian = nilaiRows.length > 0
        ? Math.round((nilaiRows.reduce((s, n) => s + n.nilai, 0) / nilaiRows.length) * 10) / 10
        : 0;
      const cplTercapai = Math.round(totalCPL * (rataCapaian / 100));

      return res.json({ kelasEnrolled, rataCapaian, cplTercapai, totalCPL });
    }

    res.json({});
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil data dashboard' });
  }
});


// GET /api/dashboard/kurikulum-progress — PDCA progress per kurikulum (for Kurikulum list page)
router.get('/kurikulum-progress', async (req, res) => {
  try {
    const allKurikulum = await prisma.kurikulum.findMany({ select: { id: true } });
    const result: Record<string, any> = {};

    for (const kur of allKurikulum) {
      const kid = kur.id;

      // PLAN
      const cplCount = await prisma.cPL.count({ where: { kurikulumId: kid } });
      const mkCount = await prisma.mataKuliah.count({ where: { kurikulumId: kid } });
      const mappings = await prisma.pemetaanCPLMK.count({ where: { cpl: { kurikulumId: kid } } });
      const planStatus = (cplCount > 0 && mkCount > 0 && mappings > 0) ? 'complete' : (cplCount > 0 || mkCount > 0 ? 'in_progress' : 'not_started');

      // DO
      const mkIds = await prisma.mataKuliah.findMany({ where: { kurikulumId: kid }, select: { id: true } }).then(r => r.map(x => x.id));
      const totalKelas = mkIds.length > 0 ? await prisma.kelas.count({ where: { mkId: { in: mkIds } } }) : 0;
      const kelasIds = mkIds.length > 0 ? await prisma.kelas.findMany({ where: { mkId: { in: mkIds } }, select: { id: true } }).then(r => r.map(x => x.id)) : [];
      const kelasWithRPS = kelasIds.length > 0
        ? await prisma.rPSPertemuan.groupBy({ by: ['kelasId'], where: { kelasId: { in: kelasIds } } }).then(r => r.length) : 0;
      const kelasWithNilai = kelasIds.length > 0
        ? await prisma.nilaiSoal.findMany({
            where: { asesmenSoal: { asesmen: { kelasId: { in: kelasIds } } } },
            select: { asesmenSoal: { select: { asesmen: { select: { kelasId: true } } } } }
          }).then(rows => new Set(rows.map(r => r.asesmenSoal.asesmen.kelasId)).size) : 0;
      const doStatus = totalKelas > 0 ? (kelasWithRPS >= totalKelas ? 'complete' : 'in_progress') : 'not_started';

      // CHECK
      const nilaiCount = kelasIds.length > 0
        ? await prisma.nilaiSoal.count({ where: { asesmenSoal: { asesmen: { kelasId: { in: kelasIds } } } } }) : 0;
      const checkStatus = nilaiCount > 0 ? 'complete' : 'not_started';

      // ACT
      const totalPlans = await prisma.actionPlan.count({ where: { kurikulumId: kid } });
      const completedPlans = await prisma.actionPlan.count({ where: { kurikulumId: kid, status: 'Completed' } });
      const actStatus = totalPlans > 0 ? (completedPlans === totalPlans ? 'complete' : 'in_progress') : 'not_started';

      result[kid] = {
        plan: { cpl: cplCount, mk: mkCount, mappings, status: planStatus },
        do: { totalKelas, kelasWithRPS, kelasWithNilai, status: doStatus },
        check: { status: checkStatus },
        act: { totalPlans, completed: completedPlans, active: totalPlans - completedPlans, status: actStatus }
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Kurikulum progress error:', error);
    res.status(500).json({ error: 'Gagal mengambil progress kurikulum' });
  }
});

export default router;
