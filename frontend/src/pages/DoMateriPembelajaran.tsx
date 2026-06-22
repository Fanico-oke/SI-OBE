import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useCurriculumStore } from '../store/useCurriculumStore';

interface Kelas { id: string; nama: string; mk: { kode: string; nama: string } }
interface Materi { id: string; nama: string; tipe: string; fileUrl: string | null; fileSize: number | null; createdAt: string }

const formatSize = (bytes: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const tipeIcon = (tipe: string) => {
  switch (tipe) {
    case 'Video': return { icon: 'movie', color: 'bg-primary/10 text-primary' };
    case 'Tautan': return { icon: 'language', color: 'bg-warning/10 text-warning' };
    default: return { icon: 'picture_as_pdf', color: 'bg-error/10 text-error' };
  }
};

export const DoMateriPembelajaran = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { activeCurriculumId: kurikulumId } = useCurriculumStore();
  const isReadOnly = user?.role === 'KAPRODI';
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nama: '', tipe: 'Dokumen', fileUrl: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    axios.get(`/api/do/kelas${kurikulumId ? `?kurikulumId=${kurikulumId}` : ''}`).then(r => {
      setKelasList(r.data);
      if (r.data.length > 0) setSelectedKelas(r.data[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [kurikulumId]);

  useEffect(() => {
    if (!selectedKelas) return;
    axios.get(`/api/materi?kelasId=${selectedKelas}`).then(r => setMateriList(r.data)).catch(() => setMateriList([]));
  }, [selectedKelas]);

  const handleUpload = async () => {
    if (!form.nama) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('nama', form.nama);
      fd.append('tipe', form.tipe);
      fd.append('kelasId', selectedKelas);
      if (form.tipe === 'Tautan') {
        fd.append('fileUrl', form.fileUrl);
      } else if (file) {
        fd.append('file', file);
      }
      await axios.post('/api/materi', fd);
      const r = await axios.get(`/api/materi?kelasId=${selectedKelas}`);
      setMateriList(r.data);
      setShowModal(false);
      setForm({ nama: '', tipe: 'Dokumen', fileUrl: '' });
      setFile(null);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const handleDelete = async (mId: string) => {
    if (!confirm('Hapus materi ini?')) return;
    await axios.delete(`/api/materi/${mId}`);
    setMateriList(prev => prev.filter(m => m.id !== mId));
  };

  const dokCount = materiList.filter(m => m.tipe === 'Dokumen').length;
  const vidCount = materiList.filter(m => m.tipe === 'Video').length;
  const linkCount = materiList.filter(m => m.tipe === 'Tautan').length;
  const filtered = materiList.filter(m => m.nama.toLowerCase().includes(search.toLowerCase()));
  const currentKelas = kelasList.find(k => k.id === selectedKelas);

  return (
    <div className="w-full space-y-4">
      <div className="w-full">
        <div className="flex gap-6 border-b border-outline-variant overflow-x-auto">
          <Link to="/do" className="tab-inactive pb-3 whitespace-nowrap px-2">Daftar Modul</Link>
          <Link to="/do/rps" className="tab-inactive pb-3 whitespace-nowrap px-2">RPS</Link>
          <Link to="/do/aktivitas" className="tab-inactive pb-3 whitespace-nowrap px-2">Aktivitas</Link>
          <Link to="/do/tugas" className="tab-inactive pb-3 whitespace-nowrap px-2">Tugas & Asesmen</Link>
          <Link to="/do/rubrik" className="tab-inactive pb-3 whitespace-nowrap px-2">Rubrik Penilaian</Link>
          <Link to="/do/materi" className="tab-active pb-3 whitespace-nowrap px-2">Materi Pembelajaran</Link>
        </div>
      </div>

      <div className="p-8">
        {isReadOnly && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2 text-warning text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Mode Pengawasan — Hanya Kaprodi yang bisa melihat, tidak bisa mengubah data
          </div>
        )}
        {/* Phase Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-caption font-bold tracking-tight">FASE: DO (PELAKSANAAN)</span>
            </div>
            <h2 className="font-h1 text-h1 text-on-surface">Materi Pembelajaran</h2>
            <p className="text-on-surface-variant">
              {currentKelas ? `Manajemen materi untuk ${currentKelas.mk.kode} - ${currentKelas.mk.nama}` : 'Pilih kelas untuk mengelola materi'}
            </p>
          </div>
          {!isReadOnly && (
          <button onClick={() => setShowModal(true)} className="bg-secondary text-on-secondary px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold hover:scale-[1.02] active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined">upload_file</span>
            Upload Materi
          </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Kelas Selector */}
              <div className="card">
                <h3 className="font-h3 text-h3 mb-4">Pilih Kelas</h3>
                <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="input-base w-full py-2.5">
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.mk.kode} - {k.mk.nama} ({k.nama})</option>
                  ))}
                </select>
                {kelasList.length === 0 && <p className="text-on-surface-variant text-sm mt-2">Belum ada kelas terdaftar</p>}
              </div>

              {/* Resource Categories */}
              <div className="card p-0 overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
                  <h3 className="font-h3 text-h3">Kategori Sumber</h3>
                </div>
                <div className="divide-y divide-outline-variant">
                  <div className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">description</span>
                      <span className="font-medium">Dokumen & PDF</span>
                    </div>
                    <span className="bg-surface-container-high px-2 py-0.5 rounded text-caption font-data-mono">{dokCount}</span>
                  </div>
                  <div className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">smart_display</span>
                      <span className="font-medium">Video Materi</span>
                    </div>
                    <span className="bg-surface-container-high px-2 py-0.5 rounded text-caption font-data-mono">{vidCount}</span>
                  </div>
                  <div className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">link</span>
                      <span className="font-medium">Tautan Eksternal</span>
                    </div>
                    <span className="bg-surface-container-high px-2 py-0.5 rounded text-caption font-data-mono">{linkCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Materials List */}
            <div className="col-span-12 lg:col-span-8">
              <div className="card p-0 flex flex-col h-full overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-outline-variant flex justify-between items-center gap-4">
                  <div className="relative w-full md:w-72">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input className="input-base w-full pl-10 pr-4 py-2" placeholder="Cari materi..." type="text" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <span className="text-caption text-on-surface-variant">{filtered.length} materi</span>
                </div>
                {/* Table */}
                <div className="table-container">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th>Nama Materi</th>
                        <th>Tipe</th>
                        <th>Ukuran</th>
                        <th>Tanggal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">Belum ada materi untuk kelas ini</td></tr>
                      ) : filtered.map(m => {
                        const t = tipeIcon(m.tipe);
                        return (
                          <tr key={m.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded flex items-center justify-center ${t.color}`}>
                                  <span className="material-symbols-outlined">{t.icon}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-on-surface">{m.nama}</p>
                                  {m.fileUrl && <p className="text-caption text-on-surface-variant truncate max-w-[200px]">{m.fileUrl}</p>}
                                </div>
                              </div>
                            </td>
                            <td><span className="badge-tertiary">{m.tipe.toUpperCase()}</span></td>
                            <td className="td-mono">{formatSize(m.fileSize)}</td>
                            <td className="text-caption">{new Date(m.createdAt).toLocaleDateString('id-ID')}</td>
                            <td className="text-right">
                              {!isReadOnly && (
                              <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-error/10 text-error rounded transition-colors" title="Hapus">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Footer */}
                <div className="mt-auto p-4 border-t border-outline-variant">
                  <span className="text-caption text-on-surface-variant">Total: {materiList.length} materi</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && !isReadOnly && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-h2 text-h2 mb-6">Upload Materi Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-1 block">Nama Materi</label>
                <input className="input-base w-full py-2.5" placeholder="Nama file/materi" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant mb-1 block">Tipe</label>
                <select className="input-base w-full py-2.5" value={form.tipe} onChange={e => setForm(p => ({ ...p, tipe: e.target.value }))}>
                  <option value="Dokumen">Dokumen</option>
                  <option value="Video">Video</option>
                  <option value="Tautan">Tautan</option>
                </select>
              </div>
              {form.tipe === 'Tautan' ? (
                <div>
                  <label className="text-sm font-medium text-on-surface-variant mb-1 block">URL</label>
                  <input className="input-base w-full py-2.5" placeholder="https://..." value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-on-surface-variant mb-1 block">File</label>
                  <input type="file" className="input-base w-full py-2" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">Batal</button>
              <button onClick={handleUpload} disabled={uploading || !form.nama} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity">
                {uploading ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
