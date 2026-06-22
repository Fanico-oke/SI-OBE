const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🚀 Memulai pengisian data kurikulum dari dokumen Kaprodi...\n');

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
  const plMap = {};
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
  const cplMap = {};
  for (const cpl of cplData) {
    const created = await prisma.cPL.create({ data: { kurikulumId: kId, ...cpl } });
    cplMap[cpl.kode] = created.id;
  }
  console.log('✅ 14 CPL Prodi (CPL01-CPL14) diisi');

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
  const bkMap = {};
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
  const mkMap = {};
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
  const cpmkMap = {};
  for (const c of cpmkData) {
    if (cplMap[c.cplKode]) {
      const created = await prisma.cPMK.create({ data: { cplId: cplMap[c.cplKode], kode: c.kode, deskripsi: c.deskripsi } });
      cpmkMap[c.kode] = created.id;
    }
  }
  console.log(`✅ ${cpmkData.length} CPMK diisi`);

  // =============================================
  // SUMMARY
  // =============================================
  console.log('\n========================================');
  console.log('🎉 PENGISIAN DATA SELESAI!');
  console.log('========================================');
  console.log(`Kurikulum    : 1 (${kurikulum.nama})`);
  console.log(`Profil Lulusan: ${plData.length}`);
  console.log(`CPL Prodi    : ${cplData.length}`);
  console.log(`Bahan Kajian : ${bkData.length}`);
  console.log(`Mata Kuliah  : ${mkData.length}`);
  console.log(`CPMK         : ${cpmkData.length}`);
  console.log(`Pemetaan PL↔CPL: ${plCplCount}`);
  console.log(`Pemetaan CPL↔BK: ${cplBkCount}`);
  console.log(`Pemetaan BK↔MK : ${bkMkCount}`);
  console.log(`Pemetaan CPL↔MK: ${cplMkCount}`);
  console.log('========================================');
}

seed()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
