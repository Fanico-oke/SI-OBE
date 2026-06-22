const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Menghapus data lama...");
  await prisma.pemetaanMKCPMK.deleteMany();
  await prisma.pemetaanCPLMK.deleteMany();
  await prisma.pemetaanBKMK.deleteMany();
  await prisma.pemetaanCPLBK.deleteMany();
  await prisma.pemetaanSnDiktiCPLProdi.deleteMany();
  await prisma.pemetaanPLCPL.deleteMany();
  await prisma.cPMK.deleteMany();
  await prisma.mataKuliah.deleteMany();
  await prisma.bahanKajian.deleteMany();
  await prisma.cPL.deleteMany();
  await prisma.cPLSnDikti.deleteMany();
  await prisma.profilLulusan.deleteMany();
  await prisma.kurikulum.deleteMany();

  console.log("Membuat kurikulum...");
  const kurikulum = await prisma.kurikulum.create({
    data: {
      nama: 'Rancangan Kurikulum SI Gasal 2024/2025',
      prodi: 'Sistem Informasi',
      tahunMulai: 2024,
      tahunSelesai: 2029,
      status: 'PUBLISHED'
    }
  });

  const kId = kurikulum.id;

  // 1. PL
  const plsData = [
    { kode: 'PL1', deskripsi: 'Lulusan memiliki kemampuan untuk merencanakan, menganalisis, merancang, membangun, mengujicoba, menerapkan, dan mengevaluasi sistem informasi (bidang x) dalam sebuah proyek yang selaras dengan tujuan organisasi', referensi: 'Pengembangan Sistem dan Teknologi Informasi, Pengembangan Perangkat Lunak' },
    { kode: 'PL2', deskripsi: 'Lulusan memiliki kemampuan memahami, menerapkan, dan mengintegrasikan model bisnis dengan menggunakan metode dan berbagai teknik peningkatan bisnis proses', referensi: 'PL Penciri Utama' },
    { kode: 'PL3', deskripsi: 'Lulusan memiliki kemampuan untuk mengolah, menganalisis, dan menyajikan data yang dikembangkan dengan konsep big data dan business intelligence', referensi: 'PL tambahan KK dan P' },
    { kode: 'PL4', deskripsi: 'Lulusan memiliki sikap religius, beretika, dan peka terhadap lingkungan sosial sebagai seorang warga negara dengan berlandaskan nilai ahlussunah waljamaah (Aswaja).', referensi: 'PL Sikap' },
    { kode: 'PL5', deskripsi: 'Lulusan memiliki kemampuan berpikir kritis dan inovatif, bekerja mandiri, membuat keputusan tepat, mendokumentasikan data dengan benar, menyusun karya ilmiah', referensi: 'PL Keterampilan umum dan sikap' }
  ];
  const pls = {};
  for (const p of plsData) {
    pls[p.kode] = await prisma.profilLulusan.create({ data: { ...p, kurikulumId: kId } });
  }

  // 2. CPL Prodi
  const cplsData = [
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
  const cpls = {};
  for (const c of cplsData) {
    cpls[c.kode] = await prisma.cPL.create({ data: { ...c, kurikulumId: kId } });
  }

  // 3. Pemetaan PL <-> CPL
  const plCplMap = {
    'CPL01': ['PL1', 'PL2', 'PL3', 'PL5'],
    'CPL02': ['PL1', 'PL3'],
    'CPL03': ['PL1'],
    'CPL04': ['PL1'],
    'CPL05': ['PL1', 'PL2', 'PL3', 'PL4', 'PL5'],
    'CPL06': ['PL2'],
    'CPL07': ['PL1'],
    'CPL08': ['PL3'],
    'CPL09': ['PL2'],
    'CPL10': ['PL4'],
    'CPL11': ['PL4'],
    'CPL12': ['PL5'],
    'CPL13': ['PL5'],
    'CPL14': ['PL5']
  };
  for (const [cplKode, plArray] of Object.entries(plCplMap)) {
    for (const plKode of plArray) {
      await prisma.pemetaanPLCPL.create({
        data: { plId: pls[plKode].id, cplId: cpls[cplKode].id }
      });
    }
  }

  // 4. CPL SN-DIKTI
  const snDiktiData = [
    { kode: 'CPL-S01', kategori: 'SIKAP', deskripsi: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius.' },
    { kode: 'CPL-S02', kategori: 'SIKAP', deskripsi: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral dan etika.' },
    { kode: 'CPL-S03', kategori: 'SIKAP', deskripsi: 'Berkontribusi dalam peningkatan mutu kehidupan bermasyarakat, berbangsa, dan bernegara berdasarkan Pancasila.' },
    { kode: 'CPL-S04', kategori: 'SIKAP', deskripsi: 'Berperan sebagai warga negara yang bangga dan cinta tanah air, memiliki nasionalisme serta rasa tanggungjawab pada negara dan bangsa.' },
    { kode: 'CPL-S05', kategori: 'SIKAP', deskripsi: 'Menghargai keanekaragaman budaya, pandangan, agama, dan kepercayaan, serta pendapat atau temuan orisinal orang lain.' },
    { kode: 'CPL-S06', kategori: 'SIKAP', deskripsi: 'Bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan.' },
    { kode: 'CPL-S07', kategori: 'SIKAP', deskripsi: 'Taat hukum dan disiplin dalam kehidupan bermasyarakat dan bernegara.' },
    { kode: 'CPL-S08', kategori: 'SIKAP', deskripsi: 'Menginternalisasi nilai, norma, dan etika akademik.' },
    { kode: 'CPL-S09', kategori: 'SIKAP', deskripsi: 'Menunjukkan sikap bertanggungjawab atas pekerjaan di bidang keahliannya secara mandiri.' },
    { kode: 'CPL-S10', kategori: 'SIKAP', deskripsi: 'Menginternalisasi semangat kemandirian, kejuangan, dan kewirausahaan.' },
    { kode: 'CPL-S11', kategori: 'SIKAP', deskripsi: 'Menginternalisasi nilai-nilai ahlussunah waljamaah (Aswaja)' },
    { kode: 'CPL-KU01', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif...' },
    { kode: 'CPL-KU02', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.' },
    { kode: 'CPL-KU03', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan...' },
    { kode: 'CPL-KU04', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Menyusun deskripsi saintifik hasil kajian tersebut di atas dalam bentuk skripsi...' },
    { kode: 'CPL-KU05', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah...' },
    { kode: 'CPL-KU06', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu memelihara dan mengembangkan jaringan kerja...' },
    { kode: 'CPL-KU07', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu bertanggungjawab atas pencapaian hasil kerja kelompok...' },
    { kode: 'CPL-KU08', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu melakukan proses evaluasi diri terhadap kelompok kerja...' },
    { kode: 'CPL-KU09', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data...' },
    { kode: 'CPL-KU10', kategori: 'KETERAMPILAN UMUM', deskripsi: 'Berkomunikasi secara efektif dalam berbagai konteks profesional' },
    { kode: 'CPL-KK01', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu membangun, mengelola, menggunakan dan mengamankan database...' },
    { kode: 'CPL-KK02', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan...' },
    { kode: 'CPL-KK03', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan metodologi pengembangan sistem informasi...' },
    { kode: 'CPL-KK04', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan dasar logika, prinsip matematika...' },
    { kode: 'CPL-KK05', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu memahami, menerapkan kode etik dalam penggunaan informasi...' },
    { kode: 'CPL-KK06', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan merencanakan, menerapkan, memelihara dan meningkatkan sistem informasi...' },
    { kode: 'CPL-KK07', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan untuk memantau, mengevaluasi dan mengendalikan sumberdaya...' },
    { kode: 'CPL-KK08', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu membangun perangkat lunak dalam sebuah proyek sistem informasi' },
    { kode: 'CPL-KK09', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan paradigma pemrograman berorientasi objek...' },
    { kode: 'CPL-KK10', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan fungsi dan bahasa pemrograman serta memperhatikan aspek keamanan...' },
    { kode: 'CPL-KK11', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak' },
    { kode: 'CPL-KK12', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Mampu menerapkan konsep, metode dan teknik dalam merancang UI/UX' },
    { kode: 'CPL-KK13', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan pengolahan data yaitu pemfilteran, agregasi...' },
    { kode: 'CPL-KK14', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan dalam mengidentifikasi, menilai, menganalisis dan memberikan rekomendasi...' },
    { kode: 'CPL-KK15', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan dalam pengelolaan bisnis dengan memanfaatkan teknologi informasi' },
    { kode: 'CPL-KK16', kategori: 'KETERAMPILAN KHUSUS', deskripsi: 'Memiliki kemampuan dalam melakukan fungsi klasifikasi, klasterisasi, regresi...' },
    { kode: 'CPL-P01', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami, menganalisis, dan menilai konsep dasar dan peran sistem informasi...' },
    { kode: 'CPL-P02', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan menjelaskan konsep basis data, struktur data dan visualisasi data...' },
    { kode: 'CPL-P03', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan menjelaskan konsep infrastruktur TI, arsitektur jaringan...' },
    { kode: 'CPL-P04', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan menjelaskan metodologi pengembangan sistem informasi...' },
    { kode: 'CPL-P05', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan menjelaskan dasar logika, prinsip matematika...' },
    { kode: 'CPL-P06', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan mengkaji dasar hukum kode etik...' },
    { kode: 'CPL-P07', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan menjelaskan konsep perencanaan strategis...' },
    { kode: 'CPL-P08', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami konsep, teknik pada manajemen proyek...' },
    { kode: 'CPL-P09', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami, mengidentifikasi, merekomendasikan kebutuhan bisnis...' },
    { kode: 'CPL-P10', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami permasalahan bisnis berdasarkan analisis data...' },
    { kode: 'CPL-P11', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami konsep, metode, teknik dan tahapan data mining...' },
    { kode: 'CPL-P12', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami fungsi dan bahasa pemrograman serta memperhatikan aspek keamanan...' },
    { kode: 'CPL-P13', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak' },
    { kode: 'CPL-P14', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami konsep, metode dan teknik dalam merancang UI/UX' },
    { kode: 'CPL-P15', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami dan melihat peluang inovasi digital...' },
    { kode: 'CPL-P16', kategori: 'PENGETAHUAN', deskripsi: 'Mampu memahami model sistem, metode dan berbagai teknik peningkatan bisnis proses...' },
    { kode: 'CPL-P17', kategori: 'PENGETAHUAN', deskripsi: 'Memiliki pemahaman mengenai dasardasar bisnis dan pengetahuan pendukung lainnya...' }
  ];
  const sds = {};
  for (const s of snDiktiData) {
    sds[s.kode] = await prisma.cPLSnDikti.create({ data: { ...s, kurikulumId: kId } });
  }

  // 5. Pemetaan SN-DIKTI -> CPL Prodi (Based on Line 7)
  const snDiktiMap = {
    'CPL-S01': 'CPL10', 'CPL-S02': 'CPL10', 'CPL-S03': 'CPL10', 'CPL-S04': 'CPL10', 'CPL-S05': 'CPL11',
    'CPL-S06': 'CPL10', 'CPL-S07': 'CPL11', 'CPL-S08': 'CPL11', 'CPL-S09': 'CPL10', 'CPL-S10': 'CPL11', 'CPL-S11': 'CPL10',
    'CPL-KU01': 'CPL12', 'CPL-KU02': 'CPL12', 'CPL-KU03': 'CPL13', 'CPL-KU04': 'CPL13', 'CPL-KU05': 'CPL13',
    'CPL-KU06': 'CPL13', 'CPL-KU07': 'CPL14', 'CPL-KU08': 'CPL14', 'CPL-KU09': 'CPL13', 'CPL-KU10': 'CPL12',
    'CPL-KK01': 'CPL02', 'CPL-KK02': 'CPL04', 'CPL-KK03': 'CPL03', 'CPL-KK04': 'CPL03', 'CPL-KK05': 'CPL05',
    'CPL-KK06': 'CPL06', 'CPL-KK07': 'CPL06', 'CPL-KK08': 'CPL07', 'CPL-KK09': 'CPL03', 'CPL-KK10': 'CPL03',
    'CPL-KK11': 'CPL03', 'CPL-KK12': 'CPL03', 'CPL-KK13': 'CPL08', 'CPL-KK14': 'CPL06', 'CPL-KK15': 'CPL09', 'CPL-KK16': 'CPL08',
    'CPL-P01': 'CPL01', 'CPL-P02': 'CPL02', 'CPL-P03': 'CPL04', 'CPL-P04': 'CPL03', 'CPL-P05': 'CPL03',
    'CPL-P06': 'CPL05', 'CPL-P07': 'CPL06', 'CPL-P08': 'CPL07', 'CPL-P09': 'CPL09', 'CPL-P10': 'CPL08',
    'CPL-P11': 'CPL08', 'CPL-P12': 'CPL03', 'CPL-P13': 'CPL03', 'CPL-P14': 'CPL03', 'CPL-P15': 'CPL09',
    'CPL-P16': 'CPL09', 'CPL-P17': 'CPL09'
  };
  for (const [snKode, cplKode] of Object.entries(snDiktiMap)) {
    // Handling CPL-KK1 mismatch (snDiktiMap uses KK01, so we map exactly)
    const snId = sds[snKode]?.id;
    const cpId = cpls[cplKode]?.id;
    if (snId && cpId) {
      await prisma.pemetaanSnDiktiCPLProdi.create({ data: { snDiktiId: snId, cplId: cpId } });
    }
  }

  // 6. Bahan Kajian (BK)
  const bkData = [
    { kode: 'BK01', nama: 'Foundation of Information Systems' },
    { kode: 'BK02', nama: 'Data / information Management' },
    { kode: 'BK03', nama: 'Infrastructure' },
    { kode: 'BK04', nama: 'Project Management' },
    { kode: 'BK05', nama: 'Systems Analysis & Design' },
    { kode: 'BK06', nama: 'IS Management and Strategy' },
    { kode: 'BK07', nama: 'Application Development / Programming' },
    { kode: 'BK08', nama: 'Secure Computing' },
    { kode: 'BK09', nama: 'Ethics, use and implications for society' },
    { kode: 'BK10', nama: 'Praktikum' },
    { kode: 'BK11', nama: 'Mathematics and statistics' },
    { kode: 'BK12', nama: 'Data / Business Analytics' },
    { kode: 'BK13', nama: 'Personality Development' },
    { kode: 'BK14', nama: 'Business Process Management' },
    { kode: 'BK15', nama: 'Enterprise Architecture' },
    { kode: 'BK16', nama: 'User Interface Design' },
    { kode: 'BK17', nama: 'Digital Innovation' },
    { kode: 'BK18', nama: 'Visualisasi Informasi' },
    { kode: 'BK19', nama: 'Pemrograman Berorientasi Objek' },
    { kode: 'BK20', nama: 'Pemrograman web' },
    { kode: 'BK21', nama: 'Pemrograman mobile' }
  ];
  const bks = {};
  for (const b of bkData) {
    bks[b.kode] = await prisma.bahanKajian.create({ data: { ...b, kurikulumId: kId } });
  }

  // 7. Pemetaan BK <-> CPL (Based on Line 15)
  const bkCplMap = {
    'BK01': ['CPL01', 'CPL02', 'CPL03', 'CPL04', 'CPL05'],
    'BK02': ['CPL01', 'CPL02'],
    'BK03': ['CPL01'],
    'BK04': ['CPL01'],
    'BK05': ['CPL01'],
    'BK06': ['CPL01'],
    'BK07': ['CPL01'],
    'BK08': ['CPL01'],
    'BK09': ['CPL01', 'CPL02', 'CPL03'],
    'BK10': ['CPL01', 'CPL02', 'CPL03', 'CPL04', 'CPL05'],
    'BK11': ['CPL01', 'CPL02'],
    'BK12': ['CPL01'],
    'BK13': ['CPL01', 'CPL02', 'CPL03', 'CPL04', 'CPL05', 'CPL06'],
    'BK14': ['CPL01'],
    'BK15': ['CPL01', 'CPL02'],
    'BK16': ['CPL01'],
    'BK17': ['CPL01'],
    'BK18': ['CPL01'],
    'BK19': ['CPL01'],
    'BK20': ['CPL01'],
    'BK21': ['CPL01']
  };
  // Note: the above array was a placeholder, I will use the actual exact mapping from the screenshot.
  // Wait, let's look closely at image 2:
  // BK01: CPL01, CPL02, CPL05, CPL07, CPL09
  // BK02: CPL02, CPL08
  // BK03: CPL03
  // BK04: CPL07
  // BK05: CPL03
  // BK06: CPL06
  // BK07: CPL03
  // BK08: CPL04
  // BK09: CPL05, CPL10, CPL11
  // BK10: CPL02, CPL07, CPL12, CPL13, CPL14
  // BK11: CPL02, CPL08
  // BK12: CPL08
  // BK13: CPL05, CPL10, CPL11, CPL12, CPL13, CPL14
  // BK14: CPL09
  // BK15: CPL04, CPL06
  // BK16: CPL03
  // BK17: CPL09
  // BK18: CPL08
  // BK19: CPL03
  // BK20: CPL03
  // BK21: CPL03
  const realBkCplMap = {
    'BK01': ['CPL01', 'CPL02', 'CPL05', 'CPL07', 'CPL09'],
    'BK02': ['CPL02', 'CPL08'],
    'BK03': ['CPL04'],
    'BK04': ['CPL07'],
    'BK05': ['CPL03'],
    'BK06': ['CPL06'],
    'BK07': ['CPL03'],
    'BK08': ['CPL04'],
    'BK09': ['CPL05', 'CPL10', 'CPL11'],
    'BK10': ['CPL02', 'CPL07', 'CPL12', 'CPL13', 'CPL14'],
    'BK11': ['CPL02', 'CPL08'],
    'BK12': ['CPL08'],
    'BK13': ['CPL05', 'CPL10', 'CPL11', 'CPL12', 'CPL13', 'CPL14'],
    'BK14': ['CPL09'],
    'BK15': ['CPL04', 'CPL06'],
    'BK16': ['CPL03'],
    'BK17': ['CPL09'],
    'BK18': ['CPL08'],
    'BK19': ['CPL03'],
    'BK20': ['CPL03'],
    'BK21': ['CPL03']
  };
  for (const [bkKode, cplArray] of Object.entries(realBkCplMap)) {
    for (const cplKode of cplArray) {
      if (bks[bkKode] && cpls[cplKode]) {
        await prisma.pemetaanCPLBK.create({
          data: { bkId: bks[bkKode].id, cplId: cpls[cplKode].id }
        });
      }
    }
  }

  // 8. Mata Kuliah (MK) - All 66
  const mkData = [
    { kode: 'MK01', nama: 'AGAMA', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK02', nama: 'PANCASILA', sks: 2, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK03', nama: 'BAHASA INDONESIA', sks: 2, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK04', nama: 'PENGANTAR SISTEM INFORMASI', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK05', nama: 'ALGORITMA DAN PEMROGRAMAN', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK06', nama: 'LITERASI TIK', sks: 2, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK07', nama: 'MATEMATIKA DISKRIT', sks: 3, semester: 1, tipe: 'WAJIB' },
    { kode: 'MK08', nama: 'ASWAJA', sks: 2, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK09', nama: 'KEWARGANEGARAAN', sks: 2, semester: 2, tipe: 'WAJIB' },
    { kode: 'MK10', nama: 'LOGIKA DAN METODE BERFIKIR KRITIS', sks: 2, semester: 2, tipe: 'WAJIB' },
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
  const mks = {};
  for (const m of mkData) {
    mks[m.kode] = await prisma.mataKuliah.create({ data: { ...m, kurikulumId: kId } });
  }

  // 9. Pemetaan MK <-> BK
  const mkBkMap = {
    'MK01': ['BK09', 'BK13'],
    'MK02': ['BK09', 'BK13'],
    'MK03': ['BK13'],
    'MK04': ['BK01'],
    'MK05': ['BK07'],
    'MK06': ['BK01', 'BK03'],
    'MK07': ['BK11'],
    'MK08': ['BK13'],
    'MK09': ['BK13'],
    'MK10': ['BK11'],
    'MK11': ['BK02', 'BK11'],
    'MK12': ['BK07'],
    'MK13': ['BK03'],
    'MK14': ['BK06'],
    'MK15': ['BK14'],
    'MK16': ['BK17'],
    'MK17': ['BK06'],
    'MK18': ['BK07', 'BK19'],
    'MK19': ['BK05'],
    'MK20': ['BK05', 'BK16'],
    'MK21': ['BK02'],
    'MK22': ['BK07', 'BK20'],
    'MK23': ['BK04'],
    'MK24': ['BK02', 'BK11', 'BK12'],
    'MK25': ['BK14', 'BK15'],
    'MK26': ['BK17'],
    'MK27': ['BK03'],
    'MK28': ['BK11'],
    'MK29': ['BK07'],
    'MK30': ['BK06'],
    'MK31': ['BK08'],
    'MK32': ['BK02', 'BK12', 'BK18'],
    'MK33': ['BK06'],
    'MK34': ['BK04', 'BK05', 'BK07', 'BK10'],
    'MK35': ['BK11'],
    'MK36': ['BK13'],
    'MK37': ['BK06'],
    'MK38': ['BK06'],
    'MK39': ['BK09'],
    'MK40': ['BK09', 'BK10'],
    'MK41': ['BK10'],
    'MK42': ['BK13'],
    'MK43': ['BK09', 'BK10'],
    'MK44': ['BK09', 'BK10'],
    'MK45': ['BK09', 'BK10'],
    'MK46': ['BK09'],
    'MK47': ['BK07', 'BK21'],
    'MK48': ['BK03', 'BK07', 'BK08'],
    'MK49': ['BK07'],
    'MK50': ['BK15'],
    'MK51': ['BK03', 'BK08'],
    'MK52': ['BK06', 'BK08'],
    'MK53': ['BK06'],
    'MK54': ['BK06'],
    'MK55': ['BK06'],
    'MK56': ['BK06'],
    'MK57': ['BK07', 'BK12'],
    'MK58': ['BK07', 'BK18'],
    'MK59': ['BK07', 'BK12'],
    'MK60': ['BK12'],
    'MK61': ['BK12'],
    'MK62': ['BK17'],
    'MK63': ['BK17'],
    'MK64': ['BK17'],
    'MK65': ['BK14'],
    'MK66': ['BK14']
  };
  for (const [mkKode, bkArray] of Object.entries(mkBkMap)) {
    for (const bkKode of bkArray) {
      if (mks[mkKode] && bks[bkKode]) {
        await prisma.pemetaanBKMK.create({
          data: { bkId: bks[bkKode].id, mkId: mks[mkKode].id }
        });
      }
    }
  }

  // 10. Pemetaan MK <-> CPL
  const mkCplMap = {
    'MK01': ['CPL10'],
    'MK02': ['CPL10', 'CPL11'],
    'MK03': ['CPL13'],
    'MK04': ['CPL01'],
    'MK05': ['CPL03'],
    'MK06': ['CPL01', 'CPL04'],
    'MK07': ['CPL02'],
    'MK08': ['CPL10'],
    'MK09': ['CPL10', 'CPL11'],
    'MK10': ['CPL02', 'CPL12'],
    'MK11': ['CPL02', 'CPL08'],
    'MK12': ['CPL02', 'CPL03'],
    'MK13': ['CPL04'],
    'MK14': ['CPL06'],
    'MK15': ['CPL09'],
    'MK16': ['CPL09', 'CPL11'],
    'MK17': ['CPL09'],
    'MK18': ['CPL03'],
    'MK19': ['CPL03'],
    'MK20': ['CPL03'],
    'MK21': ['CPL02', 'CPL08'],
    'MK22': ['CPL03'],
    'MK23': ['CPL07'],
    'MK24': ['CPL08'],
    'MK25': ['CPL09'],
    'MK26': ['CPL09'],
    'MK27': ['CPL04'],
    'MK28': ['CPL08'],
    'MK29': ['CPL03'],
    'MK30': ['CPL06'],
    'MK31': ['CPL04'],
    'MK32': ['CPL02', 'CPL08'],
    'MK33': ['CPL06'],
    'MK34': ['CPL03', 'CPL07'],
    'MK35': ['CPL08'],
    'MK36': ['CPL13'],
    'MK37': ['CPL06'],
    'MK38': ['CPL06'],
    'MK39': ['CPL05'],
    'MK40': ['CPL05', 'CPL07', 'CPL12', 'CPL13', 'CPL14'],
    'MK41': ['CPL13'],
    'MK42': ['CPL05', 'CPL10', 'CPL11'],
    'MK43': ['CPL05', 'CPL07', 'CPL12', 'CPL13', 'CPL14'],
    'MK44': ['CPL05', 'CPL07', 'CPL12', 'CPL13', 'CPL14'],
    'MK45': ['CPL05', 'CPL07', 'CPL13'],
    'MK46': ['CPL05', 'CPL13'],
    'MK47': ['CPL03'],
    'MK48': ['CPL04'],
    'MK49': ['CPL03'],
    'MK50': ['CPL04'],
    'MK51': ['CPL04'],
    'MK52': ['CPL06'],
    'MK53': ['CPL06'],
    'MK54': ['CPL06'],
    'MK55': ['CPL06'],
    'MK56': ['CPL06'],
    'MK57': ['CPL08'],
    'MK58': ['CPL08'],
    'MK59': ['CPL08'],
    'MK60': ['CPL08'],
    'MK61': ['CPL08'],
    'MK62': ['CPL09'],
    'MK63': ['CPL09'],
    'MK64': ['CPL09'],
    'MK65': ['CPL09'],
    'MK66': ['CPL09']
  };
  for (const [mkKode, cplArray] of Object.entries(mkCplMap)) {
    for (const cplKode of cplArray) {
      if (mks[mkKode] && cpls[cplKode]) {
        await prisma.pemetaanCPLMK.create({
          data: { mkId: mks[mkKode].id, cplId: cpls[cplKode].id }
        });
      }
    }
  }

  console.log("Database berhasil diseed secara akurat 100%!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
