import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import cpmkBank from '../data/cpmk_bank.json';
import { sortByKode } from '../utils/naturalSort';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface PLData {
  id: string;
  kode: string;
  deskripsi: string;
  referensi?: string;
}

interface CPLData {
  id: string;
  kode: string;
  deskripsi: string;
  kategori?: string;
  cpmk?: CPMKData[];
}

interface CPMKData {
  id: string;
  cplId: string;
  kode: string;
  deskripsi: string;
}

export const PlanEditor = () => {
  const { activeCurriculumId: id, activeCurriculumStatus } = useCurriculumStore();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const isReadOnly = user?.role === 'DOSEN' || activeCurriculumStatus === 'ARCHIVED';
  const [tujuan, setTujuan] = useState('');
  const [level, setLevel] = useState('Level 6');
  const [referensiAcuan, setReferensiAcuan] = useState<string[]>(['SN-DIKTI']);
  const [okupasiList, setOkupasiList] = useState<string[]>([]);
  const [formData, setFormData] = useState({ okupasi: '' });
  const [tujuanKurikulumId, setTujuanKurikulumId] = useState<string | null>(null);
  const [tujuanLoading, setTujuanLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Kurikulum metadata
  const [kurikulumTahun, setKurikulumTahun] = useState<{ mulai: number; selesai: number } | null>(null);
  const [totalSks, setTotalSks] = useState(0);

  // State Data
  const [plList, setPlList] = useState<PLData[]>([]);
  const [cplList, setCplList] = useState<CPLData[]>([]);

  // Form State PL
  const [showPlForm, setShowPlForm] = useState(false);
  const [plForm, setPlForm] = useState<Partial<PLData>>({ kode: '', deskripsi: '', referensi: '' });
  const [editingPlId, setEditingPlId] = useState<string | null>(null);

  interface CPLSnDiktiData {
    id: string;
    kode: string;
    deskripsi: string;
    kategori: string;
  }

  // State Data CPL SN-DIKTI
  const [cplSnDiktiList, setCplSnDiktiList] = useState<CPLSnDiktiData[]>([]);
  const [showSnDiktiForm, setShowSnDiktiForm] = useState(false);
  const [snDiktiForm, setSnDiktiForm] = useState<Partial<CPLSnDiktiData>>({ kode: '', deskripsi: '', kategori: 'Sikap' });
  const [editingSnDiktiId, setEditingSnDiktiId] = useState<string | null>(null);

  // Form State CPL
  const [showCplForm, setShowCplForm] = useState(false);
  const [cplForm, setCplForm] = useState<Partial<CPLData>>({ kode: '', deskripsi: '' });
  const [editingCplId, setEditingCplId] = useState<string | null>(null);

  // Form State CPMK
  const [showCpmkForm, setShowCpmkForm] = useState(false);
  const [cpmkForm, setCpmkForm] = useState<Partial<CPMKData>>({ cplId: '', kode: '', deskripsi: '' });
  const [editingCpmkId, setEditingCpmkId] = useState<string | null>(null);

  // Accordion States
  const [expandedPl, setExpandedPl] = useState<boolean>(true);
  const [expandedSnDikti, setExpandedSnDikti] = useState<Record<string, boolean>>({'Sikap': true, 'Keterampilan Umum': true, 'Keterampilan Khusus': true, 'Pengetahuan': true});
  const [expandedCpl, setExpandedCpl] = useState<boolean>(true);
  const [expandedCpmk, setExpandedCpmk] = useState<boolean>(true);

  const toggleSnDikti = (cat: string) => setExpandedSnDikti(p => ({...p, [cat]: !p[cat]}));

  const snDiktiByKategori = cplSnDiktiList.reduce((acc, sn) => {
    const cat = sn.kategori || 'Sikap';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sn);
    return acc;
  }, {} as Record<string, CPLSnDiktiData[]>);
  const sortedKategoriSnDikti = Object.keys(snDiktiByKategori);

  useEffect(() => {
    console.log('[PlanEditor] id changed to:', id);
    fetchData();
    fetchTujuan();
  }, [id]);

  const fetchTujuan = async () => {
    try {
      const res = await axios.get(`/api/obe/tujuan${id ? `?kurikulumId=${id}` : ''}`);
      setTujuan(res.data.tujuan || '');
      setLevel(res.data.levelKkni || 'Level 6');
      setReferensiAcuan(res.data.referensiAcuan || ['SN-DIKTI']);
      setOkupasiList(res.data.petaOkupasi || []);
      setTujuanKurikulumId(res.data.kurikulumId);
    } catch (error) {
      console.error('Failed to fetch tujuan', error);
    }
  };

  const fetchData = async () => {
    console.log('[PlanEditor] fetchData called with id:', id);
    // Fetch core data (PL, CPL, SN-DIKTI) — these should always work
    try {
      const [resPl, resCpl, resSnDikti] = await Promise.all([
        axios.get(`/api/profil-lulusan${id ? `?kurikulumId=${id}` : ''}`),
        axios.get(`/api/cpl${id ? `?kurikulumId=${id}` : ''}`),
        axios.get(`/api/cpl-sn-dikti${id ? `?kurikulumId=${id}` : ''}`),
      ]);
      console.log('[PlanEditor] API results - PL:', resPl.data?.length, 'CPL:', resCpl.data?.length, 'SN:', resSnDikti.data?.length);
      setPlList(resPl.data);
      setCplList(resCpl.data);
      setCplSnDiktiList(resSnDikti.data);
    } catch (error) {
      console.error('Failed to fetch core data', error);
    }

    // Fetch optional data (kurikulum detail, MK) — may fail for new kurikulum
    if (id) {
      try {
        const resKurikulum = await axios.get(`/api/kurikulum/${id}`);
        if (resKurikulum?.data) {
          setKurikulumTahun({ mulai: resKurikulum.data.tahunMulai, selesai: resKurikulum.data.tahunSelesai });
        }
      } catch { /* kurikulum detail not critical */ }

      try {
        const resMk = await axios.get(`/api/mata-kuliah?kurikulumId=${id}`);
        if (resMk?.data) {
          const mkArr = Array.isArray(resMk.data) ? resMk.data : [];
          setTotalSks(mkArr.reduce((sum: number, mk: any) => sum + (mk.sks || 0), 0));
        }
      } catch { /* MK count not critical */ }
    }
  };

  const handleSimpanTujuan = async () => {
    if (!tujuanKurikulumId && !id) {
      addToast('Tidak ada kurikulum aktif', 'error');
      return;
    }
    try {
      setTujuanLoading(true);
      await axios.put('/api/obe/tujuan', {
        kurikulumId: tujuanKurikulumId || id,
        tujuan,
        levelKkni: level,
        referensiAcuan,
        petaOkupasi: okupasiList,
      });
      addToast('Tujuan dan Sasaran berhasil disimpan', 'success');
    } catch (error) {
      addToast('Gagal menyimpan tujuan', 'error');
    } finally {
      setTujuanLoading(false);
    }
  };

  const toggleReferensi = (ref: string) => {
    setReferensiAcuan(prev =>
      prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]
    );
  };

  const handleAddOkupasi = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.okupasi.trim()) {
      setOkupasiList([...okupasiList, formData.okupasi]);
      setFormData({ okupasi: '' });
    }
  };

  const removeOkupasi = (idx: number) => {
    setOkupasiList(okupasiList.filter((_, i) => i !== idx));
  };

  // --- CRUD Profil Lulusan ---
  const handleSavePl = async () => {
    try {
      const payload = { ...plForm, kurikulumId: id };
      if (editingPlId) {
        await axios.put(`/api/obe/profil-lulusan/${editingPlId}`, payload);
      } else {
        await axios.post('/api/obe/profil-lulusan', payload);
      }
      setShowPlForm(false);
      setPlForm({ kode: '', deskripsi: '', referensi: '' });
      setEditingPlId(null);
      fetchData();
      addToast('Profil Lulusan berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save PL failed', error);
      addToast('Gagal menyimpan Profil Lulusan', 'error');
    }
  };

  const handleEditPl = (pl: PLData) => {
    setPlForm(pl);
    setEditingPlId(pl.id);
    setShowPlForm(true);
  };

  const handleDeletePl = async (plId: string) => {
    if (confirm('Yakin ingin menghapus PL ini?')) {
      try {
        await axios.delete(`/api/obe/profil-lulusan/${plId}`);
        fetchData();
        addToast('Profil Lulusan berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete PL failed', error);
        addToast('Gagal menghapus Profil Lulusan', 'error');
      }
    }
  };

  // --- CRUD CPL ---
  const handleSaveCpl = async () => {
    try {
      const payload = { ...cplForm, kurikulumId: id };
      if (editingCplId) {
        await axios.put(`/api/obe/cpl/${editingCplId}`, payload);
      } else {
        await axios.post('/api/obe/cpl', payload);
      }
      setShowCplForm(false);
      setCplForm({ kode: '', deskripsi: '' });
      setEditingCplId(null);
      fetchData();
      addToast('CPL berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save CPL failed', error);
      addToast('Gagal menyimpan CPL', 'error');
    }
  };

  const handleEditCpl = (cpl: CPLData) => {
    setCplForm(cpl);
    setEditingCplId(cpl.id);
    setShowCplForm(true);
  };

  const handleDeleteCpl = async (cplId: string) => {
    if (confirm('Yakin ingin menghapus CPL ini?')) {
      try {
        await axios.delete(`/api/obe/cpl/${cplId}`);
        fetchData();
        addToast('CPL berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete CPL failed', error);
        addToast('Gagal menghapus CPL', 'error');
      }
    }
  };

  // --- CRUD CPMK ---
  const handleSaveCpmk = async () => {
    try {
      if (editingCpmkId) {
        await axios.put(`/api/obe/cpmk/${editingCpmkId}`, cpmkForm);
      } else {
        await axios.post('/api/obe/cpmk', cpmkForm);
      }
      setShowCpmkForm(false);
      setCpmkForm({ cplId: '', kode: '', deskripsi: '' });
      setEditingCpmkId(null);
      fetchData();
      addToast('CPMK berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save CPMK failed', error);
      addToast('Gagal menyimpan CPMK', 'error');
    }
  };

  const handleEditCpmk = (cpmk: CPMKData) => {
    setCpmkForm(cpmk);
    setEditingCpmkId(cpmk.id);
    setShowCpmkForm(true);
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

  // --- CRUD CPL SN-DIKTI ---
  const handleSaveSnDikti = async () => {
    try {
      const payload = { ...snDiktiForm, kurikulumId: id };
      if (editingSnDiktiId) {
        await axios.put(`/api/obe/cpl-sn-dikti/${editingSnDiktiId}`, payload);
      } else {
        await axios.post('/api/obe/cpl-sn-dikti', payload);
      }
      setShowSnDiktiForm(false);
      setSnDiktiForm({ kode: '', deskripsi: '', kategori: 'Sikap' });
      setEditingSnDiktiId(null);
      fetchData();
      addToast('CPL SN-DIKTI berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save CPL SN-DIKTI failed', error);
      addToast('Gagal menyimpan CPL SN-DIKTI', 'error');
    }
  };

  const handleEditSnDikti = (snDikti: CPLSnDiktiData) => {
    setSnDiktiForm(snDikti);
    setEditingSnDiktiId(snDikti.id);
    setShowSnDiktiForm(true);
  };

  const handleDeleteSnDikti = async (snDiktiId: string) => {
    if (confirm('Yakin ingin menghapus CPL SN-DIKTI ini?')) {
      try {
        await axios.delete(`/api/obe/cpl-sn-dikti/${snDiktiId}`);
        fetchData();
        addToast('CPL SN-DIKTI berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete CPL SN-DIKTI failed', error);
        addToast('Gagal menghapus CPL SN-DIKTI', 'error');
      }
    }
  };

  return (
    <PhaseLayout
      title="PLAN: Perencanaan Kurikulum"
      description="Rancang profil lulusan, capaian pembelajaran, dan matriks kurikulum secara terstruktur."
      icon="architecture"
      iconBgColorClass="bg-primary/10"
      iconTextColorClass="text-primary"
      tabs={
        <>
          <Link to="/plan" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Profil & CPL</Link>
          <Link to="/plan/bkmk" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Bahan Kajian & Mata Kuliah</Link>
          <Link to="/plan/mapping" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Matriks Pemetaan</Link>
          <Link to="/plan/indikator" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Indikator Penilaian</Link>
        </>
      }
      mainContent={
        <>
          <ArchivedBanner returnPath="/plan" />
          {isReadOnly && !(['ARCHIVED'].includes(activeCurriculumStatus || '')) && (
            <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 font-medium bg-warning/10 border border-warning/30 text-warning">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              Mode Baca — Hubungi Kaprodi untuk mengubah data
            </div>
          )}
          <div className="lg:col-span-2 card flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-surface-variant pb-4">
              <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">target</span>
                Tujuan Pembelajaran
              </h3>
              {!isReadOnly && <button onClick={handleSimpanTujuan} disabled={tujuanLoading} className="btn-primary px-4 py-2 rounded-lg font-body text-body font-medium disabled:opacity-50">{tujuanLoading ? 'Menyimpan...' : 'Simpan Tujuan'}</button>}
            </div>
            
            <div className="space-y-2">
              <label className="input-label block">Tujuan Utama</label>
              <textarea className="input-base w-full resize-none text-on-surface" rows={4} value={tujuan} onChange={(e) => setTujuan(e.target.value)}></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="input-label block">Target Level KKNI</label>
                  <div className="relative">
                    <button onClick={() => setShowTooltip(showTooltip === 'kkni' ? null : 'kkni')} className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">help</span>
                    </button>
                    {showTooltip === 'kkni' && (
                      <div className="absolute left-8 top-0 z-50 w-72 p-3 rounded-lg bg-surface-dark text-white text-xs shadow-lg border border-outline-variant/30 animate-fade-in">
                        <p className="font-bold mb-1">KKNI = Kerangka Kualifikasi Nasional Indonesia</p>
                        <p>Jenjang kualifikasi lulusan berdasarkan Perpres No. 8/2012:</p>
                        <ul className="mt-1 space-y-0.5 ml-2">
                          <li>• <b>Level 6</b> = S1/D4</li>
                          <li>• <b>Level 7</b> = Profesi</li>
                          <li>• <b>Level 8</b> = S2</li>
                        </ul>
                        <p className="mt-1 text-white/70">Untuk prodi S1, pilih Level 6.</p>
                      </div>
                    )}
                  </div>
                </div>
                <select className="input-base w-full" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option>Level 6</option>
                  <option>Level 7</option>
                  <option>Level 8</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="input-label block">Referensi</label>
                  <div className="relative">
                    <button onClick={() => setShowTooltip(showTooltip === 'ref' ? null : 'ref')} className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">help</span>
                    </button>
                    {showTooltip === 'ref' && (
                      <div className="absolute left-8 top-0 z-50 w-80 p-3 rounded-lg bg-surface-dark text-white text-xs shadow-lg border border-outline-variant/30 animate-fade-in">
                        <p className="font-bold mb-1">Acuan standar untuk menyusun CPL:</p>
                        <ul className="space-y-1 ml-2">
                          <li>• <b>SN-DIKTI</b> — Standar Nasional Dikti (Permendikbud 3/2020). <span className="text-yellow-300">Wajib dipilih.</span></li>
                          <li>• <b>KKNI</b> — Kerangka Kualifikasi Nasional Indonesia.</li>
                          <li>• <b>IS2020</b> — Standar kurikulum SI internasional (ACM & AIS).</li>
                          <li>• <b>ACM/IEEE</b> — Standar computing umum dari ACM/IEEE.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {['SN-DIKTI','KKNI','IS2020','ACM/IEEE'].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={referensiAcuan.includes(r)} onChange={() => toggleReferensi(r)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" />
                      <span className="font-body text-body text-on-surface-variant">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <label className="input-label block">Peta Okupasi</label>
                <div className="relative">
                  <button onClick={() => setShowTooltip(showTooltip === 'okupasi' ? null : 'okupasi')} className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">help</span>
                  </button>
                  {showTooltip === 'okupasi' && (
                    <div className="absolute left-8 top-0 z-50 w-80 p-3 rounded-lg bg-surface-dark text-white text-xs shadow-lg border border-outline-variant/30 animate-fade-in">
                      <p className="font-bold mb-1">Jabatan/profesi yang ditargetkan untuk lulusan.</p>
                      <p>Menjawab: "Lulusan prodi ini bisa bekerja sebagai apa?"</p>
                      <p className="mt-1">Contoh untuk prodi SI:</p>
                      <ul className="mt-0.5 space-y-0.5 ml-2">
                        <li>• System Analyst</li>
                        <li>• Software Developer</li>
                        <li>• IT Project Manager</li>
                        <li>• Data Analyst</li>
                      </ul>
                      <p className="mt-1 text-white/70">Sumber: SKKNI / KKNI Bidang dari Kemenaker.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest min-h-[50px] items-center">
                {okupasiList.map((o, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full font-caption text-caption">
                    {o}
                    <button onClick={() => removeOkupasi(i)} className="hover:text-error transition-colors ml-1 font-bold">x</button>
                  </span>
                ))}
                <input className="border-none bg-transparent focus:ring-0 font-body text-body flex-1 min-w-[120px] outline-none" placeholder="Tambah okupasi (Enter)" type="text" value={formData.okupasi} onChange={(e) => setFormData({...formData, okupasi: e.target.value})} onKeyDown={handleAddOkupasi}/>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="font-h3 text-h3 text-on-surface flex items-center gap-2">Profil Lulusan (PL)</label>
                {!isReadOnly && (
                  <button onClick={() => { setPlForm({ kode: '', deskripsi: '', referensi: '' }); setEditingPlId(null); setShowPlForm(true); }} className="btn-primary px-4 py-2 rounded-full text-caption font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah PL
                  </button>
                )}
              </div>

              {showPlForm && (
                <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Kode PL</label>
                      <input type="text" className="input-base w-full" placeholder="Contoh: PL1" value={plForm.kode || ''} onChange={e => setPlForm({...plForm, kode: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="input-label block mb-1">Deskripsi Profil Lulusan</label>
                      <input type="text" className="input-base w-full" placeholder="Deskripsi..." value={plForm.deskripsi || ''} onChange={e => setPlForm({...plForm, deskripsi: e.target.value})} />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Referensi Peta Okupasi</label>
                      <input type="text" className="input-base w-full" placeholder="Okupasi (opsional)" value={plForm.referensi || ''} onChange={e => setPlForm({...plForm, referensi: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setShowPlForm(false)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                    <button onClick={handleSavePl} className="btn-primary px-4 py-2 rounded-md">{editingPlId ? 'Update PL' : 'Simpan PL'}</button>
                  </div>
                </div>
              )}

              <div className="table-container mt-2">
                <div 
                  className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setExpandedPl(!expandedPl)}
                >
                  <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedPl ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                    Semua Profil Lulusan
                  </div>
                  <span className="text-caption text-on-surface-variant font-medium">{plList.length} Item</span>
                </div>
                
                {expandedPl && (
                  <table className="table-modern">
                    <thead>
                      <tr><th className="w-32">Kode PL</th><th className="flex-1">Deskripsi Profil Lulusan</th><th className="w-32">Referensi Okupasi</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                    </thead>
                    <tbody>
                      {plList.length === 0 && (
                        <tr><td colSpan={4} className="text-center text-on-surface-variant">Belum ada data Profil Lulusan</td></tr>
                      )}
                      {sortByKode(plList).map((pl) => (
                        <tr key={pl.id} className="group">
                          <td className="td-code">{pl.kode}</td>
                          <td>{pl.deskripsi}</td>
                          <td><span className="badge-tertiary">{pl.referensi || '-'}</span></td>
                          {!isReadOnly && (
                            <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditPl(pl)} className="table-action-secondary" title="Edit">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDeletePl(pl.id)} className="table-action-danger" title="Hapus">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4 border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="font-h3 text-h3 text-on-surface flex items-center gap-2">Standar Nasional CPL (SN-DIKTI)</label>
                {!isReadOnly && (
                  <button onClick={() => { setSnDiktiForm({ kode: '', deskripsi: '', kategori: 'Sikap' }); setEditingSnDiktiId(null); setShowSnDiktiForm(true); }} className="btn-primary px-4 py-2 rounded-full text-caption font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah SN-DIKTI
                  </button>
                )}
              </div>

              {showSnDiktiForm && (
                <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Kategori</label>
                      <select className="input-base w-full" value={snDiktiForm.kategori || 'Sikap'} onChange={e => setSnDiktiForm({...snDiktiForm, kategori: e.target.value})}>
                        <option value="Sikap">Sikap</option>
                        <option value="Keterampilan Umum">Keterampilan Umum</option>
                        <option value="Keterampilan Khusus">Keterampilan Khusus</option>
                        <option value="Pengetahuan">Pengetahuan</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Kode</label>
                      <input type="text" className="input-base w-full" placeholder="S1, KU1..." value={snDiktiForm.kode || ''} onChange={e => setSnDiktiForm({...snDiktiForm, kode: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="input-label block mb-1">Deskripsi SN-DIKTI</label>
                      <input type="text" className="input-base w-full" placeholder="Deskripsi..." value={snDiktiForm.deskripsi || ''} onChange={e => setSnDiktiForm({...snDiktiForm, deskripsi: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setShowSnDiktiForm(false)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                    <button onClick={handleSaveSnDikti} className="btn-primary px-4 py-2 rounded-md">{editingSnDiktiId ? 'Update SN-DIKTI' : 'Simpan SN-DIKTI'}</button>
                  </div>
                </div>
              )}

              <div className="mt-2 flex flex-col gap-3">
                {cplSnDiktiList.length === 0 && (
                  <div className="empty-state p-8 text-center text-on-surface-variant border border-outline-variant rounded-lg">Belum ada data CPL SN-DIKTI</div>
                )}
                {sortedKategoriSnDikti.map(cat => (
                  <div key={cat} className="rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest shadow-sm">
                    <div 
                      className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => toggleSnDikti(cat)}
                    >
                      <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedSnDikti[cat] ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                        Kategori: {cat}
                      </div>
                      <span className="text-caption text-on-surface-variant font-medium">{snDiktiByKategori[cat].length} CPL</span>
                    </div>
                    
                    {expandedSnDikti[cat] && (
                      <div className="table-container">
                        <table className="table-modern">
                          <thead>
                            <tr><th className="w-32">Kode</th><th className="flex-1">Deskripsi</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                          </thead>
                          <tbody>
                            {sortByKode(snDiktiByKategori[cat]).map((sn) => (
                              <tr key={sn.id} className="group">
                                <td className="td-code">{sn.kode}</td>
                                <td>{sn.deskripsi}</td>
                                {!isReadOnly && (
                                  <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditSnDikti(sn)} className="table-action-secondary" title="Edit">
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDeleteSnDikti(sn.id)} className="table-action-danger" title="Hapus">
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4 border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="font-h3 text-h3 text-on-surface flex items-center gap-2">CPL Prodi (Capaian Pembelajaran Lulusan)</label>
                {!isReadOnly && (
                  <button onClick={() => { setCplForm({ kode: '', deskripsi: '' }); setEditingCplId(null); setShowCplForm(true); }} className="btn-primary px-4 py-2 rounded-full text-caption font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah CPL
                  </button>
                )}
              </div>

              {showCplForm && (
                <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Kode CPL</label>
                      <input type="text" className="input-base w-full" placeholder="Contoh: CPL01" value={cplForm.kode || ''} onChange={e => setCplForm({...cplForm, kode: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="input-label block mb-1">Deskripsi CPL</label>
                      <input type="text" className="input-base w-full" placeholder="Deskripsi..." value={cplForm.deskripsi || ''} onChange={e => setCplForm({...cplForm, deskripsi: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setShowCplForm(false)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                    <button onClick={handleSaveCpl} className="btn-primary px-4 py-2 rounded-md">{editingCplId ? 'Update CPL' : 'Simpan CPL'}</button>
                  </div>
                </div>
              )}

              <div className="table-container mt-2">
                <div 
                  className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setExpandedCpl(!expandedCpl)}
                >
                  <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedCpl ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                    Semua CPL Prodi
                  </div>
                  <span className="text-caption text-on-surface-variant font-medium">{cplList.length} Item</span>
                </div>
                
                {expandedCpl && (
                  <table className="table-modern">
                    <thead>
                      <tr><th className="w-32">Kode</th><th className="flex-1">Deskripsi CPL</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                    </thead>
                    <tbody>
                      {cplList.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-on-surface-variant">Belum ada data CPL</td></tr>
                      )}
                      {sortByKode(cplList).map((cpl) => (
                        <tr key={cpl.id} className="group">
                          <td className="td-code">{cpl.kode}</td>
                          <td>{cpl.deskripsi}</td>
                          {!isReadOnly && (
                            <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditCpl(cpl)} className="table-action-secondary" title="Edit">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteCpl(cpl.id)} className="table-action-danger" title="Hapus">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4 border-t border-outline-variant pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="font-h3 text-h3 text-on-surface flex items-center gap-2">CPMK (Capaian Pembelajaran Mata Kuliah)</label>
                {!isReadOnly && (
                  <button onClick={() => { setCpmkForm({ cplId: '', kode: '', deskripsi: '' }); setEditingCpmkId(null); setShowCpmkForm(true); }} className="btn-primary px-4 py-2 rounded-full text-caption font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tambah CPMK
                  </button>
                )}
              </div>

              {showCpmkForm && (
                <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3 border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
                  
                  <div className="flex justify-between items-center border-b border-outline-variant pb-2 mb-2">
                    <h4 className="font-bold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">dataset_linked</span>
                      Form CPMK
                    </h4>
                    <div className="flex items-center gap-2 text-caption">
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

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">CPL Induk</label>
                      <select className="input-base w-full font-data-mono" value={cpmkForm.cplId || ''} onChange={e => setCpmkForm({...cpmkForm, cplId: e.target.value})}>
                        <option value="" disabled>Pilih CPL...</option>
                        {sortByKode(cplList).map(c => <option key={c.id} value={c.id}>{c.kode}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="input-label block mb-1">Kode CPMK</label>
                      <input type="text" className="input-base w-full font-data-mono" placeholder="CPMK01" value={cpmkForm.kode || ''} onChange={e => setCpmkForm({...cpmkForm, kode: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="input-label block mb-1">Deskripsi CPMK</label>
                      <input type="text" className="input-base w-full" placeholder="Deskripsi..." value={cpmkForm.deskripsi || ''} onChange={e => setCpmkForm({...cpmkForm, deskripsi: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2 relative z-10">
                    <button onClick={() => setShowCpmkForm(false)} className="btn-ghost px-4 py-2 rounded-md font-medium">Batal</button>
                    <button onClick={handleSaveCpmk} className="btn-primary px-4 py-2 rounded-md font-medium shadow-md shadow-primary/20">{editingCpmkId ? 'Update CPMK' : 'Simpan CPMK'}</button>
                  </div>
                </div>
              )}

              <div className="table-container mt-2">
                <div 
                  className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setExpandedCpmk(!expandedCpmk)}
                >
                  <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedCpmk ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                    Semua CPMK
                  </div>
                  <span className="text-caption text-on-surface-variant font-medium">{cplList.reduce((acc, cpl) => acc + (cpl.cpmk?.length || 0), 0)} Item</span>
                </div>
                
                {expandedCpmk && (
                  <table className="table-modern">
                    <thead>
                      <tr><th className="w-32">Kode</th><th className="w-32">CPL Terkait</th><th className="flex-1">Deskripsi CPMK</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                    </thead>
                    <tbody>
                      {cplList.reduce((acc, cpl) => acc + (cpl.cpmk?.length || 0), 0) === 0 && (
                        <tr><td colSpan={4} className="text-center text-on-surface-variant">Belum ada data CPMK</td></tr>
                      )}
                      {sortByKode(cplList).map(cpl => sortByKode(cpl.cpmk || []).map(cpmk => (
                        <tr key={cpmk.id} className="group">
                          <td className="td-code">{cpmk.kode}</td>
                          <td>
                            <span className="td-code">{cpl.kode}</span>
                          </td>
                          <td>{cpmk.deskripsi}</td>
                          {!isReadOnly && (
                            <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditCpmk({...cpmk, cplId: cpl.id})} className="table-action-secondary" title="Edit">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteCpmk(cpmk.id)} className="table-action-danger" title="Hapus">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      )))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      }
      sideContent={
        <>
          <div className="card">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary">info</span>
              Informasi Umum
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Status</p>
                <span className="badge-neutral inline-block mt-1">Drafting Phase</span>
              </div>
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Tahun Implementasi</p>
                <p className="font-body text-body text-on-surface font-medium">{kurikulumTahun ? `${kurikulumTahun.mulai} - ${kurikulumTahun.selesai}` : '—'}</p>
              </div>
              <div>
                <p className="font-caption text-caption text-on-surface-variant">Kapasitas SKS</p>
                <div className="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${Math.min((totalSks / 144) * 100, 100)}%` }}></div>
                </div>
                <p className="font-caption text-caption text-on-surface mt-1 text-right">{totalSks} / 144 SKS</p>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
