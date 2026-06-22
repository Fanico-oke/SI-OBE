import { useState } from 'react';

interface Article {
  title: string;
  description: string;
  updatedAt: string;
  category: 'start' | 'pdca' | 'obe' | 'faq';
  type: 'article' | 'video';
}

const allArticles: Article[] = [
  {
    title: 'Cara Memetakan CPL ke Mata Kuliah',
    description: 'Pelajari langkah-langkah detail mengaitkan Capaian Pembelajaran Lulusan dengan mata kuliah di tahap Plan.',
    updatedAt: 'Diperbarui 2 hari lalu',
    category: 'pdca',
    type: 'article'
  },
  {
    title: 'Pengaturan Bobot Penilaian Rubrik',
    description: 'Panduan mengatur persentase dan bobot indikator penilaian pada tahap Do.',
    updatedAt: 'Diperbarui 1 minggu lalu',
    category: 'obe',
    type: 'article'
  },
  {
    title: 'Video: Overview Laporan Evaluasi (Check)',
    description: 'Tutorial visual membaca dashboard analitik performa kelas.',
    updatedAt: 'Diperbarui 1 bulan lalu',
    category: 'faq',
    type: 'video'
  },
  {
    title: 'Navigasi Sistem & Antarmuka Dasar',
    description: 'Pengenalan layout utama dashboard, sidebar navigasi, dan pengaturan preferensi sistem.',
    updatedAt: 'Diperbarui 3 hari lalu',
    category: 'start',
    type: 'article'
  },
  {
    title: 'Kalkulasi Pencapaian Lulusan (CPMK)',
    description: 'Bagaimana sistem mengalkulasi pencapaian CPMK mahasiswa berdasarkan bobot asesmen.',
    updatedAt: 'Diperbarui 5 hari lalu',
    category: 'obe',
    type: 'article'
  },
  {
    title: 'Panduan Evaluasi Tahap Act',
    description: 'Mengisi form rekomendasi tindak lanjut perbaikan kurikulum di siklus akhir.',
    updatedAt: 'Diperbarui 2 minggu lalu',
    category: 'pdca',
    type: 'article'
  }
];

export function Bantuan() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleChipClick = (query: string) => {
    setSearchQuery(query);
  };

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? article.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-4">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-surface-container-low to-transparent -z-10 rounded-xl pointer-events-none"></div>

      {/* Hero & Search Section */}
      <section className="text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/10 text-primary rounded-full font-caption text-caption mb-6 border border-primary/20">
 <span className="material-symbols-outlined text-body">auto_awesome</span>
          SI-OBE Knowledge Base 2.0
        </div>
        <h1 className="page-header justify-center mb-4">Bagaimana kami bisa membantu Anda?</h1>
        <p className="font-body text-body text-on-surface-variant max-w-2xl mx-auto mb-10">
          Jelajahi panduan komprehensif, tutorial implementasi, dan dokumentasi teknis untuk mengelola siklus kurikulum (PDCA) berbasis Outcome-Based Education.
        </p>

        {/* Search Component */}
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base block w-full pl-12 pr-12 py-4 rounded-xl shadow-sm hover:shadow-md"
            placeholder="Cari artikel, panduan PDCA, atau FAQ..."
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors mr-1"
              >
 <span className="material-symbols-outlined ">close</span>
              </button>
            )}
            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors">
 <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <span className="font-caption text-caption text-on-surface-variant py-1">Pencarian Populer:</span>
          <button
            onClick={() => handleChipClick('Input Nilai Mahasiswa')}
            className="px-3 py-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-caption text-caption hover:border-primary hover:text-primary transition-colors"
          >
            Input Nilai Mahasiswa
          </button>
          <button
            onClick={() => handleChipClick('Generate Laporan OBE')}
            className="px-3 py-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-caption text-caption hover:border-primary hover:text-primary transition-colors"
          >
            Generate Laporan OBE
          </button>
          <button
            onClick={() => handleChipClick('Siklus Evaluasi')}
            className="px-3 py-1 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-caption text-caption hover:border-primary hover:text-primary transition-colors"
          >
            Siklus Evaluasi
          </button>
        </div>
      </section>

      {/* Bento Grid Categories */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap_section">
        {/* Category 1 */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'start' ? null : 'start')}
          className={`card-interactive flex flex-col h-full relative overflow-hidden ${
            activeCategory === 'start' ? 'ring-2 ring-primary border-primary' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="stat-icon bg-surface-container-high border border-outline-variant/50 text-primary mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors rounded-lg">
 <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Mulai Cepat</h2>
          <p className="font-body text-body text-on-surface-variant mb-6 flex-1">
            Panduan awal navigasi sistem, pengaturan profil, dan pengenalan antarmuka dasar SI-OBE.
          </p>
          <div className="border-t border-outline-variant/50 pt-4 mt-auto">
            <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-primary group-hover:gap-2 transition-all">
              {activeCategory === 'start' ? 'Tampilkan Semua' : 'Lihat 12 Artikel'}{' '}
 <span className="material-symbols-outlined text-body">
                {activeCategory === 'start' ? 'close' : 'arrow_forward'}
              </span>
            </span>
          </div>
        </div>

        {/* Category 2 */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'pdca' ? null : 'pdca')}
          className={`card-interactive flex flex-col h-full relative overflow-hidden ${
            activeCategory === 'pdca' ? 'ring-2 ring-secondary border-secondary' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="stat-icon bg-surface-container-high border border-outline-variant/50 text-secondary mb-6 group-hover:bg-secondary group-hover:text-on-secondary transition-colors rounded-lg">
 <span className="material-symbols-outlined">cycle</span>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Siklus PDCA</h2>
          <p className="font-body text-body text-on-surface-variant mb-6 flex-1">
            Dokumentasi lengkap mengenai tahapan Plan, Do, Check, dan Act dalam manajemen kurikulum.
          </p>
          <div className="border-t border-outline-variant/50 pt-4 mt-auto">
            <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-secondary group-hover:gap-2 transition-all">
              {activeCategory === 'pdca' ? 'Tampilkan Semua' : 'Lihat 24 Artikel'}{' '}
 <span className="material-symbols-outlined text-body">
                {activeCategory === 'pdca' ? 'close' : 'arrow_forward'}
              </span>
            </span>
          </div>
        </div>

        {/* Category 3 */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'obe' ? null : 'obe')}
          className={`card-interactive flex flex-col h-full relative overflow-hidden ${
            activeCategory === 'obe' ? 'ring-2 ring-tertiary border-tertiary' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="stat-icon bg-surface-container-high border border-outline-variant/50 text-tertiary mb-6 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors rounded-lg">
 <span className="material-symbols-outlined">school</span>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Implementasi OBE</h2>
          <p className="font-body text-body text-on-surface-variant mb-6 flex-1">
            Strategi pemetaan CPL ke CPMK, rubrik penilaian, dan kalkulasi pencapaian lulusan.
          </p>
          <div className="border-t border-outline-variant/50 pt-4 mt-auto">
            <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-tertiary group-hover:gap-2 transition-all">
              {activeCategory === 'obe' ? 'Tampilkan Semua' : 'Lihat 18 Artikel'}{' '}
 <span className="material-symbols-outlined text-body">
                {activeCategory === 'obe' ? 'close' : 'arrow_forward'}
              </span>
            </span>
          </div>
        </div>

        {/* Category 4 */}
        <div
          onClick={() => setActiveCategory(activeCategory === 'faq' ? null : 'faq')}
          className={`card-interactive flex flex-col h-full relative overflow-hidden ${
            activeCategory === 'faq' ? 'ring-2 ring-outline border-outline' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-variant/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="stat-icon bg-surface-container-high border border-outline-variant/50 text-on-surface-variant mb-6 group-hover:bg-surface-variant group-hover:text-on-surface transition-colors rounded-lg">
 <span className="material-symbols-outlined">forum</span>
          </div>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">FAQ &amp; Solusi</h2>
          <p className="font-body text-body text-on-surface-variant mb-6 flex-1">
            Kumpulan pertanyaan yang sering diajukan dan panduan pemecahan masalah teknis.
          </p>
          <div className="border-t border-outline-variant/50 pt-4 mt-auto">
            <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-on-surface-variant group-hover:gap-2 transition-all group-hover:text-on-surface">
              {activeCategory === 'faq' ? 'Tampilkan Semua' : 'Lihat FAQ'}{' '}
 <span className="material-symbols-outlined text-body">
                {activeCategory === 'faq' ? 'close' : 'arrow_forward'}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Featured Documentation */}
      <section className="card p-0 overflow-hidden">
        <div className="p-padding_card border-b border-outline-variant bg-surface flex justify-between items-center">
          <h3 className="section-title">
 <span className="material-symbols-outlined text-primary">bookmark_added</span>
            {activeCategory ? 'Hasil Filter Dokumentasi' : 'Dokumentasi Populer'}
          </h3>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="btn-ghost text-caption font-semibold"
            >
              Reset Filter Kategori
            </button>
          )}
        </div>
        <div className="divide-y divide-outline-variant/50">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
              <a
                key={index}
                className="flex items-start md:items-center justify-between p-4 hover:bg-surface-container-low transition-colors group cursor-pointer"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-start gap-4">
 <span className="material-symbols-outlined text-outline group-hover:text-primary mt-1 md:mt-0 transition-colors">
                    {article.type === 'video' ? 'play_circle' : 'description'}
                  </span>
                  <div>
                    <h4 className="font-body text-body font-medium text-on-surface group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="font-caption text-caption text-on-surface-variant mt-1 hidden md:block">
                      {article.description}
                    </p>
                  </div>
                </div>
                <span className="font-caption text-caption text-outline hidden md:block whitespace-nowrap ml-4">
                  {article.updatedAt}
                </span>
              </a>
            ))
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-body text-body">
              Tidak ada artikel yang cocok dengan filter atau pencarian Anda.
            </div>
          )}
        </div>
      </section>

      {/* Support CTA Section */}
      <section className="relative rounded-xl overflow-hidden bg-primary shadow-card">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%27100%25%27%20height%3D%27100%25%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org/2000/svg%27%3E%3Cdefs%3E%3Cpattern%20id%3D%27p%27%20width%3D%27100%27%20height%3D%27100%27%20patternUnits%3D%27userSpaceOnUse%27%3E%3Ccircle%20cx%3D%2750%27%20cy%3D%2750%27%20r%3D%2740%27%20fill%3D%27none%27%20stroke%3D%27rgba%28255%2C255%2C255%2C0.1%29%27%20stroke-width%3D%272%27%2F%3E%3C%2Fpattern%3E%3C%2defs%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27url%28%23p%29%27%2F%3E%3C%2Fsvg%3E')] opacity-30 pointer-events-none"></div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary to-primary/80 backdrop-blur-sm">
          <div className="text-on-primary text-center md:text-left max-w-xl">
            <h2 className="font-h1 text-h1-mobile md:text-h1 font-bold mb-3">Tidak menemukan apa yang Anda cari?</h2>
            <p className="font-body text-body text-primary-fixed-dim">
              Tim dukungan teknis dan ahli akademik kami siap membantu Anda secara langsung. Hubungi kami melalui Live Chat atau kirimkan tiket bantuan melalui portal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
            <button className="px-6 py-3 bg-surface-container-lowest text-primary font-body text-body font-medium rounded-lg hover:bg-surface-container-low hover:scale-105 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm">
 <span className="material-symbols-outlined">support_agent</span> Chat Live
            </button>
            <button className="px-6 py-3 bg-transparent border border-outline-variant text-on-primary font-body text-body font-medium rounded-lg hover:bg-white/10 transition-colors duration-150 flex items-center justify-center gap-2">
 <span className="material-symbols-outlined">mail</span> Kirim Tiket
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
