import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface Lampiran {
  originalName: string;
  fileName: string;
  size: number;
  mimetype: string;
}

interface Dokumentasi {
  id: string;
  kurikulumId: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  tanggal: string;
  peserta: string | null;
  lokasi: string | null;
  hasil: string | null;
  tindakLanjut: string | null;
  lampiran: string | null;
  createdAt: string;
}

const KATEGORI_OPTIONS = [
  { value: 'Rapat Kurikulum', icon: 'groups', color: 'text-primary' },
  { value: 'Workshop / Pelatihan', icon: 'school', color: 'text-secondary' },
  { value: 'FGD', icon: 'forum', color: 'text-tertiary' },
  { value: 'Evaluasi Eksternal', icon: 'domain', color: 'text-warning' },
  { value: 'Revisi Dokumen', icon: 'edit_document', color: 'text-error' },
  { value: 'Seminar / Sosialisasi', icon: 'campaign', color: 'text-success' },
  { value: 'Kunjungan Industri', icon: 'factory', color: 'text-on-surface-variant' },
  { value: 'Monitoring Internal', icon: 'monitoring', color: 'text-primary' },
  { value: 'Lain-lain', icon: 'more_horiz', color: 'text-outline' },
];

const getKategoriMeta = (k: string) => KATEGORI_OPTIONS.find(o => o.value === k) || KATEGORI_OPTIONS[8];
const formatFileSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export const ActDokumentasi = () => {
  const { activeCurriculumId } = useCurriculumStore();
  const { addToast } = useAppStore();

  const [docs, setDocs] = useState<Dokumentasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form fields
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Rapat Kurikulum');
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [peserta, setPeserta] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [hasil, setHasil] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingLampiran, setExistingLampiran] = useState<Lampiran[]>([]);

  const fetchDocs = async () => {
    if (!activeCurriculumId) return;
    try {
      const res = await axios.get(`/api/dokumentasi?kurikulumId=${activeCurriculumId}`);
      setDocs(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [activeCurriculumId]);

  const resetForm = () => {
    setJudul(''); setKategori('Rapat Kurikulum'); setDeskripsi('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setPeserta(''); setLokasi(''); setHasil(''); setTindakLanjut('');
    setFiles([]); setExistingLampiran([]); setEditId(null); setShowForm(false);
  };

  const openEdit = (doc: Dokumentasi) => {
    setEditId(doc.id);
    setJudul(doc.judul); setKategori(doc.kategori); setDeskripsi(doc.deskripsi);
    setTanggal(doc.tanggal.split('T')[0]);
    setPeserta(doc.peserta || ''); setLokasi(doc.lokasi || '');
    setHasil(doc.hasil || ''); setTindakLanjut(doc.tindakLanjut || '');
    try { setExistingLampiran(JSON.parse(doc.lampiran || '[]')); } catch { setExistingLampiran([]); }
    setFiles([]); setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!judul.trim() || !deskripsi.trim() || !activeCurriculumId) {
      addToast('Judul dan deskripsi wajib diisi', 'error'); return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('kurikulumId', activeCurriculumId);
      formData.append('judul', judul); formData.append('kategori', kategori);
      formData.append('deskripsi', deskripsi); formData.append('tanggal', tanggal);
      formData.append('peserta', peserta); formData.append('lokasi', lokasi);
      formData.append('hasil', hasil); formData.append('tindakLanjut', tindakLanjut);
      if (editId) formData.append('existingLampiran', JSON.stringify(existingLampiran));
      files.forEach(f => formData.append('files', f));

      if (editId) {
        await axios.put(`/api/dokumentasi/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        addToast('Dokumentasi berhasil diupdate', 'success');
      } else {
        await axios.post('/api/dokumentasi', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        addToast('Dokumentasi berhasil disimpan', 'success');
      }
      resetForm(); fetchDocs();
    } catch (e) {
      addToast('Gagal menyimpan dokumentasi', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus dokumentasi ini?')) return;
    try {
      await axios.delete(`/api/dokumentasi/${id}`);
      addToast('Dokumentasi berhasil dihapus', 'success');
      fetchDocs();
    } catch (e) { addToast('Gagal menghapus', 'error'); }
  };

  const removeExistingFile = (idx: number) => {
    setExistingLampiran(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Group by month
  const groupedDocs: Record<string, Dokumentasi[]> = {};
  docs.forEach(d => {
    const key = new Date(d.tanggal).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!groupedDocs[key]) groupedDocs[key] = [];
    groupedDocs[key].push(d);
  });

  return (
    <PhaseLayout
      title="ACT: Pusat Tindak Lanjut (CQI)"
      description="Delegasikan perbaikan kurikulum secara berkelanjutan dan pantau rekam jejak penyelesaian isu kritis."
      icon="change_circle"
      iconBgColorClass="bg-error/10"
      iconTextColorClass="text-error"
      tabs={
        <>
          <Link to="/act" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Tindakan Perbaikan</Link>
          <Link to="/act/monitoring" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Monitoring Perbaikan</Link>
          <Link to="/act/dokumentasi" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Dokumentasi Kegiatan</Link>
          <Link to="/act/finalisasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Finalisasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          <ArchivedBanner returnPath="/act" />

          {/* Header + Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Dokumentasi Kegiatan Kurikulum
              </h2>
              <p className="page-subtitle">Catat dan arsipkan semua kegiatan terkait kurikulum sebagai bukti pelaksanaan PDCA.</p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Kegiatan
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="card flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">event_note</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Total Kegiatan</p>
                <p className="font-bold text-lg text-on-surface">{docs.length}</p>
              </div>
            </div>
            {['Rapat Kurikulum', 'Workshop / Pelatihan', 'Evaluasi Eksternal'].map(cat => {
              const meta = getKategoriMeta(cat);
              const count = docs.filter(d => d.kategori === cat).length;
              return (
                <div key={cat} className="card flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-variant flex items-center justify-center">
                    <span className={`material-symbols-outlined ${meta.color} text-[20px]`}>{meta.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{cat.split(' / ')[0]}</p>
                    <p className="font-bold text-lg text-on-surface">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="card mb-6 border-2 border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-h4 text-h4 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  {editId ? 'Edit Dokumentasi' : 'Tambah Dokumentasi Baru'}
                </h3>
                <button onClick={resetForm} className="btn-icon"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="input-label">Judul Kegiatan *</label>
                  <input type="text" className="input-base w-full" placeholder="Contoh: Rapat Evaluasi Semester Ganjil 2025" value={judul} onChange={e => setJudul(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Kategori *</label>
                  <select className="input-base w-full" value={kategori} onChange={e => setKategori(e.target.value)}>
                    {KATEGORI_OPTIONS.map(k => <option key={k.value} value={k.value}>{k.value}</option>)}
                  </select>
                </div>

                <div>
                  <label className="input-label">Tanggal Pelaksanaan *</label>
                  <input type="date" className="input-base w-full" value={tanggal} onChange={e => setTanggal(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className="input-label">Deskripsi Kegiatan *</label>
                  <textarea className="input-base w-full resize-none" rows={3} placeholder="Jelaskan detail kegiatan yang dilakukan..." value={deskripsi} onChange={e => setDeskripsi(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Peserta / Pihak Terlibat</label>
                  <input type="text" className="input-base w-full" placeholder="Contoh: 12 dosen prodi SI, Dekan, Wakil Dekan" value={peserta} onChange={e => setPeserta(e.target.value)} />
                </div>

                <div>
                  <label className="input-label">Lokasi</label>
                  <input type="text" className="input-base w-full" placeholder="Contoh: Ruang Rapat Prodi Lt.3" value={lokasi} onChange={e => setLokasi(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className="input-label">Hasil / Kesimpulan</label>
                  <textarea className="input-base w-full resize-none" rows={2} placeholder="Rangkuman hasil kegiatan dan keputusan yang diambil..." value={hasil} onChange={e => setHasil(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className="input-label">Tindak Lanjut</label>
                  <input type="text" className="input-base w-full" placeholder="Contoh: Revisi RPS 3 MK sebelum semester depan" value={tindakLanjut} onChange={e => setTindakLanjut(e.target.value)} />
                </div>

                {/* File Upload */}
                <div className="md:col-span-2">
                  <label className="input-label">Lampiran / Bukti (maks 5 file, 10MB/file)</label>
                  <div className="mt-1">
                    <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <span className="material-symbols-outlined text-on-surface-variant">upload_file</span>
                      <span className="text-on-surface-variant text-sm">Klik untuk upload file (PDF, DOC, XLS, PPT, JPG, PNG)</span>
                      <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp" onChange={e => { if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                    </label>
                  </div>

                  {/* Existing files (edit mode) */}
                  {existingLampiran.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-on-surface-variant font-medium">File tersimpan:</p>
                      {existingLampiran.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant/50 rounded-lg text-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">attach_file</span>
                          <span className="flex-1 truncate">{f.originalName}</span>
                          <span className="text-xs text-on-surface-variant">{formatFileSize(f.size)}</span>
                          <button onClick={() => removeExistingFile(i)} className="text-error hover:bg-error/10 rounded p-0.5">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New files */}
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-on-surface-variant font-medium">File baru:</p>
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-success/5 border border-success/20 rounded-lg text-sm">
                          <span className="material-symbols-outlined text-[16px] text-success">upload_file</span>
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-xs text-on-surface-variant">{formatFileSize(f.size)}</span>
                          <button onClick={() => removeNewFile(i)} className="text-error hover:bg-error/10 rounded p-0.5">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-outline-variant">
                <button onClick={resetForm} className="btn-ghost">Batal</button>
                <button onClick={handleSubmit} disabled={saving || !judul.trim() || !deskripsi.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Menyimpan...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">save</span> {editId ? 'Update' : 'Simpan'} Dokumentasi</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Timeline List */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : docs.length === 0 ? (
            <div className="card text-center py-12">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">description</span>
              <h3 className="font-bold text-on-surface mb-1">Belum Ada Dokumentasi</h3>
              <p className="text-on-surface-variant text-sm">Klik "Tambah Kegiatan" untuk mulai mendokumentasikan kegiatan kurikulum.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDocs).map(([month, items]) => (
                <div key={month}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
                    <h3 className="font-bold text-on-surface">{month}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{items.length} kegiatan</span>
                  </div>

                  <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-2">
                    {items.map(doc => {
                      const meta = getKategoriMeta(doc.kategori);
                      let lampiran: Lampiran[] = [];
                      try { lampiran = JSON.parse(doc.lampiran || '[]'); } catch { }

                      return (
                        <div key={doc.id} className="card ml-4 relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[calc(1rem+11px)] top-4 w-5 h-5 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>

                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-[18px] ${meta.color}`}>{meta.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-on-surface">{doc.judul}</h4>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                                  <span>{doc.kategori}</span>
                                  <span>•</span>
                                  <span>{new Date(doc.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(doc)} className="btn-icon p-1" title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(doc.id)} className="btn-icon text-error p-1" title="Hapus">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-on-surface mb-3">{doc.deskripsi}</p>

                          {/* Detail Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {doc.peserta && (
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">group</span>
                                <div><span className="text-on-surface-variant text-xs">Peserta:</span><br/><span className="text-on-surface">{doc.peserta}</span></div>
                              </div>
                            )}
                            {doc.lokasi && (
                              <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">location_on</span>
                                <div><span className="text-on-surface-variant text-xs">Lokasi:</span><br/><span className="text-on-surface">{doc.lokasi}</span></div>
                              </div>
                            )}
                          </div>

                          {doc.hasil && (
                            <div className="mt-3 p-2.5 rounded-lg bg-success/5 border border-success/20">
                              <div className="flex items-center gap-1 text-xs text-success font-medium mb-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Hasil / Kesimpulan
                              </div>
                              <p className="text-sm text-on-surface">{doc.hasil}</p>
                            </div>
                          )}

                          {doc.tindakLanjut && (
                            <div className="mt-2 p-2.5 rounded-lg bg-warning/5 border border-warning/20">
                              <div className="flex items-center gap-1 text-xs text-warning font-medium mb-1">
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span> Tindak Lanjut
                              </div>
                              <p className="text-sm text-on-surface">{doc.tindakLanjut}</p>
                            </div>
                          )}

                          {/* Attachments */}
                          {lampiran.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {lampiran.map((f, i) => (
                                <a
                                  key={i}
                                  href={`/api/dokumentasi/file/${f.fileName}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-variant/60 rounded-lg text-xs hover:bg-primary/10 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px] text-primary">attach_file</span>
                                  <span className="truncate max-w-[150px]">{f.originalName}</span>
                                  <span className="text-on-surface-variant">{formatFileSize(f.size)}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      }
    />
  );
};
