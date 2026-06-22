import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  tipe: string;
}

interface KelasInfo {
  id: string;
  mkId: string;
  completedAt: string | null;
}

const TIPE_STYLES: Record<string, string> = {
  WAJIB: 'bg-primary text-on-primary',
  PILIHAN: 'bg-secondary text-on-secondary',
  MKWK: 'bg-tertiary text-on-tertiary',
  MKDU: 'border border-outline text-on-surface-variant bg-surface',
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const DoModul = () => {
  const navigate = useNavigate();
  const { activeCurriculumId: id, curriculums } = useCurriculumStore();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [kelasList, setKelasList] = useState<KelasInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSemester, setActiveSemester] = useState<number | null>(null);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set(SEMESTERS));
  const [finalizingKelasId, setFinalizingKelasId] = useState<string | null>(null);

  // Detect if current curriculum is archived (read-only)
  const currentCurriculum = curriculums.find(c => c.id === id);
  const isArchived = currentCurriculum?.status === 'ARCHIVED';
  const activeCurriculum = curriculums.find(c => c.status === 'ACTIVE');
  const isDosen = user?.role === 'DOSEN';

  useEffect(() => {
    if (curriculums.length === 0) {
      useCurriculumStore.getState().fetchCurriculums();
    }
  }, [curriculums.length]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mkRes, kelasRes] = await Promise.all([
          axios.get<MataKuliah[]>(`/api/mata-kuliah?kurikulumId=${id}`),
          axios.get<KelasInfo[]>(`/api/do/kelas?kurikulumId=${id}`)
        ]);
        setMataKuliah(mkRes.data);
        setKelasList(kelasRes.data);
        setError(null);
      } catch {
        setError('Gagal memuat data Mata Kuliah.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getKelasForMk = (mkId: string): KelasInfo | undefined => {
    return kelasList.find(k => k.mkId === mkId);
  };

  const handleFinalizeDo = async (e: React.MouseEvent, kelasId: string) => {
    e.stopPropagation(); // Prevent card click navigation
    if (finalizingKelasId) return;
    setFinalizingKelasId(kelasId);
    try {
      const res = await axios.post('/api/do/finalize-do', { kelasId });
      addToast(res.data.message, 'success');
      // Update local state to reflect completion
      setKelasList(prev => prev.map(k => k.id === kelasId ? { ...k, completedAt: new Date().toISOString() } : k));
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.checklist) {
        const failed = data.checklist.filter((c: any) => !c.passed);
        const messages = failed.map((c: any) => `✗ ${c.item}: ${c.detail || ''}`).join('\n');
        addToast(`Validasi gagal:\n${messages}`, 'error');
      } else {
        addToast(data?.error || 'Gagal menyelesaikan fase Do', 'error');
      }
    } finally {
      setFinalizingKelasId(null);
    }
  };

  const toggleSemester = (sem: number) => {
    setExpandedSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(sem)) {
        next.delete(sem);
      } else {
        next.add(sem);
      }
      return next;
    });
  };

  // Filter by search and semester
  const filtered = mataKuliah.filter((mk) => {
    const matchesSearch =
      searchQuery === '' ||
      mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mk.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = activeSemester === null || mk.semester === activeSemester;
    return matchesSearch && matchesSemester;
  });

  // Group by semester
  const grouped = SEMESTERS.reduce<Record<number, MataKuliah[]>>((acc, sem) => {
    acc[sem] = filtered.filter((mk) => mk.semester === sem);
    return acc;
  }, {} as Record<number, MataKuliah[]>);

  const totalSKS = (items: MataKuliah[]) => items.reduce((sum, mk) => sum + mk.sks, 0);

  return (
    <PhaseLayout
      title="DO: Pelaksanaan Kelas & Asesmen"
      description="Kelola modul pembelajaran, Rencana Pembelajaran Semester (RPS), dan aktivitas di dalam kelas."
      icon="school"
      iconBgColorClass="bg-primary/10"
      iconTextColorClass="text-primary"
      tabs={
        <>
          <Link to="/do" className={`py-3 whitespace-nowrap px-4 -mb-px ${window.location.pathname === '/do' ? 'tab-active' : 'tab-inactive'}`}>Daftar Modul</Link>
          <Link to="/do/rps" className={`py-3 whitespace-nowrap px-4 -mb-px ${window.location.pathname.includes('/do/rps') ? 'tab-active' : 'tab-inactive'}`}>RPS</Link>
          <Link to="/do/tugas" className={`py-3 whitespace-nowrap px-4 -mb-px ${window.location.pathname.includes('/do/tugas') ? 'tab-active' : 'tab-inactive'}`}>Tugas & Asesmen</Link>
          <Link to="/do/penilaian" className={`py-3 whitespace-nowrap px-4 -mb-px ${window.location.pathname.includes('/do/penilaian') ? 'tab-active' : 'tab-inactive'}`}>Penilaian</Link>
        </>
      }
      mainContent={
        <>
          {/* Archived Curriculum Banner */}
          <ArchivedBanner returnPath="/do" />

          {window.location.pathname !== '/do' && (
            <div className="bg-primary/10 text-primary p-4 rounded-xl font-body text-body mb-6 border border-primary/20 flex items-center gap-3">
              <span className="material-symbols-outlined">info</span>
              <div>
                <strong>Pilih Modul:</strong> Silakan klik salah satu mata kuliah di bawah ini untuk mengelola {window.location.pathname.includes('rps') ? 'RPS' : window.location.pathname.includes('tugas') ? 'Tugas & Asesmen' : 'Penilaian'} pada kelas tersebut.
              </div>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 font-body text-body text-on-surface-variant">Memuat data...</span>
            </div>
          )}

          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg font-body text-body text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {SEMESTERS.filter((sem) => activeSemester === null || sem === activeSemester).map((sem) => {
                const items = grouped[sem] || [];
                if (items.length === 0 && searchQuery) return null;
                const isExpanded = expandedSemesters.has(sem);

                return (
                  <div
                    key={sem}
                    className="card overflow-hidden"
                  >
                    {/* Semester Header */}
                    <button
                      onClick={() => toggleSemester(sem)}
                      className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          {isExpanded ? 'expand_more' : 'chevron_right'}
                        </span>
                        <h3 className="font-h3 text-h3 text-on-background">Semester {sem}</h3>
                        <span className="badge-neutral px-2 py-0.5 rounded-full">
                          {items.length} MK
                        </span>
                      </div>
                      <span className="font-data-mono text-data-mono text-on-surface-variant">
                        {totalSKS(items)} SKS
                      </span>
                    </button>

                    {/* MK Cards */}
                    {isExpanded && (
                      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3">
                        {items.length === 0 ? (
                          <p className="col-span-full text-center py-4 font-body text-body text-on-surface-variant">
                            Tidak ada mata kuliah ditemukan.
                          </p>
                        ) : (
                          items.map((mk) => (
                            <div
                              key={mk.id}
                              onClick={async () => {
                                try {
                                  const res = await axios.post('/api/do/seed', { mkId: mk.id });
                                  if (res.data.kelasId) {
                                    let targetPath = `/do/rps/${res.data.kelasId}`;
                                    if (window.location.pathname.includes('/do/tugas')) {
                                      targetPath = `/do/tugas/${res.data.kelasId}`;
                                    } else if (window.location.pathname.includes('/do/penilaian')) {
                                      targetPath = `/do/penilaian/${res.data.kelasId}`;
                                    }
                                    navigate(targetPath);
                                  }
                                } catch (e) {
                                  alert('Gagal mengakses kelas');
                                }
                              }}
                              className="card-interactive p-4"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-data-mono text-data-mono text-primary font-semibold">
                                  {mk.kode}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-caption text-caption font-medium ${
                                    TIPE_STYLES[mk.tipe] || TIPE_STYLES.MKDU
                                  }`}
                                >
                                  {mk.tipe}
                                </span>
                              </div>
                              <p className="font-body text-body text-on-surface font-medium mb-2 line-clamp-2">
                                {mk.nama}
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-body text-outline">school</span>
                                  <span className="font-caption text-caption text-on-surface-variant">
                                    {mk.sks} SKS
                                  </span>
                                </div>
                                {user?.role === 'DOSEN' && !isArchived && (() => {
                                  const kelasInfo = getKelasForMk(mk.id);
                                  if (!kelasInfo) return null;
                                  if (kelasInfo.completedAt) {
                                    return (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-caption text-caption font-medium" title="Fase Do telah diselesaikan">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Selesai
                                      </span>
                                    );
                                  }
                                  return (
                                    <button
                                      onClick={(e) => handleFinalizeDo(e, kelasInfo.id)}
                                      disabled={finalizingKelasId === kelasInfo.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-caption text-caption font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                      title="Selesaikan fase Do untuk kelas ini"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {finalizingKelasId === kelasInfo.id ? 'hourglass_empty' : 'task_alt'}
                                      </span>
                                      {finalizingKelasId === kelasInfo.id ? 'Memproses...' : 'Selesaikan Do'}
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      }
      sideContent={
        <>
          <div className="flex flex-col gap-4">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">search</span>
              Pencarian
            </h3>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="input-base w-full pl-10 pr-4 py-2"
                placeholder="Cari mata kuliah..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <hr className="border-outline-variant" />

          <div className="flex flex-col gap-4">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">filter_list</span>
              Filter Semester
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveSemester(null)}
                className={`px-4 py-2 rounded-lg font-body text-body font-medium transition-all duration-150 active:scale-95 ${
                  activeSemester === null
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                Semua
              </button>
              {SEMESTERS.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setActiveSemester(sem === activeSemester ? null : sem)}
                  className={`px-4 py-2 rounded-lg font-body text-body font-medium transition-all duration-150 active:scale-95 ${
                    activeSemester === sem
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
};
