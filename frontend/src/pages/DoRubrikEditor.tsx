import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

export const DoRubrikEditor = () => {
  const { kelasId } = useParams();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const isReadOnly = user?.role === 'KAPRODI';
  const [rubriks, setRubriks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for new/edit form
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kriteria: [{ aspek: '', bobot: 0, sangatBaik: '', baik: '', cukup: '', kurang: '' }]
  });

  useEffect(() => {
    if (kelasId) {
      fetchRubriks();
    }
  }, [kelasId]);

  const fetchRubriks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/do/kelas/${kelasId}/rubrik`);
      setRubriks(res.data);
    } catch (error) {
      console.error('Failed to fetch rubriks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKriteria = () => {
    setFormData(prev => ({
      ...prev,
      kriteria: [...prev.kriteria, { aspek: '', bobot: 0, sangatBaik: '', baik: '', cukup: '', kurang: '' }]
    }));
  };

  const handleKriteriaChange = (index: number, field: string, value: string) => {
    const newKriteria = [...formData.kriteria];
    newKriteria[index] = { ...newKriteria[index], [field]: field === 'bobot' ? parseFloat(value) || 0 : value };
    setFormData({ ...formData, kriteria: newKriteria });
  };

  const handleRemoveKriteria = (index: number) => {
    const newKriteria = formData.kriteria.filter((_, i) => i !== index);
    setFormData({ ...formData, kriteria: newKriteria });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/do/rubrik', {
        kelasId,
        nama: formData.nama,
        deskripsi: formData.deskripsi,
        kriteria: formData.kriteria
      });
      setIsEditing(false);
      setFormData({
        nama: '',
        deskripsi: '',
        kriteria: [{ aspek: '', bobot: 0, sangatBaik: '', baik: '', cukup: '', kurang: '' }]
      });
      fetchRubriks();
    } catch (error) {
      addToast('Gagal menyimpan Rubrik', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!kelasId) {
    return (
      <PhaseLayout
        title="DO: Pelaksanaan Kelas & Asesmen"
        description="Kelola modul pembelajaran, Rencana Pembelajaran Semester (RPS), dan aktivitas di dalam kelas."
        icon="school"
        iconBgColorClass="bg-primary/10"
        iconTextColorClass="text-primary"
        tabs={
          <>
            <Link to="/do" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Daftar Modul</Link>
            <Link to="/do/rps" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
            <Link to="/do/tugas" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
            <Link to="/do/penilaian" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Penilaian</Link>
          </>
        }
        mainContent={
          <div className="empty-state bg-surface border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant mt-6">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search</span>
            <p className="font-body text-body">Silakan kembali ke <strong>Daftar Modul</strong> dan pilih salah satu kelas terlebih dahulu.</p>
            <Link to="/do" className="btn-primary mt-4 inline-block px-4 py-2 rounded-lg font-medium">
              Kembali ke Daftar Modul
            </Link>
          </div>
        }
      />
    );
  }

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Memuat Editor Rubrik...</div>;

  return (
    <PhaseLayout
      title={`⚖️ Bank Rubrik Penilaian ${kelasId ? `- ${kelasId}` : ''}`}
      description="Kelola instrumen rubrik penilaian kelas."
      icon="gavel"
      iconBgColorClass="bg-tertiary/10"
      iconTextColorClass="text-tertiary"
      tabs={
        <>
          <Link to="/do" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Daftar Modul</Link>
          <Link to={`/do/rps/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
          <Link to={`/do/tugas/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
          <Link to={`/do/rubrik/${kelasId}`} className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Rubrik Penilaian</Link>
          <Link to={`/do/penilaian/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Penilaian</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          {isReadOnly && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2 text-warning text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Mode Pengawasan — Hanya Kaprodi yang bisa melihat, tidak bisa mengubah data
            </div>
          )}

          <div className="mb-6 flex justify-between items-center">
            <h2 className="font-h1 text-h1 text-on-surface flex items-center gap-3">
              <span className="text-tertiary">⚖️</span> Bank Rubrik Penilaian
            </h2>
            {!isReadOnly && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-tertiary text-on-tertiary rounded-lg font-medium hover:bg-tertiary/90 transition-colors shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span> Buat Rubrik Baru
              </button>
            )}
          </div>

          {isEditing && !isReadOnly ? (
            <div className="card p-6 mb-8">
              <h3 className="font-bold font-h3 text-h3 mb-4 text-tertiary">Tambah Rubrik Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="input-label block mb-1">Nama Rubrik</label>
                  <input type="text" className="input-base w-full" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="Misal: Rubrik Presentasi Kelompok" />
                </div>
                <div>
                  <label className="input-label block mb-1">Deskripsi Singkat</label>
                  <input type="text" className="input-base w-full" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Opsional..." />
                </div>
              </div>

              <h4 className="font-bold text-md mb-2">Kriteria Penilaian</h4>
              <div className="table-container">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Aspek / Kriteria</th>
                      <th className="w-20">Bobot (%)</th>
                      <th className="w-1/5 text-success">Sangat Baik (81-100)</th>
                      <th className="w-1/5 text-primary">Baik (61-80)</th>
                      <th className="w-1/5 text-tertiary">Cukup (41-60)</th>
                      <th className="w-1/5 text-error">Kurang (&lt;41)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.kriteria.map((krit, index) => (
                      <tr key={index}>
                        <td><input type="text" className="input-base w-full" value={krit.aspek} onChange={e => handleKriteriaChange(index, 'aspek', e.target.value)} placeholder="Aspek..." /></td>
                        <td><input type="number" className="input-base w-full text-center" value={krit.bobot || ''} onChange={e => handleKriteriaChange(index, 'bobot', e.target.value)} placeholder="0" /></td>
                        <td><textarea className="input-base w-full text-xs min-h-[60px]" value={krit.sangatBaik} onChange={e => handleKriteriaChange(index, 'sangatBaik', e.target.value)} /></td>
                        <td><textarea className="input-base w-full text-xs min-h-[60px]" value={krit.baik} onChange={e => handleKriteriaChange(index, 'baik', e.target.value)} /></td>
                        <td><textarea className="input-base w-full text-xs min-h-[60px]" value={krit.cukup} onChange={e => handleKriteriaChange(index, 'cukup', e.target.value)} /></td>
                        <td><textarea className="input-base w-full text-xs min-h-[60px]" value={krit.kurang} onChange={e => handleKriteriaChange(index, 'kurang', e.target.value)} /></td>
                        <td className="text-center">
                          <button onClick={() => handleRemoveKriteria(index)} className="table-action-danger"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <button onClick={handleAddKriteria} className="text-tertiary font-bold text-sm hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">add</span> Tambah Baris Kriteria</button>
              </div>

              <div className="mt-8 flex gap-4 justify-end">
                <button onClick={() => setIsEditing(false)} className="btn-secondary px-4 py-2 rounded-lg">Batal</button>
                <button onClick={handleSave} className="px-4 py-2 bg-tertiary text-on-tertiary rounded-lg font-bold hover:bg-tertiary/90">{saving ? 'Menyimpan...' : 'Simpan Rubrik'}</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {rubriks.length === 0 ? (
                 <div className="empty-state p-12 text-center border border-dashed border-outline-variant rounded-xl text-on-surface-variant">
                   <span className="material-symbols-outlined text-h1 mb-2">table_view</span>
                   <p>Belum ada Rubrik yang dibuat untuk kelas ini.</p>
                 </div>
              ) : rubriks.map(r => (
                <div key={r.id} className="card overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-h3 font-bold text-tertiary mb-1">{r.nama}</h3>
                    <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-xs font-bold rounded-md">Digunakan di Asesmen</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-6">{r.deskripsi || 'Tidak ada deskripsi.'}</p>
                  
                  <div className="table-container">
                    <table className="table-modern">
                      <thead>
                        <tr>
                          <th className="text-left w-1/5">Aspek Penilaian</th>
                          <th className="w-16">Bobot</th>
                          <th className="w-1/5 text-success text-left">Sangat Baik (81-100)</th>
                          <th className="w-1/5 text-primary text-left">Baik (61-80)</th>
                          <th className="w-1/5 text-tertiary text-left">Cukup (41-60)</th>
                          <th className="w-1/5 text-error text-left">Kurang (&lt;41)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.kriteria.map((krit: any) => (
                          <tr key={krit.id}>
                            <td className="font-bold">{krit.aspek}</td>
                            <td className="text-center td-mono">{krit.bobot}%</td>
                            <td>{krit.sangatBaik}</td>
                            <td>{krit.baik}</td>
                            <td>{krit.cukup}</td>
                            <td>{krit.kurang}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
