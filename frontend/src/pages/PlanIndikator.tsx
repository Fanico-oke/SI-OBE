import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import cpmkBank from '../data/cpmk_bank.json';
import { sortByKode } from '../utils/naturalSort';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface SubCPMK { id: string; kode: string; deskripsi: string; cpmkId: string; }
interface CPMK { id: string; kode: string; deskripsi: string; cplId: string; subCpmk: SubCPMK[]; }
interface CPLData { id: string; kode: string; deskripsi: string; cpmk: CPMK[]; }

const API = '';

export const PlanIndikator = () => {
  const { activeCurriculumId: id, activeCurriculumStatus } = useCurriculumStore();
  const { user } = useAuthStore();
  const isReadOnly = user?.role === 'DOSEN' || activeCurriculumStatus === 'ARCHIVED';
  const [cplList, setCplList] = useState<CPLData[]>([]);
  const [hasMkCpmkMappings, setHasMkCpmkMappings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { addToast } = useAppStore();
  const [completeness, setCompleteness] = useState<any>(null);
  const [finalizing, setFinalizing] = useState(false);

  // Form State CPMK
  const [showCpmkForm, setShowCpmkForm] = useState<string | null>(null); // Menyimpan ID CPL yang sedang dibuka form-nya
  const [cpmkForm, setCpmkForm] = useState<Partial<CPMK>>({ kode: '', deskripsi: '' });
  const [editingCpmkId, setEditingCpmkId] = useState<string | null>(null);

  // Form State Sub-CPMK
  const [showSubCpmkForm, setShowSubCpmkForm] = useState<string | null>(null); // Menyimpan ID CPMK
  const [subCpmkForm, setSubCpmkForm] = useState<Partial<SubCPMK>>({ kode: '', deskripsi: '' });
  const [editingSubCpmkId, setEditingSubCpmkId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchCompleteness();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch CPL data and MK-CPMK mappings in parallel
      const [cplRes, mappingRes] = await Promise.all([
        axios.get(`${API}/api/cpl?kurikulumId=${id}`),
        axios.get(`${API}/api/pemetaan/mk-cpmk?kurikulumId=${id}`)
      ]);
      
      const mappings = mappingRes.data || [];
      const mappedCpmkIds = new Set(mappings.map((m: any) => m.cpmkId));
      setHasMkCpmkMappings(mappedCpmkIds.size > 0);

      // Filter: only show CPL that have at least 1 mapped CPMK
      const allCpls: CPLData[] = cplRes.data;
      const filteredCpls = allCpls
        .map(cpl => ({
          ...cpl,
          cpmk: cpl.cpmk.filter(c => mappedCpmkIds.has(c.id))
        }))
        .filter(cpl => cpl.cpmk.length > 0);

      setCplList(filteredCpls);
      if (expanded.size === 0) {
        setExpanded(new Set(filteredCpls.map(c => c.id)));
      }
    } catch (error) {
      console.error('Failed to fetch indikator data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleteness = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/obe/plan-completeness?kurikulumId=${id}`);
      setCompleteness(res.data);
    } catch { /* silent */ }
  };

  const handleFinalize = async () => {
    if (!id) return;
    try {
      setFinalizing(true);
      await axios.post('/api/obe/finalize-plan', { kurikulumId: id });
      addToast('Plan berhasil diselesaikan! Notifikasi dikirim ke Dosen.', 'success');
      fetchCompleteness();
    } catch {
      addToast('Gagal menyelesaikan plan', 'error');
    } finally {
      setFinalizing(false);
    }
  };

  const toggleExpand = (cplId: string) => {
    const next = new Set(expanded);
    next.has(cplId) ? next.delete(cplId) : next.add(cplId);
    setExpanded(next);
  };

  // --- CRUD CPMK ---
  const handleSaveCpmk = async (cplId: string) => {
    try {
      const payload = { ...cpmkForm, cplId };
      if (editingCpmkId) {
        await axios.put(`/api/obe/cpmk/${editingCpmkId}`, payload);
      } else {
        await axios.post('/api/obe/cpmk', payload);
      }
      setShowCpmkForm(null);
      setCpmkForm({ kode: '', deskripsi: '' });
      setEditingCpmkId(null);
      fetchData();
      addToast('CPMK berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save CPMK failed', error);
      addToast('Gagal menyimpan CPMK', 'error');
    }
  };

  const handleEditCpmk = (cplId: string, cpmk: CPMK) => {
    setCpmkForm(cpmk);
    setEditingCpmkId(cpmk.id);
    setShowCpmkForm(cplId);
    
    // expand the CPL if not expanded
    if (!expanded.has(cplId)) {
      toggleExpand(cplId);
    }
  };

  const handleDeleteCpmk = async (cpmkId: string) => {
    if (confirm('Yakin ingin menghapus CPMK ini?')) {
      try {
        await axios.delete(`/api/obe/cpmk/${cpmkId}`);
        fetchData();
        addToast('CPMK berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete CPMK failed', error);
        addToast('Gagal menghapus CPMK', 'error');
      }
    }
  };

  // --- CRUD Sub-CPMK ---
  const generateSubCpmkKode = (cpmkKode: string, existingSubs: SubCPMK[]) => {
    // CPMK011 → L011, lalu cari nomor urut berikutnya
    const prefix = 'L' + cpmkKode.replace(/^CPMK/i, '');
    const existingNums = existingSubs
      .map(s => { const m = s.kode.match(new RegExp(`^${prefix}-(\\d+)$`)); return m ? parseInt(m[1]) : 0; })
      .filter(n => n > 0);
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `${prefix}-${nextNum}`;
  };

  const handleSaveSubCpmk = async (cpmkId: string, cpmkKode: string, existingSubs: SubCPMK[]) => {
    try {
      let payload;
      if (editingSubCpmkId) {
        payload = { ...subCpmkForm, cpmkId };
        await axios.put(`/api/obe/sub-cpmk/${editingSubCpmkId}`, payload);
      } else {
        const autoKode = generateSubCpmkKode(cpmkKode, existingSubs);
        payload = { kode: autoKode, deskripsi: subCpmkForm.deskripsi, cpmkId };
        await axios.post('/api/obe/sub-cpmk', payload);
      }
      setShowSubCpmkForm(null);
      setSubCpmkForm({ kode: '', deskripsi: '' });
      setEditingSubCpmkId(null);
      fetchData();
      addToast('Sub-CPMK berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save Sub-CPMK failed', error);
      addToast('Gagal menyimpan Sub-CPMK', 'error');
    }
  };

  const handleEditSubCpmk = (cpmkId: string, sub: SubCPMK) => {
    setSubCpmkForm(sub);
    setEditingSubCpmkId(sub.id);
    setShowSubCpmkForm(cpmkId);
  };

  const handleDeleteSubCpmk = async (subId: string) => {
    if (confirm('Yakin ingin menghapus Sub-CPMK ini?')) {
      try {
        await axios.delete(`/api/obe/sub-cpmk/${subId}`);
        fetchData();
        addToast('Sub-CPMK berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete Sub-CPMK failed', error);
        addToast('Gagal menghapus Sub-CPMK', 'error');
      }
    }
  };


  const filtered = cplList.filter(c =>
    c.kode.toLowerCase().includes(search.toLowerCase()) ||
    c.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
    c.cpmk.some(cp => cp.kode.toLowerCase().includes(search.toLowerCase()) || cp.deskripsi.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCpmk = cplList.reduce((sum, c) => sum + c.cpmk.length, 0);

  return (
    <PhaseLayout
      title="PLAN: Perencanaan Kurikulum"
      description="Tentukan Indikator Penilaian untuk mengukur capaian pembelajaran."
      icon="analytics"
      iconBgColorClass="bg-error/10"
      iconTextColorClass="text-error"
      tabs={
        <>
          <Link to="/plan" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Profil & CPL</Link>
          <Link to="/plan/bkmk" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Bahan Kajian & Mata Kuliah</Link>
          <Link to="/plan/mapping" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Matriks Pemetaan</Link>
          <Link to="/plan/indikator" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Indikator Penilaian</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          <ArchivedBanner returnPath="/plan" />

        {isReadOnly && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-warning flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            Mode Baca — Hubungi Kaprodi untuk mengubah data
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon bg-primary/10"><span className="material-symbols-outlined text-primary">school</span></div>
            <div><p className="stat-value">{cplList.length}</p><p className="stat-label">CPL Prodi</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-secondary/10"><span className="material-symbols-outlined text-secondary">checklist</span></div>
            <div><p className="stat-value">{totalCpmk}</p><p className="stat-label">Total CPMK</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-tertiary/10"><span className="material-symbols-outlined text-tertiary">avg_pace</span></div>
            <div><p className="stat-value">{cplList.length > 0 ? (totalCpmk / cplList.length).toFixed(1) : 0}</p><p className="stat-label">Rata-rata CPMK/CPL</p></div>
          </div>
        </div>

        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="input-base w-full pl-10 pr-4 py-3 rounded-xl" placeholder="Cari CPL atau CPMK..." value={search} onChange={e => setSearch(e.target.value)} type="text"/>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
        ) : !hasMkCpmkMappings ? (
          <div className="empty-state py-16 text-center">
            <span className="material-symbols-outlined text-[56px] text-outline mb-4">link_off</span>
            <h3 className="font-h3 text-h3 text-on-surface mb-2">Belum Ada Pemetaan MK ↔ CPMK</h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
              Indikator Penilaian hanya tampil setelah Anda mencentang matriks <strong>MK ↔ CPMK</strong> di tab Matriks Pemetaan.
            </p>
            <Link to="/plan/mapping" className="btn-primary inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">grid_on</span>
              Buka Matriks Pemetaan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortByKode(filtered).map(cpl => (
              <div key={cpl.id} className="card overflow-hidden transition-all">
                <div className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-surface-container transition-colors">
                  <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(cpl.id)}>
                    <span className={`material-symbols-outlined text-primary transition-transform ${expanded.has(cpl.id) ? 'rotate-90' : ''}`}>chevron_right</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="badge-primary px-3 py-1 font-bold">{cpl.kode}</span>
                        <span className="badge-neutral px-2 py-0.5">{cpl.cpmk.length} CPMK</span>
                      </div>
                      <p className="font-body text-body text-on-surface mt-2">{cpl.deskripsi}</p>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button onClick={() => { setCpmkForm({ kode: '', deskripsi: '' }); setEditingCpmkId(null); setShowCpmkForm(cpl.id); }} className="btn-primary px-4 py-2 rounded-full text-caption font-bold whitespace-nowrap flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Tambah CPMK
                    </button>
                  )}
                </div>
                
                {showCpmkForm === cpl.id && (
                  <div className="border-t border-outline-variant bg-surface-container-high p-4 m-4 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
                    
                    <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">dataset_linked</span>
                        Form CPMK
                      </h4>
                      <div className="flex items-center gap-2 text-caption relative z-10">
                        <label className="text-on-surface-variant font-medium whitespace-nowrap">Bank CPMK:</label>
                        <select 
                          className="px-3 py-1.5 bg-surface-container-lowest border border-primary/30 text-primary rounded-md font-medium text-caption max-w-[250px] outline-none focus:ring-2 focus:ring-primary/20"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const selected = cpmkBank.find(c => c.kode === val);
                              if (selected) {
                                setCpmkForm({...cpmkForm, kode: selected.kode, deskripsi: selected.deskripsi});
                              }
                            }
                          }}
                        >
                          <option value="">-- Pilih untuk Auto-fill --</option>
                          {cpmkBank.map(bank => (
                            <option key={bank.kode} value={bank.kode}>{bank.kode} - {bank.deskripsi.substring(0, 30)}...</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3 relative z-10">
                      <div className="sm:col-span-1">
                        <label className="input-label block mb-1">Kode CPMK</label>
                        <input type="text" className="input-base w-full font-data-mono" placeholder="Contoh: CPMK01" value={cpmkForm.kode || ''} onChange={e => setCpmkForm({...cpmkForm, kode: e.target.value})} />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="input-label block mb-1">Deskripsi CPMK</label>
                        <input type="text" className="input-base w-full" placeholder="Mampu..." value={cpmkForm.deskripsi || ''} onChange={e => setCpmkForm({...cpmkForm, deskripsi: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 relative z-10">
                      <button onClick={() => setShowCpmkForm(null)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                      <button onClick={() => handleSaveCpmk(cpl.id)} className="btn-primary px-4 py-2 rounded-md">{editingCpmkId ? 'Update CPMK' : 'Simpan CPMK'}</button>
                    </div>
                  </div>
                )}

                {expanded.has(cpl.id) && cpl.cpmk.length > 0 && (
                  <div className="border-t border-outline-variant bg-surface-container/30 p-4 space-y-3">
                    {sortByKode(cpl.cpmk || []).map(cp => (
                      <div key={cp.id} className="flex flex-col bg-surface rounded-lg border border-outline-variant/50 overflow-hidden">
                        <div className="flex items-start justify-between gap-3 p-3 group">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded font-data-mono text-data-mono font-bold shrink-0">{cp.kode}</span>
                            <div className="flex-1">
                              <p className="font-body text-body text-on-surface">{cp.deskripsi}</p>
                              <div className="mt-2 text-caption text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                                {cp.subCpmk?.length || 0} Sub-CPMK
                              </div>
                            </div>
                          </div>
                          {!isReadOnly && (
                            <div className="flex gap-2">
                              <button onClick={() => { setSubCpmkForm({ kode: '', deskripsi: '' }); setEditingSubCpmkId(null); setShowSubCpmkForm(showSubCpmkForm === cp.id ? null : cp.id); }} className="btn-icon w-8 h-8 rounded-full bg-tertiary/10 text-tertiary hover:bg-tertiary/20" title="Tambah Sub-CPMK">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                              <button onClick={() => handleEditCpmk(cpl.id, cp)} className="btn-icon w-8 h-8 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20" title="Edit CPMK">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteCpmk(cp.id)} className="btn-icon w-8 h-8 rounded-full bg-error/10 text-error hover:bg-error/20" title="Hapus CPMK">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {showSubCpmkForm === cp.id && (
                          <div className="bg-surface-container-high p-3 mx-3 mb-3 rounded-lg border border-outline-variant">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="shrink-0">
                                <span className="text-[11px] text-on-surface-variant">Kode otomatis:</span>
                                <span className="ml-1 px-2 py-0.5 bg-tertiary/10 text-tertiary rounded font-data-mono text-data-mono font-bold">
                                  {editingSubCpmkId ? subCpmkForm.kode : generateSubCpmkKode(cp.kode, cp.subCpmk || [])}
                                </span>
                              </div>
                              <div className="flex-1">
                                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Deskripsi Sub-CPMK</label>
                                <input type="text" className="input-base w-full text-caption" placeholder="Mampu menjelaskan..." value={subCpmkForm.deskripsi || ''} onChange={e => setSubCpmkForm({...subCpmkForm, deskripsi: e.target.value})} autoFocus />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setShowSubCpmkForm(null)} className="px-3 py-1 text-[12px] text-on-surface-variant hover:bg-surface-variant rounded transition-colors">Batal</button>
                              <button onClick={() => handleSaveSubCpmk(cp.id, cp.kode, cp.subCpmk || [])} className="px-3 py-1 text-[12px] bg-tertiary text-on-tertiary rounded hover:bg-tertiary/90 transition-colors">{editingSubCpmkId ? 'Update' : 'Simpan'}</button>
                            </div>
                          </div>
                        )}

                        {cp.subCpmk && cp.subCpmk.length > 0 && (
                          <div className="bg-surface-container-lowest border-t border-outline-variant/50 p-2 pl-12 space-y-2">
                            {sortByKode(cp.subCpmk).map(sub => (
                              <div key={sub.id} className="flex items-start justify-between gap-3 text-caption group/sub">
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-tertiary shrink-0 w-8">{sub.kode}</span>
                                  <p className="text-on-surface-variant">{sub.deskripsi}</p>
                                </div>
                                {!isReadOnly && (
                                  <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditSubCpmk(cp.id, sub)} className="text-secondary hover:bg-secondary/10 p-1 rounded" title="Edit Sub-CPMK">
                                      <span className="material-symbols-outlined text-[14px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDeleteSubCpmk(sub.id)} className="text-error hover:bg-error/10 p-1 rounded" title="Hapus Sub-CPMK">
                                      <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state text-center py-12 text-on-surface-variant font-body text-body">
                <span className="material-symbols-outlined text-h1 mb-2 block">search_off</span>
                Tidak ada CPL atau CPMK yang ditemukan.
              </div>
            )}
          </div>
        )}
        {/* Finalize Plan Section */}
        {!isReadOnly && completeness && (
          <div className="mt-8 card p-6">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">checklist</span>
              Checklist Kelengkapan Plan
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { key: 'pl', label: 'Profil Lulusan', count: completeness.counts?.pl },
                { key: 'cpl', label: 'CPL Prodi', count: completeness.counts?.cpl },
                { key: 'cpmk', label: 'CPMK', count: completeness.counts?.cpmk },
                { key: 'bk', label: 'Bahan Kajian', count: completeness.counts?.bk },
                { key: 'mk', label: 'Mata Kuliah', count: completeness.counts?.mk },
                { key: 'matriks', label: 'Pemetaan CPL-MK', count: completeness.counts?.matriks },
                { key: 'indikator', label: 'Sub-CPMK', count: completeness.counts?.indikator },
              ].map(item => (
                <div key={item.key} className={`flex items-center gap-2 p-3 rounded-lg border ${
                  completeness[item.key] ? 'bg-secondary/5 border-secondary/20' : 'bg-error/5 border-error/20'
                }`}>
                  <span className={`material-symbols-outlined text-[18px] ${completeness[item.key] ? 'text-secondary' : 'text-error'}`}>
                    {completeness[item.key] ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <div className="font-caption text-caption font-medium text-on-surface">{item.label}</div>
                    <div className="font-data-mono text-data-mono text-on-surface-variant">{item.count || 0}</div>
                  </div>
                </div>
              ))}
            </div>

            {completeness.allComplete ? (
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                {finalizing ? 'Menyimpan...' : 'Selesaikan Plan & Kirim ke Dosen'}
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl bg-surface-container-high text-on-surface-variant font-medium text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">info</span>
                Lengkapi semua checklist di atas sebelum menyelesaikan Plan
              </div>
            )}
          </div>
        )}

        </>
      }
    />
  );
};
