import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface KurikulumData { id: string; nama: string; prodi: string; tahunMulai: number; tahunSelesai: number; deskripsi: string; status: string; }
interface ProfilLulusan { id: string; kode: string; deskripsi: string; referensi: string | null; }
interface CPL { id: string; kode: string; deskripsi: string; kategori: string | null; }
interface BahanKajian { id: string; kode: string; nama: string; deskripsi: string | null; }
interface MataKuliah { id: string; kode: string; nama: string; sks: number; semester: number; tipe: string; }

export const KurikulumDetail = () => {
  const { id } = useParams();
  const [kurikulum, setKurikulum] = useState<KurikulumData | null>(null);
  
  const [plList, setPlList] = useState<ProfilLulusan[]>([]);
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [bkList, setBkList] = useState<BahanKajian[]>([]);
  const [mkList, setMkList] = useState<MataKuliah[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PL' | 'CPL' | 'BK' | 'MK'>('PL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kRes, plRes, cplRes, bkRes, mkRes] = await Promise.all([
          axios.get('/api/kurikulum'),
          axios.get('/api/profil-lulusan'),
          axios.get('/api/cpl'),
          axios.get('/api/bahan-kajian'),
          axios.get('/api/mata-kuliah')
        ]);
        const k = kRes.data.find((x: any) => x.id === id);
        setKurikulum(k || null);
        
        // Only show items that belong to this kurikulum if the API returned all
        setPlList(plRes.data.filter((x: any) => x.kurikulumId === id));
        setCplList(cplRes.data.filter((x: any) => x.kurikulumId === id));
        setBkList(bkRes.data.filter((x: any) => x.kurikulumId === id));
        setMkList(mkRes.data.filter((x: any) => x.kurikulumId === id));
      } catch(e) { 
        console.error(e);
      }
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-6 font-body text-body">Loading...</div>;
  if (!kurikulum) return <div className="p-6 font-body text-body text-error">Kurikulum tidak ditemukan</div>;

  return (
    <div className="w-full space-y-4">
      <header className="flex items-center gap-4 w-full">
        <Link to="/kurikulum" className="btn-icon rounded-full hover:bg-surface-container text-on-surface-variant">
          <span className="material-symbols-outlined icon-fill">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-h2 text-h2 font-bold text-on-surface">{kurikulum.nama}</h1>
          <p className="font-caption text-caption text-on-surface-variant">
            {kurikulum.prodi} • {kurikulum.tahunMulai} - {kurikulum.tahunSelesai}
          </p>
        </div>
      </header>
      

          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-h3 text-h3 text-on-surface">Informasi Umum</h3>
              <span className="badge-primary uppercase">
                {kurikulum.status}
              </span>
            </div>
            <p className="font-body text-body text-on-surface-variant leading-relaxed">
              {kurikulum.deskripsi || 'Tidak ada deskripsi.'}
            </p>
          </div>

          <div>
            <div className="flex gap-2 border-b border-outline-variant mb-6 overflow-x-auto">
              {(['PL', 'CPL', 'BK', 'MK'] as const).map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveTab(t)}
                  className={activeTab === t ? 'tab-active' : 'tab-inactive'}
                >
                  {t === 'PL' ? 'Profil Lulusan (PL)' : 
                   t === 'CPL' ? 'Capaian Pembelajaran (CPL)' : 
                   t === 'BK' ? 'Bahan Kajian (BK)' : 
                   'Mata Kuliah (MK)'}
                </button>
              ))}
            </div>
            
            <div className="table-container">
              {activeTab === 'PL' && (
                <table className="table-modern">
                  <thead>
                    <tr><th>Kode</th><th>Deskripsi</th><th>Referensi</th></tr>
                  </thead>
                  <tbody>
                    {plList.length === 0 ? <tr><td colSpan={3} className="text-center text-outline">Tidak ada data PL.</td></tr> : 
                      plList.map(item => (
                        <tr key={item.id}>
                          <td className="td-code font-bold text-primary">{item.kode}</td>
                          <td>{item.deskripsi}</td>
                          <td><span className="badge-secondary">{item.referensi || '-'}</span></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'CPL' && (
                <table className="table-modern">
                  <thead>
                    <tr><th>Kode</th><th>Deskripsi</th><th>Kategori</th></tr>
                  </thead>
                  <tbody>
                    {cplList.length === 0 ? <tr><td colSpan={3} className="text-center text-outline">Tidak ada data CPL.</td></tr> : 
                      cplList.map(item => (
                        <tr key={item.id}>
                          <td className="td-code font-bold text-primary">{item.kode}</td>
                          <td>{item.deskripsi}</td>
                          <td><span className="badge-tertiary">{item.kategori || 'U'}</span></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'BK' && (
                <table className="table-modern">
                  <thead>
                    <tr><th>Kode</th><th>Nama Kajian</th><th>Deskripsi</th></tr>
                  </thead>
                  <tbody>
                    {bkList.length === 0 ? <tr><td colSpan={3} className="text-center text-outline">Tidak ada data BK.</td></tr> : 
                      bkList.map(item => (
                        <tr key={item.id}>
                          <td className="td-code font-bold text-primary">{item.kode}</td>
                          <td className="font-medium">{item.nama}</td>
                          <td className="text-on-surface-variant">{item.deskripsi || '-'}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'MK' && (
                <table className="table-modern">
                  <thead>
                    <tr><th>Smt</th><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Tipe</th></tr>
                  </thead>
                  <tbody>
                    {mkList.length === 0 ? <tr><td colSpan={5} className="text-center text-outline">Tidak ada data Mata Kuliah.</td></tr> : 
                      [...mkList].sort((a,b) => a.semester - b.semester).map(item => (
                        <tr key={item.id}>
                          <td className="td-mono font-bold text-on-surface-variant">{item.semester}</td>
                          <td className="td-code font-bold text-primary">{item.kode}</td>
                          <td className="font-medium">{item.nama}</td>
                          <td className="td-mono">{item.sks}</td>
                          <td><span className={`${item.tipe === 'WAJIB' ? 'badge-error' : 'badge-neutral'} uppercase`}>{item.tipe}</span></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
    </div>
  );
};