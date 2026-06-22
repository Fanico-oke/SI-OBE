import React, { useState, useEffect, useCallback } from 'react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ArchivedBanner } from '../components/ArchivedBanner';

// ─── Types ────────────────────────────────────────────────────────
interface Referensi {
  id: string;
  nama: string;
  kategori: string;   // 'Internal' | 'External'
  tipe: string;       // 'PDF' | 'Excel' | 'Word' | 'URL'
  fileUrl: string;
  fileSize: number;
  status: string;     // 'ACTIVE' | 'ARCHIVED' | 'DRAFT'
  uploadedBy: string;
  createdAt: string;
}

interface ReferensiForm {
  nama: string;
  kategori: string;
  tipe: string;
  url?: string;
}

const EMPTY_FORM: ReferensiForm = { nama: '', kategori: 'Internal', tipe: 'PDF', url: '' };

// ─── Helpers ──────────────────────────────────────────────────────
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const tipeIcon = (tipe: string) => {
  switch (tipe) {
    case 'PDF':
      return <span className="material-symbols-outlined">picture_as_pdf</span>;
    case 'Excel':
      return <span className="material-symbols-outlined">description</span>;
    case 'Word':
      return <span className="material-symbols-outlined">article</span>;
    case 'URL':
      return <span className="material-symbols-outlined">link</span>;
    default:
      return <span className="material-symbols-outlined">draft</span>;
  }
};

const tipeColor = (tipe: string) => {
  switch (tipe) {
    case 'PDF':   return 'bg-error/10 text-error';
    case 'Excel': return 'bg-success/10 text-success';
    case 'Word':  return 'bg-primary/10 text-primary';
    case 'URL':   return 'bg-tertiary/10 text-tertiary';
    default:      return 'bg-surface-container text-on-surface-variant';
  }
};

const statusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':   return 'badge-success';
    case 'ARCHIVED': return 'badge-neutral';
    case 'DRAFT':    return 'badge-warning';
    default:         return 'badge-neutral';
  }
};

// ─── Component ────────────────────────────────────────────────────
export const PlanReferensi = () => {
  const { activeCurriculumId: kurikulumId } = useCurriculumStore();
  const { user } = useAuthStore();
  const isReadOnly = user?.role === 'DOSEN';

  // Data
  const [referensiList, setReferensiList] = useState<Referensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReferensiForm>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filter
  const [filterKategori, setFilterKategori] = useState<string>('Semua');

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchReferensi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/referensi${kurikulumId ? `?kurikulumId=${kurikulumId}` : ''}`);
      setReferensiList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch referensi:', err);
      setReferensiList([]);
    } finally {
      setLoading(false);
    }
  }, [kurikulumId]);

  useEffect(() => {
    fetchReferensi();
  }, [fetchReferensi]);

  // ── Stats (computed) ───────────────────────────────────────────
  const totalDocs = referensiList.length;
  const internalCount = referensiList.filter(r => r.kategori === 'Internal').length;
  const externalCount = referensiList.filter(r => r.kategori === 'External').length;
  const internalPct = totalDocs > 0 ? Math.round((internalCount / totalDocs) * 100) : 0;

  // ── Filtered list ──────────────────────────────────────────────
  const filteredList = filterKategori === 'Semua'
    ? referensiList
    : referensiList.filter(r => r.kategori === filterKategori);

  // ── CRUD ───────────────────────────────────────────────────────
  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (ref: Referensi) => {
    setForm({
      nama: ref.nama,
      kategori: ref.kategori,
      tipe: ref.tipe,
      url: ref.tipe === 'URL' ? ref.fileUrl : '',
    });
    setSelectedFile(null);
    setEditingId(ref.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        // Update (JSON)
        await axios.put(`/api/referensi/${editingId}`, {
          nama: form.nama,
          kategori: form.kategori,
          tipe: form.tipe,
          ...(form.tipe === 'URL' ? { fileUrl: form.url } : {}),
        });
      } else {
        // Create (multipart)
        const fd = new FormData();
        fd.append('nama', form.nama);
        fd.append('kategori', form.kategori);
        fd.append('tipe', form.tipe);
        fd.append('kurikulumId', kurikulumId || '');
        if (form.tipe === 'URL') {
          fd.append('fileUrl', form.url || '');
        } else if (selectedFile) {
          fd.append('file', selectedFile);
        }
        await axios.post('/api/referensi', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      fetchReferensi();
    } catch (err) {
      console.error('Save referensi failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (refId: string) => {
    if (!confirm('Yakin ingin menghapus referensi ini?')) return;
    try {
      await axios.delete(`/api/referensi/${refId}`);
      fetchReferensi();
    } catch (err) {
      console.error('Delete referensi failed:', err);
    }
  };

  // ── Featured ref (latest active) ──────────────────────────────
  const featuredRef = referensiList.find(r => r.status === 'ACTIVE') || referensiList[0];

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4">
      <ArchivedBanner returnPath="/plan" />

      {isReadOnly && (
        <div className="px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-warning flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          Mode Baca — Hubungi Kaprodi untuk mengubah data
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex text-caption text-on-surface-variant mb-2 gap-2">
            <a className="hover:text-primary" href="#">Plan Editor</a>
            <span>/</span>
            <span className="text-primary font-bold">Referensi</span>
          </nav>
          <h2 className="page-header">Dokumen Referensi</h2>
          <p className="page-subtitle">Kelola standar eksternal, SK Rektor, dan regulasi pendukung kurikulum.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-3">
            <button
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Tambah Referensi
            </button>
          </div>
        )}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left sidebar — Featured + Stats */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Featured Reference Card */}
          <div className="bg-primary text-on-primary-container p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined !text-[120px]">gavel</span>
            </div>
            <span className="text-caption font-bold uppercase tracking-widest opacity-80 mb-2 block">
              Prioritas Standard
            </span>
            {featuredRef ? (
              <>
                <h3 className="font-h2 text-h2 mb-4 leading-tight">{featuredRef.nama}</h3>
                <div className="flex items-center gap-4 text-caption">
                  <span className="bg-on-primary/20 px-2 py-1 rounded">{featuredRef.tipe}</span>
                  <span>{formatDate(featuredRef.createdAt)}</span>
                </div>
              </>
            ) : (
              <h3 className="font-h2 text-h2 mb-4 leading-tight opacity-60">Belum ada referensi</h3>
            )}
          </div>

          {/* Statistics Card */}
          <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm">
            <h4 className="font-h3 text-h3 mb-4">Statistik Referensi</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body text-on-surface-variant">Total Dokumen</span>
                <span className="font-data-mono text-primary font-bold">{totalDocs} Files</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${internalPct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-surface-container rounded-lg">
                  <span className="text-caption block opacity-70">Internal</span>
                  <span className="font-bold">{internalCount}</span>
                </div>
                <div className="p-3 bg-surface-container rounded-lg">
                  <span className="text-caption block opacity-70">External</span>
                  <span className="font-bold">{externalCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main File Manager Area */}
        <div className="md:col-span-8 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-4">
              <select
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-body font-bold"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>
            <span className="text-caption text-on-surface-variant">
              {filteredList.length} of {totalDocs} dokumen
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="text-on-surface-variant text-body">Memuat referensi…</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state m-6">
              <div className="empty-state-icon">
                <span className="material-symbols-outlined !text-[48px]">folder_open</span>
              </div>
              <p className="empty-state-text">
                {totalDocs === 0
                  ? 'Belum ada referensi. Klik "Tambah Referensi" untuk mulai.'
                  : 'Tidak ada referensi untuk kategori ini.'}
              </p>
            </div>
          ) : (
            <div className="table-container border-0 shadow-none rounded-none">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="flex-1">Nama Dokumen</th>
                    <th className="w-24">Kategori</th>
                    <th className="w-20">Tipe</th>
                    <th className="w-20">Size</th>
                    <th className="w-20">Status</th>
                    <th className="w-24">Tanggal</th>
                    <th className="text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map(ref => (
                    <tr key={ref.id} className="group cursor-pointer">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${tipeColor(ref.tipe)}`}>
                            {tipeIcon(ref.tipe)}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{ref.nama}</div>
                            <div className="text-caption text-on-surface-variant">
                              {ref.tipe === 'URL' ? 'External Source' : `${formatFileSize(ref.fileSize)} • ${ref.kategori}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{ref.kategori}</td>
                      <td>
                        <span className={`badge ${ref.tipe === 'PDF' ? 'badge-error' : ref.tipe === 'Excel' ? 'badge-success' : ref.tipe === 'Word' ? 'badge-primary' : 'badge-tertiary'}`}>
                          {ref.tipe}
                        </span>
                      </td>
                      <td className="td-mono">{ref.tipe === 'URL' ? '—' : formatFileSize(ref.fileSize)}</td>
                      <td>
                        <span className={statusBadge(ref.status)}>{ref.status}</span>
                      </td>
                      <td className="td-mono">{formatDate(ref.createdAt)}</td>
                      {!isReadOnly && (
                        <td className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(ref)}
                              className="table-action-secondary"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(ref.id)}
                              className="table-action-danger"
                              title="Hapus"
                            >
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

          {/* Footer */}
          {!loading && filteredList.length > 0 && (
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-between items-center text-caption text-on-surface-variant">
              <span>Showing {filteredList.length} of {totalDocs} documents</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Form ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-h3 text-h3">
                {editingId ? 'Edit Referensi' : 'Tambah Referensi Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body space-y-5">
              {/* Nama */}
              <div>
                <label className="input-label">Nama Dokumen</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="SK Rektor No. 42 tentang Kurikulum"
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="input-label">Kategori</label>
                <select
                  className="input-base"
                  value={form.kategori}
                  onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                >
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>

              {/* Tipe */}
              <div>
                <label className="input-label">Tipe</label>
                <select
                  className="input-base"
                  value={form.tipe}
                  onChange={e => {
                    setForm(f => ({ ...f, tipe: e.target.value }));
                    setSelectedFile(null);
                  }}
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                  <option value="Word">Word</option>
                  <option value="URL">URL (External Link)</option>
                </select>
              </div>

              {/* File or URL input */}
              {form.tipe === 'URL' ? (
                <div>
                  <label className="input-label">URL</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0">link</span>
                    <input
                      type="url"
                      className="input-base"
                      placeholder="https://example.com/document"
                      value={form.url || ''}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    />
                  </div>
                </div>
              ) : !editingId ? (
                <div>
                  <label className="input-label">Upload File</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    {selectedFile ? (
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                        <span className="text-body font-medium">{selectedFile.name}</span>
                        <span className="text-caption text-on-surface-variant">
                          ({formatFileSize(selectedFile.size)})
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                        <span className="text-caption">Klik untuk pilih file atau drag & drop</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept={
                        form.tipe === 'PDF' ? '.pdf'
                        : form.tipe === 'Excel' ? '.xlsx,.xls,.csv'
                        : form.tipe === 'Word' ? '.doc,.docx' : '*'
                      }
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary px-5 py-2.5 rounded-lg"
                disabled={saving}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2"
                disabled={saving || !form.nama.trim()}
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                {editingId ? 'Simpan Perubahan' : 'Upload Referensi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
