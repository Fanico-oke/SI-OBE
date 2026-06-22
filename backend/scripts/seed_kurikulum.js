const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const data = [
    // === STATUS: ACTIVE ===
    {
      nama: 'Kurikulum Sistem Informasi 2024/2025',
      prodi: 'Sistem Informasi',
      tahunMulai: 2024,
      tahunSelesai: 2028,
      deskripsi: 'Kurikulum aktif Program Studi Sistem Informasi yang mengintegrasikan kompetensi OBE dengan kebutuhan industri digital.',
      status: 'ACTIVE'
    },
    {
      nama: 'Kurikulum Teknik Informatika 2023/2024',
      prodi: 'Teknik Informatika',
      tahunMulai: 2023,
      tahunSelesai: 2027,
      deskripsi: 'Kurikulum berbasis OBE untuk Program Studi Teknik Informatika dengan fokus pada pengembangan perangkat lunak dan kecerdasan buatan.',
      status: 'ACTIVE'
    },

    // === STATUS: Draft ===
    {
      nama: 'Rancangan Kurikulum SI Gasal 2025/2026',
      prodi: 'Sistem Informasi',
      tahunMulai: 2025,
      tahunSelesai: 2029,
      deskripsi: 'Draft kurikulum baru Sistem Informasi semester gasal, sedang dalam tahap perencanaan dan review internal tim dosen.',
      status: 'Draft'
    },
    {
      nama: 'Kurikulum Sains Data (Rancangan)',
      prodi: 'Sains Data',
      tahunMulai: 2025,
      tahunSelesai: 2029,
      deskripsi: 'Rancangan awal kurikulum prodi Sains Data baru. Masih perlu validasi dari BAN-PT dan masukan dari stakeholder industri.',
      status: 'Draft'
    },
    {
      nama: 'Revisi Kurikulum TI 2025',
      prodi: 'Teknik Informatika',
      tahunMulai: 2025,
      tahunSelesai: 2029,
      deskripsi: 'Draft revisi kurikulum Teknik Informatika untuk menambahkan mata kuliah Cloud Computing dan DevOps.',
      status: 'Draft'
    },

    // === STATUS: Published ===
    {
      nama: 'Kurikulum SI Genap 2022/2023 (Terbit)',
      prodi: 'Sistem Informasi',
      tahunMulai: 2022,
      tahunSelesai: 2026,
      deskripsi: 'Kurikulum yang sudah selesai direview dan diterbitkan secara resmi untuk semester genap 2022/2023.',
      status: 'Published'
    },
    {
      nama: 'Kurikulum TI 2021/2022 (Terbit)',
      prodi: 'Teknik Informatika',
      tahunMulai: 2021,
      tahunSelesai: 2025,
      deskripsi: 'Kurikulum Teknik Informatika yang sudah dipublikasikan dan dijalankan selama 4 tahun. Sudah memasuki fase evaluasi akhir.',
      status: 'Published'
    },
    {
      nama: 'Kurikulum Manajemen Informatika 2023 (Terbit)',
      prodi: 'Manajemen Informatika',
      tahunMulai: 2023,
      tahunSelesai: 2027,
      deskripsi: 'Kurikulum D3 Manajemen Informatika yang telah melalui proses akreditasi dan resmi diterbitkan.',
      status: 'Published'
    }
  ];

  for (const item of data) {
    await prisma.kurikulum.create({ data: item });
    console.log(`Created: [${item.status}] ${item.nama}`);
  }

  console.log('\\nSeeding selesai! Total:', data.length, 'kurikulum ditambahkan.');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
