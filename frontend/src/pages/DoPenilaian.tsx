import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

interface SubCPMK { id: string; kode: string; deskripsi: string; }
interface CPMK { id: string; kode: string; subCpmk: SubCPMK[]; }
interface Enrollment { id: string; mahasiswa: { id: string; nim: string; nama: string; }; }
interface KelasData {
  id: string; nama: string; tahunAjaran: string; semester: string;
  mk: { kode: string; nama: string; pemetaanCPMK: { cpmk: CPMK; }[]; };
  enrollments: Enrollment[];
}

interface AsesmenSoal { id: string; asesmenId: string; nomorSoal: string; bobotSoal: number; subCpmkId: string; subCpmk?: SubCPMK; nilai?: any[]; }
interface Asesmen { id: string; kelasId: string; nama: string; bobot: number; soal: AsesmenSoal[]; }

export const DoPenilaian = () => {
  const { kelasId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const isReadOnly = user?.role === 'KAPRODI';
  const [kelas, setKelas] = useState<KelasData | null>(null);
  const [asesmenList, setAsesmenList] = useState<Asesmen[]>([]);
  const [activeAsesmenId, setActiveAsesmenId] = useState<string>('');
  
  const [penilaian, setPenilaian] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Buat Asesmen
  const [showModal, setShowModal] = useState(searchParams.get('create') === 'true');
  const [asesmenForm, setAsesmenForm] = useState({ nama: '', bobot: 20 });
  const [soalForm, setSoalForm] = useState([{ nomorSoal: 'Soal 1', bobotSoal: 100, subCpmkId: '' }]);

  useEffect(() => {
    if (kelasId) fetchData();
    
    // Clean up URL if opened modal
    if (searchParams.get('create') === 'true') {
      setSearchParams({});
    }
  }, [kelasId]);

  const fetchData = async () => {
    try {
      const [resKelas, resAsesmen] = await Promise.all([
        axios.get(`/api/do/kelas/${kelasId}`),
        axios.get(`/api/do/kelas/${kelasId}/asesmen`)
      ]);
      setKelas(resKelas.data);
      setAsesmenList(resAsesmen.data);
      if (resAsesmen.data.length > 0) setActiveAsesmenId(resAsesmen.data[0].id);

      // Map existing nilai
      const pMap: Record<string, number> = {};
      resAsesmen.data.forEach((a: Asesmen) => {
        a.soal.forEach(s => {
          s.nilai?.forEach(n => { pMap[`${n.mahasiswaId}_${s.id}`] = n.nilai; });
        });
      });
      setPenilaian(pMap);
    } catch (e) { console.error('Failed fetching', e); }
    finally { setLoading(false); }
  };

  const handleNilaiChange = (mId: string, sId: string, val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    if (num > 100) num = 100; if (num < 0) num = 0;
    setPenilaian(prev => ({ ...prev, [`${mId}_${sId}`]: num }));
  };

  const activeAsesmen = asesmenList.find(a => a.id === activeAsesmenId);

  const handleSaveNilai = async () => {
    if (!activeAsesmen) return;
    setSaving(true);
    try {
      const payload = Object.entries(penilaian)
        .filter(([key]) => activeAsesmen.soal.some(s => key.endsWith(`_${s.id}`)))
        .map(([key, nilai]) => {
          const [mahasiswaId, asesmenSoalId] = key.split('_');
          const soal = activeAsesmen.soal.find(s => s.id === asesmenSoalId);
          return { mahasiswaId, asesmenSoalId, nilai, kelasId, subCpmkId: soal?.subCpmkId };
        });
      
      await axios.post('/api/do/nilai-soal', { nilaiData: payload });
      addToast('Data penilaian berhasil disimpan!', 'success');
    } catch (e) { addToast('Gagal menyimpan penilaian', 'error'); }
    setSaving(false);
  };

  const handleCreateAsesmen = async () => {
    if (soalForm.some(s => !s.subCpmkId)) {
      addToast('Semua soal WAJIB di-tagging ke Sub-CPMK terlebih dahulu', 'error');
      return;
    }
    try {
      await axios.post('/api/do/asesmen', {
        kelasId,
        nama: asesmenForm.nama,
        bobot: asesmenForm.bobot,
        soal: soalForm
      });
      setShowModal(false);
      fetchData();
    } catch (e) { addToast('Gagal membuat asesmen', 'error'); }
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
            <Link to="/do/penilaian" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Penilaian</Link>
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!kelas) return <div className="p-8 text-center text-error">Kelas tidak ditemukan</div>;

  const allSubCpmk: SubCPMK[] = [];
  kelas.mk.pemetaanCPMK?.forEach(p => p.cpmk.subCpmk?.forEach(s => allSubCpmk.push(s)));

  return (
    <PhaseLayout
      title={`📊 Penilaian ${kelas ? `- ${kelas.nama}` : ''}`}
      description="Masukkan nilai asesmen mahasiswa dan evaluasi capaian CPMK/CPL."
      icon="grading"
      iconBgColorClass="bg-success/10"
      iconTextColorClass="text-success"
      tabs={
        <>
          <Link to="/do" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Daftar Modul</Link>
          <Link to={`/do/rps/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
          <Link to={`/do/tugas/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
          <Link to={`/do/penilaian/${kelasId}`} className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Penilaian</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          <ArchivedBanner returnPath="/do" />

          {isReadOnly && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2 text-warning text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              Mode Pengawasan — Hanya Kaprodi yang bisa melihat, tidak bisa mengubah data
            </div>
          )}

          <div className="mb-6 flex gap-4 items-end bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          <div className="flex-1 max-w-sm">
            <label className="input-label block mb-2">Pilih Asesmen (Tugas/UTS/UAS)</label>
            <select className="input-base w-full" value={activeAsesmenId} onChange={e => setActiveAsesmenId(e.target.value)}>
              {asesmenList.map(a => <option key={a.id} value={a.id}>{a.nama} (Bobot: {a.bobot}%)</option>)}
              {asesmenList.length === 0 && <option value="">Belum ada asesmen</option>}
            </select>
          </div>
          {!isReadOnly && (
          <button onClick={() => {
            if (allSubCpmk.length === 0) {
              addToast('Anda tidak bisa membuat asesmen karena kelas belum memiliki Sub-CPMK', 'error');
            } else {
              setShowModal(true);
            }
          }} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-medium flex items-center gap-2 h-10 border border-primary/20">
            <span className="material-symbols-outlined text-[18px]">add</span> Buat Asesmen Baru
          </button>
          )}
          
          {!isReadOnly && activeAsesmen && (
            <button onClick={handleSaveNilai} disabled={saving} className="btn-primary ml-auto px-6 py-2 rounded-lg font-medium h-10 shadow-sm disabled:opacity-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? 'Menyimpan...' : 'Simpan Nilai'}
            </button>
          )}
        </div>

        {activeAsesmen ? (
          <div className="card p-0 overflow-hidden">
            <div className="table-container">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="border-r border-outline-variant w-16 text-center">No</th>
                    <th className="border-r border-outline-variant min-w-[120px]">NIM</th>
                    <th className="border-r border-outline-variant min-w-[200px]">Nama Mahasiswa</th>
                    {activeAsesmen.soal.map(s => (
                      <th key={s.id} className="border-r border-outline-variant text-center w-32 text-secondary bg-secondary/5">
                        <div className="text-body font-bold">{s.nomorSoal}</div>
                        <div className="text-xs font-normal text-on-surface-variant mb-1">Bobot Soal: {s.bobotSoal}%</div>
                        <div className="text-[10px] bg-primary/10 text-primary px-1 rounded inline-block font-data-mono">Tag: {s.subCpmk?.kode || s.subCpmkId}</div>
                      </th>
                    ))}
                    <th className="text-center w-24 bg-primary/5 text-primary">Total Asesmen</th>
                  </tr>
                </thead>
                <tbody>
                  {kelas.enrollments.map((en, index) => {
                    const mId = en.mahasiswa.id;
                    let total = 0;
                    activeAsesmen.soal.forEach(s => {
                      total += (penilaian[`${mId}_${s.id}`] || 0) * (s.bobotSoal / 100);
                    });
                    
                    return (
                      <tr key={mId} className="group">
                        <td className="text-center text-on-surface-variant border-r border-outline-variant">{index + 1}</td>
                        <td className="td-mono border-r border-outline-variant">{en.mahasiswa.nim}</td>
                        <td className="font-medium border-r border-outline-variant">{en.mahasiswa.nama}</td>
                        
                        {activeAsesmen.soal.map(s => (
                          <td key={s.id} className="!p-2 border-r border-outline-variant bg-surface group-hover:bg-surface-container-lowest transition-colors">
                            <input 
                              type="number" min="0" max="100" 
                              className="w-full px-2 py-2 text-center bg-transparent border border-transparent hover:border-outline-variant rounded focus:border-primary focus:ring-1 outline-none transition-all font-data-mono font-bold text-primary"
                              value={penilaian[`${mId}_${s.id}`] ?? ''}
                              onChange={e => handleNilaiChange(mId, s.id, e.target.value)}
                              placeholder="0"
                              readOnly={isReadOnly}
                            />
                          </td>
                        ))}
                        
                        <td className="text-center font-bold text-primary bg-primary/5 border-l border-outline-variant td-mono">{total.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                  {kelas.enrollments.length === 0 && (
                    <tr><td colSpan={activeAsesmen.soal.length + 4} className="text-center text-on-surface-variant">Belum ada mahasiswa terdaftar di kelas ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state bg-surface border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">assignment_add</span>
            <p className="font-body text-body">Belum ada asesmen yang dibuat untuk kelas ini.</p>
            <p className="font-caption text-caption mt-1">Silakan klik "Buat Asesmen Baru" untuk memulai penilaian.</p>
          </div>
        )}
      {showModal && !isReadOnly && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl border border-outline-variant w-full max-w-2xl max-h-full flex flex-col">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-h2 text-h2 text-on-surface">Buat Asesmen Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="input-label block mb-1">Nama Asesmen</label>
                  <input type="text" className="input-base w-full" placeholder="Contoh: UTS, Tugas 1" value={asesmenForm.nama} onChange={e => setAsesmenForm({...asesmenForm, nama: e.target.value})} />
                </div>
                <div>
                  <label className="input-label block mb-1">Bobot Asesmen thd Nilai Akhir (%)</label>
                  <input type="number" className="input-base w-full" value={asesmenForm.bobot} onChange={e => setAsesmenForm({...asesmenForm, bobot: parseFloat(e.target.value)})} />
                </div>
              </div>
              
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-bold text-on-surface">Daftar Soal & Tagging Sub-CPMK</h3>
                <button onClick={() => setSoalForm([...soalForm, { nomorSoal: `Soal ${soalForm.length + 1}`, bobotSoal: 0, subCpmkId: '' }])} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-[16px]">add</span> Tambah Soal
                </button>
              </div>
              
              <div className="space-y-3">
                {soalForm.map((s, idx) => (
                  <div key={idx} className="flex gap-3 items-end p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Label Soal</label>
                      <input type="text" className="input-base w-full" value={s.nomorSoal} onChange={e => { const n = [...soalForm]; n[idx].nomorSoal = e.target.value; setSoalForm(n); }} />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium mb-1">Bobot Soal %</label>
                      <input type="number" className="input-base w-full" value={s.bobotSoal} onChange={e => { const n = [...soalForm]; n[idx].bobotSoal = parseFloat(e.target.value); setSoalForm(n); }} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Tag Sub-CPMK</label>
                      <select className="input-base w-full" value={s.subCpmkId} onChange={e => { const n = [...soalForm]; n[idx].subCpmkId = e.target.value; setSoalForm(n); }}>
                        <option value="">-- Pilih Sub-CPMK --</option>
                        {allSubCpmk.map(sub => <option key={sub.id} value={sub.id}>{sub.kode} - {sub.deskripsi.substring(0,40)}...</option>)}
                      </select>
                    </div>
                    <button onClick={() => setSoalForm(soalForm.filter((_, i) => i !== idx))} className="mb-1 text-error p-1 hover:bg-error/10 rounded"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost px-4 py-2 font-medium">Batal</button>
              <button onClick={handleCreateAsesmen} className="btn-primary px-4 py-2 rounded-lg font-medium">Simpan Asesmen</button>
            </div>
          </div>
        </div>
      )}
      </>
    }
  />
);
};
