import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { sortByKode } from '../utils/naturalSort';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface BKData {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
}

interface MKData {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  tipe: string;
}

export const PlanBKMK = () => {
  const { activeCurriculumId: id, activeCurriculumStatus } = useCurriculumStore();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const isReadOnly = user?.role === 'DOSEN' || activeCurriculumStatus === 'ARCHIVED';
  
  const [bkList, setBkList] = useState<BKData[]>([]);
  const [mkList, setMkList] = useState<MKData[]>([]);

  // Accordion state
  const [expandedBk, setExpandedBk] = useState<boolean>(true);
  const [expandedMk, setExpandedMk] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true });

  const toggleMk = (sem: number) => setExpandedMk(p => ({...p, [sem]: !p[sem]}));

  const mkBySemester = mkList.reduce((acc, mk) => {
    const sem = mk.semester || 0;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(mk);
    return acc;
  }, {} as Record<number, MKData[]>);
  const sortedSemesters = Object.keys(mkBySemester).map(Number).sort((a,b) => a-b);

  // Form State BK
  const [showBkForm, setShowBkForm] = useState(false);
  const [bkForm, setBkForm] = useState<Partial<BKData>>({ kode: '', nama: '', deskripsi: '' });
  const [editingBkId, setEditingBkId] = useState<string | null>(null);

  // Form State MK
  const [showMkForm, setShowMkForm] = useState(false);
  const [mkForm, setMkForm] = useState<Partial<MKData>>({ kode: '', nama: '', sks: 3, semester: 1, tipe: 'WAJIB' });
  const [editingMkId, setEditingMkId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [resBk, resMk] = await Promise.all([
        axios.get(`/api/bahan-kajian${id ? `?kurikulumId=${id}` : ''}`),
        axios.get(`/api/mata-kuliah${id ? `?kurikulumId=${id}` : ''}`)
      ]);
      setBkList(resBk.data);
      setMkList(resMk.data);
    } catch (error) {
      console.error('Failed to fetch BK/MK data', error);
    }
  };

  // --- CRUD Bahan Kajian ---
  const handleSaveBk = async () => {
    try {
      const payload = { ...bkForm, kurikulumId: id };
      if (editingBkId) {
        await axios.put(`/api/obe/bahan-kajian/${editingBkId}`, payload);
      } else {
        await axios.post('/api/obe/bahan-kajian', payload);
      }
      setShowBkForm(false);
      setBkForm({ kode: '', nama: '', deskripsi: '' });
      setEditingBkId(null);
      fetchData();
      addToast('Bahan Kajian berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save BK failed', error);
      addToast('Gagal menyimpan Bahan Kajian', 'error');
    }
  };

  const handleEditBk = (bk: BKData) => {
    setBkForm(bk);
    setEditingBkId(bk.id);
    setShowBkForm(true);
  };

  const handleDeleteBk = async (bkId: string) => {
    if (confirm('Yakin ingin menghapus BK ini?')) {
      try {
        await axios.delete(`/api/obe/bahan-kajian/${bkId}`);
        fetchData();
        addToast('Bahan Kajian berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete BK failed', error);
        addToast('Gagal menghapus Bahan Kajian', 'error');
      }
    }
  };

  // --- CRUD Mata Kuliah ---
  const handleSaveMk = async () => {
    try {
      const payload = { ...mkForm, kurikulumId: id };
      if (editingMkId) {
        await axios.put(`/api/obe/mata-kuliah/${editingMkId}`, payload);
      } else {
        await axios.post('/api/obe/mata-kuliah', payload);
      }
      setShowMkForm(false);
      setMkForm({ kode: '', nama: '', sks: 3, semester: 1, tipe: 'WAJIB' });
      setEditingMkId(null);
      fetchData();
      addToast('Mata Kuliah berhasil disimpan', 'success');
    } catch (error) {
      console.error('Save MK failed', error);
      addToast('Gagal menyimpan Mata Kuliah', 'error');
    }
  };

  const handleEditMk = (mk: MKData) => {
    setMkForm(mk);
    setEditingMkId(mk.id);
    setShowMkForm(true);
  };

  const handleDeleteMk = async (mkId: string) => {
    if (confirm('Yakin ingin menghapus MK ini?')) {
      try {
        await axios.delete(`/api/obe/mata-kuliah/${mkId}`);
        fetchData();
        addToast('Mata Kuliah berhasil dihapus', 'success');
      } catch (error) {
        console.error('Delete MK failed', error);
        addToast('Gagal menghapus Mata Kuliah', 'error');
      }
    }
  };

  return (
    <PhaseLayout
      title="PLAN: Perencanaan Kurikulum"
      description="Kelola Bahan Kajian dan Mata Kuliah untuk kurikulum program studi."
      icon="menu_book"
      iconBgColorClass="bg-primary/10"
      iconTextColorClass="text-primary"
      tabs={
        <>
          <Link to="/plan" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Profil & CPL</Link>
          <Link to="/plan/bkmk" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Bahan Kajian & Mata Kuliah</Link>
          <Link to="/plan/mapping" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Matriks Pemetaan</Link>
          <Link to="/plan/indikator" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Indikator Penilaian</Link>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KOLOM BAHAN KAJIAN */}
            <div className="card flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-surface-variant pb-4">
                <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">library_books</span>
                  </div>
                  Bahan Kajian (BK)
                </h3>
                {!isReadOnly && (
                  <button onClick={() => { setBkForm({ kode: '', nama: '', deskripsi: '' }); setEditingBkId(null); setShowBkForm(true); }} className="btn-primary px-5 py-2.5 rounded-full font-bold text-body flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah BK
                  </button>
                )}
              </div>

            {showBkForm && (
              <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-1">
                    <label className="input-label block mb-1">Kode BK</label>
                    <input type="text" className="input-base w-full" placeholder="Contoh: BK01" value={bkForm.kode || ''} onChange={e => setBkForm({...bkForm, kode: e.target.value})} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="input-label block mb-1">Nama BK</label>
                    <input type="text" className="input-base w-full" placeholder="Contoh: Pemrograman" value={bkForm.nama || ''} onChange={e => setBkForm({...bkForm, nama: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label block mb-1">Deskripsi</label>
                    <input type="text" className="input-base w-full" placeholder="Deskripsi opsional..." value={bkForm.deskripsi || ''} onChange={e => setBkForm({...bkForm, deskripsi: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowBkForm(false)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                  <button onClick={handleSaveBk} className="btn-primary px-4 py-2 rounded-md">{editingBkId ? 'Update BK' : 'Simpan BK'}</button>
                </div>
              </div>
            )}

            <div className="table-container mt-2">
              <div 
                className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setExpandedBk(!expandedBk)}
              >
                <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedBk ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                  Semua Bahan Kajian
                </div>
                <span className="text-caption text-on-surface-variant font-medium">{bkList.length} Item</span>
              </div>
              
              {expandedBk && (
                <table className="table-modern">
                  <thead>
                    <tr><th className="w-32">Kode</th><th className="flex-1">Nama BK</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                  </thead>
                  <tbody>
                    {bkList.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-on-surface-variant">Belum ada data Bahan Kajian</td></tr>
                    )}
                    {sortByKode(bkList).map((bk) => (
                      <tr key={bk.id} className="group">
                        <td className="td-code">{bk.kode}</td>
                        <td>
                          <div className="font-medium text-on-surface">{bk.nama}</div>
                          {bk.deskripsi && <div className="text-caption mt-1 line-clamp-1">{bk.deskripsi}</div>}
                        </td>
                        {!isReadOnly && (
                          <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditBk(bk)} className="table-action-secondary" title="Edit">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => handleDeleteBk(bk.id)} className="table-action-danger" title="Hapus">
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

          {/* KOLOM MATA KULIAH */}
          <div className="card flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-surface-variant pb-4">
              <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                Mata Kuliah (MK)
              </h3>
              {!isReadOnly && (
                <button onClick={() => { setMkForm({ kode: '', nama: '', sks: 3, semester: 1, tipe: 'WAJIB' }); setEditingMkId(null); setShowMkForm(true); }} className="btn-primary px-5 py-2.5 rounded-full font-bold text-body flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Tambah MK
                </button>
              )}
            </div>

            {showMkForm && (
              <div className="p-4 bg-surface-container-high rounded-lg mb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="input-label block mb-1">Kode MK</label>
                    <input type="text" className="input-base w-full" placeholder="CS101" value={mkForm.kode || ''} onChange={e => setMkForm({...mkForm, kode: e.target.value})} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="input-label block mb-1">Nama MK</label>
                    <input type="text" className="input-base w-full" placeholder="Struktur Data" value={mkForm.nama || ''} onChange={e => setMkForm({...mkForm, nama: e.target.value})} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="input-label block mb-1">SKS</label>
                    <input type="number" min="1" max="6" className="input-base w-full" value={mkForm.sks || 3} onChange={e => setMkForm({...mkForm, sks: parseInt(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="input-label block mb-1">Semester</label>
                    <input type="number" min="1" max="8" className="input-base w-full" value={mkForm.semester || 1} onChange={e => setMkForm({...mkForm, semester: parseInt(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label block mb-1">Tipe</label>
                    <select className="input-base w-full" value={mkForm.tipe || 'WAJIB'} onChange={e => setMkForm({...mkForm, tipe: e.target.value})}>
                      <option value="WAJIB">WAJIB</option>
                      <option value="PILIHAN">PILIHAN</option>
                      <option value="MKWK">MKWK</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowMkForm(false)} className="btn-ghost px-4 py-2 rounded-md">Batal</button>
                  <button onClick={handleSaveMk} className="btn-primary px-4 py-2 rounded-md">{editingMkId ? 'Update MK' : 'Simpan MK'}</button>
                </div>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-3">
              {mkList.length === 0 && (
                <div className="empty-state p-8 text-center text-on-surface-variant border border-outline-variant rounded-lg">Belum ada data Mata Kuliah</div>
              )}
              {sortedSemesters.map(sem => (
                <div key={sem} className="rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest shadow-sm">
                  <div 
                    className="bg-primary/5 border-b border-outline-variant p-4 flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => toggleMk(sem)}
                  >
                    <div className="font-caption text-caption font-bold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] transition-transform duration-300" style={{ transform: expandedMk[sem] ? 'rotate(180deg)' : 'rotate(0deg)' }}>keyboard_arrow_down</span>
                      Semester {sem}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">{mkBySemester[sem].reduce((sum, mk) => sum + mk.sks, 0)} SKS</span>
                      <span className="text-caption text-on-surface-variant font-medium">{mkBySemester[sem].length} MK</span>
                    </div>
                  </div>
                  
                  {expandedMk[sem] && (
                    <div className="table-container">
                      <table className="table-modern">
                        <thead>
                          <tr><th className="w-28">Kode</th><th className="flex-1">Nama MK</th><th className="text-center w-20">SKS</th><th className="text-center w-24">Semester</th>{!isReadOnly && <th className="text-center w-24">Aksi</th>}</tr>
                        </thead>
                        <tbody>
                          {sortByKode(mkBySemester[sem]).map((mk) => (
                            <tr key={mk.id} className="group">
                              <td className="td-code">{mk.kode}</td>
                              <td className="font-medium">{mk.nama}</td>
                              <td className="text-center td-mono">{mk.sks}</td>
                              <td>
                                <span className={`inline-block px-2 py-0.5 text-[10px] rounded font-bold ${mk.tipe === 'WAJIB' ? 'bg-error-container text-on-error-container' : 'bg-surface-variant text-on-surface-variant'}`}>{mk.tipe}</span>
                              </td>
                              {!isReadOnly && (
                                <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditMk(mk)} className="table-action-secondary" title="Edit">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteMk(mk.id)} className="table-action-danger" title="Hapus">
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
        </div>

        {/* TABEL SEBARAN MK PER SEMESTER (TABEL 12) */}
        <div className="mt-8 card">
          <div className="border-b border-surface-variant pb-4 mb-4">
            <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">view_timeline</span>
              Tabel 12: Sebaran SKS MK per Semester
            </h3>
          </div>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Total SKS</th>
                  <th>Jml MK</th>
                  <th>MK Wajib</th>
                  <th>MK Pilihan</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                  const mksInSem = mkList.filter(m => m.semester === sem);
                  const totalSks = mksInSem.reduce((sum, m) => sum + m.sks, 0);
                  const mkWajib = mksInSem.filter(m => m.tipe === 'WAJIB');
                  const mkPilihan = mksInSem.filter(m => m.tipe !== 'WAJIB');
                  return (
                    <tr key={sem}>
                      <td className="font-bold">{sem}</td>
                      <td className="td-mono">{totalSks}</td>
                      <td className="td-mono">{mksInSem.length}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {sortByKode(mkWajib).map(m => <span key={m.id} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-data-mono" title={m.nama}>{m.kode}</span>)}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {sortByKode(mkPilihan).map(m => <span key={m.id} className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-data-mono" title={m.nama}>{m.kode}</span>)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        </>
      }
    />
  );
};
