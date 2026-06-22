import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

export function Dashboard() {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { fetchCurriculums, activeCurriculumId } = useCurriculumStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState({ totalMK: 0, totalCPL: 0, totalBK: 0, totalPL: 0 });
  const [dosenMK, setDosenMK] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mkRes, cplRes, bkRes, plRes, actRes] = await Promise.all([
          axios.get('/api/mata-kuliah'),
          axios.get('/api/cpl'),
          axios.get('/api/bahan-kajian'),
          axios.get('/api/profil-lulusan'),
          axios.get('/api/act/action-plan')
        ]);
        
        const mks = Array.isArray(mkRes.data) ? mkRes.data : [];
        setStats({
          totalMK: mks.length,
          totalCPL: Array.isArray(cplRes.data) ? cplRes.data.length : 0,
          totalBK: Array.isArray(bkRes.data) ? bkRes.data.length : 0,
          totalPL: Array.isArray(plRes.data) ? plRes.data.length : 0,
        });
        setDosenMK(mks);
        setRecentActions(Array.isArray(actRes.data) ? actRes.data.slice(0, 3) : []);
      } catch {
        // Silently keep defaults on error
      }
    };
    fetchStats();
    const fetchDashStats = async () => {
      try {
        setDashLoading(true);
        const params = activeCurriculumId ? `?kurikulumId=${activeCurriculumId}` : '';
        const res = await axios.get(`/api/dashboard/stats${params}`);
        setDashStats(res.data);
      } catch {
        // Silently keep null on error
      } finally {
        setDashLoading(false);
      }
    };
    fetchDashStats();
  }, [activeCurriculumId]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      addToast('Sedang mengunggah dan memproses Excel...', 'info');
      const res = await axios.post('/api/kurikulum/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addToast(`Berhasil! ${res.data.count} kurikulum ditambahkan.`, 'success');
      fetchCurriculums();
    } catch {
      addToast('Gagal mengimport data Excel', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // RBAC: Mahasiswa Dashboard
  if (user?.role === 'MAHASISWA') {
    return (
      <div className="w-full space-y-4">
        {/* Hero Banner â€” dark */}
        <div className="card-dark rounded-3xl p-10 relative overflow-hidden ">
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/20 blur-3xl animate-float"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[250px] h-[250px] rounded-full bg-tertiary/15 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-secondary/20 rounded-full text-xs font-bold tracking-wider mb-4 text-secondary uppercase border border-secondary/30">
              Student Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface-dark mb-3 tracking-tight">
              Halo, <span className="text-secondary">{user?.nama || 'Mahasiswa'}</span> 👋
            </h1>
            <p className="text-on-surface-dark-dim text-lg max-w-xl">
              Pantau pencapaian CPL dan hasil belajar berbasis Outcome-Based Education Anda.
            </p>
          </div>
        </div>

        {/* Quick Stats – live from API */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-accent rounded-2xl p-6 hover-lift " style={{ '--i': 0 } as any}>
            <div className="w-10 h-10 rounded-xl bg-white/20 text-on-tertiary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl icon-fill">school</span>
            </div>
            <h3 className="text-3xl font-bold text-on-tertiary tracking-tight">{dashLoading ? '—' : (dashStats?.kelasEnrolled ?? 0)}</h3>
            <p className="text-sm text-on-tertiary/70 font-medium uppercase tracking-wide">MK Diambil</p>
          </div>
          <div className="card rounded-2xl p-6 hover-lift " style={{ '--i': 1 } as any}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl icon-fill">trending_up</span>
            </div>
            <h3 className="text-3xl font-bold text-on-surface tracking-tight">{dashLoading ? '—' : (dashStats?.rataCapaian ?? 0)}</h3>
            <p className="text-sm text-on-surface-variant font-medium uppercase tracking-wide">Rata-rata Capaian</p>
          </div>
          <div className="bg-secondary rounded-2xl p-6 hover-lift  text-on-secondary border-0 shadow-card" style={{ '--i': 2 } as any}>
            <div className="w-10 h-10 rounded-xl bg-white/20 text-on-secondary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl icon-fill">workspace_premium</span>
            </div>
            <h3 className="text-3xl font-bold text-on-secondary tracking-tight">{dashLoading ? '—' : `${dashStats?.cplTercapai ?? 0}/${dashStats?.totalCPL ?? 0}`}</h3>
            <p className="text-sm text-on-secondary/70 font-medium uppercase tracking-wide">CPL Tercapai</p>
          </div>
          <Link to="/rapor-obe" className="card-dark rounded-2xl p-6 hover-lift group" style={{ '--i': 3 } as any}>
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center mb-4 group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
              <span className="material-symbols-outlined text-xl icon-fill">assignment</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface-dark tracking-tight group-hover:text-tertiary transition-colors">Rapor OBE</h3>
            <p className="text-sm text-on-surface-dark-dim font-medium uppercase tracking-wide">Lihat Detail →</p>
          </Link>
        </div>

        {/* Quick Access */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="section-title">
              <span className="material-symbols-outlined text-tertiary icon-fill">auto_stories</span> Akses Cepat
            </h3>
            <Link to="/laporan" className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
              Lihat Laporan <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/laporan" className="card-interactive group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Laporan Pencapaian CPL</h4>
                  <p className="text-sm text-on-surface-variant">Lihat grafik radar & progress CPL Anda</p>
                </div>
              </div>
            </Link>
            <Link to="/profil" className="card-interactive group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">Profil Saya</h4>
                  <p className="text-sm text-on-surface-variant">Kelola data profil & preferensi</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dosen Specific Dashboard
  if (user?.role === 'DOSEN') {
    return (
      <div className="w-full space-y-4">
        {/* Hero Banner â€” dark with animated gradient */}
        <div className="card-dark rounded-3xl p-10 relative overflow-hidden ">
          <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl animate-float"></div>
          <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] rounded-full bg-tertiary/15 blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-xl">
              <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs font-bold tracking-wider mb-4 text-primary-fixed-dim uppercase border border-primary/30">
                Lecturer Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface-dark mb-3 tracking-tight">
                Halo, <span className="text-tertiary">{user?.nama || 'Dosen'}</span> 👋
              </h1>
              <p className="text-on-surface-dark-dim text-lg">
                Anda memiliki <span className="text-tertiary font-bold">{dosenMK.length}</span> Mata Kuliah semester ini. Pilih kelas untuk mulai menyusun RPS & penilaian.
              </p>
            </div>
            <Link to="/do" className="btn bg-surface text-primary font-bold rounded-xl shadow-lg hover:shadow-card-hover hover:scale-105 transition-all flex items-center gap-2 px-6 py-3 shrink-0">
              <span className="material-symbols-outlined">play_circle</span> Mulai DO
            </Link>
          </div>
        </div>

        {/* Progress Kelas Saya */}
        <div>
          <h3 className="section-title mb-4">
            <span className="material-symbols-outlined text-tertiary icon-fill">bar_chart</span> Progress Kelas Saya
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-dark rounded-2xl p-6 hover-lift" style={{ '--i': 0 } as any}>
              <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">menu_book</span>
              </div>
              <h3 className="text-4xl font-bold text-on-surface-dark tracking-tight">{dashLoading ? '—' : (dashStats?.kelas?.total ?? 0)}</h3>
              <p className="text-sm text-on-surface-dark-dim font-medium uppercase tracking-wide mt-1">Total Kelas</p>
            </div>
            <div className="card-accent rounded-2xl p-6 hover-lift" style={{ '--i': 1 } as any}>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-on-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">description</span>
              </div>
              <h3 className="text-4xl font-bold text-on-tertiary tracking-tight">{dashLoading ? '—' : (dashStats?.kelas?.withRPS ?? 0)}</h3>
              <p className="text-sm text-on-tertiary/70 font-medium uppercase tracking-wide mt-1">RPS Selesai</p>
            </div>
            <div className="card rounded-2xl p-6 hover-lift" style={{ '--i': 2 } as any}>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">grading</span>
              </div>
              <h3 className="text-4xl font-bold text-on-surface tracking-tight">{dashLoading ? '—' : (dashStats?.kelas?.withNilai ?? 0)}</h3>
              <p className="text-sm text-on-surface-variant font-medium uppercase tracking-wide mt-1">Kelas Dinilai</p>
            </div>
            <div className="bg-secondary rounded-2xl p-6 hover-lift text-on-secondary border-0 shadow-card" style={{ '--i': 3 } as any}>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-on-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">trending_up</span>
              </div>
              <h3 className="text-4xl font-bold text-on-secondary tracking-tight">{dashLoading ? '—' : (dashStats?.rataCapaian ?? 0)}</h3>
              <p className="text-sm text-on-secondary/70 font-medium uppercase tracking-wide mt-1">Rata-rata Capaian</p>
            </div>
          </div>
        </div>

        {/* Quick Access: Mata Kuliah List */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="section-title">
              <span className="material-symbols-outlined text-tertiary icon-fill">auto_stories</span> Akses Cepat Mata Kuliah
            </h3>
            <Link to="/do" className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
              Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dosenMK.slice(0, 6).map((mk: any, idx: number) => (
              <button key={mk.id} onClick={async () => {
                try {
                  const res = await axios.post('/api/do/seed', { mkId: mk.id });
                  if (res.data.kelasId) {
                    window.location.href = `/do/rps/${res.data.kelasId}`;
                  }
                } catch (e) { alert('Gagal mengakses kelas'); }
              }} className="card-interactive overflow-hidden group block text-left w-full hover-lift " style={{ '--i': idx } as any}>
                <div className="h-1.5 bg-gradient-to-r from-tertiary via-primary to-secondary"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="badge-dark">{mk.kode}</span>
                    <span className="badge-tertiary">{mk.sks} SKS</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">{mk.nama}</h4>
                  <p className="text-sm text-on-surface-variant flex items-center gap-2 mt-3">
                    <span className="material-symbols-outlined text-[16px]">play_circle</span> Mulai Pelaksanaan
                  </p>
                </div>
              </button>
            ))}
            {dosenMK.length === 0 && (
              <div className="col-span-full empty-state">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">menu_book</span>
                <p className="text-on-surface-variant font-medium">Belum ada mata kuliah yang diampu.</p>
                <p className="text-sm text-outline mt-1">Hubungi Kaprodi untuk penugasan mata kuliah.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (user?.role === 'ADMIN') {
    const adminStats = dashStats || {};
    const usrs = adminStats.users || {};
    return (
      <div className="w-full space-y-4">
        <div className="card-dark rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl animate-float"></div>
          <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] rounded-full bg-secondary/15 blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs font-bold tracking-wider mb-4 text-primary-fixed-dim uppercase border border-primary/30">
              System Administration
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface-dark mb-3 tracking-tight">
              Selamat Datang, <span className="text-tertiary">{user?.nama || 'Admin'}</span> 👋
            </h1>
            <p className="text-on-surface-dark-dim text-lg max-w-xl">
              Kelola pengguna, kelas, dan konfigurasi sistem SI-OBE.
            </p>
          </div>
        </div>

        <div>
          <h3 className="section-title mb-4">
            <span className="material-symbols-outlined text-secondary icon-fill">monitoring</span> Statistik Sistem
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-dark rounded-2xl p-6 hover-lift" style={{ '--i': 0 } as any}>
              <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">group</span>
              </div>
              <h3 className="text-4xl font-bold text-on-surface-dark tracking-tight">{dashLoading ? '—' : (usrs.total ?? 0)}</h3>
              <p className="text-sm text-on-surface-dark-dim font-medium uppercase tracking-wide mt-1">Total User</p>
              {!dashLoading && <p className="text-xs text-on-surface-dark-dim mt-2">Kaprodi: {usrs.kaprodi ?? 0} · Dosen: {usrs.dosen ?? 0} · Admin: {usrs.admin ?? 0} · Mhs: {usrs.mahasiswa ?? 0}</p>}
            </div>
            <div className="card-accent rounded-2xl p-6 hover-lift" style={{ '--i': 1 } as any}>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-on-tertiary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">class</span>
              </div>
              <h3 className="text-4xl font-bold text-on-tertiary tracking-tight">{dashLoading ? '—' : (adminStats.kelas ?? 0)}</h3>
              <p className="text-sm text-on-tertiary/70 font-medium uppercase tracking-wide mt-1">Kelas</p>
            </div>
            <div className="card rounded-2xl p-6 hover-lift" style={{ '--i': 2 } as any}>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">school</span>
              </div>
              <h3 className="text-4xl font-bold text-on-surface tracking-tight">{dashLoading ? '—' : (adminStats.mahasiswa ?? 0)}</h3>
              <p className="text-sm text-on-surface-variant font-medium uppercase tracking-wide mt-1">Mahasiswa</p>
            </div>
            <div className="bg-secondary rounded-2xl p-6 hover-lift text-on-secondary border-0 shadow-card" style={{ '--i': 3 } as any}>
              <div className="w-10 h-10 rounded-xl bg-white/20 text-on-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl icon-fill">auto_stories</span>
              </div>
              <h3 className="text-4xl font-bold text-on-secondary tracking-tight">{dashLoading ? '—' : (adminStats.kurikulum ?? 0)}</h3>
              <p className="text-sm text-on-secondary/70 font-medium uppercase tracking-wide mt-1">Kurikulum</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="section-title mb-4">
            <span className="material-symbols-outlined text-tertiary icon-fill">bolt</span> Akses Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/settings" className="card-interactive group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-2xl">settings</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Pengaturan</h4>
                  <p className="text-sm text-on-surface-variant">Konfigurasi sistem</p>
                </div>
              </div>
            </Link>
            <Link to="/plan" className="card-interactive group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
                  <span className="material-symbols-outlined text-2xl">architecture</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface group-hover:text-tertiary transition-colors">Kurikulum</h4>
                  <p className="text-sm text-on-surface-variant">Kelola data kurikulum</p>
                </div>
              </div>
            </Link>
            <Link to="/laporan" className="card-interactive group hover-lift">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface group-hover:text-secondary transition-colors">Laporan</h4>
                  <p className="text-sm text-on-surface-variant">Lihat laporan OBE</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Kaprodi Dashboard UI (default)
  const pdca = dashStats?.pdca;
  const statusBadge = (status: string) => {
    if (status === 'complete') return <span className="badge-success">Complete</span>;
    if (status === 'in_progress') return <span className="badge-tertiary">In Progress</span>;
    return <span className="badge-dark">Not Started</span>;
  };
  return (
    <div className="w-full space-y-4">
      
      {/* 1. Hero Banner â€” dark with animated gradient */}
      <div className="card-dark rounded-3xl p-10 mb-8 relative overflow-hidden ">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-tertiary/20 blur-3xl animate-float"></div>
        <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] rounded-full bg-secondary/15 blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[20%] right-[5%] w-[200px] h-[200px] rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 bg-tertiary/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider mb-4 text-tertiary uppercase border border-tertiary/30">
              Curriculum Management
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface-dark mb-3 leading-tight tracking-tight">
              Selamat Datang, <span className="text-tertiary">{user?.nama || 'Kaprodi'}</span> 👋
            </h1>
            <p className="text-on-surface-dark-dim text-lg max-w-xl">
              Pantau dan kelola seluruh siklus Outcome-Based Education untuk memastikan kualitas lulusan program studi.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/laporan" className="btn bg-surface text-primary font-bold rounded-xl shadow-lg hover:shadow-card-hover hover:scale-105 transition-all flex items-center gap-2 px-6 py-3">
              <span className="material-symbols-outlined">analytics</span> Lihat Laporan
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Bento Stat Grid â€” mixed dark/light/accent cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Dark stat card */}
        <div className="card-dark rounded-2xl p-6 hover-lift  group" style={{ '--i': 0 } as any}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl icon-fill">menu_book</span>
            </div>
            {/* No comparison data available */}
          </div>
          <h3 className="text-4xl font-bold text-on-surface-dark mb-1 tracking-tight">{stats.totalMK}</h3>
          <p className="text-sm text-on-surface-dark-dim font-medium tracking-wide uppercase">Mata Kuliah</p>
        </div>

        {/* Accent/peach stat card */}
        <div className="card-accent rounded-2xl p-6 hover-lift  group" style={{ '--i': 1 } as any}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-on-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl icon-fill">straighten</span>
            </div>
          </div>
          <h3 className="text-4xl font-bold text-on-tertiary mb-1 tracking-tight">{stats.totalCPL}</h3>
          <p className="text-sm text-on-tertiary/70 font-medium tracking-wide uppercase">CPL</p>
        </div>

        {/* Light stat card */}
        <div className="card rounded-2xl p-6 hover-lift  group" style={{ '--i': 2 } as any}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl icon-fill">category</span>
            </div>
          </div>
          <h3 className="text-4xl font-bold text-on-surface mb-1 tracking-tight">{stats.totalBK}</h3>
          <p className="text-sm text-on-surface-variant font-medium tracking-wide uppercase">Bahan Kajian</p>
        </div>

        {/* Lavender/secondary stat card */}
        <div className="bg-secondary rounded-2xl p-6 hover-lift  group text-on-secondary border-0 shadow-card" style={{ '--i': 3 } as any}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl icon-fill">school</span>
            </div>
          </div>
          <h3 className="text-4xl font-bold text-on-secondary mb-1 tracking-tight">{stats.totalPL}</h3>
          <p className="text-sm text-on-secondary/70 font-medium tracking-wide uppercase">Profil Lulusan</p>
        </div>
      </div>

      {/* PDCA Status Indicators */}
      <div className="mb-8" style={{ animationDelay: '350ms' }}>
        <h3 className="section-title mb-4">
          <span className="material-symbols-outlined text-primary icon-fill">speed</span> Status Siklus PDCA
        </h3>
        {dashLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="card rounded-2xl p-6 animate-pulse">
                <div className="h-10 w-10 bg-surface-variant/30 rounded-xl mb-4"></div>
                <div className="h-8 w-20 bg-surface-variant/30 rounded mb-2"></div>
                <div className="h-4 w-32 bg-surface-variant/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : pdca ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* PLAN */}
            <div className="card rounded-2xl p-6 hover-lift border-l-4 border-primary" style={{ '--i': 0 } as any}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">architecture</span>
                </div>
                {statusBadge(pdca.plan?.status)}
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Plan</h4>
              <div className="space-y-1 text-sm text-on-surface-variant">
                <p><span className="font-bold text-on-surface">{pdca.plan?.cpl ?? 0}</span> CPL</p>
                <p><span className="font-bold text-on-surface">{pdca.plan?.mk ?? 0}</span> Mata Kuliah</p>
                <p><span className="font-bold text-on-surface">{pdca.plan?.mappings ?? 0}</span> Pemetaan</p>
              </div>
            </div>
            {/* DO */}
            <div className="card rounded-2xl p-6 hover-lift border-l-4 border-tertiary" style={{ '--i': 1 } as any}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">play_circle</span>
                </div>
                {statusBadge(pdca.do?.status)}
              </div>
              <h4 className="text-sm font-bold text-tertiary uppercase tracking-wider mb-2">Do</h4>
              <div className="space-y-1 text-sm text-on-surface-variant">
                <p><span className="font-bold text-on-surface">{pdca.do?.kelasWithRPS ?? 0}/{pdca.do?.totalKelas ?? 0}</span> RPS</p>
                <p><span className="font-bold text-on-surface">{pdca.do?.kelasWithNilai ?? 0}/{pdca.do?.totalKelas ?? 0}</span> Nilai</p>
              </div>
            </div>
            {/* CHECK */}
            <div className="card rounded-2xl p-6 hover-lift border-l-4 border-secondary" style={{ '--i': 2 } as any}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">fact_check</span>
                </div>
                {statusBadge(pdca.check?.status)}
              </div>
              <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">Check</h4>
              <div className="space-y-1 text-sm text-on-surface-variant">
                <p><span className="font-bold text-on-surface">{pdca.check?.cplTercapai ?? 0}/{pdca.check?.totalCPL ?? 0}</span> CPL Tercapai</p>
                <p><span className="font-bold text-on-surface">{pdca.check?.rataCapaian ?? 0}%</span> Rata-rata</p>
              </div>
            </div>
            {/* ACT */}
            <div className="card rounded-2xl p-6 hover-lift border-l-4 border-warning" style={{ '--i': 3 } as any}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">update</span>
                </div>
                {statusBadge(pdca.act?.status)}
              </div>
              <h4 className="text-sm font-bold text-warning uppercase tracking-wider mb-2">Act</h4>
              <div className="space-y-1 text-sm text-on-surface-variant">
                <p><span className="font-bold text-on-surface">{pdca.act?.active ?? 0}</span> Aktif</p>
                <p><span className="font-bold text-on-surface">{pdca.act?.completed ?? 0}</span> Selesai</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. PDCA Bento Grid â€” varied sizes */}
      <div className="mb-8 " style={{ animationDelay: '400ms' }}>
        <h3 className="section-title mb-6">
          <span className="material-symbols-outlined text-tertiary icon-fill">cycle</span> Alur Siklus OBE (PDCA)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PLAN â€” spans 2 columns, dark */}
          <Link to="/plan" className="md:col-span-2 card-dark rounded-2xl p-8 group hover-lift relative overflow-hidden flex gap-6">
            <div className="absolute -right-16 -bottom-16 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
              <span className="material-symbols-outlined text-[200px]">architecture</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0 group-hover:bg-tertiary group-hover:text-on-tertiary group-hover:shadow-lg transition-all duration-300 animate-pulse-glow">
              <span className="material-symbols-outlined text-2xl">architecture</span>
            </div>
            <div className="z-10">
              <div className="text-xs font-bold text-tertiary tracking-widest uppercase mb-1">Fase 1</div>
              <h3 className="text-xl font-bold text-on-surface-dark mb-2 group-hover:text-tertiary transition-colors">
                PLAN <span className="font-normal text-base text-on-surface-dark-dim">(Perencanaan)</span>
              </h3>
              <p className="text-on-surface-dark-dim leading-relaxed text-sm">
                Susun fondasi kurikulum. Tetapkan Profil Lulusan, rumuskan CPL, Bahan Kajian, dan petakan Mata Kuliah.
              </p>
            </div>
          </Link>

          {/* DO â€” accent card */}
          <Link to="/do" className="card-accent rounded-2xl p-8 group hover-lift relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity">
              <span className="material-symbols-outlined text-[120px]">play_circle</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 text-on-tertiary flex items-center justify-center shrink-0 mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">play_circle</span>
            </div>
            <div className="text-xs font-bold text-on-tertiary/70 tracking-widest uppercase mb-1">Fase 2</div>
            <h3 className="text-xl font-bold text-on-tertiary mb-2">DO</h3>
            <p className="text-on-tertiary/70 text-sm">Eksekusi pembelajaran, susun RPS, buat Asesmen.</p>
          </Link>

          {/* CHECK â€” light card */}
          <Link to="/check" className="card rounded-2xl p-8 group hover-lift relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              <span className="material-symbols-outlined text-[120px]">fact_check</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mb-4 group-hover:bg-secondary group-hover:text-on-secondary group-hover:shadow-lg transition-all duration-300">
              <span className="material-symbols-outlined text-2xl">fact_check</span>
            </div>
            <div className="text-xs font-bold text-secondary tracking-widest uppercase mb-1">Fase 3</div>
            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">CHECK</h3>
            <p className="text-on-surface-variant text-sm">Audit keberhasilan, kalkulasi pencapaian CPL.</p>
          </Link>

          {/* ACT â€” spans 2 columns, lavender bg */}
          <Link to="/act" className="md:col-span-2 bg-secondary/10 border border-secondary/20 rounded-2xl p-8 group hover-lift relative overflow-hidden flex gap-6">
            <div className="absolute -right-16 -bottom-16 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
              <span className="material-symbols-outlined text-[200px]">update</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-on-secondary group-hover:shadow-lg transition-all duration-300">
              <span className="material-symbols-outlined text-2xl">update</span>
            </div>
            <div className="z-10">
              <div className="text-xs font-bold text-secondary tracking-widest uppercase mb-1">Fase 4</div>
              <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-secondary transition-colors">
                ACT <span className="font-normal text-base text-on-surface-variant">(Tindak Lanjut)</span>
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Tutup siklus OBE. Implementasikan Continuous Quality Improvement (CQI) untuk perbaikan kurikulum berikutnya.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Aktivitas CQI Terbaru */}
      <div className="mb-6 " style={{ animationDelay: '500ms' }}>
        <div className="flex justify-between items-end mb-6">
          <h3 className="section-title">
            <span className="material-symbols-outlined text-secondary">history</span> Aktivitas CQI Terbaru
          </h3>
          <Link to="/act" className="text-primary hover:underline font-medium text-sm flex items-center gap-1">
            Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="card overflow-hidden">
          {recentActions.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined text-h1 text-outline mb-3">inbox</span>
              <p className="text-on-surface-variant font-medium">Belum ada aktivitas Tindak Lanjut (CQI) yang dicatat.</p>
              <p className="text-sm text-outline mt-1">Data akan otomatis muncul ketika ada CPL gagal di Fase Check.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {recentActions.map((act, idx) => (
                <div key={act.id} className="p-6 hover:bg-surface-variant/30 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center " style={{ '--i': idx } as any}>
                  <div className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${act.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-tertiary/10 text-tertiary'}`}>
                      <span className="material-symbols-outlined">{act.status === 'Completed' ? 'task_alt' : 'pending_actions'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg">{act.title}</h4>
                      <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{act.context}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs font-bold text-outline flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span> {act.assignedTo}
                        </span>
                        <span className="text-xs font-bold text-outline flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(act.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {act.status === 'Completed' ? (
                      <span className="badge-success">Selesai</span>
                    ) : (
                      <span className="badge-tertiary">Aktif / Dalam Pengerjaan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
