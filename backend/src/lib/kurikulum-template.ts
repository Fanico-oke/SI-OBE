import { prisma } from './prisma';

/**
 * Seeds template data for a newly created kurikulum.
 * Inserts: PL, CPL, CPL SN-DIKTI, BK, MK, CPMK
 * Does NOT insert: Matriks/Pemetaan, Sub-CPMK, or any Do/Check/Act data.
 */
export async function seedTemplateData(kurikulumId: string): Promise<void> {
  try {
    console.log(`[Template] Seeding template data for kurikulum ${kurikulumId}...`);

    // 1. Profil Lulusan (5 items)
    await prisma.profilLulusan.createMany({
      data: [
        { kurikulumId, kode: 'PL1', deskripsi: 'Lulusan memiliki kemampuan untuk merencanakan, menganalisis, merancang, membangun, mengujicoba, menerapkan, dan mengevaluasi sistem informasi (bidang x) dalam sebuah proyek yang selaras dengan tujuan organisasi', referensi: 'PL Penciri Utama - Pengembangan SI, Pengembangan Perangkat Lunak, Manajemen Proyek TI' },
        { kurikulumId, kode: 'PL2', deskripsi: 'Lulusan memiliki kemampuan memahami, menerapkan, dan mengintegrasikan model bisnis dengan menggunakan metode dan berbagai teknik peningkatan bisnis proses yang mendatangkan suatu nilai tambah bagi organisasi', referensi: 'PL Penciri Utama' },
        { kurikulumId, kode: 'PL3', deskripsi: 'Lulusan memiliki kemampuan untuk mengolah, menganalisis, dan menyajikan data yang dikembangkan dengan konsep big data dan business intelligence untuk membantu dalam proses pengambilan keputusan', referensi: 'PL tambahan KK dan P' },
        { kurikulumId, kode: 'PL4', deskripsi: 'Lulusan memiliki sikap religius, beretika, dan peka terhadap lingkungan sosial sebagai seorang warga negara dengan berlandaskan nilai ahlussunah waljamaah (Aswaja).', referensi: 'PL Sikap' },
        { kurikulumId, kode: 'PL5', deskripsi: 'Lulusan memiliki kemampuan berpikir kritis dan inovatif, bekerja mandiri, membuat keputusan tepat, mendokumentasikan data dengan benar, menyusun karya ilmiah, berkomunikasi efektif, membangun jaringan kerja, bertanggung jawab atas hasil tim', referensi: 'PL Keterampilan umum dan sikap' },
      ],
    });
    console.log('[Template] ✅ 5 Profil Lulusan');

    // 2. CPL Prodi (14 items) — need kode→id map for CPMK
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
      { kode: 'CPL10', deskripsi: 'Mampu menunjukkan sikap profesionalitas, integritas, dan berjati diri islami yang dilengkapi dengan kemampuan komunikasi, kepemimpinan, bekerja sama dan bertanggung jawab atas pekerjaan di bidang keahliannya' },
      { kode: 'CPL11', deskripsi: 'Mampu menunjukkan sikap taat hukum, disiplin, dan menghargai keanekaragaman melalui internalisasi nilai, norma, etika akademik, semangat kemandirian, kejuangan, dan kewirausahaan' },
      { kode: 'CPL12', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, terukur, berfikir logis, kritis, sistematis, dan inovatif, komunikatif dalam mengembangkan ilmu pengetahuan yang memperhatikan nilai humaniora sesuai bidang keahliannya' },
      { kode: 'CPL13', deskripsi: 'Mampu mengkaji implikasi pengembangan ilmu pengetahuan dengan menerapkan keahliannya dalam rangka menghasilkan solusi, menyusun deskripsi saintifik hasil kajian dalam bentuk laporan ilmiah yang sahih dan original' },
      { kode: 'CPL14', deskripsi: 'Mampu melakukan evaluasi diri dan supervisi terhadap penyelesaian pekerjaan sebagai wujud tanggung jawab atas pencapaian hasil kelompok kerja' },
    ];
    const cplMap: Record<string, string> = {};
    for (const cpl of cplData) {
      const created = await prisma.cPL.create({ data: { kurikulumId, ...cpl } });
      cplMap[cpl.kode] = created.id;
    }
    console.log('[Template] ✅ 14 CPL Prodi');

    // 3. CPL SN-DIKTI (54 items)
    await prisma.cPLSnDikti.createMany({
      data: [
        { kurikulumId, kode: 'CPL-S01', kategori: 'Sikap', deskripsi: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius.' },
        { kurikulumId, kode: 'CPL-S02', kategori: 'Sikap', deskripsi: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral dan etika.' },
        { kurikulumId, kode: 'CPL-S03', kategori: 'Sikap', deskripsi: 'Berkontribusi dalam peningkatan mutu kehidupan bermasyarakat, berbangsa, dan bernegara berdasarkan Pancasila.' },
        { kurikulumId, kode: 'CPL-S04', kategori: 'Sikap', deskripsi: 'Berperan sebagai warga negara yang bangga dan cinta tanah air, memiliki nasionalisme serta rasa tanggungjawab pada negara dan bangsa.' },
        { kurikulumId, kode: 'CPL-S05', kategori: 'Sikap', deskripsi: 'Menghargai keanekaragaman budaya, pandangan, agama, dan kepercayaan, serta pendapat atau temuan orisinal orang lain.' },
        { kurikulumId, kode: 'CPL-S06', kategori: 'Sikap', deskripsi: 'Bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan.' },
        { kurikulumId, kode: 'CPL-S07', kategori: 'Sikap', deskripsi: 'Taat hukum dan disiplin dalam kehidupan bermasyarakat dan bernegara.' },
        { kurikulumId, kode: 'CPL-S08', kategori: 'Sikap', deskripsi: 'Menginternalisasi nilai, norma, dan etika akademik.' },
        { kurikulumId, kode: 'CPL-S09', kategori: 'Sikap', deskripsi: 'Menunjukkan sikap bertanggungjawab atas pekerjaan di bidang keahliannya secara mandiri.' },
        { kurikulumId, kode: 'CPL-S10', kategori: 'Sikap', deskripsi: 'Menginternalisasi semangat kemandirian, kejuangan, dan kewirausahaan.' },
        { kurikulumId, kode: 'CPL-S11', kategori: 'Sikap', deskripsi: 'Menginternalisasi nilai-nilai ahlussunah waljamaah (Aswaja)' },
        { kurikulumId, kode: 'CPL-KU01', kategori: 'Keterampilan Umum', deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi.' },
        { kurikulumId, kode: 'CPL-KU02', kategori: 'Keterampilan Umum', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.' },
        { kurikulumId, kode: 'CPL-KU03', kategori: 'Keterampilan Umum', deskripsi: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi sesuai dengan keahliannya.' },
        { kurikulumId, kode: 'CPL-KU04', kategori: 'Keterampilan Umum', deskripsi: 'Menyusun deskripsi saintifik hasil kajian dalam bentuk skripsi atau laporan tugas akhir.' },
        { kurikulumId, kode: 'CPL-KU05', kategori: 'Keterampilan Umum', deskripsi: 'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya.' },
        { kurikulumId, kode: 'CPL-KU06', kategori: 'Keterampilan Umum', deskripsi: 'Mampu memelihara dan mengembangkan jaringan kerja dengan pembimbing, kolega, sejawat.' },
        { kurikulumId, kode: 'CPL-KU07', kategori: 'Keterampilan Umum', deskripsi: 'Mampu bertanggungjawab atas pencapaian hasil kerja kelompok dan melakukan supervisi.' },
        { kurikulumId, kode: 'CPL-KU08', kategori: 'Keterampilan Umum', deskripsi: 'Mampu melakukan proses evaluasi diri terhadap kelompok kerja dan mampu mengelola pembelajaran secara mandiri.' },
        { kurikulumId, kode: 'CPL-KU09', kategori: 'Keterampilan Umum', deskripsi: 'Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data untuk menjamin kesahihan.' },
        { kurikulumId, kode: 'CPL-KU10', kategori: 'Keterampilan Umum', deskripsi: 'Berkomunikasi secara efektif dalam berbagai konteks profesional' },
        { kurikulumId, kode: 'CPL-KK01', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu membangun, mengelola, menggunakan dan mengamankan database.' },
        { kurikulumId, kode: 'CPL-KK02', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud.' },
        { kurikulumId, kode: 'CPL-KK03', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan metodologi pengembangan sistem informasi beserta alat pemodelannya.' },
        { kurikulumId, kode: 'CPL-KK04', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan dasar logika, prinsip matematika, dan struktur data pada pemrograman perangkat lunak.' },
        { kurikulumId, kode: 'CPL-KK05', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan kode etik dalam penggunaan informasi dan data pada perancangan dan penggunaan suatu sistem.' },
        { kurikulumId, kode: 'CPL-KK06', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan merencanakan, menerapkan, memelihara dan meningkatkan SI organisasi.' },
        { kurikulumId, kode: 'CPL-KK07', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan memantau, mengevaluasi dan mengendalikan sumberdaya SI.' },
        { kurikulumId, kode: 'CPL-KK08', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu membangun perangkat lunak dalam sebuah proyek sistem informasi.' },
        { kurikulumId, kode: 'CPL-KK09', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan paradigma pemrograman berorientasi objek.' },
        { kurikulumId, kode: 'CPL-KK10', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan fungsi dan bahasa pemrograman pada aplikasi berbasis web.' },
        { kurikulumId, kode: 'CPL-KK11', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak.' },
        { kurikulumId, kode: 'CPL-KK12', kategori: 'Keterampilan Khusus', deskripsi: 'Mampu menerapkan konsep, metode dan teknik dalam merancang UI/UX.' },
        { kurikulumId, kode: 'CPL-KK13', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan pengolahan data dan menyajikan informasi yang efektif dalam analisis dan visualisasi data.' },
        { kurikulumId, kode: 'CPL-KK14', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan dalam manajemen risiko teknologi informasi dalam organisasi.' },
        { kurikulumId, kode: 'CPL-KK15', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan dalam pengelolaan bisnis dengan memanfaatkan teknologi informasi.' },
        { kurikulumId, kode: 'CPL-KK16', kategori: 'Keterampilan Khusus', deskripsi: 'Memiliki kemampuan dalam fungsi klasifikasi, klasterisasi, regresi, deteksi anomali di dalam data mining.' },
        { kurikulumId, kode: 'CPL-P01', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep dasar dan peran SI dalam mengelola data dan rekomendasi pengambilan keputusan.' },
        { kurikulumId, kode: 'CPL-P02', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep basis data, struktur data dan visualisasi data.' },
        { kurikulumId, kode: 'CPL-P03', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep infrastruktur TI, arsitektur jaringan, layanan cloud.' },
        { kurikulumId, kode: 'CPL-P04', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami metodologi pengembangan SI mulai dari SDLC dan pengembangan agile.' },
        { kurikulumId, kode: 'CPL-P05', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami dasar logika, prinsip matematika, dan struktur data pada perangkat lunak.' },
        { kurikulumId, kode: 'CPL-P06', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami dasar hukum kode etik dalam penggunaan informasi dan data.' },
        { kurikulumId, kode: 'CPL-P07', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep perencanaan strategis, resiko organisasi, dan tata kelola SI.' },
        { kurikulumId, kode: 'CPL-P08', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep dan teknik manajemen proyek.' },
        { kurikulumId, kode: 'CPL-P09', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami kebutuhan bisnis terhadap dampak penggunaan teknologi.' },
        { kurikulumId, kode: 'CPL-P10', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami permasalahan bisnis berdasarkan analisis data.' },
        { kurikulumId, kode: 'CPL-P11', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep data mining serta visualisasi data.' },
        { kurikulumId, kode: 'CPL-P12', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami fungsi dan bahasa pemrograman pada aplikasi berbasis web.' },
        { kurikulumId, kode: 'CPL-P13', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami fungsi dan bahasa pemrograman pada aplikasi berbasis perangkat bergerak.' },
        { kurikulumId, kode: 'CPL-P14', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami konsep, metode dan teknik dalam merancang UI/UX.' },
        { kurikulumId, kode: 'CPL-P15', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami dan melihat peluang inovasi digital.' },
        { kurikulumId, kode: 'CPL-P16', kategori: 'Pengetahuan', deskripsi: 'Mampu memahami model sistem dan teknik peningkatan bisnis proses.' },
        { kurikulumId, kode: 'CPL-P17', kategori: 'Pengetahuan', deskripsi: 'Memiliki pemahaman mengenai dasar-dasar bisnis yang berkaitan dengan TI.' },
      ],
    });
    console.log('[Template] ✅ 54 CPL SN-DIKTI');

    // 4. Bahan Kajian (21 items)
    await prisma.bahanKajian.createMany({
      data: [
        { kurikulumId, kode: 'BK01', nama: 'Foundation of Information Systems' },
        { kurikulumId, kode: 'BK02', nama: 'Data / Information Management' },
        { kurikulumId, kode: 'BK03', nama: 'Infrastructure' },
        { kurikulumId, kode: 'BK04', nama: 'Project Management' },
        { kurikulumId, kode: 'BK05', nama: 'Systems Analysis & Design' },
        { kurikulumId, kode: 'BK06', nama: 'IS Management and Strategy' },
        { kurikulumId, kode: 'BK07', nama: 'Application Development / Programming' },
        { kurikulumId, kode: 'BK08', nama: 'Secure Computing' },
        { kurikulumId, kode: 'BK09', nama: 'Ethics, Use and Implications for Society' },
        { kurikulumId, kode: 'BK10', nama: 'Praktikum' },
        { kurikulumId, kode: 'BK11', nama: 'Mathematics and Statistics' },
        { kurikulumId, kode: 'BK12', nama: 'Data / Business Analytics' },
        { kurikulumId, kode: 'BK13', nama: 'Personality Development' },
        { kurikulumId, kode: 'BK14', nama: 'Business Process Management' },
        { kurikulumId, kode: 'BK15', nama: 'Enterprise Architecture' },
        { kurikulumId, kode: 'BK16', nama: 'User Interface Design' },
        { kurikulumId, kode: 'BK17', nama: 'Digital Innovation' },
        { kurikulumId, kode: 'BK18', nama: 'Visualisasi Informasi' },
        { kurikulumId, kode: 'BK19', nama: 'Pemrograman Berorientasi Objek' },
        { kurikulumId, kode: 'BK20', nama: 'Pemrograman Web' },
        { kurikulumId, kode: 'BK21', nama: 'Pemrograman Mobile' },
      ],
    });
    console.log('[Template] ✅ 21 Bahan Kajian');

    // 5. Mata Kuliah (66 items)
    await prisma.mataKuliah.createMany({
      data: [
        { kurikulumId, kode: 'MK01', nama: 'AGAMA', sks: 3, semester: 1, tipe: 'MKWK' },
        { kurikulumId, kode: 'MK02', nama: 'PANCASILA', sks: 2, semester: 1, tipe: 'MKWK' },
        { kurikulumId, kode: 'MK03', nama: 'BAHASA INDONESIA', sks: 2, semester: 1, tipe: 'MKWK' },
        { kurikulumId, kode: 'MK04', nama: 'PENGANTAR SISTEM INFORMASI', sks: 3, semester: 1, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK05', nama: 'ALGORITMA DAN PEMROGRAMAN', sks: 3, semester: 1, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK06', nama: 'LITERASI TIK', sks: 2, semester: 1, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK07', nama: 'MATEMATIKA DISKRIT', sks: 3, semester: 1, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK08', nama: 'ASWAJA', sks: 2, semester: 2, tipe: 'MKDU' },
        { kurikulumId, kode: 'MK09', nama: 'KEWARGANEGARAAN', sks: 2, semester: 2, tipe: 'MKWK' },
        { kurikulumId, kode: 'MK10', nama: 'LOGIKA DAN METODE BERFIKIR KRITIS', sks: 2, semester: 2, tipe: 'MKDU' },
        { kurikulumId, kode: 'MK11', nama: 'MANAJEMEN DATA', sks: 2, semester: 2, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK12', nama: 'STRUKTUR DATA', sks: 2, semester: 2, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK13', nama: 'SISTEM OPERASI', sks: 2, semester: 2, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK14', nama: 'PENGANTAR MANAJEMEN', sks: 3, semester: 2, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK15', nama: 'MANAJEMEN PROSES BISNIS', sks: 3, semester: 2, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK16', nama: 'KEWIRAUSAHAAN', sks: 3, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK17', nama: 'PENGANTAR AKUNTANSI', sks: 3, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK18', nama: 'PEMROGRAMAN BERORIENTASI OBJEK', sks: 3, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK19', nama: 'ANALISIS DAN PERANCANGAN SISTEM INFORMASI', sks: 3, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK20', nama: 'DESAIN UI/UX', sks: 3, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK21', nama: 'SISTEM DAN MANAJEMEN BASIS DATA', sks: 4, semester: 3, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK22', nama: 'PEMROGRAMAN WEB', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK23', nama: 'MANAJEMEN PROYEK SISTEM INFORMASI', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK24', nama: 'DATA SCIENCE', sks: 2, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK25', nama: 'SISTEM ENTERPRISE', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK26', nama: 'RINTISAN BISNIS DIGITAL', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK27', nama: 'DESAIN DAN MANAJEMEN JARINGAN KOMPUTER', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK28', nama: 'RISET OPERASI', sks: 3, semester: 4, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK29', nama: 'PENGUJIAN PERANGKAT LUNAK', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK30', nama: 'MANAJEMEN INVESTASI TI', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK31', nama: 'PROTEKSI ASET INFORMASI', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK32', nama: 'DATA WAREHOUSE DAN DATA MINING', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK33', nama: 'TATA KELOLA TI', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK34', nama: 'CAPSTONE PROJECT', sks: 4, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK35', nama: 'STATISTIK', sks: 3, semester: 5, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK36', nama: 'BAHASA INGGRIS', sks: 2, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK37', nama: 'PERENCANAAN STRATEGIS SI/TI', sks: 3, semester: 6, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK38', nama: 'MANAJEMEN LAYANAN TI', sks: 3, semester: 6, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK39', nama: 'ETIKA PROFESI', sks: 2, semester: 6, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK40', nama: 'MAGANG', sks: 5, semester: 7, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK41', nama: 'METODOLOGI PENELITIAN', sks: 3, semester: 7, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK42', nama: 'KETERAMPILAN INTERPERSONAL', sks: 2, semester: 7, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK43', nama: 'KULIAH KERJA NYATA', sks: 2, semester: 7, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK44', nama: 'TUGAS AKHIR', sks: 6, semester: 8, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK45', nama: 'TEKNOLOGI DAN MASYARAKAT', sks: 3, semester: 8, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK46', nama: 'KULIAH LAPANGAN', sks: 2, semester: 8, tipe: 'WAJIB' },
        { kurikulumId, kode: 'MK47', nama: 'PEMROGRAMAN MOBILE', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK48', nama: 'INTERNET UNTUK SEGALA', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK49', nama: 'TEKNOLOGI PEMROGRAMAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK50', nama: 'ARSITEKTUR TEKNOLOGI', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK51', nama: 'KOMPUTASI AWAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK52', nama: 'MANAJEMEN RISIKO TI', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK53', nama: 'MANAJEMEN PERUBAHAN', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK54', nama: 'PENGUKURAN KINERJA TI', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK55', nama: 'MANAJEMEN KEBERLANGSUNGAN BISNIS', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK56', nama: 'AUDIT SISTEM INFORMASI', sks: 3, semester: 6, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK57', nama: 'SISTEM PENDUKUNG KEPUTUSAN', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK58', nama: 'VISUALISASI INFORMASI', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK59', nama: 'SISTEM CERDAS', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK60', nama: 'TEKNIK PERAMALAN', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK61', nama: 'PENGOLAHAN CITRA', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK62', nama: 'MANAJEMEN MEREK DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK63', nama: 'PEMASARAN DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK64', nama: 'KREATIF DIGITAL', sks: 3, semester: 7, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK65', nama: 'MANAJEMEN HUBUNGAN PELANGGAN', sks: 3, semester: 8, tipe: 'PILIHAN' },
        { kurikulumId, kode: 'MK66', nama: 'MANAJEMEN RANTAI PASOK', sks: 3, semester: 8, tipe: 'PILIHAN' },
      ],
    });
    console.log('[Template] ✅ 66 Mata Kuliah');

    // 6. CPMK (34 items) — linked to CPL via cplMap
    const cpmkData = [
      { cplKode: 'CPL01', kode: 'CPMK011', deskripsi: 'Mampu memahami konsep dasar sistem informasi' },
      { cplKode: 'CPL01', kode: 'CPMK012', deskripsi: 'Mampu menilai peran sistem informasi dalam memberikan rekomendasi pengambilan keputusan di organisasi' },
      { cplKode: 'CPL02', kode: 'CPMK021', deskripsi: 'Mampu merancang dan menggunakan database' },
      { cplKode: 'CPL02', kode: 'CPMK022', deskripsi: 'Mampu mengolah dan menganalisa data dengan alat dan teknik pengolahan data' },
      { cplKode: 'CPL03', kode: 'CPMK031', deskripsi: 'Mampu menggunakan berbagai metodologi pengembangan sistem' },
      { cplKode: 'CPL03', kode: 'CPMK032', deskripsi: 'Mampu menggunakan berbagai alat pemodelan sistem' },
      { cplKode: 'CPL03', kode: 'CPMK033', deskripsi: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi' },
      { cplKode: 'CPL04', kode: 'CPMK041', deskripsi: 'Mampu membuat perencanaan infrastruktur TI, arsitektur jaringan, layanan fisik dan cloud' },
      { cplKode: 'CPL04', kode: 'CPMK042', deskripsi: 'Mampu menganalisa konsep identifikasi, otentikasi, otorisasi akses' },
      { cplKode: 'CPL05', kode: 'CPMK051', deskripsi: 'Mampu memahami kode etik dalam penggunaan informasi dan data' },
      { cplKode: 'CPL05', kode: 'CPMK052', deskripsi: 'Mampu menerapkan kode etik dalam penggunaan informasi dan data' },
      { cplKode: 'CPL06', kode: 'CPMK061', deskripsi: 'Mampu merencanakan sistem informasi organisasi untuk mencapai tujuan organisasi' },
      { cplKode: 'CPL06', kode: 'CPMK062', deskripsi: 'Mampu menerapkan sistem informasi organisasi untuk mencapai tujuan organisasi' },
      { cplKode: 'CPL06', kode: 'CPMK063', deskripsi: 'Mampu memelihara sistem informasi organisasi' },
      { cplKode: 'CPL06', kode: 'CPMK064', deskripsi: 'Mampu meningkatkan sistem informasi organisasi' },
      { cplKode: 'CPL07', kode: 'CPMK071', deskripsi: 'Mampu memahami konsep manajemen proyek sistem informasi' },
      { cplKode: 'CPL07', kode: 'CPMK072', deskripsi: 'Mampu mengidentifikasi teknik manajemen proyek sistem informasi' },
      { cplKode: 'CPL07', kode: 'CPMK073', deskripsi: 'Mampu menerapkan metodologi manajemen proyek sistem informasi' },
      { cplKode: 'CPL08', kode: 'CPMK081', deskripsi: 'Mampu memahami konsep data mining serta visualisasi data' },
      { cplKode: 'CPL08', kode: 'CPMK082', deskripsi: 'Mampu menerapkan data mining serta visualisasi data dalam pengolahan dan penyajian informasi' },
      { cplKode: 'CPL09', kode: 'CPMK091', deskripsi: 'Mampu memahami model sistem dan teknik peningkatan bisnis proses dan inovasi digital' },
      { cplKode: 'CPL09', kode: 'CPMK092', deskripsi: 'Mampu menerapkan model sistem dan teknik peningkatan bisnis proses dan inovasi digital' },
      { cplKode: 'CPL10', kode: 'CPMK101', deskripsi: 'Mampu menunjukkan sikap berjati diri islami berlandaskan nilai ahlus sunah waljamahah' },
      { cplKode: 'CPL10', kode: 'CPMK102', deskripsi: 'Mampu menunjukkan sikap profesionalitas, integritas, komunikasi, kepemimpinan, dan tanggung jawab' },
      { cplKode: 'CPL11', kode: 'CPMK111', deskripsi: 'Mampu menunjukkan sikap taat hukum dan disiplin' },
      { cplKode: 'CPL11', kode: 'CPMK112', deskripsi: 'Mampu menunjukkan sikap menghargai keanekaragaman dan semangat kemandirian' },
      { cplKode: 'CPL12', kode: 'CPMK121', deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur' },
      { cplKode: 'CPL12', kode: 'CPMK122', deskripsi: 'Mampu berfikir logis, kritis, sistematis, dan inovatif' },
      { cplKode: 'CPL13', kode: 'CPMK131', deskripsi: 'Mampu mengkaji implikasi pengembangan ilmu pengetahuan dalam rangka menghasilkan solusi' },
      { cplKode: 'CPL13', kode: 'CPMK132', deskripsi: 'Mampu menyusun deskripsi saintifik hasil kajian dalam bentuk laporan ilmiah' },
      { cplKode: 'CPL13', kode: 'CPMK133', deskripsi: 'Mampu memelihara serta mengembangkan jaringan kerja' },
      { cplKode: 'CPL14', kode: 'CPMK141', deskripsi: 'Mampu melakukan evaluasi diri terhadap penyelesaian pekerjaan' },
      { cplKode: 'CPL14', kode: 'CPMK142', deskripsi: 'Mampu melakukan supervisi terhadap penyelesaian pekerjaan atas pencapaian hasil kelompok kerja' },
    ];
    for (const c of cpmkData) {
      if (cplMap[c.cplKode]) {
        await prisma.cPMK.create({ data: { cplId: cplMap[c.cplKode], kode: c.kode, deskripsi: c.deskripsi } });
      }
    }
    console.log('[Template] ✅ 34 CPMK');

    console.log(`[Template] ✅ Selesai seeding template untuk kurikulum ${kurikulumId}`);
  } catch (error) {
    console.error('[Template] ❌ Gagal seeding template data:', error);
    // Don't throw — kurikulum still created, just without template data
  }
}
