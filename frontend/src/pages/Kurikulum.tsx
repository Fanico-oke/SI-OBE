import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

export const Kurikulum = () => {
  const { curriculums, fetchCurriculums, deleteCurriculum } = useCurriculumStore();
  const { addToast } = useAppStore();
  const { user } = useAuthStore();
  const isKaprodi = user?.role === 'KAPRODI' || user?.role === 'ADMIN';
  const isDosen = user?.role === 'DOSEN';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pdcaProgressMap, setPdcaProgressMap] = useState<Record<string, any>>({});
  const [deleteTarget, setDeleteTarget] = useState<{id: string, nama: string} | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get('/api/dashboard/kurikulum-progress');
        setPdcaProgressMap(res.data);
      } catch { /* silent */ }
    };
    fetchProgress();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addToast(`Pencarian untuk "${e.currentTarget.value}" dijalankan`, 'info');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      fetchCurriculums(); // Refresh data
    } catch (error) {
      console.error(error);
      addToast('Gagal mengimport data Excel', 'error');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchCurriculums();
  }, [fetchCurriculums]);

  const handleDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.nama) return;
    try {
      await deleteCurriculum(deleteTarget.id);
      addToast(`Kurikulum "${deleteTarget.nama}" berhasil dihapus`, 'success');
    } catch {
      addToast('Gagal menghapus kurikulum', 'error');
    }
    setDeleteTarget(null);
    setDeleteConfirmText('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header mb-1">Manajemen Kurikulum</h1>
          <p className="page-subtitle">Kelola, pantau, dan tingkatkan siklus hidup kurikulum akademik.</p>
        </div>
        {isKaprodi && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a href="/template_kurikulum.xlsx" download className="text-primary font-caption text-caption hover:underline flex items-center gap-1 bg-primary/10 px-3 py-2 rounded-lg transition-colors hover:bg-primary/20">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Unduh Template Excel
          </a>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button onClick={handleImportClick} className="btn-secondary flex items-center gap-2">
 <span className="material-symbols-outlined text-[24px]">upload</span>
            Import
          </button>
          <Link to="/kurikulum/create">
            <button className="btn-primary flex items-center gap-2">
 <span className="material-symbols-outlined text-[24px]">add</span>
              Buat Kurikulum
            </button>
          </Link>
        </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto flex-1 relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input onKeyDown={handleSearch} className="input-base pl-10" placeholder="Cari nama kurikulum, kode, atau prodi..." type="text"/>
        </div>
        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-3">
          <select value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            addToast(`Filter Status: ${e.target.value || 'Semua'}`, 'info');
          }} className="input-base flex-1 sm:w-auto cursor-pointer appearance-none">
            <option value="">Semua Status</option>
            <option value="DRAFT">Sedang Disusun</option>
            <option value="ACTIVE">Berjalan</option>
            <option value="ARCHIVED">Diarsipkan</option>
          </select>
          <button onClick={() => addToast('Panel Filter Lanjutan dibuka', 'info')} className="btn-icon" title="Filter Lanjutan">
 <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      {/* Curriculum List (Cards) */}
      <div className="flex flex-col gap-4">
        {curriculums.filter(c => statusFilter === '' || c.status === statusFilter).map((c) => (
          <div key={c.id} className="card-hover p-padding_card group">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge-neutral">{c.prodi}</span>
                  <span className={`px-3 py-1 rounded-full font-caption text-caption flex items-center gap-1.5 font-medium border whitespace-nowrap ${
                    c.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary border-secondary/20' 
                    : c.status === 'DRAFT' ? 'bg-warning/10 text-warning border-warning/20'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">{
                      c.status === 'ACTIVE' ? 'play_circle' : c.status === 'DRAFT' ? 'edit_note' : 'inventory_2'
                    }</span>
                    {c.status === 'ACTIVE' ? 'Berjalan' : c.status === 'DRAFT' ? 'Sedang Disusun' : 'Diarsipkan'}
                  </span>
                </div>
                <Link to={isDosen ? `/do` : `/plan`} onClick={() => useCurriculumStore.getState().setActiveCurriculum(c.id)}>
                  <h2 className="font-h2 text-h2 text-on-surface mb-1 group-hover:text-primary transition-colors cursor-pointer">{c.nama}</h2>
                </Link>
                <div className="flex items-center gap-4 text-on-surface-variant font-body text-body mt-3">
                  <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded">
 <span className="material-symbols-outlined text-body">calendar_today</span>
                    <span className="font-data-mono text-data-mono">{c.tahunMulai}/{c.tahunSelesai}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-64 shrink-0 flex flex-col justify-center">
                {(() => {
                  const pdca = pdcaProgressMap[c.id];
                  let phase = 'Plan'; let pct = 0; let color = 'primary';
                  if (c.status === 'ARCHIVED') {
                    phase = 'Complete'; pct = 100; color = 'success';
                  } else if (pdca) {
                    const planDone = (pdca.plan?.cpl > 0 && pdca.plan?.mk > 0 && pdca.plan?.mappings > 0);
                    const doPct = pdca.do?.totalKelas > 0 ? Math.round((pdca.do.kelasWithNilai / pdca.do.totalKelas) * 100) : 0;
                    const checkDone = pdca.check?.status === 'complete';
                    const actDone = pdca.act?.totalPlans > 0 && pdca.act?.active === 0;
                    if (!planDone) { phase = 'Plan'; pct = pdca.plan?.cpl > 0 ? 50 : 0; color = 'primary'; }
                    else if (doPct < 100) { phase = 'Do'; pct = doPct; color = 'tertiary'; }
                    else if (!checkDone) { phase = 'Check'; pct = 50; color = 'secondary'; }
                    else { phase = actDone ? 'Complete' : 'Act'; pct = actDone ? 100 : Math.round((pdca.act?.completed / Math.max(pdca.act?.totalPlans, 1)) * 100); color = actDone ? 'success' : 'warning'; }
                  }
                  return (
                    <>
                      <div className="flex justify-between items-end mb-2">
                        <span className={`font-caption text-caption font-semibold uppercase tracking-wider flex items-center gap-1 text-${color}`}>
                          {phase} Phase
                        </span>
                        <span className="font-data-mono text-data-mono font-medium">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ease-out bg-${color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="flex flex-col items-end justify-between shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/50 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {isDosen ? (
                    <Link to={`/do`}>
                      <button onClick={() => useCurriculumStore.getState().setActiveCurriculum(c.id)} className="btn-primary">
                        <span className="material-symbols-outlined text-[18px] mr-1">{c.status === 'ACTIVE' ? 'play_circle' : 'visibility'}</span>
                        {c.status === 'ACTIVE' ? 'Masuk Kelas' : 'Lihat Kurikulum'}
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/plan`}>
                      <button onClick={() => useCurriculumStore.getState().setActiveCurriculum(c.id)} className="btn-primary">
                        <span className="material-symbols-outlined text-[18px] mr-1">{c.status === 'ACTIVE' ? 'play_circle' : 'visibility'}</span>
                        {c.status === 'ACTIVE' ? 'Masuk PDCA' : 'Lihat Kurikulum'}
                      </button>
                    </Link>
                  )}
                  {isKaprodi && (
                    <>
                      {c.status === 'ARCHIVED' ? (
                        <button className="btn-ghost opacity-40 cursor-not-allowed" title="Kurikulum arsip tidak bisa diedit" disabled>Edit</button>
                      ) : (
                        <Link to={`/plan`}>
                          <button onClick={() => useCurriculumStore.getState().setActiveCurriculum(c.id)} className="btn-ghost">Edit</button>
                        </Link>
                      )}
                      <button onClick={() => setDeleteTarget({id: c.id, nama: c.nama})} className="btn-icon text-error hover:bg-error/10" title="Hapus">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                    </>
                  )}
                </div>
                <div className="font-caption text-caption text-outline mt-4 md:mt-0 text-right w-full">
                  Dibuat: {new Date(c.createdAt).toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {curriculums.length === 0 && (
          <div className="empty-state">
 <span className="material-symbols-outlined text-[48px] text-outline mb-2">folder_off</span>
            <h3 className="font-h3 text-h3">Tidak ada kurikulum</h3>
            <p className="text-on-surface-variant mt-1">Silakan buat kurikulum baru untuk memulai.</p>
          </div>
        )}
      </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[28px]">warning</span>
              </div>
              <h3 className="font-h3 text-h3 text-error">Hapus Kurikulum</h3>
            </div>
            <p className="text-on-surface-variant mb-2">
              Anda akan menghapus kurikulum <strong>"{deleteTarget.nama}"</strong> beserta <strong>semua data terkait</strong> (CPL, CPMK, BK, MK, Modul, dll).
            </p>
            <p className="text-on-surface-variant mb-4 text-sm">
              Ketik <strong>{deleteTarget.nama}</strong> untuk konfirmasi:
            </p>
            <input
              type="text"
              className="input-base w-full mb-4"
              placeholder="Ketik nama kurikulum..."
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }} className="btn-ghost">Batal</button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== deleteTarget.nama}
                className="btn-primary bg-error hover:bg-error/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
