import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

export const DoModulRPS = () => {
  const { kelasId } = useParams();
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const isReadOnly = user?.role === 'KAPRODI';
  const [kelas, setKelas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingRps, setSavingRps] = useState(false);
  
  // Default 14 weeks RPS structure
  const initialRps = Array.from({ length: 14 }, (_, i) => ({
    mingguKe: i + 1,
    subCpmkId: '',
    materi: '',
    metode: '',
    waktu: ''
  }));
  const [rpsList, setRpsList] = useState<any[]>(initialRps);

  useEffect(() => {
    if (kelasId) {
      setLoading(true);
      Promise.all([
        axios.get(`/api/do/kelas/${kelasId}`),
        axios.get(`/api/do/kelas/${kelasId}/rps`)
      ]).then(([kelasRes, rpsRes]) => {
        setKelas(kelasRes.data);
        if (rpsRes.data && rpsRes.data.length > 0) {
          setRpsList(rpsRes.data);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [kelasId]);

  const handleRpsChange = (index: number, field: string, value: string) => {
    const newList = [...rpsList];
    newList[index] = { ...newList[index], [field]: value };
    setRpsList(newList);
  };

  const handleSaveRps = async () => {
    setSavingRps(true);
    try {
      await axios.post('/api/do/rps', { kelasId, rpsData: rpsList });
      setIsEditing(false);
    } catch (e) {
      addToast('Gagal menyimpan RPS', 'error');
    } finally {
      setSavingRps(false);
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
            <Link to="/do/rps" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
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

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Memuat RPS...</div>;
  if (!kelas) return <div className="p-8 text-center text-error">Data kelas tidak ditemukan</div>;

  const mk = kelas.mk;
  
  // Ambil data unik CPL dari CPMK yang dipetakan ke MK ini
  const uniqueCpls = new Map();
  const allSubCpmks: any[] = [];
  
  const pemetaan = mk.pemetaanCPMK || [];
  
  pemetaan.forEach((p: any) => {
    const cpmk = p.cpmk;
    if (cpmk && cpmk.cpl) {
      if (!uniqueCpls.has(cpmk.cpl.id)) {
        uniqueCpls.set(cpmk.cpl.id, cpmk.cpl);
      }
    }
    if (cpmk && cpmk.subCpmk && Array.isArray(cpmk.subCpmk)) {
      cpmk.subCpmk.forEach((sc: any) => {
        allSubCpmks.push({ ...sc, cpmkKode: cpmk.kode });
      });
    }
  });

  return (
    <PhaseLayout
      title={`📚 Rencana Pembelajaran Semester (RPS) ${kelas ? `- ${kelas.nama}` : ''}`}
      description="Kelola dan susun struktur pembelajaran semester untuk kelas ini."
      icon="menu_book"
      iconBgColorClass="bg-primary/10"
      iconTextColorClass="text-primary"
      tabs={
        <>
          <Link to="/do" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Daftar Modul</Link>
          <Link to={`/do/rps/${kelasId}`} className="tab-active py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
          <Link to={`/do/tugas/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
          <Link to={`/do/penilaian/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Penilaian</Link>
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

          <div className="mb-6 flex justify-end">
            <button className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2" onClick={() => window.print()}>
              <span className="material-symbols-outlined">print</span> Cetak PDF
            </button>
          </div>

          <div className="card p-6 lg:p-10">
            <div className="text-center mb-8 border-b border-outline-variant pb-6">
              <h1 className="font-h2 text-h2 font-bold text-on-surface mb-2">RENCANA PEMBELAJARAN SEMESTER (RPS)</h1>
              <h2 className="font-h3 text-h3 text-on-surface-variant font-medium">PROGRAM STUDI SISTEM INFORMASI</h2>
            </div>
            
            <div className="table-container mb-8">
              <table className="table-modern">
                <tbody>
                  <tr>
                    <td className="font-bold w-1/4">MATA KULIAH</td>
                    <td className="w-1/4">{mk.nama}</td>
                    <td className="font-bold w-1/4 border-l border-outline-variant">KODE</td>
                    <td className="w-1/4">{mk.kode}</td>
                  </tr>
                  <tr>
                    <td className="font-bold w-1/4">BOBOT (sks)</td>
                    <td className="w-1/4">{mk.sks} SKS</td>
                    <td className="font-bold w-1/4 border-l border-outline-variant">SEMESTER</td>
                    <td className="w-1/4">{mk.semester}</td>
                  </tr>
                  <tr>
                    <td className="font-bold w-1/4">NAMA KELAS</td>
                    <td colSpan={3} className="font-bold text-primary">{kelas.nama} ({kelas.tahunAjaran})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-h3 text-h3 text-on-surface mb-4">Capaian Pembelajaran (CP)</h3>
            <div className="table-container mb-8">
              <table className="table-modern">
                <tbody>
                  {/* CPL Section */}
                  <tr>
                    <td className="font-bold w-1/4 align-top" rowSpan={Array.from(uniqueCpls.values()).length > 0 ? Array.from(uniqueCpls.values()).length : 1}>
                      CPL Prodi yang dibebankan pada MK
                    </td>
                    {Array.from(uniqueCpls.values()).length > 0 ? (
                      <td className="border-l border-outline-variant">
                        <span className="font-bold text-primary">{Array.from(uniqueCpls.values())[0]?.kode}</span>: <span className="text-on-surface-variant">{Array.from(uniqueCpls.values())[0]?.deskripsi}</span>
                      </td>
                    ) : (
                      <td className="border-l border-outline-variant text-on-surface-variant italic">Belum ada pemetaan CPL</td>
                    )}
                  </tr>
                  {Array.from(uniqueCpls.values()).slice(1).map((cpl: any) => (
                    <tr key={cpl.id}>
                      <td className="border-l border-outline-variant">
                        <span className="font-bold text-primary">{cpl.kode}</span>: <span className="text-on-surface-variant">{cpl.deskripsi}</span>
                      </td>
                    </tr>
                  ))}

                  {/* CPMK Section */}
                  <tr className="border-t-2 border-outline-variant">
                    <td className="font-bold w-1/4 align-top" rowSpan={pemetaan.length > 0 ? pemetaan.length : 1}>
                      Capaian Pembelajaran Mata Kuliah (CPMK)
                    </td>
                    {pemetaan.length > 0 ? (
                      <td className="border-l border-outline-variant">
                        <span className="font-bold text-secondary">{pemetaan[0]?.cpmk.kode}</span>: <span className="text-on-surface-variant">{pemetaan[0]?.cpmk.deskripsi}</span>
                      </td>
                    ) : (
                      <td className="border-l border-outline-variant text-on-surface-variant italic">Belum ada pemetaan CPMK</td>
                    )}
                  </tr>
                  {pemetaan.slice(1).map((p: any) => (
                    <tr key={p.id}>
                      <td className="border-l border-outline-variant">
                        <span className="font-bold text-secondary">{p.cpmk.kode}</span>: <span className="text-on-surface-variant">{p.cpmk.deskripsi}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mb-4 mt-8">
              <h3 className="font-h3 text-h3 text-on-surface">Rencana Kegiatan Pembelajaran (Mingguan)</h3>
              {!isReadOnly && (
                !isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-bold hover:bg-primary/20 transition-colors">Edit RPS</button>
                ) : (
                  <button onClick={handleSaveRps} className="btn-primary px-4 py-2 rounded-full font-bold shadow-md">{savingRps ? 'Menyimpan...' : 'Simpan RPS'}</button>
                )
              )}
            </div>

            <div className="table-container mb-8">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="text-center w-20">Minggu</th>
                    <th>Sub-CPMK yang Diukur</th>
                    <th>Materi Pembelajaran</th>
                    <th className="w-40">Metode / Waktu</th>
                  </tr>
                </thead>
                <tbody>
                {rpsList.map((rps, index) => (
                  <tr key={index}>
                    <td className="text-center font-bold">{rps.mingguKe}</td>
                    <td>
                      {isEditing ? (
                        <select 
                          className="input-base w-full"
                          value={rps.subCpmkId || ''}
                          onChange={(e) => handleRpsChange(index, 'subCpmkId', e.target.value)}
                        >
                          <option value="">-- Pilih Sub-CPMK --</option>
                          {allSubCpmks.map(sc => (
                            <option key={sc.id} value={sc.id}>{sc.kode}: {sc.deskripsi}</option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {allSubCpmks.find(sc => sc.id === rps.subCpmkId)?.kode || '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <textarea 
                          className="input-base w-full"
                          rows={2}
                          value={rps.materi || ''}
                          onChange={(e) => handleRpsChange(index, 'materi', e.target.value)}
                        />
                      ) : (
                        <span className="whitespace-pre-wrap">{rps.materi || '-'}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="space-y-1">
                          <input type="text" className="input-base w-full" placeholder="Metode..." value={rps.metode} onChange={(e) => handleRpsChange(index, 'metode', e.target.value)} />
                          <input type="text" className="input-base w-full" placeholder="Waktu (menit)..." value={rps.waktu} onChange={(e) => handleRpsChange(index, 'waktu', e.target.value)} />
                        </div>
                      ) : (
                        <div className="text-xs">
                          <div className="font-bold">{rps.metode || '-'}</div>
                          <div className="text-on-surface-variant">{rps.waktu || '-'}</div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            <div className="mt-8 text-right text-sm">
              <p>Disahkan oleh,</p>
              <br/><br/><br/>
              <p className="font-bold underline">Ketua Program Studi</p>
            </div>
          </div>
        </>
      }
    />
  );
};
