const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Ambil MK "MK04" (Pengantar Sistem Informasi) atau MK apapun
  const mk = await prisma.mataKuliah.findFirst({
    where: { kode: 'MK04' }
  }) || await prisma.mataKuliah.findFirst();

  if (!mk) return console.log('Tidak ada MK');

  // 2. Ambil CPL
  let cpl = await prisma.cPL.findFirst();
  if (!cpl) {
    cpl = await prisma.cPL.create({ data: { kode: 'CPL-01', deskripsi: 'Mampu merancang sistem informasi...' }});
  }

  // 3. Buat CPMK
  let cpmk = await prisma.cPMK.findFirst({ where: { cplId: cpl.id } });
  if (!cpmk) {
    cpmk = await prisma.cPMK.create({
      data: {
        kode: 'CPMK01',
        deskripsi: 'Mampu memahami konsep dasar sistem informasi',
        cplId: cpl.id
      }
    });
  }

  // 4. Buat Sub-CPMK
  let subCpmk1 = await prisma.subCPMK.findFirst({ where: { cpmkId: cpmk.id, kode: 'L1' } });
  if (!subCpmk1) {
    subCpmk1 = await prisma.subCPMK.create({
      data: { kode: 'L1', deskripsi: 'Menjelaskan komponen SI', cpmkId: cpmk.id }
    });
  }
  let subCpmk2 = await prisma.subCPMK.findFirst({ where: { cpmkId: cpmk.id, kode: 'L2' } });
  if (!subCpmk2) {
    subCpmk2 = await prisma.subCPMK.create({
      data: { kode: 'L2', deskripsi: 'Merancang arsitektur SI', cpmkId: cpmk.id }
    });
  }

  // 5. Petakan MK -> CPMK
  await prisma.pemetaanMKCPMK.upsert({
    where: { mkId_cpmkId: { mkId: mk.id, cpmkId: cpmk.id } },
    update: {},
    create: { mkId: mk.id, cpmkId: cpmk.id }
  });

  // 6. Buat Mahasiswa riil
  const m1 = await prisma.mahasiswa.upsert({
    where: { nim: '120220001' }, update: {}, create: { nim: '120220001', nama: 'Andi Setiawan', angkatan: 2024 }
  });
  const m2 = await prisma.mahasiswa.upsert({
    where: { nim: '120220002' }, update: {}, create: { nim: '120220002', nama: 'Budi Santoso', angkatan: 2024 }
  });

  // 7. Buat Kelas
  let kelas = await prisma.kelas.findFirst({ where: { mkId: mk.id } });
  if (!kelas) {
    kelas = await prisma.kelas.create({
      data: { mkId: mk.id, nama: mk.kode + ' - 01', tahunAjaran: '2024/2025', semester: 'Ganjil' }
    });
  }

  // 8. Daftarkan Mahasiswa ke Kelas
  await prisma.kelasEnrollment.createMany({
    data: [
      { kelasId: kelas.id, mahasiswaId: m1.id },
      { kelasId: kelas.id, mahasiswaId: m2.id }
    ],
    skipDuplicates: true
  });

  console.log(`Berhasil menyuntikkan data RIIL untuk Mata Kuliah ${mk.kode} - ${mk.nama}`);
  console.log(`Silakan klik kartu mata kuliah ini di menu Pelaksanaan Kelas.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
