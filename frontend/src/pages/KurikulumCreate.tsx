import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAppStore } from '../store/useAppStore';

export const KurikulumCreate = () => {
  const navigate = useNavigate();
  const { addCurriculum, duplicateCurriculum, curriculums, fetchCurriculums } = useCurriculumStore();
  const { addToast } = useAppStore();

  const [mode, setMode] = useState<'BLANK' | 'DUPLICATE'>('BLANK');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    tahunMulai: '',
    tahunSelesai: '',
    deskripsi: '',
    sourceKurikulumId: ''
  });

  useEffect(() => {
    fetchCurriculums();
  }, [fetchCurriculums]);

  const handleSubmit = async () => {
    if (!formData.nama || !formData.tahunMulai) {
      addToast('Nama kurikulum dan Tahun Mulai harus diisi', 'error');
      return;
    }

    if (mode === 'DUPLICATE' && !formData.sourceKurikulumId) {
      addToast('Silakan pilih kurikulum lama yang ingin diduplikat', 'error');
      return;
    }
    
    setLoading(true);
    try {
      let newId;
      if (mode === 'BLANK') {
        newId = await addCurriculum({
          nama: formData.nama,
          tahunMulai: parseInt(formData.tahunMulai.substring(0, 4)),
          tahunSelesai: formData.tahunSelesai ? parseInt(formData.tahunSelesai.substring(0, 4)) : parseInt(formData.tahunMulai.substring(0, 4)) + 4,
          prodi: 'SI',
          deskripsi: formData.deskripsi
        });
      } else {
        newId = await duplicateCurriculum({
          sourceKurikulumId: formData.sourceKurikulumId,
          nama: formData.nama,
          tahunMulai: parseInt(formData.tahunMulai.substring(0, 4)),
          tahunSelesai: formData.tahunSelesai ? parseInt(formData.tahunSelesai.substring(0, 4)) : parseInt(formData.tahunMulai.substring(0, 4)) + 4,
          deskripsi: formData.deskripsi
        });
      }
      
      addToast(mode === 'BLANK' ? 'Draft Kurikulum berhasil dibuat!' : 'Kurikulum berhasil diduplikat!', 'success');
      useCurriculumStore.getState().setActiveCurriculum(newId);
      navigate('/plan');
    } catch (e) {
      addToast('Gagal membuat kurikulum', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="mb-8">
        <h1 className="page-header">Tambah Kurikulum Baru</h1>
        <p className="page-subtitle mt-2">Program Studi: Sistem Informasi (Default)</p>
      </div>

      <div className="card overflow-hidden mb-8">
        {/* Mode Selection */}
        <div className="p-6 border-b border-outline-variant bg-background">
          <label className="input-label mb-3">Metode Pembuatan</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${mode === 'BLANK' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container'}`}
              onClick={() => setMode('BLANK')}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'BLANK' ? 'border-primary' : 'border-outline'}`}>
                  {mode === 'BLANK' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                </div>
                <span className="font-bold text-on-surface">Mulai Kosong</span>
              </div>
              <p className="text-xs text-on-surface-variant ml-8">Mendesain kurikulum dari awal (Blank Canvas)</p>
            </div>

            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${mode === 'DUPLICATE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant hover:bg-surface-container'}`}
              onClick={() => setMode('DUPLICATE')}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${mode === 'DUPLICATE' ? 'border-primary' : 'border-outline'}`}>
                  {mode === 'DUPLICATE' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                </div>
                <span className="font-bold text-on-surface">Duplikat Kurikulum Lama</span>
              </div>
              <p className="text-xs text-on-surface-variant ml-8">Salin Profil Lulusan, CPL, dan MK dari sebelumnya</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-6">
          {mode === 'DUPLICATE' && (
            <div className="bg-tertiary/10 border border-tertiary/30 p-4 rounded-lg">
              <label className="input-label text-tertiary mb-2" htmlFor="source_curriculum">Pilih Kurikulum yang Ingin Disalin</label>
              <select 
                className="input-base"
                id="source_curriculum"
                value={formData.sourceKurikulumId}
                onChange={(e) => setFormData({...formData, sourceKurikulumId: e.target.value})}
              >
                <option value="">-- Pilih Kurikulum --</option>
                {curriculums.map(c => (
                  <option key={c.id} value={c.id}>{c.nama} (Mulai: {c.tahunMulai})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="input-label mb-2" htmlFor="curriculum_name">Nama Kurikulum (Draft Baru)</label>
            <input 
              className="input-base" 
              id="curriculum_name" 
              placeholder="e.g., Kurikulum SI 2026 - OBE" 
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label mb-2" htmlFor="tahun_mulai">Tanggal Mulai Berlaku</label>
              <input 
                className="input-base" 
                id="tahun_mulai" 
                type="date"
                value={formData.tahunMulai}
                onChange={(e) => setFormData({...formData, tahunMulai: e.target.value})}
              />
            </div>
            <div>
              <label className="input-label mb-2" htmlFor="tahun_selesai">Tanggal Berakhir Berlaku</label>
              <input 
                className="input-base" 
                id="tahun_selesai" 
                type="date"
                value={formData.tahunSelesai}
                onChange={(e) => setFormData({...formData, tahunSelesai: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="input-label mb-2" htmlFor="description">Deskripsi Singkat (Opsional)</label>
            <textarea 
              className="input-base resize-none" 
              id="description" 
              placeholder="Jelaskan secara singkat tujuan atau nomor SK rektor dari kurikulum ini..." 
              rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link to="/kurikulum">
          <button className="btn-secondary">Batal</button>
        </Link>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? 'Menyimpan...' : 'Simpan Draft & Mulai Fase Plan'}
          {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
};
