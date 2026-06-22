import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';
import { useCurriculumStore } from '../store/useCurriculumStore';

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
}

interface Kelas {
  id: string;
  namaKelas: string;
  mk: MataKuliah;
}

interface SubCpmk {
  id: string;
  kode: string;
  deskripsi: string;
}

interface Cpmk {
  id: string;
  kode: string;
  deskripsi: string;
  subCpmk?: SubCpmk[];
}

interface Enrollment {
  id: string;
  mahasiswa: {
    nama: string;
    nim: string;
  };
}

interface KelasDetail {
  id: string;
  namaKelas: string;
  mk: MataKuliah;
  cpmk?: Cpmk[];
  enrollments?: Enrollment[];
}

export const DoModulDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { activeCurriculumId: kurikulumId } = useCurriculumStore();
  const isReadOnly = user?.role === 'KAPRODI';

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [kelasDetail, setKelasDetail] = useState<KelasDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'clos' | 'materi' | 'tugas' | 'rubrik'>('clos');

  // Fetch kelas list on mount
  useEffect(() => {
    const fetchKelasList = async () => {
      try {
        setLoadingList(true);
        setErrorList(null);
        const res = await axios.get(`/api/do/kelas${kurikulumId ? `?kurikulumId=${kurikulumId}` : ''}`);
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setKelasList(data);
        // Auto-select first kelas
        if (data.length > 0) {
          setSelectedKelasId(data[0].id);
        }
      } catch (err: any) {
        setErrorList(err.response?.data?.message || 'Gagal memuat daftar kelas');
      } finally {
        setLoadingList(false);
      }
    };
    fetchKelasList();
  }, [kurikulumId]);

  // Fetch kelas detail when selected
  useEffect(() => {
    if (!selectedKelasId) return;
    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        setErrorDetail(null);
        const res = await axios.get(`/api/do/kelas/${selectedKelasId}`);
        setKelasDetail(res.data.data || res.data);
      } catch (err: any) {
        setErrorDetail(err.response?.data?.message || 'Gagal memuat detail kelas');
        setKelasDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedKelasId]);

  const filteredKelas = kelasList.filter((k) => {
    const label = `${k.mk?.kode || ''} ${k.mk?.nama || ''} ${k.namaKelas || ''}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  const selectedKelas = kelasList.find((k) => k.id === selectedKelasId);
  const selectedLabel = selectedKelas
    ? `${selectedKelas.mk?.kode || ''}: ${selectedKelas.mk?.nama || selectedKelas.namaKelas}`
    : '';

  const cpmkList = kelasDetail?.cpmk || [];
  const enrollmentCount = kelasDetail?.enrollments?.length || 0;

  return (
    <div className="w-full space-y-4">
      <div className=" w-full">
        <div className="flex gap-6 border-b border-outline-variant overflow-x-auto">
          <Link to="/do" className="tab-inactive pb-3 whitespace-nowrap px-2">Daftar Modul</Link>
          <Link to="/do/rps" className="tab-inactive pb-3 whitespace-nowrap px-2">RPS</Link>
          <Link to="/do/aktivitas" className="tab-inactive pb-3 whitespace-nowrap px-2">Aktivitas</Link>
          <Link to="/do/tugas" className="tab-inactive pb-3 whitespace-nowrap px-2">Tugas &amp; Asesmen</Link>
          <Link to="/do/rubrik" className="tab-inactive pb-3 whitespace-nowrap px-2">Rubrik Penilaian</Link>
          <Link to="/do/materi" className="tab-inactive pb-3 whitespace-nowrap px-2">Materi Pembelajaran</Link>
          <Link to={`/do/penilaian/${selectedKelasId || ''}`} className="tab-active pb-3 whitespace-nowrap px-2">Input Nilai</Link>
        </div>
      </div>

                  
{/*  TopNavBar (Shared Component - Mobile Only)  */}
{/*  TopNavBar (Desktop specific elements integrated into page header layout to avoid full standard top nav conflict while maintaining actions)  */}
<div className="hidden md:flex justify-end items-center px-8 py-4 border-b border-outline-variant bg-surface sticky top-0 z-30">
<div className="flex items-center gap-4">
<button className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-150 p-2 rounded-full scale-100 active:scale-95">
<span className="material-symbols-outlined" >notifications</span>
</button>
<button className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-150 p-2 rounded-full scale-100 active:scale-95">
<span className="material-symbols-outlined" >account_circle</span>
</button>
</div>
</div>
{/*  Page Header & Actions  */}

{/*  Editor Workspace Layout  */}
<div className="flex-1 bg-surface-container-lowest p-6 overflow-hidden flex flex-col">
<div className=" w-full flex-1 flex flex-col lg:flex-row gap_section h-full min-h-[600px]">
{/*  Left Panel: Modul List  */}
<aside className="w-full lg:w-1/3 xl:w-1/4 bg-surface rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm">
<div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
<h3 className="font-h3 text-h3 text-on-background mb-4">DAFTAR MODUL</h3>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline " >search</span>
<input
  className="input-base w-full pl-10 pr-4 py-2"
  placeholder="Cari modul..."
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
</div>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar p-2">
{loadingList ? (
  <div className="flex items-center justify-center py-8">
    <span className="material-symbols-outlined animate-spin text-secondary">progress_activity</span>
    <span className="ml-2 text-on-surface-variant font-body text-body">Memuat daftar kelas...</span>
  </div>
) : errorList ? (
  <div className="text-center py-8 text-error font-body text-body">{errorList}</div>
) : filteredKelas.length === 0 ? (
  <div className="text-center py-8 text-on-surface-variant font-body text-body">Tidak ada kelas ditemukan</div>
) : (
<ul className="flex flex-col gap-1">
{filteredKelas.map((kelas) => {
  const isActive = kelas.id === selectedKelasId;
  const label = `${kelas.mk?.kode || ''}: ${kelas.mk?.nama || kelas.namaKelas}`;
  return (
    <li key={kelas.id}>
      <button
        onClick={() => setSelectedKelasId(kelas.id)}
        className={
          isActive
            ? "w-full text-left px-4 py-3 rounded-lg bg-secondary/10 border-l-4 border-secondary text-secondary font-body text-body font-medium hover:bg-secondary/20 transition-colors flex items-center justify-between"
            : "w-full text-left px-4 py-3 rounded-lg border-l-4 border-transparent text-on-surface-variant font-body text-body hover:bg-surface-container-low transition-colors"
        }
      >
        <span>{label}</span>
        {isActive && <span className="material-symbols-outlined " >chevron_right</span>}
      </button>
    </li>
  );
})}
</ul>
)}
</div>
<div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
{!isReadOnly && (
<button onClick={() => addToast('Gunakan menu Kurikulum > Plan Editor untuk menambah modul', 'info')} className="w-full py-2 border border-dashed border-outline text-on-surface-variant font-body text-body font-medium rounded-lg hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined " >add</span>
                            Tambah Modul
                        </button>
)}
</div>
</aside>
{/*  Main Panel: Modul Editor  */}
<section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm">
{/*  Editor Header & Tabs  */}
<div className="border-b border-outline-variant bg-surface">
<div className="p-6 pb-0">
<h3 className="font-h2 text-h2 text-on-background mb-2">EDITOR MODUL</h3>
<p className="font-body text-body text-on-surface-variant mb-6 font-medium">
  {selectedLabel || 'Pilih modul dari daftar'}
  {kelasDetail && enrollmentCount > 0 && (
    <span className="ml-3 px-2 py-0.5 bg-surface-container rounded text-on-surface-variant font-data-mono text-data-mono text-caption">
      {enrollmentCount} mahasiswa
    </span>
  )}
</p>
<div className="flex gap-6 overflow-x-auto custom-scrollbar">
<button
  onClick={() => setActiveTab('clos')}
  className={activeTab === 'clos'
    ? "px-2 py-3 border-b-2 border-secondary text-secondary font-body text-body font-bold whitespace-nowrap"
    : "px-2 py-3 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-body text-body font-medium whitespace-nowrap transition-colors"}
>
                                    CLOs
                                </button>
<button
  onClick={() => setActiveTab('materi')}
  className={activeTab === 'materi'
    ? "px-2 py-3 border-b-2 border-secondary text-secondary font-body text-body font-bold whitespace-nowrap"
    : "px-2 py-3 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-body text-body font-medium whitespace-nowrap transition-colors"}
>
                                    Materi
                                </button>
<button
  onClick={() => setActiveTab('tugas')}
  className={activeTab === 'tugas'
    ? "px-2 py-3 border-b-2 border-secondary text-secondary font-body text-body font-bold whitespace-nowrap"
    : "px-2 py-3 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-body text-body font-medium whitespace-nowrap transition-colors"}
>
                                    Tugas
                                </button>
<button
  onClick={() => setActiveTab('rubrik')}
  className={activeTab === 'rubrik'
    ? "px-2 py-3 border-b-2 border-secondary text-secondary font-body text-body font-bold whitespace-nowrap"
    : "px-2 py-3 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface font-body text-body font-medium whitespace-nowrap transition-colors"}
>
                                    Rubrik
                                </button>
</div>
</div>
</div>
{/*  Editor Content Area  */}
<div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-surface-container-lowest">
{isReadOnly && (
  <div className="mb-4 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2 text-warning text-sm font-medium">
    <span className="material-symbols-outlined text-[18px]">visibility</span>
    Mode Pengawasan — Hanya Kaprodi yang bisa melihat, tidak bisa mengubah data
  </div>
)}

{loadingDetail ? (
  <div className="flex items-center justify-center py-16">
    <span className="material-symbols-outlined animate-spin text-secondary text-4xl">progress_activity</span>
    <span className="ml-3 text-on-surface-variant font-body text-body">Memuat detail modul...</span>
  </div>
) : errorDetail ? (
  <div className="text-center py-16 text-error font-body text-body">{errorDetail}</div>
) : !selectedKelasId ? (
  <div className="text-center py-16 text-on-surface-variant font-body text-body">
    <span className="material-symbols-outlined text-4xl mb-2 block">school</span>
    Pilih modul dari daftar di sebelah kiri
  </div>
) : (
<>
{/*  Section 1: CLOs  */}
{activeTab === 'clos' && (
<div className="bg-surface rounded-lg border border-outline-variant p-6">
<div className="flex justify-between items-center mb-4">
<h4 className="font-h3 text-h3 text-on-background flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" >fact_check</span>
                                    CLOs (Capaian Pembelajaran)
                                </h4>
{!isReadOnly && (
<button onClick={() => addToast('CLO dikelola di menu Plan > Indikator CPMK', 'info')} className="text-secondary hover:text-secondary/80 font-body text-body font-medium flex items-center gap-1 transition-colors">
<span className="material-symbols-outlined " >add</span> Tambah CLO
                                </button>
)}
</div>
{cpmkList.length === 0 ? (
  <div className="text-center py-8 text-on-surface-variant font-body text-body">
    <span className="material-symbols-outlined text-3xl mb-2 block text-outline">fact_check</span>
    Belum ada CPMK/CLO untuk kelas ini
  </div>
) : (
<div className="space-y-3">
{cpmkList.map((cpmk, idx) => (
  <div key={cpmk.id || idx} className="p-4 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-secondary/50 transition-colors group">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="font-body text-body font-medium text-on-background mb-1">
          {cpmk.kode}: {cpmk.deskripsi}
        </p>
        {cpmk.subCpmk && cpmk.subCpmk.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-body text-outline" >subdirectory_arrow_right</span>
            {cpmk.subCpmk.map((sub, sIdx) => (
              <span key={sub.id || sIdx} className="px-2 py-1 bg-surface-container text-on-surface-variant font-data-mono text-data-mono rounded text-caption">
                {sub.kode}
              </span>
            ))}
          </div>
        )}
      </div>
      {!isReadOnly && (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <button onClick={() => addToast('Edit CPMK di menu Plan > Indikator', 'info')} className="p-1 text-outline hover:text-secondary"><span className="material-symbols-outlined " >edit</span></button>
        <button onClick={() => addToast('Hapus CPMK di menu Plan > Indikator', 'info')} className="p-1 text-outline hover:text-error"><span className="material-symbols-outlined " >delete</span></button>
      </div>
      )}
    </div>
  </div>
))}
</div>
)}
</div>
)}

{/*  Section 2: Materi  */}
{activeTab === 'materi' && (
<div className="bg-surface rounded-lg border border-outline-variant p-6">
<div className="flex justify-between items-center mb-4">
<h4 className="font-h3 text-h3 text-on-background flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" >menu_book</span>
                                    Materi Pembelajaran
                                </h4>
{!isReadOnly && (
<div className="flex items-center gap-3">
<button onClick={() => addToast('Upload materi di menu Do > Materi Pembelajaran', 'info')} className="text-secondary hover:text-secondary/80 font-body text-body font-medium flex items-center gap-1 transition-colors">
<span className="material-symbols-outlined " >upload</span> Upload
                                    </button>
<span className="text-outline-variant">|</span>
<button onClick={() => addToast('Tambah link materi di menu Do > Materi Pembelajaran', 'info')} className="text-secondary hover:text-secondary/80 font-body text-body font-medium flex items-center gap-1 transition-colors">
<span className="material-symbols-outlined " >link</span> Link
                                    </button>
</div>
)}
</div>
<div className="text-center py-8 text-on-surface-variant font-body text-body">
  <span className="material-symbols-outlined text-3xl mb-2 block text-outline">menu_book</span>
  Belum ada materi pembelajaran
</div>
</div>
)}

{/*  Section 3: Tugas & Asesmen  */}
{activeTab === 'tugas' && (
<div className="bg-surface rounded-lg border border-outline-variant p-6">
<div className="flex justify-between items-center mb-4">
<h4 className="font-h3 text-h3 text-on-background flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" >assignment</span>
                                    Tugas &amp; Asesmen
                                </h4>
{!isReadOnly && (
<button onClick={() => addToast('Tambah tugas di menu Do > Tugas & Asesmen', 'info')} className="text-secondary hover:text-secondary/80 font-body text-body font-medium flex items-center gap-1 transition-colors">
<span className="material-symbols-outlined " >add</span> Tambah Tugas
                                </button>
)}
</div>
<div className="text-center py-8 text-on-surface-variant font-body text-body">
  <span className="material-symbols-outlined text-3xl mb-2 block text-outline">assignment</span>
  Belum ada asesmen
</div>
</div>
)}

{/*  Section 4: Rubrik  */}
{activeTab === 'rubrik' && (
<div className="bg-surface rounded-lg border border-outline-variant p-6">
<div className="flex justify-between items-center mb-4">
<h4 className="font-h3 text-h3 text-on-background flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" >grading</span>
                                    Rubrik Penilaian
                                </h4>
</div>
<div className="text-center py-8 text-on-surface-variant font-body text-body">
  <span className="material-symbols-outlined text-3xl mb-2 block text-outline">grading</span>
  Belum ada rubrik penilaian
</div>
</div>
)}
</>
)}
</div>
</section>
</div>
</div>

    </div>
  );
};
