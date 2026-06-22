/**
 * seedNicoDo.ts
 * Seeds ALL 66 MK for kurikulum Nico with REAL curriculum-appropriate data.
 * Creates: Kelas, KelasEnrollment, Mahasiswa, RPSPertemuan, Asesmen, AsesmenSoal, NilaiSoal
 *
 * Usage: npx ts-node src/scripts/runSeedNicoDo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── CONFIG ───────────────────────────────────────────────────
const KURIKULUM_ID = '37ae7117-971d-41e0-a2ae-e41e7b99dbab';

// ─── MAHASISWA POOL (5 students, reused across all kelas) ────
const MAHASISWA_POOL = [
  { nim: '1301210001', nama: 'Ahmad Fauzan Hakim', angkatan: 2021 },
  { nim: '1301210002', nama: 'Siti Nurhaliza Putri', angkatan: 2021 },
  { nim: '1301210003', nama: 'Rizky Dwi Ananda', angkatan: 2021 },
  { nim: '1301210004', nama: 'Dinda Ayu Lestari', angkatan: 2021 },
  { nim: '1301210005', nama: 'Muhammad Rafli Pratama', angkatan: 2021 },
];

// ─── HELPER: deterministic score per (student, mk, asesmen) ──
function getScore(studentIdx: number, mkIdx: number, asesmenIdx: number): number {
  // Produces values 70–95 in a deterministic but varied pattern
  const base = 70;
  const hash = ((studentIdx + 1) * 7 + (mkIdx + 1) * 13 + (asesmenIdx + 1) * 19) % 26;
  return base + hash; // 70-95
}

// ─── REAL MATERI PER MK (16 pertemuan each) ──────────────────
// Pertemuan 8 = UTS review/exam, Pertemuan 16 = UAS review/exam

const MK_MATERI: Record<string, string[]> = {
  // ──────── MK01–MK10 ────────
  'AGAMA': [
    'Konsep Ketuhanan dalam Perspektif Islam',
    'Sumber Hukum Islam: Al-Quran dan Hadits',
    'Akhlak dan Etika dalam Islam',
    'Ibadah dan Muamalah',
    'Islam dan Ilmu Pengetahuan',
    'Toleransi dan Kerukunan Antar Umat Beragama',
    'Islam dan Isu Kontemporer',
    'UTS: Evaluasi Tengah Semester',
    'Ekonomi Syariah dan Perbankan Islam',
    'Islam dan Hak Asasi Manusia',
    'Peran Agama dalam Pembangunan Nasional',
    'Etika Profesi dalam Perspektif Islam',
    'Islam dan Teknologi Informasi',
    'Radikalisme dan Deradikalisasi',
    'Moderasi Beragama di Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PANCASILA': [
    'Sejarah Lahirnya Pancasila',
    'Pancasila sebagai Dasar Negara',
    'Pancasila sebagai Sistem Filsafat',
    'Pancasila sebagai Ideologi Negara',
    'Sila Pertama: Ketuhanan Yang Maha Esa',
    'Sila Kedua: Kemanusiaan yang Adil dan Beradab',
    'Sila Ketiga: Persatuan Indonesia',
    'UTS: Evaluasi Tengah Semester',
    'Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan',
    'Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia',
    'Pancasila dalam Konteks Ketatanegaraan',
    'Pancasila dan Globalisasi',
    'Ancaman terhadap Pancasila',
    'Aktualisasi Nilai-Nilai Pancasila',
    'Pancasila dalam Kehidupan Bermasyarakat',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KEWARGANEGARAAN': [
    'Identitas Nasional Indonesia',
    'Hak dan Kewajiban Warga Negara',
    'Demokrasi Indonesia',
    'Konstitusi dan Rule of Law',
    'Hak Asasi Manusia di Indonesia',
    'Geopolitik dan Wawasan Nusantara',
    'Ketahanan Nasional',
    'UTS: Evaluasi Tengah Semester',
    'Integrasi Nasional',
    'Otonomi Daerah dan Good Governance',
    'Masyarakat Madani (Civil Society)',
    'Sistem Pertahanan dan Keamanan Negara',
    'Politik dan Strategi Nasional',
    'Globalisasi dan Tantangan Nasional',
    'Bela Negara dalam Era Digital',
    'UAS: Evaluasi Akhir Semester',
  ],
  'BAHASA INDONESIA': [
    'Kedudukan Bahasa Indonesia sebagai Bahasa Nasional',
    'Ejaan dan Tanda Baca Bahasa Indonesia (PUEBI)',
    'Kalimat Efektif dan Paragraf',
    'Penulisan Karya Ilmiah: Struktur dan Format',
    'Teknik Penulisan Makalah Akademik',
    'Kutipan, Parafrase, dan Daftar Pustaka',
    'Teknik Presentasi Ilmiah',
    'UTS: Evaluasi Tengah Semester',
    'Penulisan Laporan Penelitian',
    'Penulisan Proposal Penelitian',
    'Analisis Wacana dan Teks Akademik',
    'Korespondensi Resmi dan Surat Dinas',
    'Resensi dan Kritik Ilmiah',
    'Semantik dan Pragmatik dalam Konteks Akademik',
    'Bahasa Indonesia dalam Publikasi Ilmiah',
    'UAS: Evaluasi Akhir Semester',
  ],
  'LOGIKA DAN ALGORITMA': [
    'Pengantar Logika Proposisional',
    'Tabel Kebenaran dan Ekuivalensi Logis',
    'Logika Predikat dan Kuantifikasi',
    'Konsep Dasar Algoritma dan Pseudocode',
    'Flowchart dan Struktur Kontrol',
    'Algoritma Sekuensial dan Percabangan',
    'Algoritma Perulangan dan Iterasi',
    'UTS: Evaluasi Tengah Semester',
    'Array dan Manipulasi Data',
    'Algoritma Pencarian (Linear, Binary Search)',
    'Algoritma Pengurutan (Bubble, Selection, Insertion Sort)',
    'Fungsi dan Prosedur',
    'Rekursi dan Analisis Rekursif',
    'Kompleksitas Algoritma (Big-O Notation)',
    'Studi Kasus: Penyelesaian Masalah dengan Algoritma',
    'UAS: Evaluasi Akhir Semester',
  ],
  'SISTEM INFORMASI': [
    'Konsep Dasar Sistem Informasi',
    'Komponen dan Jenis Sistem Informasi',
    'Sistem Informasi Manajemen (SIM)',
    'Sistem Pendukung Keputusan (SPK)',
    'E-Business dan E-Commerce',
    'Enterprise Resource Planning (ERP)',
    'Infrastruktur Teknologi Informasi',
    'UTS: Evaluasi Tengah Semester',
    'Pengembangan Sistem Informasi (SDLC)',
    'Analisis Kebutuhan Sistem',
    'Basis Data dalam Konteks SI',
    'Keamanan Sistem Informasi',
    'Etika dan Isu Sosial dalam SI',
    'Tren Teknologi: Cloud, IoT, dan AI dalam SI',
    'Studi Kasus Implementasi SI di Organisasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PENGANTAR TEKNOLOGI INFORMASI': [
    'Sejarah dan Evolusi Teknologi Informasi',
    'Perangkat Keras Komputer (Hardware)',
    'Perangkat Lunak Komputer (Software)',
    'Sistem Operasi dan Manajemen File',
    'Jaringan Komputer dan Internet',
    'Pengolahan Data dan Informasi',
    'Aplikasi Perkantoran dan Produktivitas',
    'UTS: Evaluasi Tengah Semester',
    'Basis Data dan Sistem Manajemen Basis Data',
    'Keamanan Informasi dan Cybersecurity Dasar',
    'Multimedia dan Desain Grafis',
    'Komputasi Awan (Cloud Computing)',
    'Internet of Things (IoT)',
    'Kecerdasan Buatan dan Machine Learning',
    'Karir dan Profesi di Bidang TI',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MATEMATIKA DISKRIT': [
    'Logika Matematika dan Proposisi',
    'Himpunan dan Operasi Himpunan',
    'Relasi dan Fungsi',
    'Induksi Matematika',
    'Algoritma dan Bilangan Bulat',
    'Kombinatorika: Permutasi dan Kombinasi',
    'Prinsip Pigeonhole dan Inklusi-Eksklusi',
    'UTS: Evaluasi Tengah Semester',
    'Teori Graf: Konsep Dasar',
    'Graf Euler dan Hamilton',
    'Pohon (Tree) dan Spanning Tree',
    'Pewarnaan Graf dan Planaritas',
    'Aljabar Boolean',
    'Automata dan Bahasa Formal',
    'Aplikasi Matematika Diskrit dalam Informatika',
    'UAS: Evaluasi Akhir Semester',
  ],
  'ALJABAR LINIER': [
    'Sistem Persamaan Linier dan Eliminasi Gauss',
    'Matriks dan Operasi Matriks',
    'Determinan dan Sifat-Sifatnya',
    'Invers Matriks dan Aplikasinya',
    'Ruang Vektor dan Subruang',
    'Independensi Linier dan Basis',
    'Transformasi Linier',
    'UTS: Evaluasi Tengah Semester',
    'Representasi Matriks Transformasi Linier',
    'Nilai Eigen dan Vektor Eigen',
    'Diagonalisasi Matriks',
    'Ruang Hasil Kali Dalam',
    'Proses Gram-Schmidt dan Ortogonalitas',
    'Dekomposisi Nilai Singular (SVD)',
    'Aplikasi Aljabar Linier dalam Data Science',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PEMROGRAMAN DASAR': [
    'Pengantar Pemrograman dan Lingkungan Pengembangan',
    'Variabel, Tipe Data, dan Operator',
    'Input/Output dan Struktur Sekuensial',
    'Percabangan (If-Else, Switch-Case)',
    'Perulangan (For, While, Do-While)',
    'Array Satu Dimensi dan Multi Dimensi',
    'Fungsi dan Parameter',
    'UTS: Evaluasi Tengah Semester',
    'String dan Manipulasi Karakter',
    'Pointer dan Referensi',
    'Struct dan Union',
    'File Handling: Membaca dan Menulis File',
    'Sorting dan Searching Sederhana',
    'Debugging dan Error Handling',
    'Proyek Mini: Aplikasi Konsol Sederhana',
    'UAS: Evaluasi Akhir Semester',
  ],

  // ──────── MK11–MK20 ────────
  'MANAJEMEN DATA': [
    'Konsep Data, Informasi, dan Pengetahuan',
    'Siklus Hidup Data (Data Lifecycle)',
    'Model Data: Hierarkis, Jaringan, Relasional',
    'Normalisasi Data (1NF, 2NF, 3NF, BCNF)',
    'Metadata dan Katalog Data',
    'Kualitas Data dan Data Cleansing',
    'Master Data Management (MDM)',
    'UTS: Evaluasi Tengah Semester',
    'Data Governance dan Kebijakan Data',
    'Big Data: Volume, Velocity, Variety',
    'Data Integration dan ETL',
    'Data Privacy dan Regulasi (GDPR, UU PDP)',
    'Data Architecture dan Data Modeling',
    'Open Data dan Data Sharing',
    'Studi Kasus Manajemen Data di Organisasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'STRUKTUR DATA': [
    'Abstract Data Type (ADT) dan Kompleksitas',
    'Array dan Linked List',
    'Singly, Doubly, dan Circular Linked List',
    'Stack: Konsep dan Implementasi',
    'Queue dan Priority Queue',
    'Rekursi dan Backtracking',
    'Tree: Binary Tree dan Binary Search Tree',
    'UTS: Evaluasi Tengah Semester',
    'AVL Tree dan Balanced BST',
    'Heap dan Heap Sort',
    'Hashing dan Hash Table',
    'Graf: Representasi dan Traversal (BFS, DFS)',
    'Shortest Path: Dijkstra dan Bellman-Ford',
    'Minimum Spanning Tree: Kruskal dan Prim',
    'Studi Kasus: Penerapan Struktur Data',
    'UAS: Evaluasi Akhir Semester',
  ],
  'SISTEM OPERASI': [
    'Pengantar Sistem Operasi dan Sejarahnya',
    'Struktur Sistem Operasi dan System Call',
    'Manajemen Proses dan Thread',
    'Penjadwalan CPU (FCFS, SJF, Round Robin)',
    'Sinkronisasi Proses dan Critical Section',
    'Deadlock: Deteksi, Pencegahan, dan Recovery',
    'Manajemen Memori: Paging dan Segmentasi',
    'UTS: Evaluasi Tengah Semester',
    'Virtual Memory dan Page Replacement',
    'Sistem File dan Manajemen Penyimpanan',
    'I/O System dan Device Driver',
    'Proteksi dan Keamanan Sistem Operasi',
    'Studi Kasus: Linux Kernel',
    'Virtualisasi dan Container (Docker)',
    'Sistem Operasi Terdistribusi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PENGANTAR MANAJEMEN': [
    'Konsep Dasar Manajemen dan Organisasi',
    'Evolusi Teori Manajemen',
    'Lingkungan Bisnis dan Pengambilan Keputusan',
    'Perencanaan (Planning) dan Penetapan Tujuan',
    'Pengorganisasian (Organizing) dan Struktur Organisasi',
    'Kepemimpinan (Leading) dan Motivasi',
    'Pengendalian (Controlling) dan Evaluasi Kinerja',
    'UTS: Evaluasi Tengah Semester',
    'Manajemen Sumber Daya Manusia',
    'Manajemen Operasi dan Rantai Pasok',
    'Manajemen Pemasaran',
    'Manajemen Keuangan Dasar',
    'Etika Bisnis dan Tanggung Jawab Sosial',
    'Manajemen Perubahan dan Inovasi',
    'Manajemen Strategis: Pengantar',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN PROSES BISNIS': [
    'Konsep Dasar Proses Bisnis',
    'Business Process Modeling Notation (BPMN)',
    'Identifikasi dan Dokumentasi Proses Bisnis',
    'Analisis Proses Bisnis (As-Is Analysis)',
    'Desain Proses Bisnis (To-Be Design)',
    'Key Performance Indicator (KPI) Proses',
    'Business Process Automation',
    'UTS: Evaluasi Tengah Semester',
    'Business Process Reengineering (BPR)',
    'Continuous Process Improvement (CPI)',
    'Lean Management dan Six Sigma',
    'Workflow Management System',
    'Process Mining dan Process Analytics',
    'Integrasi Proses Bisnis Antar-Sistem',
    'Studi Kasus: Transformasi Proses Bisnis Digital',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KEWIRAUSAHAAN': [
    'Konsep Dasar Kewirausahaan dan Mindset Wirausaha',
    'Identifikasi Peluang Bisnis',
    'Model Bisnis Canvas (BMC)',
    'Riset Pasar dan Validasi Ide',
    'Perencanaan Keuangan dan Modal Usaha',
    'Strategi Pemasaran untuk Startup',
    'Aspek Legal dan Perizinan Usaha',
    'UTS: Evaluasi Tengah Semester',
    'Pengembangan Produk Minimum (MVP)',
    'Manajemen Tim dan Kepemimpinan Startup',
    'Pitching dan Presentasi Bisnis',
    'Pendanaan: Angel Investor, VC, dan Crowdfunding',
    'Digital Marketing untuk UMKM',
    'Scaling dan Pertumbuhan Bisnis',
    'Studi Kasus Startup Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PENGANTAR AKUNTANSI': [
    'Konsep Dasar Akuntansi dan Prinsip Akuntansi',
    'Persamaan Dasar Akuntansi',
    'Siklus Akuntansi: Jurnal dan Posting',
    'Buku Besar dan Neraca Saldo',
    'Jurnal Penyesuaian',
    'Laporan Laba Rugi',
    'Neraca (Laporan Posisi Keuangan)',
    'UTS: Evaluasi Tengah Semester',
    'Laporan Arus Kas',
    'Akuntansi Persediaan',
    'Akuntansi Aset Tetap dan Penyusutan',
    'Akuntansi Hutang dan Modal',
    'Analisis Laporan Keuangan',
    'Akuntansi Biaya Dasar',
    'Sistem Informasi Akuntansi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PEMROGRAMAN BERORIENTASI OBJEK': [
    'Paradigma Pemrograman dan Pengantar OOP',
    'Class, Object, dan Constructor',
    'Encapsulation dan Access Modifier',
    'Inheritance dan Polimorfisme',
    'Abstract Class dan Interface',
    'Exception Handling',
    'Collection Framework (List, Set, Map)',
    'UTS: Evaluasi Tengah Semester',
    'Generics dan Type Safety',
    'File I/O dan Serialization',
    'Design Pattern: Singleton, Factory, Observer',
    'UML: Class Diagram dan Sequence Diagram',
    'Unit Testing dan Test-Driven Development',
    'GUI Programming Dasar',
    'Proyek OOP: Aplikasi Terintegrasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'ANALISIS DAN PERANCANGAN SI': [
    'Pengantar Analisis dan Perancangan Sistem Informasi',
    'System Development Life Cycle (SDLC)',
    'Teknik Pengumpulan Kebutuhan (Requirement Elicitation)',
    'Pemodelan Proses: Data Flow Diagram (DFD)',
    'Pemodelan Data: Entity Relationship Diagram (ERD)',
    'Use Case Diagram dan Skenario',
    'Activity Diagram dan Sequence Diagram',
    'UTS: Evaluasi Tengah Semester',
    'Perancangan Arsitektur Sistem',
    'Perancangan Basis Data',
    'Perancangan Antarmuka Pengguna',
    'Prototyping dan Wireframing',
    'Pengujian dan Validasi Kebutuhan',
    'Dokumentasi Sistem: SRS dan SDD',
    'Studi Kasus: Analisis dan Perancangan SI Nyata',
    'UAS: Evaluasi Akhir Semester',
  ],
  'DESAIN UI/UX': [
    'Pengantar UI/UX dan Human-Computer Interaction',
    'Prinsip Desain Visual: Tipografi, Warna, Layout',
    'User Research dan Persona',
    'User Journey Map dan Empathy Map',
    'Information Architecture dan Card Sorting',
    'Wireframing: Low-Fidelity dan High-Fidelity',
    'Prototyping dengan Figma',
    'UTS: Evaluasi Tengah Semester',
    'Interaction Design dan Micro-Interactions',
    'Responsive Design dan Mobile-First Approach',
    'Usability Testing dan Heuristic Evaluation',
    'Accessibility (WCAG) dan Inclusive Design',
    'Design System dan Component Library',
    'Desain UI untuk Aplikasi Mobile',
    'Proyek Akhir: Redesign Aplikasi',
    'UAS: Evaluasi Akhir Semester',
  ],

  // ──────── MK21–MK30 ────────
  'SISTEM DAN MANAJEMEN BASIS DATA': [
    'Konsep Dasar Basis Data dan DBMS',
    'Model Data Relasional dan Aljabar Relasional',
    'SQL: DDL (CREATE, ALTER, DROP)',
    'SQL: DML (SELECT, INSERT, UPDATE, DELETE)',
    'SQL Lanjut: JOIN, Subquery, dan View',
    'Normalisasi dan Denormalisasi',
    'Indexing dan Optimasi Query',
    'UTS: Evaluasi Tengah Semester',
    'Transaksi dan Concurrency Control',
    'Recovery dan Backup Database',
    'Stored Procedure, Trigger, dan Function',
    'NoSQL: MongoDB dan Key-Value Store',
    'Database Administration dan Security',
    'Data Modeling Lanjut',
    'Studi Kasus: Perancangan Database Skala Besar',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PEMROGRAMAN WEB': [
    'Pengantar Web dan Arsitektur Client-Server',
    'HTML5: Struktur dan Semantic Markup',
    'CSS3: Styling, Flexbox, dan Grid',
    'JavaScript: Dasar dan DOM Manipulation',
    'Responsive Web Design dan Framework CSS',
    'JavaScript Lanjut: ES6+, Async/Await',
    'Frontend Framework: React.js Dasar',
    'UTS: Evaluasi Tengah Semester',
    'Backend Development: Node.js dan Express',
    'RESTful API Design dan Implementasi',
    'Database Integration: ORM (Prisma/Sequelize)',
    'Authentication dan Authorization (JWT)',
    'Deployment dan Web Hosting',
    'Version Control dengan Git dan GitHub',
    'Proyek Akhir: Full-Stack Web Application',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN PROYEK SI': [
    'Pengantar Manajemen Proyek dan PMBOK',
    'Inisiasi Proyek dan Project Charter',
    'Perencanaan Ruang Lingkup (Scope Management)',
    'Work Breakdown Structure (WBS)',
    'Penjadwalan Proyek: Gantt Chart dan Critical Path',
    'Estimasi Biaya dan Anggaran Proyek',
    'Manajemen Risiko Proyek',
    'UTS: Evaluasi Tengah Semester',
    'Manajemen Kualitas Proyek',
    'Manajemen Sumber Daya dan Tim Proyek',
    'Manajemen Komunikasi dan Stakeholder',
    'Agile Project Management: Scrum dan Kanban',
    'Monitoring, Controlling, dan Earned Value',
    'Penutupan Proyek dan Lessons Learned',
    'Studi Kasus: Manajemen Proyek SI Nyata',
    'UAS: Evaluasi Akhir Semester',
  ],
  'DATA SCIENCE': [
    'Pengantar Data Science dan Ekosistemnya',
    'Python untuk Data Science: NumPy dan Pandas',
    'Eksplorasi Data dan Statistik Deskriptif',
    'Visualisasi Data dengan Matplotlib dan Seaborn',
    'Data Cleaning dan Preprocessing',
    'Regresi Linier dan Logistik',
    'Klasifikasi: Decision Tree dan Random Forest',
    'UTS: Evaluasi Tengah Semester',
    'Clustering: K-Means dan Hierarchical',
    'Evaluasi Model: Confusion Matrix, ROC, AUC',
    'Feature Engineering dan Selection',
    'Natural Language Processing (NLP) Dasar',
    'Deep Learning: Pengantar Neural Network',
    'Big Data Tools: Spark dan Hadoop Dasar',
    'Proyek Data Science: End-to-End Pipeline',
    'UAS: Evaluasi Akhir Semester',
  ],
  'SISTEM ENTERPRISE': [
    'Pengantar Sistem Enterprise dan Arsitektur Enterprise',
    'Enterprise Resource Planning (ERP): Konsep dan Modul',
    'Supply Chain Management (SCM) System',
    'Customer Relationship Management (CRM) System',
    'Business Intelligence dan Dashboard',
    'Enterprise Application Integration (EAI)',
    'SOA dan Microservices Architecture',
    'UTS: Evaluasi Tengah Semester',
    'Implementasi ERP: Metodologi dan Best Practice',
    'Change Management dalam Implementasi Enterprise System',
    'Cloud-Based Enterprise Systems (SaaS)',
    'Enterprise Content Management (ECM)',
    'Enterprise Security dan Compliance',
    'Digital Transformation dan Industry 4.0',
    'Studi Kasus: Implementasi SAP/Oracle di Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'RINTISAN BISNIS DIGITAL': [
    'Ekosistem Bisnis Digital di Indonesia',
    'Lean Startup Methodology',
    'Problem-Solution Fit dan Product-Market Fit',
    'Business Model Innovation',
    'Customer Development dan Validasi',
    'Minimum Viable Product (MVP) Digital',
    'Digital Platform dan Marketplace',
    'UTS: Evaluasi Tengah Semester',
    'Growth Hacking dan Metrik Startup',
    'Monetisasi: Freemium, Subscription, Ads',
    'Fintech dan Payment Gateway',
    'Legal Aspects: PT, CV, dan Regulasi Digital',
    'Pitch Deck dan Presentasi ke Investor',
    'Venture Capital dan Tahapan Pendanaan',
    'Studi Kasus: Unicorn Startup Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'DESAIN DAN MANAJEMEN JARINGAN KOMPUTER': [
    'Pengantar Jaringan Komputer dan Model OSI',
    'Model TCP/IP dan Protokol Jaringan',
    'Pengalamatan IP (IPv4 dan IPv6) dan Subnetting',
    'Perangkat Jaringan: Router, Switch, Access Point',
    'Topologi Jaringan dan Desain LAN',
    'VLAN dan Inter-VLAN Routing',
    'Routing Protocol: Static, RIP, OSPF',
    'UTS: Evaluasi Tengah Semester',
    'Wireless Network dan Standar IEEE 802.11',
    'Network Security: Firewall dan IDS/IPS',
    'VPN dan Teknologi Tunneling',
    'Network Monitoring dan SNMP',
    'Quality of Service (QoS)',
    'Software-Defined Networking (SDN)',
    'Studi Kasus: Desain Jaringan Enterprise',
    'UAS: Evaluasi Akhir Semester',
  ],
  'RISET OPERASI': [
    'Pengantar Riset Operasi dan Pemodelan Matematika',
    'Pemrograman Linier: Formulasi Model',
    'Metode Grafis dan Metode Simpleks',
    'Dualitas dan Analisis Sensitivitas',
    'Masalah Transportasi',
    'Masalah Penugasan (Assignment Problem)',
    'Integer Programming dan Mixed Integer Programming',
    'UTS: Evaluasi Tengah Semester',
    'Network Flow: Shortest Path dan Maximum Flow',
    'Teori Antrian (Queueing Theory)',
    'Simulasi Monte Carlo',
    'Dynamic Programming',
    'Teori Permainan (Game Theory)',
    'Goal Programming dan Multi-Objective',
    'Aplikasi Riset Operasi dalam Bisnis TI',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PENGUJIAN PERANGKAT LUNAK': [
    'Pengantar Pengujian Perangkat Lunak dan Quality Assurance',
    'Prinsip dan Tujuan Pengujian',
    'Pengujian Black Box: Equivalence Partitioning, Boundary Value',
    'Pengujian White Box: Statement, Branch, Path Coverage',
    'Test Case Design dan Test Plan',
    'Unit Testing dan Framework Testing (JUnit, Jest)',
    'Integration Testing dan System Testing',
    'UTS: Evaluasi Tengah Semester',
    'Acceptance Testing dan UAT',
    'Performance Testing dan Load Testing',
    'Security Testing dan Penetration Testing',
    'Regression Testing dan Automation Testing',
    'Test-Driven Development (TDD) dan BDD',
    'CI/CD dan Automated Test Pipeline',
    'Bug Tracking dan Test Management Tools',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN INVESTASI TI': [
    'Konsep Investasi Teknologi Informasi',
    'Total Cost of Ownership (TCO)',
    'Return on Investment (ROI) untuk Proyek TI',
    'Net Present Value (NPV) dan Internal Rate of Return (IRR)',
    'Cost-Benefit Analysis (CBA) Proyek TI',
    'IT Portfolio Management',
    'Business Case Development',
    'UTS: Evaluasi Tengah Semester',
    'IT Value Management dan Val IT Framework',
    'Analisis Risiko Investasi TI',
    'Balanced Scorecard untuk TI',
    'IT Outsourcing: Make vs Buy Decision',
    'Cloud Computing Economics',
    'Pengukuran Value dari Transformasi Digital',
    'Studi Kasus: Evaluasi Investasi TI di Perusahaan',
    'UAS: Evaluasi Akhir Semester',
  ],

  // ──────── MK31–MK40 ────────
  'PROTEKSI ASET INFORMASI': [
    'Pengantar Keamanan Informasi dan CIA Triad',
    'Ancaman dan Kerentanan Keamanan Informasi',
    'Kriptografi: Enkripsi Simetris dan Asimetris',
    'Public Key Infrastructure (PKI) dan Digital Signature',
    'Manajemen Identitas dan Akses (IAM)',
    'Network Security dan Firewall',
    'Malware Analysis dan Incident Response',
    'UTS: Evaluasi Tengah Semester',
    'Standar Keamanan: ISO 27001 dan NIST',
    'Security Policy dan Security Awareness',
    'Penetration Testing dan Vulnerability Assessment',
    'Keamanan Aplikasi Web (OWASP Top 10)',
    'Data Protection dan Privacy (UU PDP)',
    'Business Continuity dan Disaster Recovery',
    'Digital Forensics Dasar',
    'UAS: Evaluasi Akhir Semester',
  ],
  'DATA WAREHOUSE DAN DATA MINING': [
    'Pengantar Data Warehouse dan Arsitekturnya',
    'Dimensional Modeling: Star dan Snowflake Schema',
    'Proses ETL (Extract, Transform, Load)',
    'OLAP: Slice, Dice, Roll-up, Drill-down',
    'Data Warehouse Design dan Implementation',
    'Pengantar Data Mining dan KDD Process',
    'Association Rule Mining (Apriori, FP-Growth)',
    'UTS: Evaluasi Tengah Semester',
    'Klasifikasi: Naive Bayes dan Decision Tree',
    'Clustering: K-Means dan DBSCAN',
    'Regresi dan Prediksi',
    'Text Mining dan Sentiment Analysis',
    'Evaluasi Model Data Mining',
    'Big Data Analytics dan Tools (Hadoop, Spark)',
    'Studi Kasus: Data Warehouse dan Mining di Industri',
    'UAS: Evaluasi Akhir Semester',
  ],
  'TATA KELOLA TI': [
    'Pengantar Tata Kelola TI dan IT Governance',
    'Framework COBIT 2019: Prinsip dan Komponen',
    'ITIL 4: Service Value System',
    'ISO/IEC 38500: Corporate Governance of IT',
    'Alignment Bisnis-TI (Strategic Alignment)',
    'Struktur Organisasi TI dan Peran CIO',
    'Performance Measurement dan IT Dashboard',
    'UTS: Evaluasi Tengah Semester',
    'Risk Management dalam Tata Kelola TI',
    'Compliance dan Regulasi TI',
    'IT Service Management (ITSM)',
    'Maturity Model dan Capability Assessment',
    'Tata Kelola Data (Data Governance)',
    'Audit TI dan Assurance',
    'Studi Kasus: Implementasi COBIT di Organisasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'CAPSTONE PROJECT': [
    'Pengantar Capstone Project dan Pembentukan Tim',
    'Identifikasi Masalah dan Ruang Lingkup Proyek',
    'Studi Literatur dan Analisis Kebutuhan',
    'Perancangan Arsitektur Solusi',
    'Perencanaan Proyek dan Milestone',
    'Implementasi Sprint 1: Core Features',
    'Review dan Iterasi Sprint 1',
    'UTS: Presentasi Progres Tengah Semester',
    'Implementasi Sprint 2: Advanced Features',
    'Pengujian dan Quality Assurance',
    'Implementasi Sprint 3: Integrasi dan Polish',
    'User Acceptance Testing',
    'Dokumentasi Teknis dan User Manual',
    'Persiapan Presentasi Akhir',
    'Demo Day dan Presentasi Proyek',
    'UAS: Penilaian Akhir Proyek',
  ],
  'STATISTIK': [
    'Pengantar Statistik dan Pengumpulan Data',
    'Statistik Deskriptif: Mean, Median, Modus',
    'Distribusi Frekuensi dan Visualisasi Data',
    'Ukuran Dispersi: Varians dan Standar Deviasi',
    'Probabilitas dan Distribusi Probabilitas',
    'Distribusi Normal dan Distribusi Binomial',
    'Sampling dan Distribusi Sampling',
    'UTS: Evaluasi Tengah Semester',
    'Estimasi Interval dan Confidence Interval',
    'Uji Hipotesis: Z-Test dan T-Test',
    'Uji Chi-Square dan ANOVA',
    'Korelasi dan Regresi Linier Sederhana',
    'Regresi Linier Berganda',
    'Statistik Non-Parametrik',
    'Aplikasi Statistik dengan Software (SPSS/R)',
    'UAS: Evaluasi Akhir Semester',
  ],
  'BAHASA INGGRIS': [
    'Academic English: Reading Comprehension Skills',
    'Grammar Review: Tenses dan Sentence Structure',
    'Vocabulary Building for IT and Business',
    'Academic Writing: Paragraph Development',
    'Listening Comprehension dan Note-Taking',
    'Speaking: Presentation Skills Dasar',
    'Writing: Essay Structure (Introduction, Body, Conclusion)',
    'UTS: Evaluasi Tengah Semester',
    'Reading: Journal Articles dan Technical Documentation',
    'Writing: Abstract dan Literature Review',
    'Speaking: Group Discussion dan Debate',
    'Technical Writing: User Manual dan Documentation',
    'Business Communication: Email dan Memo',
    'TOEFL/IELTS Preparation Strategies',
    'Presentasi Akhir dalam Bahasa Inggris',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PERENCANAAN STRATEGIS SI/TI': [
    'Pengantar Perencanaan Strategis SI/TI',
    'Analisis Lingkungan Internal dan Eksternal Organisasi',
    'SWOT Analysis dan PEST Analysis untuk TI',
    'IT Strategic Alignment: Henderson-Venkatraman Model',
    'Enterprise Architecture: TOGAF Framework',
    'IT Roadmap dan Technology Adoption',
    'IT Balanced Scorecard',
    'UTS: Evaluasi Tengah Semester',
    'Digital Transformation Strategy',
    'IT Portfolio Planning dan Prioritization',
    'Vendor Selection dan IT Procurement',
    'IT Budgeting dan Resource Planning',
    'IT Innovation Management',
    'Measuring IT Strategic Value',
    'Studi Kasus: IT Strategic Plan Organisasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN LAYANAN TI': [
    'Pengantar IT Service Management (ITSM)',
    'ITIL 4 Framework: Key Concepts',
    'Service Strategy dan Service Portfolio',
    'Service Design dan Service Level Management',
    'Service Transition dan Change Management',
    'Service Operation: Incident dan Problem Management',
    'Service Desk dan Knowledge Management',
    'UTS: Evaluasi Tengah Semester',
    'Continual Service Improvement (CSI)',
    'IT Service Catalog dan Request Fulfillment',
    'Configuration Management Database (CMDB)',
    'Capacity Management dan Availability Management',
    'IT Service Continuity Management',
    'Monitoring dan Reporting Layanan TI',
    'Studi Kasus: Implementasi ITSM di Perusahaan',
    'UAS: Evaluasi Akhir Semester',
  ],
  'ETIKA PROFESI': [
    'Pengantar Etika dan Moralitas',
    'Etika Profesi di Bidang Teknologi Informasi',
    'Kode Etik Profesi: ACM, IEEE, APTIKNAS',
    'Hak Kekayaan Intelektual (HKI) dan Hak Cipta',
    'Privasi Data dan Perlindungan Informasi Pribadi',
    'Cybercrime dan Hukum Siber (UU ITE)',
    'Plagiarisme dan Integritas Akademik',
    'UTS: Evaluasi Tengah Semester',
    'Tanggung Jawab Sosial Profesional TI',
    'Whistleblowing dan Dilema Etis',
    'AI Ethics dan Algorithmic Bias',
    'Digital Divide dan Inklusi Digital',
    'Open Source dan Software Licensing',
    'Studi Kasus: Dilema Etis di Industri TI',
    'Presentasi: Analisis Isu Etika Kontemporer',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MAGANG': [
    'Orientasi Program Magang dan Persiapan',
    'Penyusunan CV dan Portofolio Profesional',
    'Teknik Wawancara Kerja',
    'Etika dan Profesionalisme di Tempat Kerja',
    'Pelaksanaan Magang Minggu 1-2',
    'Pelaksanaan Magang Minggu 3-4',
    'Pelaksanaan Magang Minggu 5-6',
    'UTS: Laporan Progres Magang',
    'Pelaksanaan Magang Minggu 7-8',
    'Pelaksanaan Magang Minggu 9-10',
    'Pelaksanaan Magang Minggu 11-12',
    'Refleksi Pengalaman dan Pembelajaran',
    'Penyusunan Laporan Magang',
    'Presentasi Hasil Magang',
    'Evaluasi dan Feedback dari Pembimbing',
    'UAS: Penilaian Akhir Magang',
  ],

  // ──────── MK41–MK50 ────────
  'METODOLOGI PENELITIAN': [
    'Pengantar Metodologi Penelitian Ilmiah',
    'Jenis-Jenis Penelitian: Kuantitatif, Kualitatif, Mixed-Method',
    'Identifikasi Masalah dan Pertanyaan Penelitian',
    'Studi Literatur dan Literature Review',
    'Kerangka Berpikir dan Hipotesis',
    'Desain Penelitian dan Variabel',
    'Populasi, Sampel, dan Teknik Sampling',
    'UTS: Evaluasi Tengah Semester',
    'Instrumen Penelitian: Kuesioner dan Wawancara',
    'Validitas dan Reliabilitas Instrumen',
    'Teknik Pengumpulan Data Primer dan Sekunder',
    'Analisis Data Kuantitatif (Statistik)',
    'Analisis Data Kualitatif (Coding dan Tematik)',
    'Penulisan Proposal dan Laporan Penelitian',
    'Presentasi Proposal Penelitian',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KETERAMPILAN INTERPERSONAL': [
    'Pengantar Soft Skills dan Keterampilan Interpersonal',
    'Komunikasi Efektif: Verbal dan Non-Verbal',
    'Active Listening dan Empati',
    'Kerjasama Tim dan Teamwork',
    'Kepemimpinan dan Gaya Kepemimpinan',
    'Manajemen Konflik dan Negosiasi',
    'Time Management dan Produktivitas',
    'UTS: Evaluasi Tengah Semester',
    'Public Speaking dan Presentation Skills',
    'Emotional Intelligence (EQ)',
    'Critical Thinking dan Problem Solving',
    'Networking dan Personal Branding',
    'Cross-Cultural Communication',
    'Stress Management dan Work-Life Balance',
    'Simulasi: Role Play dan Case Study',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KKN': [
    'Orientasi KKN dan Pembentukan Kelompok',
    'Observasi dan Identifikasi Potensi Desa/Kelurahan',
    'Analisis Masalah Masyarakat dengan Pendekatan Partisipatif',
    'Perencanaan Program Kerja KKN',
    'Pelaksanaan Program: Sosialisasi Teknologi',
    'Pelaksanaan Program: Pelatihan Digital Literacy',
    'Pelaksanaan Program: Pembuatan Website Desa',
    'UTS: Laporan Progres Tengah KKN',
    'Pelaksanaan Program: Pendampingan UMKM Digital',
    'Pelaksanaan Program: Workshop dan Seminar',
    'Monitoring dan Evaluasi Program',
    'Dokumentasi Kegiatan dan Pelaporan',
    'Pengembangan Keberlanjutan Program',
    'Penyusunan Laporan Akhir KKN',
    'Seminar Hasil KKN',
    'UAS: Penilaian Akhir KKN',
  ],
  'TUGAS AKHIR': [
    'Orientasi Tugas Akhir dan Pemilihan Topik',
    'Studi Literatur dan State of the Art',
    'Penyusunan Proposal Tugas Akhir',
    'Seminar Proposal Tugas Akhir',
    'Perancangan Solusi dan Metodologi',
    'Implementasi Tahap 1: Prototype',
    'Review dan Revisi dengan Pembimbing',
    'UTS: Evaluasi Progres Tengah Semester',
    'Implementasi Tahap 2: Pengembangan Lanjut',
    'Pengujian dan Validasi Hasil',
    'Analisis Hasil dan Pembahasan',
    'Penulisan Laporan Tugas Akhir',
    'Revisi Laporan dan Finalisasi',
    'Persiapan Sidang Akhir',
    'Sidang Tugas Akhir',
    'UAS: Penilaian Akhir dan Revisi Final',
  ],
  'TEKNOLOGI DAN MASYARAKAT': [
    'Hubungan Teknologi dan Masyarakat',
    'Sejarah Revolusi Industri dan Dampak Sosial',
    'Digital Divide dan Kesenjangan Akses Teknologi',
    'Media Sosial dan Dampaknya terhadap Masyarakat',
    'Privasi dan Surveillance di Era Digital',
    'Etika Kecerdasan Buatan dan Otomasi',
    'E-Government dan Pelayanan Publik Digital',
    'UTS: Evaluasi Tengah Semester',
    'Teknologi Hijau dan Sustainability',
    'Literasi Digital dan Hoaks',
    'Cyber Bullying dan Keamanan Online',
    'Teknologi dan Pendidikan (EdTech)',
    'Teknologi dan Kesehatan (HealthTech)',
    'Smart City dan Internet of Things',
    'Masa Depan Teknologi dan Masyarakat 5.0',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KULIAH LAPANGAN': [
    'Orientasi Kuliah Lapangan dan Persiapan',
    'Identifikasi Objek Kunjungan Industri TI',
    'Penyusunan Rencana Kunjungan dan Proposal',
    'Studi Literatur tentang Perusahaan/Organisasi Tujuan',
    'Kunjungan Industri 1: Perusahaan Teknologi',
    'Kunjungan Industri 2: Data Center',
    'Kunjungan Industri 3: Startup Digital',
    'UTS: Laporan Progres Kunjungan',
    'Kunjungan Industri 4: Instansi Pemerintah (e-Gov)',
    'Kunjungan Industri 5: Perusahaan Telekomunikasi',
    'Analisis Perbandingan Organisasi yang Dikunjungi',
    'Refleksi dan Pelajaran dari Kunjungan',
    'Penyusunan Laporan Kuliah Lapangan',
    'Presentasi Hasil Kunjungan Industri',
    'Diskusi dan Evaluasi Pembelajaran',
    'UAS: Penilaian Akhir Kuliah Lapangan',
  ],
  'PEMROGRAMAN MOBILE': [
    'Pengantar Mobile Development dan Platform',
    'Lingkungan Pengembangan: Android Studio / Flutter',
    'UI Layout: Widget, Activity, dan Navigation',
    'Komponen UI: Button, TextView, RecyclerView',
    'Event Handling dan Gesture',
    'State Management dan Lifecycle',
    'Local Storage: SharedPreferences dan SQLite',
    'UTS: Evaluasi Tengah Semester',
    'Networking: REST API dan HTTP Client',
    'JSON Parsing dan Data Binding',
    'Firebase: Authentication dan Realtime Database',
    'Push Notification dan Background Services',
    'Maps dan Location Services',
    'Testing dan Debugging Aplikasi Mobile',
    'Proyek Akhir: Aplikasi Mobile Terintegrasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'INTERNET UNTUK SEGALA': [
    'Pengantar Internet of Things (IoT) dan Arsitekturnya',
    'Sensor dan Aktuator: Jenis dan Karakteristik',
    'Mikrokontroler: Arduino dan ESP32',
    'Komunikasi IoT: MQTT, CoAP, HTTP',
    'Wireless Protocol: WiFi, Bluetooth, LoRa, Zigbee',
    'Platform IoT: ThingsBoard, Blynk, AWS IoT',
    'Pemrograman IoT dengan Arduino IDE',
    'UTS: Evaluasi Tengah Semester',
    'Edge Computing dan Fog Computing',
    'IoT Data Analytics dan Dashboard',
    'Keamanan IoT dan Privacy',
    'Smart Home dan Home Automation',
    'Industrial IoT (IIoT) dan Industry 4.0',
    'Wearable Technology dan Healthcare IoT',
    'Proyek IoT: Prototipe Sistem Smart',
    'UAS: Evaluasi Akhir Semester',
  ],
  'TEKNOLOGI PEMROGRAMAN': [
    'Paradigma Pemrograman: Imperatif, Deklaratif, Fungsional',
    'Pemrograman Fungsional dengan JavaScript/TypeScript',
    'Reactive Programming dan Observable Pattern',
    'Concurrent dan Parallel Programming',
    'API Design: REST, GraphQL, gRPC',
    'Microservices Architecture dan Communication',
    'Containerization dengan Docker',
    'UTS: Evaluasi Tengah Semester',
    'Orchestration dengan Kubernetes',
    'Event-Driven Architecture dan Message Queue',
    'Serverless Computing dan FaaS',
    'DevOps Practice dan CI/CD Pipeline',
    'Infrastructure as Code (Terraform, Ansible)',
    'Monitoring dan Observability (Prometheus, Grafana)',
    'Proyek: Membangun Aplikasi Modern Stack',
    'UAS: Evaluasi Akhir Semester',
  ],
  'ARSITEKTUR TEKNOLOGI': [
    'Pengantar Arsitektur Teknologi Informasi',
    'Arsitektur Komputer: CPU, Memory, Storage',
    'Arsitektur Client-Server dan Multi-Tier',
    'Arsitektur Monolitik vs Microservices',
    'Enterprise Architecture Framework (TOGAF, Zachman)',
    'Cloud Architecture: IaaS, PaaS, SaaS',
    'Reference Architecture dan Architecture Pattern',
    'UTS: Evaluasi Tengah Semester',
    'Data Architecture dan Data Flow',
    'Integration Architecture dan Middleware',
    'Security Architecture dan Zero Trust',
    'High Availability dan Disaster Recovery Architecture',
    'Scalability dan Performance Architecture',
    'Architecture Decision Record (ADR)',
    'Studi Kasus: Desain Arsitektur Sistem Enterprise',
    'UAS: Evaluasi Akhir Semester',
  ],

  // ──────── MK51–MK60 ────────
  'KOMPUTASI AWAN': [
    'Pengantar Cloud Computing dan Model Layanan',
    'Virtualisasi: Hypervisor dan Virtual Machine',
    'IaaS: Amazon EC2, Google Compute Engine',
    'PaaS: Heroku, Google App Engine, Azure App Service',
    'SaaS: Google Workspace, Microsoft 365',
    'Cloud Storage: S3, Blob Storage, Cloud Storage',
    'Networking di Cloud: VPC, Load Balancer',
    'UTS: Evaluasi Tengah Semester',
    'Containerization dan Kubernetes di Cloud',
    'Serverless: AWS Lambda, Azure Functions',
    'Cloud Database: RDS, Firestore, CosmosDB',
    'Cloud Security dan Identity Management',
    'Cost Management dan Optimization',
    'Multi-Cloud dan Hybrid Cloud Strategy',
    'Proyek: Deploy Aplikasi Full-Stack di Cloud',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN RISIKO TI': [
    'Pengantar Manajemen Risiko dan Konsep Risiko TI',
    'Framework Manajemen Risiko: ISO 31000 dan COSO ERM',
    'Identifikasi Risiko TI',
    'Analisis Risiko: Kualitatif dan Kuantitatif',
    'Evaluasi dan Prioritasi Risiko',
    'Risk Treatment: Mitigasi, Transfer, Accept, Avoid',
    'Risk Register dan Risk Dashboard',
    'UTS: Evaluasi Tengah Semester',
    'Operational Risk Management',
    'Cybersecurity Risk Assessment',
    'Third-Party dan Vendor Risk Management',
    'Risiko Proyek TI dan IT Project Risk',
    'Key Risk Indicators (KRI) dan Monitoring',
    'Compliance Risk dan Regulatory Requirements',
    'Studi Kasus: Manajemen Risiko TI di Industri',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN PERUBAHAN': [
    'Pengantar Manajemen Perubahan Organisasi',
    'Teori Perubahan: Lewin, Kotter, ADKAR',
    'Faktor Pendorong dan Penghambat Perubahan',
    'Resistance to Change dan Strategi Mengatasinya',
    'Stakeholder Analysis dan Communication Plan',
    'Change Readiness Assessment',
    'Change Leadership dan Sponsorship',
    'UTS: Evaluasi Tengah Semester',
    'Manajemen Perubahan dalam Proyek TI',
    'Change Management untuk Implementasi ERP',
    'Digital Transformation Change Management',
    'Organizational Culture dan Change',
    'Training dan Knowledge Transfer',
    'Measuring Change Success dan Benefits Realization',
    'Studi Kasus: Change Management di Organisasi',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PENGUKURAN KINERJA TI': [
    'Pengantar Pengukuran Kinerja TI',
    'IT Balanced Scorecard (IT BSC)',
    'Key Performance Indicators (KPI) untuk TI',
    'Service Level Agreement (SLA) dan SLO',
    'IT Performance Dashboard',
    'Benchmarking dan Maturity Assessment',
    'COBIT Performance Management',
    'UTS: Evaluasi Tengah Semester',
    'IT Financial Performance Metrics',
    'IT Operational Performance Metrics',
    'Customer Satisfaction dan User Experience Metrics',
    'IT Project Performance: Earned Value Management',
    'Application Performance Monitoring (APM)',
    'Reporting dan Data-Driven Decision Making',
    'Studi Kasus: Pengukuran Kinerja TI di Perusahaan',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN KEBERLANGSUNGAN BISNIS': [
    'Pengantar Business Continuity Management (BCM)',
    'Business Impact Analysis (BIA)',
    'Risk Assessment untuk BCM',
    'Business Continuity Strategy',
    'Business Continuity Plan (BCP) Development',
    'Disaster Recovery Planning (DRP)',
    'IT Disaster Recovery: RPO dan RTO',
    'UTS: Evaluasi Tengah Semester',
    'Crisis Management dan Communication',
    'Emergency Response Procedures',
    'Business Continuity Testing dan Exercising',
    'Supply Chain Continuity',
    'Cyber Resilience dan Incident Management',
    'ISO 22301: BCM Standard',
    'Studi Kasus: BCM Implementation',
    'UAS: Evaluasi Akhir Semester',
  ],
  'AUDIT SISTEM INFORMASI': [
    'Pengantar Audit Sistem Informasi',
    'Standar dan Framework Audit SI: COBIT, ISACA',
    'Perencanaan Audit dan Audit Program',
    'Teknik Audit: Interview, Observation, Testing',
    'Audit Pengendalian Internal (Internal Control)',
    'General Controls dan Application Controls',
    'Audit Keamanan Sistem Informasi',
    'UTS: Evaluasi Tengah Semester',
    'Audit Tata Kelola TI',
    'Audit Database dan Data Integrity',
    'Audit Jaringan dan Infrastruktur',
    'Computer-Assisted Audit Techniques (CAAT)',
    'Audit Compliance dan Regulatory',
    'Laporan Audit dan Rekomendasi',
    'Studi Kasus: Pelaksanaan Audit SI',
    'UAS: Evaluasi Akhir Semester',
  ],
  'SISTEM PENDUKUNG KEPUTUSAN': [
    'Pengantar Sistem Pendukung Keputusan (SPK)',
    'Proses Pengambilan Keputusan dan Model Simon',
    'Arsitektur dan Komponen SPK',
    'Metode AHP (Analytical Hierarchy Process)',
    'Metode SAW (Simple Additive Weighting)',
    'Metode TOPSIS',
    'Metode ELECTRE dan PROMETHEE',
    'UTS: Evaluasi Tengah Semester',
    'Metode WP (Weighted Product)',
    'Fuzzy Logic untuk SPK',
    'Group Decision Support System (GDSS)',
    'Sensitivity Analysis dalam SPK',
    'SPK Berbasis Web: Implementasi',
    'Business Intelligence dan Decision Support',
    'Studi Kasus: SPK untuk Permasalahan Nyata',
    'UAS: Evaluasi Akhir Semester',
  ],
  'VISUALISASI INFORMASI': [
    'Pengantar Visualisasi Informasi dan Prinsip Dasar',
    'Persepsi Visual dan Gestalt Principles',
    'Tipe Chart: Bar, Line, Pie, Scatter, Heatmap',
    'Desain Dashboard yang Efektif',
    'Tools Visualisasi: Tableau dan Power BI',
    'Visualisasi Data dengan Python (Matplotlib, Plotly)',
    'Visualisasi Data dengan D3.js',
    'UTS: Evaluasi Tengah Semester',
    'Interactive Visualization dan Storytelling with Data',
    'Geospatial Visualization dan Maps',
    'Network Visualization dan Graph Drawing',
    'Visualisasi Data Temporal dan Time Series',
    'Infografis dan Visual Communication',
    'Visualisasi Big Data dan Real-Time Dashboard',
    'Proyek Akhir: Dashboard Visualisasi Interaktif',
    'UAS: Evaluasi Akhir Semester',
  ],
  'SISTEM CERDAS': [
    'Pengantar Kecerdasan Buatan dan Sejarahnya',
    'Problem Solving: Search Algorithms (BFS, DFS, A*)',
    'Informed Search dan Heuristic',
    'Knowledge Representation dan Inference',
    'Sistem Pakar dan Rule-Based Systems',
    'Machine Learning: Supervised Learning',
    'Machine Learning: Unsupervised Learning',
    'UTS: Evaluasi Tengah Semester',
    'Neural Networks dan Deep Learning',
    'Convolutional Neural Network (CNN)',
    'Recurrent Neural Network (RNN) dan LSTM',
    'Natural Language Processing (NLP)',
    'Computer Vision Dasar',
    'Reinforcement Learning Pengantar',
    'Proyek: Implementasi Sistem Cerdas',
    'UAS: Evaluasi Akhir Semester',
  ],
  'TEKNIK PERAMALAN': [
    'Pengantar Teknik Peramalan dan Jenis-Jenisnya',
    'Analisis Time Series dan Komponen',
    'Metode Rata-Rata Bergerak (Moving Average)',
    'Exponential Smoothing: Single dan Double',
    'Metode Holt-Winters (Triple Exponential Smoothing)',
    'Dekomposisi Time Series',
    'Regresi untuk Peramalan',
    'UTS: Evaluasi Tengah Semester',
    'ARIMA: Konsep dan Identifikasi Model',
    'ARIMA: Estimasi dan Diagnostik',
    'SARIMA: Seasonal ARIMA',
    'Metode Peramalan Kausal',
    'Peramalan dengan Machine Learning',
    'Evaluasi Akurasi Peramalan (MAE, RMSE, MAPE)',
    'Studi Kasus: Peramalan Demand dan Sales',
    'UAS: Evaluasi Akhir Semester',
  ],

  // ──────── MK61–MK66 ────────
  'PENGOLAHAN CITRA': [
    'Pengantar Pengolahan Citra Digital',
    'Representasi Citra: Piksel, Resolusi, Kedalaman Warna',
    'Operasi Dasar Citra: Brightness, Contrast, Histogram',
    'Histogram Equalization dan Thresholding',
    'Filtering Spasial: Smoothing dan Sharpening',
    'Filtering Frekuensi: Fourier Transform',
    'Deteksi Tepi: Sobel, Canny, Laplacian',
    'UTS: Evaluasi Tengah Semester',
    'Segmentasi Citra: Region Growing, Watershed',
    'Morfologi Citra: Erosi, Dilasi, Opening, Closing',
    'Feature Extraction: SIFT, SURF, ORB',
    'Object Detection dan Recognition',
    'Image Classification dengan CNN',
    'Image Processing dengan OpenCV dan Python',
    'Proyek: Aplikasi Pengolahan Citra',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN MEREK DIGITAL': [
    'Pengantar Branding dan Merek Digital',
    'Brand Identity: Logo, Warna, Tipografi',
    'Brand Strategy dan Positioning',
    'Brand Storytelling dan Narrative',
    'Personal Branding di Era Digital',
    'Social Media Branding Strategy',
    'Brand Consistency Across Digital Channels',
    'UTS: Evaluasi Tengah Semester',
    'Online Reputation Management (ORM)',
    'Brand Community dan Engagement',
    'Influencer Marketing dan Brand Collaboration',
    'Brand Analytics dan Social Listening',
    'Crisis Communication dan Brand Recovery',
    'Brand Equity Measurement Digital',
    'Studi Kasus: Merek Digital Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'PEMASARAN DIGITAL': [
    'Pengantar Pemasaran Digital dan Ekosistemnya',
    'Consumer Behavior di Era Digital',
    'Search Engine Optimization (SEO)',
    'Search Engine Marketing (SEM) dan Google Ads',
    'Social Media Marketing: Facebook, Instagram, TikTok',
    'Content Marketing dan Content Strategy',
    'Email Marketing dan Marketing Automation',
    'UTS: Evaluasi Tengah Semester',
    'Affiliate Marketing dan Referral Programs',
    'Video Marketing dan YouTube Strategy',
    'Mobile Marketing dan App Marketing',
    'Digital Analytics: Google Analytics 4',
    'Conversion Rate Optimization (CRO)',
    'Digital Marketing Strategy dan Campaign Planning',
    'Proyek: Kampanye Pemasaran Digital',
    'UAS: Evaluasi Akhir Semester',
  ],
  'KREATIF DIGITAL': [
    'Pengantar Industri Kreatif Digital',
    'Desain Grafis: Prinsip dan Tools (Canva, Adobe)',
    'Fotografi Digital dan Editing',
    'Videografi: Produksi dan Editing Video',
    'Motion Graphics dan Animasi',
    'Podcast Production dan Audio Editing',
    'UI Design untuk Media Sosial',
    'UTS: Evaluasi Tengah Semester',
    'Content Creation untuk Platform Digital',
    'Copywriting dan Storytelling Digital',
    'Augmented Reality (AR) Content',
    'Interactive Media dan Gamification',
    'Digital Art dan Illustration',
    'Portfolio Digital dan Personal Website',
    'Proyek Akhir: Produksi Konten Kreatif Digital',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN HUBUNGAN PELANGGAN': [
    'Pengantar Customer Relationship Management (CRM)',
    'Customer Lifecycle dan Customer Journey',
    'Strategi Akuisisi Pelanggan',
    'Customer Segmentation dan Targeting',
    'CRM Operasional: Sales, Marketing, Service',
    'CRM Analitik: Customer Analytics',
    'CRM Kolaboratif: Omnichannel Communication',
    'UTS: Evaluasi Tengah Semester',
    'Implementasi Sistem CRM (Salesforce, HubSpot)',
    'Customer Satisfaction (CSAT) dan Net Promoter Score (NPS)',
    'Customer Retention dan Loyalty Programs',
    'Social CRM dan Customer Engagement',
    'Customer Data Platform (CDP)',
    'CRM dan Artificial Intelligence',
    'Studi Kasus: CRM di Perusahaan Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
  'MANAJEMEN RANTAI PASOK': [
    'Pengantar Supply Chain Management (SCM)',
    'Komponen dan Proses Supply Chain',
    'Demand Planning dan Forecasting',
    'Procurement dan Supplier Management',
    'Inventory Management dan Safety Stock',
    'Warehouse Management dan Distribution',
    'Logistics dan Transportation Management',
    'UTS: Evaluasi Tengah Semester',
    'Supply Chain Network Design',
    'Lean Supply Chain dan Agile Supply Chain',
    'Supply Chain Risk Management',
    'Green Supply Chain dan Sustainability',
    'Supply Chain Technology: ERP, SCM Systems',
    'E-SCM dan Digital Supply Chain',
    'Studi Kasus: Supply Chain Management di Indonesia',
    'UAS: Evaluasi Akhir Semester',
  ],
};

// Map MK names in the DB (may not have exact match) to our materi keys
function findMateriKey(mkNama: string): string | null {
  const normalized = mkNama.toUpperCase().trim();
  // Try exact match first
  for (const key of Object.keys(MK_MATERI)) {
    if (normalized.includes(key.toUpperCase())) return key;
  }
  return null;
}

// Methods rotation
const METODE_LIST = ['Ceramah', 'Diskusi', 'Praktikum', 'Presentasi', 'Studi Kasus', 'Tutorial', 'Problem-Based Learning'];

function getMetode(mingguKe: number): string {
  if (mingguKe === 8 || mingguKe === 16) return 'Ujian';
  return METODE_LIST[(mingguKe - 1) % METODE_LIST.length];
}

// ──────── MAIN SEED FUNCTION ──────────────────────────────────
export async function seedNicoDo() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  SEED NICO DO — Starting comprehensive seeding');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Get kurikulum
  const kurikulum = await prisma.kurikulum.findUnique({ where: { id: KURIKULUM_ID } });
  if (!kurikulum) {
    throw new Error(`Kurikulum not found: ${KURIKULUM_ID}`);
  }
  const tahunAjaran = `${kurikulum.tahunMulai}/${kurikulum.tahunSelesai}`;
  console.log(`✓ Kurikulum: ${kurikulum.nama} (${tahunAjaran})`);

  // 2. Get first DOSEN user
  const dosen = await prisma.user.findFirst({ where: { role: 'DOSEN' } });
  if (!dosen) {
    throw new Error('No user with role DOSEN found. Please create one first.');
  }
  console.log(`✓ Dosen: ${dosen.nama} (${dosen.id})`);

  // 3. Ensure mahasiswa exist
  const mahasiswaRecords: { id: string; nim: string; nama: string }[] = [];
  for (const m of MAHASISWA_POOL) {
    let mhs = await prisma.mahasiswa.findUnique({ where: { nim: m.nim } });
    if (!mhs) {
      mhs = await prisma.mahasiswa.create({ data: m });
      console.log(`  + Created Mahasiswa: ${m.nama} (${m.nim})`);
    }
    mahasiswaRecords.push({ id: mhs.id, nim: mhs.nim, nama: mhs.nama });
  }
  console.log(`✓ ${mahasiswaRecords.length} Mahasiswa ready\n`);

  // 4. Get ALL MK for this kurikulum
  const allMK = await prisma.mataKuliah.findMany({
    where: { kurikulumId: KURIKULUM_ID },
    orderBy: { kode: 'asc' },
    include: {
      pemetaanCPMK: {
        include: {
          cpmk: {
            include: { subCpmk: true }
          }
        }
      }
    }
  });

  console.log(`Found ${allMK.length} Mata Kuliah in kurikulum\n`);

  let created = 0;
  let skipped = 0;

  for (let mkIdx = 0; mkIdx < allMK.length; mkIdx++) {
    const mk = allMK[mkIdx];
    const mkLabel = `[${mkIdx + 1}/${allMK.length}] ${mk.kode} - ${mk.nama}`;

    // 4a. Check if kelas already exists for this MK + dosen
    const existingKelas = await prisma.kelas.findFirst({
      where: { mkId: mk.id, dosenId: dosen.id }
    });
    if (existingKelas) {
      console.log(`  ⊘ SKIP ${mkLabel} (kelas already exists: ${existingKelas.id})`);
      skipped++;
      continue;
    }

    // Determine semester string
    const semesterStr = mk.semester % 2 === 1 ? 'Ganjil' : 'Genap';

    // Find materi for this MK
    const materiKey = findMateriKey(mk.nama);
    const materiList = materiKey ? MK_MATERI[materiKey] : null;

    // Generate fallback materi if no match
    const finalMateri: string[] = materiList || generateFallbackMateri(mk.nama);

    // Resolve a SubCPMK to link asesmen soal & RPS to
    let subCpmkId: string | null = null;

    // Try to find existing SubCPMK via MK → CPMK → SubCPMK
    for (const mapping of mk.pemetaanCPMK) {
      if (mapping.cpmk.subCpmk.length > 0) {
        subCpmkId = mapping.cpmk.subCpmk[0].id;
        break;
      }
    }

    // If none found, find first CPMK of this MK and create a SubCPMK
    if (!subCpmkId && mk.pemetaanCPMK.length > 0) {
      const firstCpmk = mk.pemetaanCPMK[0].cpmk;
      const newSub = await prisma.subCPMK.create({
        data: {
          cpmkId: firstCpmk.id,
          kode: 'L1',
          deskripsi: `Sub-CPMK untuk ${mk.nama}`,
        }
      });
      subCpmkId = newSub.id;
    }

    // If still no subCpmk (no CPMK mapped at all), find or create a CPMK first
    if (!subCpmkId) {
      // Find any CPL linked to this MK via PemetaanCPLMK
      const cplMapping = await prisma.pemetaanCPLMK.findFirst({ where: { mkId: mk.id } });
      let cplId: string;
      if (cplMapping) {
        cplId = cplMapping.cplId;
      } else {
        // Use any CPL from the kurikulum
        const anyCpl = await prisma.cPL.findFirst({ where: { kurikulumId: KURIKULUM_ID } });
        if (!anyCpl) {
          console.log(`  ⚠ SKIP ${mkLabel} — no CPL available in kurikulum`);
          skipped++;
          continue;
        }
        cplId = anyCpl.id;
      }

      // Create CPMK
      const newCpmk = await prisma.cPMK.create({
        data: {
          cplId,
          kode: `CPMK-${mk.kode}`,
          deskripsi: `CPMK untuk ${mk.nama}`,
        }
      });

      // Map it to MK
      await prisma.pemetaanMKCPMK.create({
        data: { mkId: mk.id, cpmkId: newCpmk.id }
      }).catch(() => { /* unique constraint — already mapped */ });

      // Create SubCPMK
      const newSub = await prisma.subCPMK.create({
        data: {
          cpmkId: newCpmk.id,
          kode: 'L1',
          deskripsi: `Sub-CPMK untuk ${mk.nama}`,
        }
      });
      subCpmkId = newSub.id;
    }

    // ──── Use a transaction for the bulk creates ────
    await prisma.$transaction(async (tx) => {
      // 4b. Create Kelas
      const kelas = await tx.kelas.create({
        data: {
          mkId: mk.id,
          nama: `${mk.kode} - 01`,
          tahunAjaran,
          semester: semesterStr,
          dosenId: dosen.id,
        }
      });

      // 4c. Enroll mahasiswa
      for (const mhs of mahasiswaRecords) {
        await tx.kelasEnrollment.create({
          data: { kelasId: kelas.id, mahasiswaId: mhs.id }
        });
      }

      // 4d. Create 16 RPSPertemuan
      const waktuStr = `${50 * mk.sks} menit`;
      for (let w = 1; w <= 16; w++) {
        await tx.rPSPertemuan.create({
          data: {
            kelasId: kelas.id,
            mingguKe: w,
            materi: finalMateri[w - 1],
            metode: getMetode(w),
            waktu: waktuStr,
            subCpmkId: subCpmkId,
          }
        });
      }

      // 4e. Create 3 Asesmen
      const asesmenDefs = [
        { nama: 'Tugas', bobot: 30 },
        { nama: 'UTS', bobot: 30 },
        { nama: 'UAS', bobot: 40 },
      ];

      for (let aIdx = 0; aIdx < asesmenDefs.length; aIdx++) {
        const adef = asesmenDefs[aIdx];
        const asesmen = await tx.asesmen.create({
          data: {
            kelasId: kelas.id,
            nama: adef.nama,
            bobot: adef.bobot,
          }
        });

        // 4f. Create 1 AsesmenSoal per asesmen
        const soal = await tx.asesmenSoal.create({
          data: {
            asesmenId: asesmen.id,
            nomorSoal: 'Soal 1',
            bobotSoal: 100,
            subCpmkId: subCpmkId!,
          }
        });

        // 4g. Create NilaiSoal for each mahasiswa
        for (let sIdx = 0; sIdx < mahasiswaRecords.length; sIdx++) {
          const score = getScore(sIdx, mkIdx, aIdx);
          await tx.nilaiSoal.create({
            data: {
              mahasiswaId: mahasiswaRecords[sIdx].id,
              asesmenSoalId: soal.id,
              nilai: score,
            }
          });
        }
      }
    });

    created++;
    console.log(`  ✓ DONE ${mkLabel} (${finalMateri.length} pertemuan, 3 asesmen, ${mahasiswaRecords.length * 3} nilai)`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  SEED COMPLETE: ${created} kelas created, ${skipped} skipped`);
  console.log('═══════════════════════════════════════════════════\n');
}

// ─── FALLBACK MATERI GENERATOR ─────────────────────────────────
function generateFallbackMateri(mkNama: string): string[] {
  return [
    `Pengantar ${mkNama}`,
    `Konsep Dasar ${mkNama}`,
    `Teori dan Prinsip ${mkNama}`,
    `Metodologi ${mkNama}`,
    `Teknik dan Tools ${mkNama}`,
    `Analisis dalam ${mkNama}`,
    `Perancangan ${mkNama}`,
    `UTS: Evaluasi Tengah Semester`,
    `Implementasi ${mkNama}`,
    `Studi Kasus ${mkNama} 1`,
    `Studi Kasus ${mkNama} 2`,
    `Topik Lanjut ${mkNama}`,
    `Tren dan Inovasi ${mkNama}`,
    `Evaluasi dan Review ${mkNama}`,
    `Presentasi Proyek ${mkNama}`,
    `UAS: Evaluasi Akhir Semester`,
  ];
}
