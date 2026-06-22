const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  console.log('Clearing database...');
  // Children first — DO/CHECK/ACT phase tables
  await prisma.nilaiSoal.deleteMany();
  await prisma.asesmenSoal.deleteMany();
  await prisma.asesmen.deleteMany();
  await prisma.penilaian.deleteMany();
  await prisma.kelasEnrollment.deleteMany();
  await prisma.rPSPertemuan.deleteMany();
  await prisma.kriteriaRubrik.deleteMany();
  await prisma.rubrik.deleteMany();
  await prisma.materiPembelajaran.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.mahasiswa.deleteMany();
  // Existing PLAN phase tables
  await prisma.pemetaanMKCPMK.deleteMany();
  await prisma.pemetaanCPLMK.deleteMany();
  await prisma.pemetaanBKMK.deleteMany();
  await prisma.pemetaanCPLBK.deleteMany();
  await prisma.pemetaanPLMK.deleteMany();
  await prisma.pemetaanPLCPL.deleteMany();
  await prisma.pemetaanSnDiktiCPLProdi.deleteMany();
  await prisma.subCPMK.deleteMany();
  await prisma.cPMK.deleteMany();
  await prisma.mataKuliah.deleteMany();
  await prisma.bahanKajian.deleteMany();
  await prisma.cPL.deleteMany();
  await prisma.cPLSnDikti.deleteMany();
  await prisma.profilLulusan.deleteMany();
  await prisma.actionPlan.deleteMany();
  await prisma.kurikulum.deleteMany();
  console.log('🚀 Memulai pengisian data kurikulum dari dokumen Kaprodi...\n');

  // =============================================
  // 0. BUAT USER DUMMY (dengan password ter-hash)
  // =============================================
  const hashedPassword = bcrypt.hashSync('123', 10);
  const usersData = [
    { username: 'kaprodi', password: hashedPassword, nama: 'Bapak Kaprodi', role: 'KAPRODI' },
    { username: 'dosen', password: hashedPassword, nama: 'Bapak Dosen', role: 'DOSEN' },
    { username: '120220001', password: hashedPassword, nama: 'Mahasiswa Dummy', role: 'MAHASISWA' },
    { username: 'admin', password: hashedPassword, nama: 'Super Admin', role: 'ADMIN' },
  ];
  const userMap: Record<string, string> = {};
  for (const u of usersData) {
    const created = await prisma.user.upsert({
      where: { username: u.username },
      update: { password: u.password },
      create: u
    });
    userMap[u.username] = created.id;
  }
  console.log('✅ 4 User dummy (kaprodi, dosen, mahasiswa, admin) diisi');

  // =============================================
  // 1. BUAT KURIKULUM UTAMA
  // =============================================
  const kurikulum = await prisma.kurikulum.create({
    data: {
      nama: 'Rancangan Kurikulum SI Gasal 2024/2025',
      prodi: 'Sistem Informasi',
      tahunMulai: 2024,
      tahunSelesai: 2028,
      deskripsi: 'Kurikulum berbasis OBE Program Studi Sistem Informasi yang mengacu pada SN-DIKTI, KKNI Bidang TIK, dan IS2020 (ACM/IEEE). Mencakup 66 Mata Kuliah, 14 CPL Prodi, 21 Bahan Kajian, dan 5 Profil Lulusan.',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Kurikulum dibuat:', kurikulum.nama);
  const kId = kurikulum.id;

  // =============================================
  // 2. PROFIL LULUSAN (PL1-PL5)
  // =============================================
  const plData = [
    { kode: 'PL1', deskripsi: 'Lulusan memiliki kemampuan untuk merencanakan, menganalisis, merancang, membangun, mengujicoba, menerapkan, dan mengevaluasi sistem informasi (bidang x) dalam sebuah proyek yang selaras dengan tujuan organisasi (peta okupasi dalam KKNI Bidang TIK dan IS2020)', referensi: 'PL Penciri Utama - Pengembangan Sistem dan Teknologi Informasi, Pengembangan Perangkat Lunak dan Pemrograman, Manajemen Proyek TI' },
    { kode: 'PL2', deskripsi: 'Lulusan memiliki kemampuan memahami, menerapkan, dan mengintegrasikan model bisnis dengan menggunakan metode dan berbagai teknik peningkatan bisnis proses yang mendatangkan suatu nilai tambah bagi organisasi (peta okupasi dalam KKNI Bidang TIK dan IS2020)', referensi: 'PL Penciri Utama' },
    { kode: 'PL3', deskripsi: 'Lulusan memiliki kemampuan untuk mengolah, menganalisis, dan menyajikan data yang dikembangkan dengan konsep big data dan business intelligence untuk membantu dalam proses pengambilan keputusan (peta okupasi dalam KKNI Bidang TIK)', referensi: 'PL tambahan KK dan P' },
    { kode: 'PL4', deskripsi: 'Lulusan memiliki sikap religius, beretika, dan peka terhadap lingkungan sosial sebagai seorang warga negara dengan berlandaskan nilai ahlussunah waljamaah (Aswaja).', referensi: 'PL Sikap' },
    { kode: 'PL5', deskripsi: 'Lulusan memiliki kemampuan berpikir kritis dan inovatif, bekerja mandiri, membuat keputusan tepat, mendokumentasikan data dengan benar, menyusun karya ilmiah, berkomunikasi efektif, membangun jaringan kerja, bertanggung jawab atas hasil tim, dan mengelola pembelajaran secara mandiri sesuai bidang keahliannya', referensi: 'PL Keterampilan umum dan sikap' }
  ];
  const plMap: Record<string, string> = {};
  for (const pl of plData) {
    const created = await prisma.profilLulusan.create({ data: { kurikulumId: kId, ...pl } });
    plMap[pl.kode] = created.id;
  }
  console.log('✅ 5 Profil Lulusan (PL1-PL5) diisi');

  // =============================================
  // 3. CPL PRODI (CPL01-CPL14)
  // =============================================
  const cplData = [
    { kode: 'CPL01', deskripsi: 'Mampu memahami, menganalisis, dan menilai konsep dasar dan peran sistem informasi dalam mengelola data dan memberikan rekomendasi pengambilan keputusan pada proses dan sistem organisasi.' },
    { kode: 'CPL02', deskripsi: 'Mampu merancang dan menggunakan database, serta mengolah dan menganalisa data dengan alat dan teknik pengolahan data' },
    { kode: 'CPL03', deskripsi: 'Mampu memahami dan menggunakan berbagai metodologi pengembangan sistem beserta alat pemodelan sistem dan menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi' },
    { kode: 'CPL04', deskripsi: 'Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud, menganalisa konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat' },
    { kode: 'CPL05', deskripsi: 'Mampu memahami dan menerapkan kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem' },
    { kode: 'CPL06', deskripsi: 'Memiliki kemampuan merencanakan, menerapkan, memelihara dan meningkatkan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi yang strategis baik jangka pendek maupun jangka panjang.' },
    { kode: 'CPL07', deskripsi: 'Mampu memahami, mengidentifikasi dan menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
    { kode: 'CPL08', deskripsi: 'Mampu memahami dan menerapkan konsep, metode, teknik, dan tahapan data mining serta visualisasi data dalam pengolahan data, pengorganisasian data, dan penyajian informasi yang efektif, efisien, dan estetik' },
    { kode: 'CPL09', deskripsi: 'Mampu memahami dan menerapkan model sistem, metode dan berbagai teknik peningkatan bisnis proses, peluang inovasi digital dalam pengelolaan bisnis bidang kesehatan yang memanfaatkan teknologi' },
    { kode: 'CPL10', deskripsi: 'Mampu menunjukkan sikap profesionalitas, integritas, dan berjati diri islami yang dilengkapi dengan kemampuan komunikasi, kepemimpinan, bekerja sama dan bertanggung jawab atas pekerjaan di bidang keahliannya, bermasyarakat, berbangsa, dan bernegara sebagai warga negara yang bangga dan cinta tanah air berlandaskan nilai ahlus sunah waljamahah' },
    { kode: 'CPL11', deskripsi: 'Mampu menunjukkan sikap taat hukum, disiplin, dan menghargai keanekaragaman melalui internalisasi nilai, norma, etika akademik, semangat kemandirian, kejuangan, dan kewirausahaan' },
    { kode: 'CPL12', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, terukur, berfikir logis, kritis, sistematis, dan inovatif, komunikatif dalam mengembangkan ilmu pengetahuan yang memperhatikan nilai humaniora sesuai bidang keahliannya' },
    { kode: 'CPL13', deskripsi: 'Mampu mengkaji implikasi pengembangan ilmu pengetahuan dengan menerapkan keahliannya dalam rangka menghasilkan solusi, menyusun deskripsi saintifik hasil kajian dalam bentuk laporan ilmiah yang sahih dan original dan memelihara serta mengembangan jaringan kerja dengan pembimbing, kolega, sejawat baik di dalam maupun di luar lembaga' },
    { kode: 'CPL14', deskripsi: 'Mampu melakukan evaluasi diri dan supervisi terhadap penyelesaian pekerjaan sebagai wujud tanggung jawab atas pencapaian hasil kelompok kerja' }
  ];
  const cplMap: Record<string, string> = {};
  for (const cpl of cplData) {
    const created = await prisma.cPL.create({ data: { kurikulumId: kId, ...cpl } });
    cplMap[cpl.kode] = created.id;
  }
  console.log('✅ 14 CPL Prodi (CPL01-CPL14) diisi');

  // =============================================
  // 3a. CPL SN-DIKTI
  // =============================================
  const snDiktiData = [
    { kode: 'CPL-S01', kategori: 'Sikap', deskripsi: "Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius." },
    { kode: 'CPL-S02', kategori: 'Sikap', deskripsi: "Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral dan etika." },
    { kode: 'CPL-S03', kategori: 'Sikap', deskripsi: "Berkontribusi dalam peningkatan mutu kehidupan bermasyarakat, berbangsa, dan bernegara berdasarkan Pancasila." },
    { kode: 'CPL-S04', kategori: 'Sikap', deskripsi: "Berperan sebagai warga negara yang bangga dan cinta tanah air, memiliki nasionalisme serta rasa tanggungjawab pada negara dan bangsa." },
    { kode: 'CPL-S05', kategori: 'Sikap', deskripsi: "Menghargai keanekaragaman budaya, pandangan, agama, dan kepercayaan, serta pendapat atau temuan orisinal orang lain." },
    { kode: 'CPL-S06', kategori: 'Sikap', deskripsi: "Bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan." },
    { kode: 'CPL-S07', kategori: 'Sikap', deskripsi: "Taat hukum dan disiplin dalam kehidupan bermasyarakat dan bernegara." },
    { kode: 'CPL-S08', kategori: 'Sikap', deskripsi: "Menginternalisasi nilai, norma, dan etika akademik." },
    { kode: 'CPL-S09', kategori: 'Sikap', deskripsi: "Menunjukkan sikap bertanggungjawab atas pekerjaan di bidang keahliannya secara mandiri." },
    { kode: 'CPL-S10', kategori: 'Sikap', deskripsi: "Menginternalisasi semangat kemandirian, kejuangan, dan kewirausahaan." },
    { kode: 'CPL-S11', kategori: 'Sikap', deskripsi: "Menginternalisasi nilai-nilai ahlussunah waljamaah (Aswaja)" },
    { kode: 'CPL-KU01', kategori: 'Keterampilan Umum', deskripsi: "Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora yang sesuai dengan bidang keahliannya." },
    { kode: 'CPL-KU02', kategori: 'Keterampilan Umum', deskripsi: "Mampu menunjukkan kinerja mandiri, bermutu, dan terukur." },
    { kode: 'CPL-KU03', kategori: 'Keterampilan Umum', deskripsi: "Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni, menyusun deskripsi saintifik hasil kajiannya dalam bentuk skripsi atau laporan tugas akhir, dan mengunggahnya dalam laman perguruan tinggi." },
    { kode: 'CPL-KU04', kategori: 'Keterampilan Umum', deskripsi: "Menyusun deskripsi saintifik hasil kajian tersebut di atas dalam bentuk skripsi atau laporan tugas akhir, dan mengunggahnya dalam laman perguruan tinggi." },
    { kode: 'CPL-KU05', kategori: 'Keterampilan Umum', deskripsi: "Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya, berdasarkan hasil analisis informasi dan data." },
    { kode: 'CPL-KU06', kategori: 'Keterampilan Umum', deskripsi: "Mampu memelihara dan mengembangkan jaringan kerja dengan pembimbing, kolega, sejawat baik di dalam maupun di luar lembaganya." },
    { kode: 'CPL-KU07', kategori: 'Keterampilan Umum', deskripsi: "Mampu bertanggungjawab atas pencapaian hasil kerja kelompok dan melakukan supervisi dan evaluasi terhadap penyelesaian pekerjaan yang ditugaskan kepada pekerja yang berada di bawah tanggungjawabnya." },
    { kode: 'CPL-KU08', kategori: 'Keterampilan Umum', deskripsi: "Mampu melakukan proses evaluasi diri terhadap kelompok kerja yang berada dibawah tanggung jawabnya, dan mampu mengelola pembelajaran secara mandiri." },
    { kode: 'CPL-KU09', kategori: 'Keterampilan Umum', deskripsi: "Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data untuk menjamin kesahihan dan mencegah plagiasi." },
    { kode: 'CPL-KU10', kategori: 'Keterampilan Umum', deskripsi: "Berkomunikasi secara efektif dalam berbagai konteks profesional" },
    { kode: 'CPL-KK01', kategori: 'Keterampilan Khusus', deskripsi: "Mampu membangun, mengelola, menggunakan dan mengamankan database dengan alat dan teknik dalam sistem basis data yang akan menghasilkan model relasional" },
    { kode: 'CPL-KK02', kategori: 'Keterampilan Khusus', deskripsi: "Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud, menganalisa   konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat" },
    { kode: 'CPL-KK03', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan metodologi pengembangan sistem informasi beserta alat pemodelannya meliputi pengembangan sistem berorientasi objek, system development life cycle (SDLC)." },
    { kode: 'CPL-KK04', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan dasar logika, prinsip matematika, ekspresi, aspek modular,   linearitas dan non-linearitas struktur data pada pemrograman perangkat lunak" },
    { kode: 'CPL-KK05', kategori: 'Keterampilan Khusus', deskripsi: "Mampu memahami, menerapkan kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem" },
    { kode: 'CPL-KK06', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan merencanakan, menerapkan, memelihara dan meningkatkan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi yang strategis baik jangka pendek maupun jangka panjang." },
    { kode: 'CPL-KK07', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan untuk memantau, mengevaluasi dan mengendalikan sumberdaya sistem informasi untuk memastikan keselarasan, pencapaian dan sasaran strategis organisasi." },
    { kode: 'CPL-KK08', kategori: 'Keterampilan Khusus', deskripsi: "Mampu membangun perangkat lunak dalam sebuah proyek sistem informasi" },
    { kode: 'CPL-KK09', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan paradigma pemrograman berorientasi objek secara fundamental berdasarkan object, kelas, pewarisan, enkapsulasi, abstraksi dan polimorfisme" },
    { kode: 'CPL-KK10', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan fungsi dan bahasa pemrograman serta memperhatikan aspek keamanan pada aplikasi berbasis web di sisi client dan server" },
    { kode: 'CPL-KK11', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak" },
    { kode: 'CPL-KK12', kategori: 'Keterampilan Khusus', deskripsi: "Mampu menerapkan konsep, metode dan teknik dalam merancang UI/UX" },
    { kode: 'CPL-KK13', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan pengolahan data yaitu pemfilteran, agregasi dan pengorganisasian serta menyajikan informasi yang efektif, efisien, estetik dalam analisis dan visualisasi data" },
    { kode: 'CPL-KK14', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan dalam mengidentifikasi, menilai, menganalisis dan memberikan rekomendasi terkait   manajemen risiko teknologi informasi dalam organisasi." },
    { kode: 'CPL-KK15', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan dalam pengelolaan bisnis dengan memanfaatkan teknologi informasi" },
    { kode: 'CPL-KK16', kategori: 'Keterampilan Khusus', deskripsi: "Memiliki kemampuan dalam melakukan fungsi klasifikasi, klasterisasi, regresi, deteksi anomali, pembelajaran atura asosiasi, perangkuman, baik secara deskriptif maupun prediktif di dalam memahami masalah data secara tepat" },
    { kode: 'CPL-P01', kategori: 'Pengetahuan', deskripsi: "Mampu memahami, menganalisis, dan menilai konsep dasar dan peran sistem informasi dalam mengelola data dan memberikan rekomendasi pengambilan keputusan pada proses dan sistem organisasi." },
    { kode: 'CPL-P02', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan menjelaskan konsep basis data, struktur data dan visualisasi data secara menyeluruh" },
    { kode: 'CPL-P03', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan menjelaskan konsep infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud untuk menganalisa konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat" },
    { kode: 'CPL-P04', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan menjelaskan metodologi pengembangan sistem informasi mulai dari pengembangan sistem berorientasi objek, software development life cycle (SDLC), dan pengembangan agile" },
    { kode: 'CPL-P05', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan menjelaskan dasar logika, prinsip matematika, ekspresi, aspek modular, linearitas dan non-linearitas struktur data pada perangkat lunak" },
    { kode: 'CPL-P06', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan mengkaji dasar   hukum kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem" },
    { kode: 'CPL-P07', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan menjelaskan   konsep perencanaan strategis, resiko organisasi, serta kerangka kerja tata kelola sistem informasi" },
    { kode: 'CPL-P08', kategori: 'Pengetahuan', deskripsi: "Mampu memahami konsep, teknik pada manajemen proyek untuk memenuhi business requirement berdasarkan kriteria pengambilan keputusan" },
    { kode: 'CPL-P09', kategori: 'Pengetahuan', deskripsi: "Mampu memahami, mengidentifikasi, merekomendasikan kebutuhan bisnis terhadap dampak penggunaan teknologi di dalam masyarakat dan bisnis" },
    { kode: 'CPL-P10', kategori: 'Pengetahuan', deskripsi: "Mampu memahami permasalahan bisnis berdasarkan analisis data di dalam organisasi sebagai pendukung pengambilan keputusan" },
    { kode: 'CPL-P11', kategori: 'Pengetahuan', deskripsi: "Mampu memahami konsep, metode, teknik dan tahapan data mining serta visualisasi data sebagai pengetahuan yang berkaitan dengan teknologi informasi" },
    { kode: 'CPL-P12', kategori: 'Pengetahuan', deskripsi: "Mampu memahami fungsi dan bahasa pemrograman serta memperhatikan aspek keamanan pada aplikasi berbasis web di sisi client dan server" },
    { kode: 'CPL-P13', kategori: 'Pengetahuan', deskripsi: "Mampu memahami fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak" },
    { kode: 'CPL-P14', kategori: 'Pengetahuan', deskripsi: "Mampu memahami konsep, metode dan teknik dalam merancang UI/UX" },
    { kode: 'CPL-P15', kategori: 'Pengetahuan', deskripsi: "Mampu memahami dan melihat peluang inovasi digital untuk mengembangkan model bisnis digital yang baru" },
    { kode: 'CPL-P16', kategori: 'Pengetahuan', deskripsi: "Mampu memahami model sistem, metode dan berbagai teknik peningkatan bisnis proses yang mendatangkan suatu nilai untuk organisasi." },
    { kode: 'CPL-P17', kategori: 'Pengetahuan', deskripsi: "Memiliki pemahaman mengenai dasar-dasar bisnis dan pengetahuan pendukung lainnya yang berkaitan dengan teknologi informasi" }
  ];
  const snDiktiMap: Record<string, string> = {};
  for (const sn of snDiktiData) {
    const created = await prisma.cPLSnDikti.create({ data: { kurikulumId: kId, ...sn } });
    snDiktiMap[sn.kode] = created.id;
  }
  console.log('✅ 54 CPL SN-DIKTI (Sikap, KU, KK, P) diisi');

  // =============================================
  // 4. BAHAN KAJIAN (BK01-BK21)
  // =============================================
  const bkData = [
    { kode: 'BK01', nama: 'Foundation of Information Systems' },
    { kode: 'BK02', nama: 'Data / Information Management' },
    { kode: 'BK03', nama: 'Infrastructure' },
    { kode: 'BK04', nama: 'Project Management' },
    { kode: 'BK05', nama: 'Systems Analysis & Design' },
    { kode: 'BK06', nama: 'IS Management and Strategy' },
    { kode: 'BK07', nama: 'Application Development / Programming' },
    { kode: 'BK08', nama: 'Secure Computing' },
    { kode: 'BK09', nama: 'Ethics, Use and Implications for Society' },
    { kode: 'BK10', nama: 'Praktikum' },
    { kode: 'BK11', nama: 'Mathematics and Statistics' },
    { kode: 'BK12', nama: 'Data / Business Analytics' },
    { kode: 'BK13', nama: 'Personality Development' },
    { kode: 'BK14', nama: 'Business Process Management' },
    { kode: 'BK15', nama: 'Enterprise Architecture' },
    { kode: 'BK16', nama: 'User Interface Design' },
    { kode: 'BK17', nama: 'Digital Innovation' },
    { kode: 'BK18', nama: 'Visualisasi Informasi' },
    { kode: 'BK19', nama: 'Pemrograman Berorientasi Objek' },
    { kode: 'BK20', nama: 'Pemrograman Web' },
    { kode: 'BK21', nama: 'Pemrograman Mobile' }
  ];
  const bkMap: Record<string, string> = {};
  for (const bk of bkData) {
    const created = await prisma.bahanKajian.create({ data: { kurikulumId: kId, ...bk } });
    bkMap[bk.kode] = created.id;
  }
  console.log('✅ 21 Bahan Kajian (BK01-BK21) diisi');

  // =============================================
  // 5. MATA KULIAH (MK01-MK66) - LENGKAP 66 MK!
  // =============================================
  const mkData = [
    { kode: 'MK01', nama: 'AGAMA', sks: 3, semester: 1, tipe: 'MKWK' },
    { kode: 'MK02', nama: 'PANCASILA', sks: 2, semester: 1, tipe: 'MKWK' },
    { kode: 'MK03', nama: 'BAHASA INDONESIA', sks: 2, semester: 1, tipe: 'MKWK' },
    { kode: 'MK04', nama: 'PENGANTAR SISTEM INFORMASI', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK05', nama: 'ALGORITMA DAN PEMROGRAMAN', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK06', nama: 'LITERASI TIK', sks: 2, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK07', nama: 'MATEMATIKA DISKRIT', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK08', nama: 'ASWAJA', sks: 2, semester: 2, tipe: 'MKDU' },
    { kode: 'MK09', nama: 'KEWARGANEGARAAN', sks: 2, semester: 2, tipe: 'MKWK' },
    { kode: 'MK10', nama: 'LOGIKA DAN METODE BERFIKIR KRITIS', sks: 2, semester: 2, tipe: 'MKDU' },
    { kode: 'MK11', nama: 'MANAJEMEN DATA', sks: 2, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK12', nama: 'STRUKTUR DATA', sks: 2, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK13', nama: 'SISTEM OPERASI', sks: 2, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK14', nama: 'PENGANTAR MANAJEMEN', sks: 3, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK15', nama: 'MANAJEMEN PROSES BISNIS', sks: 3, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK16', nama: 'KEWIRAUSAHAAN', sks: 3, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK17', nama: 'PENGANTAR AKUNTANSI', sks: 3, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK18', nama: 'PEMROGRAMAN BERORIENTASI OBJEK', sks: 3, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK19', nama: 'ANALISIS DAN PERANCANGAN SISTEM INFORMASI', sks: 3, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK20', nama: 'DESAIN UI/UX', sks: 3, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK21', nama: 'SISTEM DAN MANAJEMEN BASIS DATA', sks: 4, semester: 3, tipe: 'WAJIB' },
    { kode: 'MK22', nama: 'PEMROGRAMAN WEB', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK23', nama: 'MANAJEMEN PROYEK SISTEM INFORMASI', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK24', nama: 'DATA SCIENCE', sks: 2, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK25', nama: 'SISTEM ENTERPRISE', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK26', nama: 'RINTISAN BISNIS DIGITAL', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK27', nama: 'DESAIN DAN MANAJEMEN JARINGAN KOMPUTER', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK28', nama: 'RISET OPERASI', sks: 3, semester: 4, tipe: 'WAJIB' },
    { kode: 'MK29', nama: 'PENGUJIAN PERANGKAT LUNAK', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK30', nama: 'MANAJEMEN INVESTASI TI', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK31', nama: 'PROTEKSI ASET INFORMASI', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK32', nama: 'DATA WAREHOUSE DAN DATA MINING', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK33', nama: 'TATA KELOLA TI', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK34', nama: 'CAPSTONE PROJECT', sks: 4, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK35', nama: 'STATISTIK', sks: 3, semester: 5, tipe: 'WAJIB' },
    { kode: 'MK36', nama: 'BAHASA INGGRIS', sks: 2, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK37', nama: 'PERENCANAAN STRATEGIS SI/TI', sks: 3, semester: 6, tipe: 'WAJIB' },
    { kode: 'MK38', nama: 'MANAJEMEN LAYANAN TI', sks: 3, semester: 6, tipe: 'WAJIB' },
    { kode: 'MK39', nama: 'ETIKA PROFESI', sks: 2, semester: 6, tipe: 'WAJIB' },
    { kode: 'MK40', nama: 'MAGANG', sks: 5, semester: 7, tipe: 'WAJIB' },
    { kode: 'MK41', nama: 'METODOLOGI PENELITIAN', sks: 3, semester: 7, tipe: 'WAJIB' },
    { kode: 'MK42', nama: 'KETERAMPILAN INTERPERSONAL', sks: 2, semester: 7, tipe: 'WAJIB' },
    { kode: 'MK43', nama: 'KULIAH KERJA NYATA', sks: 2, semester: 7, tipe: 'WAJIB' },
    { kode: 'MK44', nama: 'TUGAS AKHIR', sks: 6, semester: 8, tipe: 'WAJIB' },
    { kode: 'MK45', nama: 'TEKNOLOGI DAN MASYARAKAT', sks: 3, semester: 8, tipe: 'WAJIB' },
    { kode: 'MK46', nama: 'KULIAH LAPANGAN', sks: 2, semester: 8, tipe: 'WAJIB' },
    // MK Pilihan
    { kode: 'MK47', nama: 'PEMROGRAMAN MOBILE', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK48', nama: 'INTERNET UNTUK SEGALA', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK49', nama: 'TEKNOLOGI PEMROGRAMAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK50', nama: 'ARSITEKTUR TEKNOLOGI', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK51', nama: 'KOMPUTASI AWAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK52', nama: 'MANAJEMEN RISIKO TI', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK53', nama: 'MANAJEMEN PERUBAHAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK54', nama: 'PENGUKURAN KINERJA TI', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK55', nama: 'MANAJEMEN KEBERLANGSUNGAN BISNIS', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK56', nama: 'AUDIT SISTEM INFORMASI', sks: 3, semester: 6, tipe: 'PILIHAN' },
    { kode: 'MK57', nama: 'SISTEM PENDUKUNG KEPUTUSAN', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK58', nama: 'VISUALISASI INFORMASI', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK59', nama: 'SISTEM CERDAS', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK60', nama: 'TEKNIK PERAMALAN', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK61', nama: 'PENGOLAHAN CITRA', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK62', nama: 'MANAJEMEN MEREK DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK63', nama: 'PEMASARAN DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK64', nama: 'KREATIF DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
    { kode: 'MK65', nama: 'MANAJEMEN HUBUNGAN PELANGGAN', sks: 3, semester: 8, tipe: 'PILIHAN' },
    { kode: 'MK66', nama: 'MANAJEMEN RANTAI PASOK', sks: 3, semester: 8, tipe: 'PILIHAN' }
  ];
  const mkMap: Record<string, string> = {};
  for (const mk of mkData) {
    const created = await prisma.mataKuliah.create({ data: { kurikulumId: kId, ...mk } });
    mkMap[mk.kode] = created.id;
  }
  console.log('✅ 66 Mata Kuliah (MK01-MK66) diisi');

  // =============================================
  // 6. PEMETAAN PL ↔ CPL (dari Tabel 6 dokumen)
  // =============================================
  const plCplMap = {
    'PL1': ['CPL01','CPL02','CPL03','CPL04','CPL05','CPL06','CPL07'],
    'PL2': ['CPL01','CPL09'],
    'PL3': ['CPL01','CPL02','CPL08'],
    'PL4': ['CPL05','CPL10','CPL11'],
    'PL5': ['CPL05','CPL12','CPL13','CPL14']
  };
  let plCplCount = 0;
  for (const [plKode, cpls] of Object.entries(plCplMap)) {
    for (const cplKode of cpls) {
      if (plMap[plKode] && cplMap[cplKode]) {
        await prisma.pemetaanPLCPL.create({ data: { plId: plMap[plKode], cplId: cplMap[cplKode] } });
        plCplCount++;
      }
    }
  }
  console.log(`✅ ${plCplCount} Pemetaan PL ↔ CPL diisi`);

  // =============================================
  // 7. PEMETAAN CPL ↔ BK (dari Tabel 8 dokumen)
  // =============================================
  const cplBkMap = {
    'CPL01': ['BK01'],
    'CPL02': ['BK02','BK11'],
    'CPL03': ['BK05','BK07','BK19','BK20','BK21'],
    'CPL04': ['BK03','BK08'],
    'CPL05': ['BK09','BK13'],
    'CPL06': ['BK06','BK14','BK15'],
    'CPL07': ['BK04','BK10'],
    'CPL08': ['BK02','BK11','BK12','BK18'],
    'CPL09': ['BK14','BK17'],
    'CPL10': ['BK09','BK13'],
    'CPL11': ['BK09','BK13'],
    'CPL12': ['BK10','BK13'],
    'CPL13': ['BK10','BK13'],
    'CPL14': ['BK10']
  };
  let cplBkCount = 0;
  for (const [cplKode, bks] of Object.entries(cplBkMap)) {
    for (const bkKode of bks) {
      if (cplMap[cplKode] && bkMap[bkKode]) {
        await prisma.pemetaanCPLBK.create({ data: { cplId: cplMap[cplKode], bkId: bkMap[bkKode] } });
        cplBkCount++;
      }
    }
  }
  console.log(`✅ ${cplBkCount} Pemetaan CPL ↔ BK diisi`);

  // =============================================
  // 8. PEMETAAN BK ↔ MK (dari Tabel 9 dokumen)
  // =============================================
  const bkMkMap = {
    'BK01': ['MK04','MK06'],
    'BK02': ['MK11','MK21','MK24','MK32'],
    'BK03': ['MK06','MK13','MK27','MK48','MK51'],
    'BK04': ['MK23'],
    'BK05': ['MK19','MK20'],
    'BK06': ['MK14','MK17','MK30','MK33','MK37','MK38','MK52','MK53','MK54','MK55','MK56'],
    'BK07': ['MK05','MK12','MK18','MK22','MK29','MK47','MK48','MK49','MK57','MK59'],
    'BK08': ['MK31','MK48','MK52'],
    'BK09': ['MK01','MK02','MK09','MK39','MK40','MK43','MK46'],
    'BK10': ['MK34','MK40','MK43','MK44','MK45'],
    'BK11': ['MK07','MK10','MK11','MK24','MK28','MK35'],
    'BK12': ['MK24','MK32','MK57','MK58','MK59','MK60','MK61'],
    'BK13': ['MK01','MK08','MK09','MK42'],
    'BK14': ['MK15','MK25','MK65','MK66'],
    'BK15': ['MK25','MK50'],
    'BK16': ['MK20'],
    'BK17': ['MK16','MK18','MK26','MK62','MK63','MK64'],
    'BK18': ['MK32','MK58'],
    'BK19': ['MK18'],
    'BK20': ['MK22'],
    'BK21': ['MK47']
  };
  let bkMkCount = 0;
  for (const [bkKode, mks] of Object.entries(bkMkMap)) {
    for (const mkKode of mks) {
      if (bkMap[bkKode] && mkMap[mkKode]) {
        await prisma.pemetaanBKMK.create({ data: { bkId: bkMap[bkKode], mkId: mkMap[mkKode] } });
        bkMkCount++;
      }
    }
  }
  console.log(`✅ ${bkMkCount} Pemetaan BK ↔ MK diisi`);

  // =============================================
  // 9. PEMETAAN CPL ↔ MK (dari Tabel 9a dokumen)
  // =============================================
  const cplMkMap = {
    'CPL01': ['MK04','MK06'],
    'CPL02': ['MK07','MK10','MK11','MK21','MK32'],
    'CPL03': ['MK05','MK12','MK18','MK19','MK20','MK22','MK29','MK34','MK47','MK49'],
    'CPL04': ['MK06','MK13','MK27','MK31','MK48','MK50','MK51'],
    'CPL05': ['MK39','MK40','MK42','MK43','MK44','MK45','MK46'],
    'CPL06': ['MK14','MK30','MK33','MK37','MK38','MK52','MK53','MK54','MK55','MK56'],
    'CPL07': ['MK23','MK34','MK40','MK43','MK44','MK45'],
    'CPL08': ['MK11','MK24','MK28','MK32','MK35','MK57','MK58','MK59','MK60','MK61'],
    'CPL09': ['MK15','MK16','MK17','MK25','MK26','MK62','MK63','MK64','MK65','MK66'],
    'CPL10': ['MK01','MK02','MK08','MK09','MK42'],
    'CPL11': ['MK02','MK09','MK16','MK42'],
    'CPL12': ['MK10','MK40','MK43','MK44'],
    'CPL13': ['MK03','MK36','MK40','MK41','MK43','MK44','MK45','MK46'],
    'CPL14': ['MK40','MK43','MK44']
  };
  let cplMkCount = 0;
  for (const [cplKode, mks] of Object.entries(cplMkMap)) {
    for (const mkKode of mks) {
      if (cplMap[cplKode] && mkMap[mkKode]) {
        await prisma.pemetaanCPLMK.create({ data: { cplId: cplMap[cplKode], mkId: mkMap[mkKode] } });
        cplMkCount++;
      }
    }
  }
  console.log(`✅ ${cplMkCount} Pemetaan CPL ↔ MK diisi`);

  // =============================================
  // 10. CPMK (dari Tabel 14 dokumen)
  // =============================================
  const cpmkData = [
    { cplKode: 'CPL01', kode: 'CPMK011', deskripsi: 'Mampu memahami konsep dasar sistem informasi' },
    { cplKode: 'CPL01', kode: 'CPMK012', deskripsi: 'Mampu menilai peran sistem informasi dalam memberikan rekomendasi pengambilan keputusan di organisasi' },
    { cplKode: 'CPL02', kode: 'CPMK021', deskripsi: 'Mampu merancang dan menggunakan database' },
    { cplKode: 'CPL02', kode: 'CPMK022', deskripsi: 'Mampu mengolah dan menganalisa data dengan alat dan teknik pengolahan data' },
    { cplKode: 'CPL03', kode: 'CPMK031', deskripsi: 'Mampu menggunakan berbagai metodologi pengembangan sistem' },
    { cplKode: 'CPL03', kode: 'CPMK032', deskripsi: 'Mampu menggunakan berbagai alat pemodelan sistem' },
    { cplKode: 'CPL03', kode: 'CPMK033', deskripsi: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi' },
    { cplKode: 'CPL04', kode: 'CPMK041', deskripsi: 'Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud' },
    { cplKode: 'CPL04', kode: 'CPMK042', deskripsi: 'Mampu menganalisa konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat' },
    { cplKode: 'CPL05', kode: 'CPMK051', deskripsi: 'Mampu memahami kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem' },
    { cplKode: 'CPL05', kode: 'CPMK052', deskripsi: 'Mampu menerapkan kode etik dalam penggunaan informasi dan data pada perancangan, implementasi, dan penggunaan suatu sistem' },
    { cplKode: 'CPL06', kode: 'CPMK061', deskripsi: 'Mampu merencanakan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi jangka pendek maupun jangka panjang' },
    { cplKode: 'CPL06', kode: 'CPMK062', deskripsi: 'Mampu menerapkan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi' },
    { cplKode: 'CPL06', kode: 'CPMK063', deskripsi: 'Mampu memelihara sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi' },
    { cplKode: 'CPL06', kode: 'CPMK064', deskripsi: 'Mampu meningkatkan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi' },
    { cplKode: 'CPL07', kode: 'CPMK071', deskripsi: 'Mampu memahami konsep, teknik dan metodologi manajemen proyek sistem informasi' },
    { cplKode: 'CPL07', kode: 'CPMK072', deskripsi: 'Mampu mengidentifikasi konsep, teknik dan metodologi manajemen proyek sistem informasi' },
    { cplKode: 'CPL07', kode: 'CPMK073', deskripsi: 'Mampu menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi' },
    { cplKode: 'CPL08', kode: 'CPMK081', deskripsi: 'Mampu memahami konsep, metode, teknik, dan tahapan data mining serta visualisasi data' },
    { cplKode: 'CPL08', kode: 'CPMK082', deskripsi: 'Mampu menerapkan data mining serta visualisasi data dalam pengolahan, pengorganisasian, dan penyajian informasi' },
    { cplKode: 'CPL09', kode: 'CPMK091', deskripsi: 'Mampu memahami model sistem, metode dan berbagai teknik peningkatan bisnis proses dan inovasi digital' },
    { cplKode: 'CPL09', kode: 'CPMK092', deskripsi: 'Mampu menerapkan model sistem, metode dan berbagai teknik peningkatan bisnis proses dan inovasi digital' },
    { cplKode: 'CPL10', kode: 'CPMK101', deskripsi: 'Mampu menunjukkan sikap berjati diri islami berlandaskan nilai ahlus sunah waljamahah' },
    { cplKode: 'CPL10', kode: 'CPMK102', deskripsi: 'Mampu menunjukkan sikap profesionalitas, integritas, komunikasi, kepemimpinan, dan tanggung jawab' },
    { cplKode: 'CPL11', kode: 'CPMK111', deskripsi: 'Mampu menunjukkan sikap taat hukum dan disiplin melalui internalisasi nilai, norma, dan etika akademik' },
    { cplKode: 'CPL11', kode: 'CPMK112', deskripsi: 'Mampu menunjukkan sikap menghargai keanekaragaman dan semangat kemandirian' },
    { cplKode: 'CPL12', kode: 'CPMK121', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur dalam mengembangkan ilmu pengetahuan' },
    { cplKode: 'CPL12', kode: 'CPMK122', deskripsi: 'Mampu berfikir logis, kritis, sistematis, dan inovatif dalam mengembangkan ilmu pengetahuan' },
    { cplKode: 'CPL13', kode: 'CPMK131', deskripsi: 'Mampu mengkaji implikasi pengembangan ilmu pengetahuan dalam rangka menghasilkan solusi' },
    { cplKode: 'CPL13', kode: 'CPMK132', deskripsi: 'Mampu menyusun deskripsi saintifik hasil kajian dalam bentuk laporan ilmiah yang sahih' },
    { cplKode: 'CPL13', kode: 'CPMK133', deskripsi: 'Mampu memelihara serta mengembangkan jaringan kerja dengan pembimbing, kolega, dan sejawat' },
    { cplKode: 'CPL14', kode: 'CPMK141', deskripsi: 'Mampu melakukan evaluasi diri terhadap penyelesaian pekerjaan sebagai wujud tanggung jawab' },
    { cplKode: 'CPL14', kode: 'CPMK142', deskripsi: 'Mampu melakukan supervisi terhadap penyelesaian pekerjaan sebagai wujud tanggung jawab atas pencapaian hasil kelompok kerja' }
  ];
  const cpmkMap: Record<string, string> = {};
  for (const c of cpmkData) {
    if (cplMap[c.cplKode]) {
      const created = await prisma.cPMK.create({ data: { cplId: cplMap[c.cplKode], kode: c.kode, deskripsi: c.deskripsi } });
      cpmkMap[c.kode] = created.id;
    }
  }
  console.log(`✅ ${cpmkData.length} CPMK diisi`);

  // =============================================
  // 11. PEMETAAN SN-DIKTI ↔ CPL PRODI
  // =============================================
  const snDiktiCplMap: Record<string, string[]> = {
    'CPL-S01': ['CPL10'], 'CPL-S02': ['CPL10'], 'CPL-S03': ['CPL10'],
    'CPL-S04': ['CPL10'], 'CPL-S05': ['CPL11'], 'CPL-S06': ['CPL10'],
    'CPL-S07': ['CPL11'], 'CPL-S08': ['CPL11'], 'CPL-S09': ['CPL10'],
    'CPL-S10': ['CPL11'], 'CPL-S11': ['CPL10'],
    'CPL-KU01': ['CPL12'], 'CPL-KU02': ['CPL12'], 'CPL-KU03': ['CPL13'],
    'CPL-KU04': ['CPL13'], 'CPL-KU05': ['CPL13'], 'CPL-KU06': ['CPL13'],
    'CPL-KU07': ['CPL14'], 'CPL-KU08': ['CPL14'], 'CPL-KU09': ['CPL13'],
    'CPL-KU10': ['CPL12'],
    'CPL-KK01': ['CPL02'], 'CPL-KK02': ['CPL04'], 'CPL-KK03': ['CPL03'],
    'CPL-KK04': ['CPL03'], 'CPL-KK05': ['CPL05'], 'CPL-KK06': ['CPL06'],
    'CPL-KK07': ['CPL06'], 'CPL-KK08': ['CPL07'], 'CPL-KK09': ['CPL03'],
    'CPL-KK10': ['CPL03'], 'CPL-KK11': ['CPL03'], 'CPL-KK12': ['CPL03'],
    'CPL-KK13': ['CPL08'], 'CPL-KK14': ['CPL06'], 'CPL-KK15': ['CPL09'],
    'CPL-KK16': ['CPL08'],
    'CPL-P01': ['CPL01'], 'CPL-P02': ['CPL02'], 'CPL-P03': ['CPL04'],
    'CPL-P04': ['CPL03'], 'CPL-P05': ['CPL03'], 'CPL-P06': ['CPL05'],
    'CPL-P07': ['CPL06'], 'CPL-P08': ['CPL07'], 'CPL-P09': ['CPL09'],
    'CPL-P10': ['CPL08'], 'CPL-P11': ['CPL08'], 'CPL-P12': ['CPL03'],
    'CPL-P13': ['CPL03'], 'CPL-P14': ['CPL03'], 'CPL-P15': ['CPL09'],
    'CPL-P16': ['CPL09'], 'CPL-P17': ['CPL09']
  };
  let snCplCount = 0;
  for (const [snKode, cpls] of Object.entries(snDiktiCplMap)) {
    for (const cplKode of cpls) {
      if (snDiktiMap[snKode] && cplMap[cplKode]) {
        await prisma.pemetaanSnDiktiCPLProdi.create({ data: { snDiktiId: snDiktiMap[snKode], cplId: cplMap[cplKode] } });
        snCplCount++;
      }
    }
  }
  console.log(`✅ ${snCplCount} Pemetaan SN-DIKTI ↔ CPL Prodi diisi`);

  // =============================================
  // 12. PEMETAAN MK ↔ CPMK
  // =============================================
  const mkCpmkMapData: Record<string, string[]> = {
    'CPMK011': ['MK04', 'MK06'],
    'CPMK012': ['MK04'],
    'CPMK021': ['MK21', 'MK32'],
    'CPMK022': ['MK07', 'MK10', 'MK11', 'MK12', 'MK21', 'MK32'],
    'CPMK031': ['MK19', 'MK29', 'MK34'],
    'CPMK032': ['MK05', 'MK12', 'MK18', 'MK19', 'MK20', 'MK22', 'MK29', 'MK34', 'MK47', 'MK49'],
    'CPMK033': ['MK19', 'MK22', 'MK34'],
    'CPMK041': ['MK06', 'MK13', 'MK27', 'MK48', 'MK50', 'MK51'],
    'CPMK042': ['MK31', 'MK48'],
    'CPMK051': ['MK39', 'MK42'],
    'CPMK052': ['MK39', 'MK40', 'MK42', 'MK43', 'MK44', 'MK45', 'MK46'],
    'CPMK061': ['MK14', 'MK30', 'MK33', 'MK37', 'MK38', 'MK52', 'MK53', 'MK54', 'MK55', 'MK56'],
    'CPMK062': ['MK30', 'MK33', 'MK37', 'MK38', 'MK52', 'MK53', 'MK54', 'MK55', 'MK56'],
    'CPMK063': ['MK30', 'MK33', 'MK38', 'MK52', 'MK53', 'MK54', 'MK55', 'MK56'],
    'CPMK064': ['MK54', 'MK55', 'MK56'],
    'CPMK071': ['MK23'],
    'CPMK072': ['MK23'],
    'CPMK073': ['MK23', 'MK34', 'MK40', 'MK43', 'MK44', 'MK45'],
    'CPMK081': ['MK11', 'MK21', 'MK24', 'MK28', 'MK32', 'MK35'],
    'CPMK082': ['MK32', 'MK57', 'MK58', 'MK59', 'MK60', 'MK61'],
    'CPMK091': ['MK15', 'MK16', 'MK17', 'MK25', 'MK26'],
    'CPMK092': ['MK15', 'MK25', 'MK26', 'MK62', 'MK63', 'MK64', 'MK65', 'MK66'],
    'CPMK101': ['MK01', 'MK08'],
    'CPMK102': ['MK02', 'MK09', 'MK42'],
    'CPMK111': ['MK02', 'MK09', 'MK16', 'MK42'],
    'CPMK112': ['MK42'],
    'CPMK121': ['MK40', 'MK43', 'MK44'],
    'CPMK122': ['MK10', 'MK40', 'MK43', 'MK44'],
    'CPMK131': ['MK40', 'MK41', 'MK43', 'MK44', 'MK45', 'MK46'],
    'CPMK132': ['MK03', 'MK36', 'MK40', 'MK41', 'MK43', 'MK44', 'MK45', 'MK46'],
    'CPMK133': ['MK40', 'MK43', 'MK44', 'MK45', 'MK46'],
    'CPMK141': ['MK40', 'MK43', 'MK44'],
    'CPMK142': ['MK40', 'MK43', 'MK44']
  };
  let mkCpmkCount = 0;
  for (const [cpmkKode, mks] of Object.entries(mkCpmkMapData)) {
    for (const mkKode of mks) {
      if (cpmkMap[cpmkKode] && mkMap[mkKode]) {
        await prisma.pemetaanMKCPMK.create({ data: { mkId: mkMap[mkKode], cpmkId: cpmkMap[cpmkKode] } });
        mkCpmkCount++;
      }
    }
  }
  console.log(`✅ ${mkCpmkCount} Pemetaan MK ↔ CPMK diisi`);

  // =============================================
  // 13. BUAT KELAS & ASSIGN KE DOSEN
  // =============================================
  const dosenId = userMap['dosen'];
  const kelasData = [
    { mkKode: 'MK04', nama: 'SI-44-01', tahunAjaran: '2024/2025', semester: 'Ganjil' },
    { mkKode: 'MK05', nama: 'SI-44-02', tahunAjaran: '2024/2025', semester: 'Ganjil' },
    { mkKode: 'MK11', nama: 'SI-44-03', tahunAjaran: '2024/2025', semester: 'Genap' },
    { mkKode: 'MK19', nama: 'SI-44-04', tahunAjaran: '2024/2025', semester: 'Ganjil' },
    { mkKode: 'MK22', nama: 'SI-44-05', tahunAjaran: '2024/2025', semester: 'Genap' },
    // Additional kelas so CPL04-CPL14 all have assessment data
    { mkKode: 'MK27', nama: 'SI-44-06', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL04 - Desain & Manajemen Jaringan
    { mkKode: 'MK39', nama: 'SI-44-07', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL05 - Etika Profesi
    { mkKode: 'MK33', nama: 'SI-44-08', tahunAjaran: '2024/2025', semester: 'Ganjil' },  // CPL06 - Tata Kelola TI
    { mkKode: 'MK23', nama: 'SI-44-09', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL07 - Manajemen Proyek SI
    { mkKode: 'MK15', nama: 'SI-44-10', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL09 - Manajemen Proses Bisnis
    { mkKode: 'MK01', nama: 'SI-44-11', tahunAjaran: '2024/2025', semester: 'Ganjil' },  // CPL10 - Agama
    { mkKode: 'MK09', nama: 'SI-44-12', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL11 - Kewarganegaraan
    { mkKode: 'MK10', nama: 'SI-44-13', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL12 - Logika & Berpikir Kritis
    { mkKode: 'MK41', nama: 'SI-44-14', tahunAjaran: '2024/2025', semester: 'Ganjil' },  // CPL13 - Metodologi Penelitian
    { mkKode: 'MK44', nama: 'SI-44-15', tahunAjaran: '2024/2025', semester: 'Genap' },   // CPL14 - Tugas Akhir
  ];
  const kelasMap: Record<string, string> = {};
  let kelasCount = 0;
  for (const k of kelasData) {
    if (mkMap[k.mkKode]) {
      const created = await prisma.kelas.create({
        data: {
          mkId: mkMap[k.mkKode],
          nama: k.nama,
          tahunAjaran: k.tahunAjaran,
          semester: k.semester,
          dosenId: dosenId
        }
      });
      kelasMap[k.nama] = created.id;
      kelasCount++;
    }
  }
  console.log(`✅ ${kelasCount} Kelas dibuat dan di-assign ke dosen`);

  // =============================================
  // 14. SUB-CPMK (Sub Capaian Pembelajaran MK)
  // =============================================
  const subCpmkData = [
    // CPL01 → CPMK011, CPMK012
    { cpmkKode: 'CPMK011', kode: 'L011-1', deskripsi: 'Mampu menjelaskan komponen utama sistem informasi' },
    { cpmkKode: 'CPMK011', kode: 'L011-2', deskripsi: 'Mampu mengidentifikasi jenis-jenis sistem informasi dalam organisasi' },
    { cpmkKode: 'CPMK012', kode: 'L012-1', deskripsi: 'Mampu menganalisis peran SI dalam pengambilan keputusan manajerial' },
    // CPL02 → CPMK021, CPMK022
    { cpmkKode: 'CPMK021', kode: 'L021-1', deskripsi: 'Mampu merancang skema database relasional yang ternormalisasi' },
    { cpmkKode: 'CPMK021', kode: 'L021-2', deskripsi: 'Mampu mengimplementasikan query SQL untuk manipulasi data' },
    { cpmkKode: 'CPMK022', kode: 'L022-1', deskripsi: 'Mampu mengolah data menggunakan teknik agregasi dan filtering' },
    // CPL03 → CPMK031, CPMK032, CPMK033
    { cpmkKode: 'CPMK031', kode: 'L031-1', deskripsi: 'Mampu membandingkan metodologi SDLC, Agile, dan Prototyping' },
    { cpmkKode: 'CPMK032', kode: 'L032-1', deskripsi: 'Mampu membuat diagram UML (use case, activity, class)' },
    { cpmkKode: 'CPMK032', kode: 'L032-2', deskripsi: 'Mampu membuat diagram alur data (DFD) level 0 dan 1' },
    { cpmkKode: 'CPMK033', kode: 'L033-1', deskripsi: 'Mampu melakukan analisis kebutuhan fungsional dan non-fungsional' },
    // CPL04 → CPMK041, CPMK042
    { cpmkKode: 'CPMK041', kode: 'L041-1', deskripsi: 'Mampu merancang arsitektur jaringan komputer dan infrastruktur TI' },
    { cpmkKode: 'CPMK041', kode: 'L041-2', deskripsi: 'Mampu merencanakan layanan cloud computing untuk organisasi' },
    { cpmkKode: 'CPMK042', kode: 'L042-1', deskripsi: 'Mampu menganalisa mekanisme otentikasi dan otorisasi akses sistem' },
    // CPL05 → CPMK051, CPMK052
    { cpmkKode: 'CPMK051', kode: 'L051-1', deskripsi: 'Mampu menjelaskan prinsip-prinsip etika profesi di bidang TI' },
    { cpmkKode: 'CPMK051', kode: 'L051-2', deskripsi: 'Mampu mengidentifikasi pelanggaran etika dalam penggunaan data' },
    { cpmkKode: 'CPMK052', kode: 'L052-1', deskripsi: 'Mampu menerapkan kode etik dalam perancangan dan implementasi sistem' },
    // CPL06 → CPMK061, CPMK062, CPMK063, CPMK064
    { cpmkKode: 'CPMK061', kode: 'L061-1', deskripsi: 'Mampu merencanakan tata kelola TI sesuai kerangka kerja standar' },
    { cpmkKode: 'CPMK062', kode: 'L062-1', deskripsi: 'Mampu menerapkan framework tata kelola TI dalam organisasi' },
    { cpmkKode: 'CPMK063', kode: 'L063-1', deskripsi: 'Mampu memelihara dan memonitor kinerja sistem informasi organisasi' },
    // CPL07 → CPMK071, CPMK072, CPMK073
    { cpmkKode: 'CPMK071', kode: 'L071-1', deskripsi: 'Mampu menjelaskan konsep PMBOK dan area pengetahuan manajemen proyek' },
    { cpmkKode: 'CPMK072', kode: 'L072-1', deskripsi: 'Mampu mengidentifikasi risiko dan stakeholder dalam proyek SI' },
    { cpmkKode: 'CPMK073', kode: 'L073-1', deskripsi: 'Mampu membuat WBS dan jadwal proyek menggunakan Gantt chart' },
    // CPL08 → CPMK081, CPMK082
    { cpmkKode: 'CPMK081', kode: 'L081-1', deskripsi: 'Mampu menjelaskan tahapan KDD dan teknik data mining' },
    { cpmkKode: 'CPMK082', kode: 'L082-1', deskripsi: 'Mampu menerapkan teknik klasifikasi dan klasterisasi pada dataset' },
    { cpmkKode: 'CPMK082', kode: 'L082-2', deskripsi: 'Mampu membuat visualisasi data yang informatif menggunakan tools BI' },
    // CPL09 → CPMK091, CPMK092
    { cpmkKode: 'CPMK091', kode: 'L091-1', deskripsi: 'Mampu memahami model bisnis proses dan teknik peningkatan proses' },
    { cpmkKode: 'CPMK091', kode: 'L091-2', deskripsi: 'Mampu mengidentifikasi peluang inovasi digital dalam pengelolaan bisnis' },
    { cpmkKode: 'CPMK092', kode: 'L092-1', deskripsi: 'Mampu menerapkan teknik peningkatan bisnis proses menggunakan teknologi' },
    // CPL10 → CPMK101, CPMK102
    { cpmkKode: 'CPMK101', kode: 'L101-1', deskripsi: 'Mampu menunjukkan sikap religius dan berjati diri islami berlandaskan Aswaja' },
    { cpmkKode: 'CPMK101', kode: 'L101-2', deskripsi: 'Mampu mengintegrasikan nilai-nilai keislaman dalam kehidupan sehari-hari' },
    { cpmkKode: 'CPMK102', kode: 'L102-1', deskripsi: 'Mampu menunjukkan sikap profesionalitas dan integritas dalam berinteraksi' },
    // CPL11 → CPMK111, CPMK112
    { cpmkKode: 'CPMK111', kode: 'L111-1', deskripsi: 'Mampu menunjukkan sikap taat hukum dan disiplin sebagai warga negara' },
    { cpmkKode: 'CPMK111', kode: 'L111-2', deskripsi: 'Mampu menginternalisasi nilai, norma, dan etika akademik' },
    { cpmkKode: 'CPMK112', kode: 'L112-1', deskripsi: 'Mampu menghargai keanekaragaman dan menunjukkan semangat kemandirian' },
    // CPL12 → CPMK121, CPMK122
    { cpmkKode: 'CPMK121', kode: 'L121-1', deskripsi: 'Mampu menunjukkan kinerja mandiri dan bermutu dalam penyelesaian tugas' },
    { cpmkKode: 'CPMK121', kode: 'L121-2', deskripsi: 'Mampu menunjukkan kinerja yang terukur sesuai standar akademik' },
    { cpmkKode: 'CPMK122', kode: 'L122-1', deskripsi: 'Mampu berfikir logis, kritis, dan sistematis dalam memecahkan masalah' },
    // CPL13 → CPMK131, CPMK132, CPMK133
    { cpmkKode: 'CPMK131', kode: 'L131-1', deskripsi: 'Mampu mengkaji implikasi pengembangan ilmu pengetahuan dan teknologi' },
    { cpmkKode: 'CPMK132', kode: 'L132-1', deskripsi: 'Mampu menyusun deskripsi saintifik dalam bentuk laporan ilmiah yang sahih' },
    { cpmkKode: 'CPMK133', kode: 'L133-1', deskripsi: 'Mampu memelihara dan mengembangkan jaringan kerja akademik dan profesional' },
    // CPL14 → CPMK141, CPMK142
    { cpmkKode: 'CPMK141', kode: 'L141-1', deskripsi: 'Mampu melakukan evaluasi diri terhadap pencapaian hasil pekerjaan' },
    { cpmkKode: 'CPMK141', kode: 'L141-2', deskripsi: 'Mampu mengidentifikasi area perbaikan dari hasil evaluasi diri' },
    { cpmkKode: 'CPMK142', kode: 'L142-1', deskripsi: 'Mampu melakukan supervisi terhadap penyelesaian pekerjaan kelompok kerja' },
  ];
  const subCpmkMap: Record<string, string> = {};
  let subCpmkCount = 0;
  for (const sc of subCpmkData) {
    if (cpmkMap[sc.cpmkKode]) {
      const created = await prisma.subCPMK.create({
        data: { cpmkId: cpmkMap[sc.cpmkKode], kode: sc.kode, deskripsi: sc.deskripsi }
      });
      subCpmkMap[sc.kode] = created.id;
      subCpmkCount++;
    }
  }
  console.log(`✅ ${subCpmkCount} Sub-CPMK diisi`);

  // =============================================
  // 15. MAHASISWA (10 students)
  // =============================================
  const mahasiswaData = [
    { nim: '120220001', nama: 'Ahmad Fauzi', angkatan: 2022 },
    { nim: '120220002', nama: 'Budi Santoso', angkatan: 2022 },
    { nim: '120220003', nama: 'Citra Dewi', angkatan: 2022 },
    { nim: '120220004', nama: 'Dian Pratama', angkatan: 2022 },
    { nim: '120220005', nama: 'Eka Putri', angkatan: 2022 },
    { nim: '120220006', nama: 'Fajar Nugroho', angkatan: 2022 },
    { nim: '120220007', nama: 'Gita Lestari', angkatan: 2022 },
    { nim: '120220008', nama: 'Hadi Wijaya', angkatan: 2022 },
    { nim: '120220009', nama: 'Indah Sari', angkatan: 2022 },
    { nim: '120220010', nama: 'Joko Susilo', angkatan: 2022 },
  ];
  const mhsMap: Record<string, string> = {};
  for (const m of mahasiswaData) {
    const created = await prisma.mahasiswa.create({ data: m });
    mhsMap[m.nim] = created.id;
  }
  console.log(`✅ ${mahasiswaData.length} Mahasiswa diisi`);

  // =============================================
  // 16. KELAS ENROLLMENT (enroll students in classes)
  // =============================================
  // Each kelas gets ~6 students from the pool of 10
  const enrollmentPlan: Record<string, string[]> = {
    'SI-44-01': ['120220001','120220002','120220003','120220004','120220005','120220006'],
    'SI-44-02': ['120220002','120220003','120220004','120220005','120220006','120220007'],
    'SI-44-03': ['120220003','120220004','120220005','120220006','120220007','120220008'],
    'SI-44-04': ['120220004','120220005','120220006','120220007','120220008','120220009'],
    'SI-44-05': ['120220005','120220006','120220007','120220008','120220009','120220010'],
    // Additional kelas for CPL04-CPL14
    'SI-44-06': ['120220001','120220003','120220005','120220007','120220009','120220010'],
    'SI-44-07': ['120220002','120220004','120220006','120220008','120220010','120220001'],
    'SI-44-08': ['120220001','120220002','120220003','120220004','120220005','120220006'],
    'SI-44-09': ['120220003','120220005','120220007','120220009','120220001','120220002'],
    'SI-44-10': ['120220002','120220004','120220006','120220008','120220010','120220001'],
    'SI-44-11': ['120220001','120220003','120220005','120220007','120220009','120220002'],
    'SI-44-12': ['120220004','120220006','120220008','120220010','120220001','120220003'],
    'SI-44-13': ['120220005','120220007','120220009','120220001','120220003','120220002'],
    'SI-44-14': ['120220006','120220008','120220010','120220002','120220004','120220001'],
    'SI-44-15': ['120220007','120220009','120220001','120220003','120220005','120220006'],
  };
  let enrollCount = 0;
  for (const [kelasNama, nims] of Object.entries(enrollmentPlan)) {
    if (kelasMap[kelasNama]) {
      for (const nim of nims) {
        if (mhsMap[nim]) {
          await prisma.kelasEnrollment.create({
            data: { kelasId: kelasMap[kelasNama], mahasiswaId: mhsMap[nim] }
          });
          enrollCount++;
        }
      }
    }
  }
  console.log(`✅ ${enrollCount} Kelas Enrollment diisi`);

  // =============================================
  // 17. RPS PERTEMUAN (8 pertemuan × 5 kelas)
  // =============================================
  const rpsKelasNames = ['SI-44-01', 'SI-44-02', 'SI-44-03', 'SI-44-04', 'SI-44-05',
    'SI-44-06', 'SI-44-07', 'SI-44-08', 'SI-44-09', 'SI-44-10',
    'SI-44-11', 'SI-44-12', 'SI-44-13', 'SI-44-14', 'SI-44-15'];
  // Sub-CPMK keys grouped by kelas topic area
  const rpsSubCpmkMapping: Record<string, string[]> = {
    'SI-44-01': ['L011-1','L011-2','L012-1','L011-1','L011-2','L012-1','L011-1','L012-1'],  // Pengantar SI
    'SI-44-02': ['L032-1','L032-2','L031-1','L032-1','L032-2','L031-1','L032-1','L032-2'],  // Algoritma
    'SI-44-03': ['L021-1','L021-2','L022-1','L021-1','L021-2','L022-1','L021-1','L022-1'],  // Manajemen Data
    'SI-44-04': ['L033-1','L032-1','L032-2','L031-1','L033-1','L032-1','L032-2','L033-1'],  // APSI
    'SI-44-05': ['L071-1','L073-1','L081-1','L082-1','L071-1','L073-1','L081-1','L082-1'],  // Pemrograman Web
    'SI-44-06': ['L041-1','L041-2','L042-1','L041-1','L041-2','L042-1','L041-1','L042-1'],  // CPL04 - Jaringan
    'SI-44-07': ['L051-1','L051-2','L052-1','L051-1','L051-2','L052-1','L051-1','L052-1'],  // CPL05 - Etika
    'SI-44-08': ['L061-1','L062-1','L063-1','L061-1','L062-1','L063-1','L061-1','L063-1'],  // CPL06 - Tata Kelola
    'SI-44-09': ['L071-1','L072-1','L073-1','L071-1','L072-1','L073-1','L071-1','L073-1'],  // CPL07 - Manpro
    'SI-44-10': ['L091-1','L091-2','L092-1','L091-1','L091-2','L092-1','L091-1','L092-1'],  // CPL09 - Bisnis
    'SI-44-11': ['L101-1','L101-2','L102-1','L101-1','L101-2','L102-1','L101-1','L102-1'],  // CPL10 - Agama
    'SI-44-12': ['L111-1','L111-2','L112-1','L111-1','L111-2','L112-1','L111-1','L112-1'],  // CPL11 - Kwn
    'SI-44-13': ['L121-1','L121-2','L122-1','L121-1','L121-2','L122-1','L121-1','L122-1'],  // CPL12 - Logika
    'SI-44-14': ['L131-1','L132-1','L133-1','L131-1','L132-1','L133-1','L131-1','L133-1'],  // CPL13 - Metpen
    'SI-44-15': ['L141-1','L141-2','L142-1','L141-1','L141-2','L142-1','L141-1','L142-1'],  // CPL14 - TA
  };
  const rpsMateri = [
    'Pengantar dan kontrak perkuliahan',
    'Konsep dasar dan terminologi',
    'Analisis komponen utama',
    'Teknik dan metodologi',
    'Studi kasus dan praktik',
    'Implementasi dan pengujian',
    'Review dan evaluasi tengah semester',
    'Proyek akhir dan presentasi',
  ];
  const rpsMetode = ['Ceramah','Diskusi','Praktikum','Project-Based Learning','Case Study','Diskusi','Ceramah','Presentasi'];
  const rpsWaktu = ['2 × 50 menit','2 × 50 menit','3 × 50 menit','3 × 50 menit','2 × 50 menit','3 × 50 menit','2 × 50 menit','3 × 50 menit'];

  let rpsCount = 0;
  for (const kelasNama of rpsKelasNames) {
    if (kelasMap[kelasNama]) {
      const subCpmkKeys = rpsSubCpmkMapping[kelasNama];
      for (let i = 0; i < 8; i++) {
        await prisma.rPSPertemuan.create({
          data: {
            kelasId: kelasMap[kelasNama],
            mingguKe: i + 1,
            materi: rpsMateri[i],
            metode: rpsMetode[i],
            waktu: rpsWaktu[i],
            subCpmkId: subCpmkMap[subCpmkKeys[i]] || null
          }
        });
        rpsCount++;
      }
    }
  }
  console.log(`✅ ${rpsCount} RPS Pertemuan diisi (5 kelas × 8 minggu)`);

  // =============================================
  // 18. ASESMEN (3 per kelas: UTS 30%, UAS 40%, Tugas 30%)
  // =============================================
  const asesmenTemplate = [
    { nama: 'UTS', bobot: 30 },
    { nama: 'UAS', bobot: 40 },
    { nama: 'Tugas 1', bobot: 30 },
  ];
  const asesmenMap: Record<string, string> = {}; // key: "kelasNama-asesmenNama"
  let asesmenCount = 0;
  for (const [kelasNama, kelasId] of Object.entries(kelasMap)) {
    for (const tmpl of asesmenTemplate) {
      const created = await prisma.asesmen.create({
        data: { kelasId, nama: tmpl.nama, bobot: tmpl.bobot }
      });
      asesmenMap[`${kelasNama}-${tmpl.nama}`] = created.id;
      asesmenCount++;
    }
  }
  console.log(`✅ ${asesmenCount} Asesmen diisi (3 per kelas)`);

  // =============================================
  // 19. ASESMEN SOAL (2 soal per asesmen, mapped to SubCPMK)
  // =============================================
  // Assign SubCPMK to soal per kelas
  const soalSubCpmkMapping: Record<string, string[]> = {
    'SI-44-01': ['L011-1','L011-2','L012-1','L011-1','L011-2','L012-1'],
    'SI-44-02': ['L032-1','L032-2','L031-1','L032-1','L032-2','L031-1'],
    'SI-44-03': ['L021-1','L021-2','L022-1','L021-1','L021-2','L022-1'],
    'SI-44-04': ['L033-1','L032-1','L032-2','L031-1','L033-1','L032-1'],
    'SI-44-05': ['L082-1','L082-2','L081-1','L082-1','L082-2','L081-1'],
    // Additional kelas for CPL04-CPL14
    'SI-44-06': ['L041-1','L041-2','L042-1','L041-1','L041-2','L042-1'],  // CPL04
    'SI-44-07': ['L051-1','L051-2','L052-1','L051-1','L051-2','L052-1'],  // CPL05
    'SI-44-08': ['L061-1','L062-1','L063-1','L061-1','L062-1','L063-1'],  // CPL06
    'SI-44-09': ['L071-1','L072-1','L073-1','L071-1','L072-1','L073-1'],  // CPL07
    'SI-44-10': ['L091-1','L091-2','L092-1','L091-1','L091-2','L092-1'],  // CPL09
    'SI-44-11': ['L101-1','L101-2','L102-1','L101-1','L101-2','L102-1'],  // CPL10
    'SI-44-12': ['L111-1','L111-2','L112-1','L111-1','L111-2','L112-1'],  // CPL11
    'SI-44-13': ['L121-1','L121-2','L122-1','L121-1','L121-2','L122-1'],  // CPL12
    'SI-44-14': ['L131-1','L132-1','L133-1','L131-1','L132-1','L133-1'],  // CPL13
    'SI-44-15': ['L141-1','L141-2','L142-1','L141-1','L141-2','L142-1'],  // CPL14
  };
  const soalMap: Record<string, string> = {}; // key: "kelasNama-asesmenNama-soalNo"
  let soalCount = 0;
  for (const [kelasNama, kelasId] of Object.entries(kelasMap)) {
    const subKeys = soalSubCpmkMapping[kelasNama] || soalSubCpmkMapping['SI-44-01'];
    let subIdx = 0;
    for (const tmpl of asesmenTemplate) {
      const asesmenKey = `${kelasNama}-${tmpl.nama}`;
      const asesmenId = asesmenMap[asesmenKey];
      if (asesmenId) {
        for (let s = 1; s <= 2; s++) {
          const subCpmkKey = subKeys[subIdx % subKeys.length];
          subIdx++;
          if (subCpmkMap[subCpmkKey]) {
            const created = await prisma.asesmenSoal.create({
              data: {
                asesmenId,
                nomorSoal: `Soal ${s}`,
                bobotSoal: 50, // each soal = 50% of its asesmen
                subCpmkId: subCpmkMap[subCpmkKey]
              }
            });
            soalMap[`${asesmenKey}-${s}`] = created.id;
            soalCount++;
          }
        }
      }
    }
  }
  console.log(`✅ ${soalCount} Asesmen Soal diisi (2 per asesmen)`);

  // =============================================
  // 20. NILAI SOAL (student grades per question)
  // =============================================
  // Score pool — deterministic cycling for reproducibility
  const scorePool = [92, 95, 90, 98, 88, 94, 91, 96, 93, 97, 90, 95, 93, 92, 96, 89, 94, 91, 95, 92];
  let nilaiCount = 0;
  let scoreIdx = 0;

  for (const [kelasNama, _kelasId] of Object.entries(kelasMap)) {
    const enrolledNims = enrollmentPlan[kelasNama] || [];
    for (const nim of enrolledNims) {
      if (!mhsMap[nim]) continue;
      // Iterate all soal for this kelas
      for (const tmpl of asesmenTemplate) {
        for (let s = 1; s <= 2; s++) {
          const soalKey = `${kelasNama}-${tmpl.nama}-${s}`;
          if (soalMap[soalKey]) {
            const nilai = scorePool[scoreIdx % scorePool.length];
            scoreIdx++;
            await prisma.nilaiSoal.create({
              data: {
                mahasiswaId: mhsMap[nim],
                asesmenSoalId: soalMap[soalKey],
                nilai
              }
            });
            nilaiCount++;
          }
        }
      }
    }
  }
  console.log(`✅ ${nilaiCount} Nilai Soal diisi`);

  // =============================================
  // 21. RUBRIK & KRITERIA RUBRIK (1 rubrik per kelas, 3 kriteria each)
  // =============================================
  const kriteriaTemplate = [
    {
      aspek: 'Pemahaman Konsep', bobot: 40,
      sangatBaik: 'Memahami seluruh konsep dengan sangat baik dan mampu mengaplikasikan secara mandiri',
      baik: 'Memahami sebagian besar konsep dan mampu mengaplikasikan dengan bimbingan minimal',
      cukup: 'Memahami konsep dasar namun belum mampu mengaplikasikan secara konsisten',
      kurang: 'Belum memahami konsep dasar dan tidak mampu mengaplikasikan'
    },
    {
      aspek: 'Keterampilan Praktik', bobot: 35,
      sangatBaik: 'Menunjukkan keterampilan praktik yang sangat baik, hasil akurat dan efisien',
      baik: 'Menunjukkan keterampilan praktik yang baik, hasil sebagian besar akurat',
      cukup: 'Menunjukkan keterampilan praktik dasar, hasil memerlukan perbaikan',
      kurang: 'Belum menunjukkan keterampilan praktik yang memadai'
    },
    {
      aspek: 'Komunikasi & Presentasi', bobot: 25,
      sangatBaik: 'Menyampaikan hasil dengan sangat jelas, terstruktur, dan meyakinkan',
      baik: 'Menyampaikan hasil dengan jelas dan cukup terstruktur',
      cukup: 'Menyampaikan hasil namun kurang terstruktur dan kurang jelas',
      kurang: 'Tidak mampu menyampaikan hasil dengan jelas'
    }
  ];
  let rubrikCount = 0;
  let kriteriaCount = 0;
  for (const [kelasNama, kelasId] of Object.entries(kelasMap)) {
    const rubrik = await prisma.rubrik.create({
      data: {
        kelasId,
        nama: `Rubrik Penilaian ${kelasNama}`,
        deskripsi: `Rubrik penilaian untuk kelas ${kelasNama} yang mencakup aspek pemahaman, praktik, dan komunikasi`
      }
    });
    rubrikCount++;
    for (const kt of kriteriaTemplate) {
      await prisma.kriteriaRubrik.create({
        data: { rubrikId: rubrik.id, ...kt }
      });
      kriteriaCount++;
    }
  }
  console.log(`✅ ${rubrikCount} Rubrik dan ${kriteriaCount} Kriteria Rubrik diisi`);

  // =============================================
  // 22. ACTION PLAN (ACT phase)
  // =============================================
  const actionPlanData = [
    {
      title: 'Peningkatan Capaian CPL02 - Database',
      context: 'Hasil evaluasi menunjukkan rata-rata capaian CPL02 (Merancang database) masih di bawah target 70%. Perlu peningkatan metode pembelajaran dan penambahan praktikum.',
      assignedTo: 'Bapak Dosen',
      priority: 'High',
      status: 'Completed',
      cplKode: 'CPL02'
    },
    {
      title: 'Perbaikan Metode Asesmen CPL03',
      context: 'Instrumen asesmen CPL03 (Metodologi pengembangan sistem) perlu di-review. Beberapa soal tidak mengukur CPMK yang tepat. Perlu revisi soal dan rubrik penilaian.',
      assignedTo: 'Bapak Kaprodi',
      priority: 'Medium',
      status: 'Completed',
      cplKode: 'CPL03'
    },
    {
      title: 'Workshop Pemrograman Berorientasi Objek',
      context: 'Telah dilaksanakan workshop tambahan untuk meningkatkan pemahaman mahasiswa terhadap OOP. Hasil post-test menunjukkan peningkatan 15%.',
      assignedTo: 'Bapak Dosen',
      priority: 'Medium',
      status: 'Completed',
      cplKode: 'CPL03'
    },
    {
      title: 'Revisi RPS MK Pengantar Sistem Informasi',
      context: 'RPS telah direvisi untuk menambahkan studi kasus industri terkini dan memperkuat keterkaitan dengan CPL01. Perubahan sudah diimplementasikan di semester berjalan.',
      assignedTo: 'Bapak Dosen',
      priority: 'Low',
      status: 'Completed',
      cplKode: 'CPL01'
    }
  ];
  let actionPlanCount = 0;
  for (const ap of actionPlanData) {
    await prisma.actionPlan.create({
      data: {
        kurikulumId: kId,
        title: ap.title,
        context: ap.context,
        assignedTo: ap.assignedTo,
        priority: ap.priority,
        status: ap.status,
        cplId: ap.cplKode ? cplMap[ap.cplKode] : undefined
      }
    });
    actionPlanCount++;
  }
  console.log(`✅ ${actionPlanCount} Action Plan diisi`);

  // =============================================
  // 23. NOTIFIKASI (untuk semua role)
  // =============================================
  const notifData = [
    // KAPRODI notifications
    { userId: userMap['kaprodi'], title: 'Siklus PDCA Selesai', message: 'Selamat! Seluruh fase PDCA (Plan-Do-Check-Act) untuk Kurikulum SI 2024/2025 telah selesai dengan rata-rata capaian 93.1%.', type: 'SUCCESS', isRead: false },
    { userId: userMap['kaprodi'], title: 'Evaluasi CPL Tersedia', message: 'Hasil evaluasi 4 CPL telah tersedia di menu Laporan OBE. Semua CPL yang diasesmen menunjukkan capaian di atas target 70%.', type: 'INFO', isRead: false },
    { userId: userMap['kaprodi'], title: 'Action Plan Selesai', message: '4 dari 4 rencana aksi (Action Plan) CQI telah diselesaikan. Silakan review hasilnya di menu Act Phase.', type: 'SUCCESS', isRead: true },
    { userId: userMap['kaprodi'], title: 'RPS Lengkap', message: 'Seluruh 5 kelas telah memiliki RPS lengkap (8 pertemuan). Fase DO telah tercapai 100%.', type: 'INFO', isRead: true },
    // DOSEN notifications  
    { userId: userMap['dosen'], title: 'Nilai Berhasil Diinput', message: 'Nilai untuk 5 kelas yang Anda ampu telah berhasil diinput. Total 180 nilai soal tercatat.', type: 'SUCCESS', isRead: false },
    { userId: userMap['dosen'], title: 'RPS Perlu Dilengkapi', message: 'RPS untuk kelas SI-44-05 (Pemrograman Web) telah dilengkapi. Terima kasih atas kontribusinya.', type: 'INFO', isRead: true },
    { userId: userMap['dosen'], title: 'Rubrik Penilaian Tersedia', message: '5 rubrik penilaian telah dibuat untuk kelas yang Anda ampu. Pastikan rubrik sudah sesuai sebelum digunakan.', type: 'INFO', isRead: false },
    // ADMIN notifications
    { userId: userMap['admin'], title: 'Sistem Berhasil Diinisialisasi', message: 'Database SI-OBE telah berhasil di-seed dengan data kurikulum lengkap: 66 MK, 14 CPL, 10 Mahasiswa, dan 5 Kelas.', type: 'SUCCESS', isRead: false },
    { userId: userMap['admin'], title: '4 User Terdaftar', message: 'Sistem memiliki 4 pengguna aktif: 1 Admin, 1 Kaprodi, 1 Dosen, dan 1 Mahasiswa.', type: 'INFO', isRead: true },
    // MAHASISWA notifications
    { userId: userMap['120220001'], title: 'Rapor OBE Tersedia', message: 'Rapor capaian OBE Anda telah tersedia. Rata-rata capaian CPL Anda: 93%. Lihat detail di menu Rapor OBE.', type: 'SUCCESS', isRead: false },
    { userId: userMap['120220001'], title: 'Terdaftar di 3 Kelas', message: 'Anda telah terdaftar di 3 kelas untuk semester ini. Pastikan untuk mengikuti semua asesmen yang dijadwalkan.', type: 'INFO', isRead: false },
  ];
  let notifCount = 0;
  for (const n of notifData) {
    if (n.userId) {
      await prisma.notification.create({ data: n });
      notifCount++;
    }
  }
  console.log(`✅ ${notifCount} Notifikasi diisi`);

  // =============================================
  // SUMMARY
  // =============================================
  console.log('\n========================================');
  console.log('🎉 PENGISIAN DATA SELESAI!');
  console.log('========================================');
  console.log('--- PLAN Phase ---');
  console.log(`Kurikulum      : 1 (${kurikulum.nama})`);
  console.log(`Profil Lulusan : ${plData.length}`);
  console.log(`CPL Prodi      : ${cplData.length}`);
  console.log(`CPL SN-DIKTI   : ${snDiktiData.length}`);
  console.log(`Bahan Kajian   : ${bkData.length}`);
  console.log(`Mata Kuliah    : ${mkData.length}`);
  console.log(`CPMK           : ${cpmkData.length}`);
  console.log(`Sub-CPMK       : ${subCpmkCount}`);
  console.log(`PL ↔ CPL       : ${plCplCount}`);
  console.log(`CPL ↔ BK       : ${cplBkCount}`);
  console.log(`BK ↔ MK        : ${bkMkCount}`);
  console.log(`CPL ↔ MK       : ${cplMkCount}`);
  console.log(`SN-DIKTI ↔ CPL : ${snCplCount}`);
  console.log(`MK ↔ CPMK      : ${mkCpmkCount}`);
  console.log('--- DO Phase ---');
  console.log(`Kelas (Dosen)  : ${kelasCount}`);
  console.log(`Mahasiswa      : ${mahasiswaData.length}`);
  console.log(`Enrollment     : ${enrollCount}`);
  console.log(`RPS Pertemuan   : ${rpsCount}`);
  console.log(`Rubrik         : ${rubrikCount}`);
  console.log(`Kriteria Rubrik: ${kriteriaCount}`);
  console.log('--- CHECK Phase ---');
  console.log(`Asesmen        : ${asesmenCount}`);
  console.log(`Asesmen Soal   : ${soalCount}`);
  console.log(`Nilai Soal     : ${nilaiCount}`);
  console.log('--- ACT Phase ---');
  console.log(`Action Plan    : ${actionPlanCount}`);
  console.log('========================================');
}

seed()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
