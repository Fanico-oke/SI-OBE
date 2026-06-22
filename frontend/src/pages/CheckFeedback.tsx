import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';

interface Feedback {
  id: string;
  kurikulumId: string;
  tipe: 'catatan' | 'rekomendasi';
  isi: string;
  sumber: string;
  prioritas: string;
  createdAt: string;
}

const SUMBER_OPTIONS = ['Kaprodi', 'Industri', 'Alumni', 'Mahasiswa', 'Dosen'];
const PRIORITAS_OPTIONS = [
  { value: 'High', label: 'Tinggi', color: 'text-error', bg: 'bg-error/10' },
  { value: 'Medium', label: 'Sedang', color: 'text-warning', bg: 'bg-warning/10' },
  { value: 'Low', label: 'Rendah', color: 'text-on-surface-variant', bg: 'bg-surface-variant' },
];

export const CheckFeedback = () => {
  const { activeCurriculumId } = useCurriculumStore();
  const { addToast } = useAppStore();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [catatanText, setCatatanText] = useState('');
  const [rekText, setRekText] = useState('');
  const [rekSumber, setRekSumber] = useState('Kaprodi');
  const [rekPrioritas, setRekPrioritas] = useState('Medium');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const fetchFeedbacks = async () => {
    if (!activeCurriculumId) return;
    try {
      const res = await axios.get(`/api/check/feedback?kurikulumId=${activeCurriculumId}`);
      setFeedbacks(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFeedbacks(); }, [activeCurriculumId]);

  const catatan = feedbacks.filter(f => f.tipe === 'catatan');
  const rekomendasi = feedbacks.filter(f => f.tipe === 'rekomendasi');

  const handleSaveCatatan = async () => {
    if (!catatanText.trim() || !activeCurriculumId) return;
    setSaving(true);
    try {
      await axios.post('/api/check/feedback', {
        kurikulumId: activeCurriculumId,
        tipe: 'catatan',
        isi: catatanText.trim(),
        sumber: 'Kaprodi'
      });
      setCatatanText('');
      addToast('Catatan evaluasi berhasil disimpan', 'success');
      fetchFeedbacks();
    } catch (e) {
      addToast('Gagal menyimpan catatan', 'error');
    }
    setSaving(false);
  };

  const handleAddRekomendasi = async () => {
    if (!rekText.trim() || !activeCurriculumId) return;
    setSaving(true);
    try {
      await axios.post('/api/check/feedback', {
        kurikulumId: activeCurriculumId,
        tipe: 'rekomendasi',
        isi: rekText.trim(),
        sumber: rekSumber,
        prioritas: rekPrioritas
      });
      setRekText('');
      addToast('Rekomendasi berhasil ditambahkan', 'success');
      fetchFeedbacks();
    } catch (e) {
      addToast('Gagal menambahkan rekomendasi', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/check/feedback/${id}`);
      addToast('Item berhasil dihapus', 'success');
      fetchFeedbacks();
    } catch (e) {
      addToast('Gagal menghapus', 'error');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await axios.put(`/api/check/feedback/${id}`, { isi: editText.trim() });
      setEditId(null);
      addToast('Berhasil diupdate', 'success');
      fetchFeedbacks();
    } catch (e) {
      addToast('Gagal mengupdate', 'error');
    }
  };

  const getPrioritasStyle = (p: string) => PRIORITAS_OPTIONS.find(o => o.value === p) || PRIORITAS_OPTIONS[1];

  return (
    <PhaseLayout
      title="CHECK: Evaluasi & Audit Capaian"
      description="Tinjau tingkat pencapaian modul, verifikasi audit yang tertunda, dan susun laporan evaluasi."
      icon="task_alt"
      iconBgColorClass="bg-success/10"
      iconTextColorClass="text-success"
      tabs={
        <>
          <Link to="/check" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Evaluasi & Audit</Link>
          <Link to="/check/audit" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Audit Capaian</Link>
          <Link to="/check/laporan" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Laporan Evaluasi</Link>
          <Link to="/check/feedback" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Feedback & Rekomendasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          <ArchivedBanner returnPath="/check" />

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <div className="space-y-6">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                  </div>
                  <div>
                    <p className="stat-label">Catatan Evaluasi</p>
                    <p className="stat-value text-xl">{catatan.length}</p>
                  </div>
                </div>
                <div className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-warning">lightbulb</span>
                  </div>
                  <div>
                    <p className="stat-label">Rekomendasi</p>
                    <p className="stat-value text-xl">{rekomendasi.length}</p>
                  </div>
                </div>
                <div className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">priority_high</span>
                  </div>
                  <div>
                    <p className="stat-label">Prioritas Tinggi</p>
                    <p className="stat-value text-xl">{rekomendasi.filter(r => r.prioritas === 'High').length}</p>
                  </div>
                </div>
              </div>

              {/* Catatan Evaluasi */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  <h3 className="font-h4 text-h4 font-bold text-on-surface">Catatan Evaluasi</h3>
                </div>
                <p className="text-on-surface-variant text-sm mb-3">Tulis kesimpulan evaluasi, temuan penting, atau catatan umum terkait capaian CPL.</p>
                <div className="flex gap-2">
                  <textarea
                    className="input-base flex-1 resize-none"
                    rows={3}
                    placeholder="Contoh: Secara umum capaian CPL sudah memenuhi target, namun CPL03 dan CPL09 perlu perhatian khusus..."
                    value={catatanText}
                    onChange={e => setCatatanText(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSaveCatatan}
                  disabled={saving || !catatanText.trim()}
                  className="btn-primary mt-3 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Simpan Catatan
                </button>

                {catatan.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-outline-variant pt-4">
                    {catatan.map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-surface-variant/50 flex items-start gap-3 group">
                        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">notes</span>
                        {editId === c.id ? (
                          <div className="flex-1 flex gap-2">
                            <textarea className="input-base flex-1 resize-none text-sm" rows={2} value={editText} onChange={e => setEditText(e.target.value)} />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleUpdate(c.id)} className="btn-primary text-xs px-2 py-1">Simpan</button>
                              <button onClick={() => setEditId(null)} className="btn-ghost text-xs px-2 py-1">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="text-on-surface text-sm">{c.isi}</p>
                              <p className="text-on-surface-variant text-xs mt-1">{new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditId(c.id); setEditText(c.isi); }} className="btn-icon text-xs p-1" title="Edit">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(c.id)} className="btn-icon text-error text-xs p-1" title="Hapus">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rekomendasi Perbaikan */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-warning">lightbulb</span>
                  <h3 className="font-h4 text-h4 font-bold text-on-surface">Rekomendasi Perbaikan</h3>
                </div>
                <p className="text-on-surface-variant text-sm mb-3">Tambahkan rekomendasi perbaikan yang akan menjadi input untuk fase Act.</p>

                <div className="p-4 rounded-lg border border-outline-variant bg-surface-variant/30 space-y-3">
                  <textarea
                    className="input-base w-full resize-none"
                    rows={2}
                    placeholder="Contoh: Revisi RPS mata kuliah Basis Data untuk meningkatkan capaian CPL03..."
                    value={rekText}
                    onChange={e => setRekText(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[150px]">
                      <label className="input-label text-xs">Sumber Feedback</label>
                      <select className="input-base w-full text-sm" value={rekSumber} onChange={e => setRekSumber(e.target.value)}>
                        {SUMBER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="input-label text-xs">Prioritas</label>
                      <select className="input-base w-full text-sm" value={rekPrioritas} onChange={e => setRekPrioritas(e.target.value)}>
                        {PRIORITAS_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={handleAddRekomendasi}
                      disabled={saving || !rekText.trim()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Tambah
                    </button>
                  </div>
                </div>

                {rekomendasi.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {rekomendasi.map(r => {
                      const pStyle = getPrioritasStyle(r.prioritas);
                      return (
                        <div key={r.id} className="p-3 rounded-lg border border-outline-variant flex items-start gap-3 group hover:bg-surface-variant/30 transition-colors">
                          <span className={`material-symbols-outlined text-[20px] mt-0.5 ${pStyle.color}`}>
                            {r.prioritas === 'High' ? 'arrow_upward' : r.prioritas === 'Low' ? 'arrow_downward' : 'remove'}
                          </span>
                          {editId === r.id ? (
                            <div className="flex-1 flex gap-2">
                              <textarea className="input-base flex-1 resize-none text-sm" rows={2} value={editText} onChange={e => setEditText(e.target.value)} />
                              <div className="flex flex-col gap-1">
                                <button onClick={() => handleUpdate(r.id)} className="btn-primary text-xs px-2 py-1">Simpan</button>
                                <button onClick={() => setEditId(null)} className="btn-ghost text-xs px-2 py-1">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="text-on-surface text-sm">{r.isi}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pStyle.bg} ${pStyle.color}`}>
                                    {PRIORITAS_OPTIONS.find(o => o.value === r.prioritas)?.label || r.prioritas}
                                  </span>
                                  <span className="text-xs text-on-surface-variant">• {r.sumber}</span>
                                  <span className="text-xs text-on-surface-variant">• {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditId(r.id); setEditText(r.isi); }} className="btn-icon text-xs p-1" title="Edit">
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                                <button onClick={() => handleDelete(r.id)} className="btn-icon text-error text-xs p-1" title="Hapus">
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {rekomendasi.length === 0 && (
                  <div className="mt-4 text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40">lightbulb</span>
                    <p className="font-medium">Belum ada rekomendasi</p>
                    <p className="text-sm">Tambahkan rekomendasi perbaikan di form di atas.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      }
    />
  );
};
