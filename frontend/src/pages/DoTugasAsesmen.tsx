import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useAuthStore } from '../store/authStore';

interface Asesmen {
  id: string;
  nama: string;
  bobot: number;
  soal: { id: string; subCpmk: { cpmk: { kode: string } } }[];
}

export const DoTugasAsesmen = () => {
  const { kelasId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isReadOnly = user?.role === 'KAPRODI';
  const [asesmenList, setAsesmenList] = useState<Asesmen[]>([]);
  const [kelas, setKelas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAsesmen, resKelas] = await Promise.all([
          axios.get(`/api/do/kelas/${kelasId}/asesmen`),
          axios.get(`/api/do/kelas/${kelasId}`)
        ]);
        setAsesmenList(resAsesmen.data);
        setKelas(resKelas.data);
      } catch (e) {
        console.error('Failed to fetch', e);
      } finally {
        setLoading(false);
      }
    };
    if (kelasId) fetchData();
  }, [kelasId]);

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
            <Link to="/do/tugas" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
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

  return (
    <PhaseLayout
      title={`📑 Tugas & Asesmen ${kelas ? `- ${kelas.nama}` : ''}`}
      description="Kelola daftar tugas dan instrumen asesmen untuk kelas ini."
      icon="assignment"
      iconBgColorClass="bg-primary/10"
      iconTextColorClass="text-primary"
      tabs={
        <>
          <Link to="/do" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Daftar Modul</Link>
          <Link to={`/do/rps/${kelasId}`} className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">RPS</Link>
          <Link to={`/do/tugas/${kelasId}`} className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Tugas & Asesmen</Link>
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
          {!isReadOnly && (
          <div className="mb-6 flex justify-end">
          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/do/penilaian/${kelasId}?create=true`)}
              className="btn-primary px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span> Buat Tugas Baru
            </button>
          </div>
        </div>
          )}

        <div className="table-container">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant">Loading asesmen...</div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nama Asesmen</th>
                  <th className="w-32">Bobot (%)</th>
                  <th className="w-32">Jml Soal</th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {asesmenList.map((as: any) => (
                  <tr key={as.id}>
                    <td className="font-bold">{as.nama}</td>
                    <td className="text-center td-mono">{as.bobot}%</td>
                    <td className="text-center td-mono">{as.soal?.length || 0}</td>
                    <td className="text-right">
                      {!isReadOnly && (
                      <button onClick={() => navigate(`/do/penilaian/${kelasId}?asesmenId=${as.id}`)} className="table-action-primary">Input Nilai</button>
                      )}
                    </td>
                  </tr>
                ))}
                {asesmenList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-on-surface-variant italic">Belum ada asesmen.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        </>
      }
    />
  );
};
