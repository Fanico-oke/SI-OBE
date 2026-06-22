import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface CPLScore {
  kode: string;
  deskripsi: string;
  score: number;
  kategori?: string;
}

export const RaporOBE = () => {
  const { user } = useAuthStore();
  const [cplScores, setCplScores] = useState<CPLScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch CPL list for descriptions
        const [cplRes, portoRes] = await Promise.all([
          axios.get('/api/cpl'),
          axios.get(`/api/laporan/portofolio/${user.username}`)
        ]);

        const cplList = cplRes.data;
        const portoData = portoRes.data;

        // Merge CPL info with portfolio scores
        const scores: CPLScore[] = cplList.map((cpl: any) => {
          const match = portoData.cplScores?.find((s: any) => s.kode === cpl.kode);
          return {
            kode: cpl.kode,
            deskripsi: cpl.deskripsi,
            score: match?.score ?? 0,
            kategori: cpl.kode.includes('S') ? 'Sikap' : cpl.kode.includes('P') ? 'Pengetahuan' : 'Keterampilan'
          };
        });

        setCplScores(scores);
      } catch (err: any) {
        // If portfolio not found, still show CPLs with 0 scores
        try {
          const cplRes = await axios.get('/api/cpl');
          setCplScores(cplRes.data.map((c: any) => ({
            kode: c.kode,
            deskripsi: c.deskripsi,
            score: 0,
            kategori: c.kode.includes('S') ? 'Sikap' : c.kode.includes('P') ? 'Pengetahuan' : 'Keterampilan'
          })));
        } catch {
          setError('Gagal memuat data CPL');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const overall = cplScores.length > 0
    ? Math.round(cplScores.reduce((sum, c) => sum + c.score, 0) / cplScores.length * 10) / 10
    : 0;
  const best = cplScores.length > 0 ? cplScores.reduce((a, b) => a.score > b.score ? a : b) : null;
  const worst = cplScores.length > 0 ? cplScores.reduce((a, b) => a.score < b.score ? a : b) : null;
  const belowTarget = cplScores.filter(c => c.score < 75 && c.score > 0);

  const radarData = cplScores.map(c => ({
    subject: c.kode,
    score: c.score,
    target: 75,
    fullMark: 100
  }));

  if (loading) {
    return (
      <div className="w-full p-8">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="card text-center py-12">
          <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-caption font-bold tracking-tight">RAPOR KOMPETENSI</span>
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-caption font-bold">Sistem Informasi</span>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface">{user?.nama || 'Mahasiswa'}</h1>
          <p className="text-on-surface-variant mt-1">NIM: {user?.username} — Capaian Pembelajaran Lulusan (CPL)</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Cetak
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card rounded-2xl p-6 bg-gradient-to-br from-primary to-primary/80 text-on-primary relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <span className="material-symbols-outlined !text-[80px]">analytics</span>
          </div>
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Rata-rata Capaian</p>
          <h2 className="text-4xl font-bold mt-2">{overall}%</h2>
          <p className="text-sm opacity-70 mt-1">{overall >= 75 ? '✅ Memenuhi standar' : '⚠️ Di bawah standar 75%'}</p>
        </div>
        <div className="card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <span className="material-symbols-outlined !text-[80px]">trending_up</span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">CPL Terkuat</p>
          <h2 className="text-3xl font-bold mt-2 text-success">{best?.score ?? 0}%</h2>
          <p className="text-sm text-on-surface-variant mt-1 truncate">{best?.kode}: {best?.deskripsi?.substring(0, 50)}...</p>
        </div>
        <div className="card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <span className="material-symbols-outlined !text-[80px]">trending_down</span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">Perlu Perhatian</p>
          <h2 className="text-3xl font-bold mt-2 text-warning">{worst?.score ?? 0}%</h2>
          <p className="text-sm text-on-surface-variant mt-1 truncate">{worst?.kode}: {worst?.deskripsi?.substring(0, 50)}...</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-7">
          <div className="card rounded-2xl p-6 h-full">
            <h3 className="font-h3 text-h3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">radar</span>
              Profil Kompetensi
            </h3>
            <div className="w-full" style={{ height: 400 }}>
              {cplScores.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="var(--md-sys-color-outline-variant)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 10 }} />
                    <Radar name="Target (75%)" dataKey="target" stroke="var(--md-sys-color-outline)" fill="var(--md-sys-color-outline)" fillOpacity={0.1} strokeDasharray="4 4" />
                    <Radar name="Capaian Anda" dataKey="score" stroke="var(--md-sys-color-primary)" fill="var(--md-sys-color-primary)" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-on-surface-variant">
                  Belum ada data penilaian
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-caption">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                <span>Capaian Anda</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-outline bg-transparent"></div>
                <span>Target (75%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CPL Detail List */}
        <div className="lg:col-span-5">
          <div className="card rounded-2xl p-6 h-full overflow-y-auto" style={{ maxHeight: 520 }}>
            <h3 className="font-h3 text-h3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">checklist</span>
              Detail Capaian Per CPL
            </h3>
            <div className="space-y-3">
              {cplScores.map(cpl => (
                <div key={cpl.kode} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 hover:border-outline-variant transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface text-sm">{cpl.kode}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        cpl.kategori === 'Sikap' ? 'bg-tertiary/20 text-tertiary' :
                        cpl.kategori === 'Pengetahuan' ? 'bg-primary/20 text-primary' :
                        'bg-secondary/20 text-secondary'
                      }`}>{cpl.kategori}</span>
                    </div>
                    <span className={`font-bold text-sm ${cpl.score >= 75 ? 'text-success' : cpl.score > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {cpl.score > 0 ? `${cpl.score}%` : '—'}
                    </span>
                  </div>
                  <p className="text-caption text-on-surface-variant line-clamp-2 mb-2">{cpl.deskripsi}</p>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cpl.score >= 75 ? 'bg-success' : cpl.score > 0 ? 'bg-error' : 'bg-outline-variant'}`}
                      style={{ width: `${cpl.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="card rounded-2xl p-6">
        <h3 className="font-h3 text-h3 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">psychology</span>
          Interpretasi Capaian
        </h3>
        {overall >= 75 ? (
          <div className="p-4 rounded-xl bg-success/10 border border-success/20">
            <p className="text-success font-semibold mb-1">🎉 Selamat! Capaian OBE Anda memenuhi standar minimum.</p>
            <p className="text-on-surface-variant text-sm">Rata-rata capaian Anda {overall}% sudah melampaui target 75%. Tetap pertahankan dan tingkatkan kompetensi Anda.</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <p className="text-warning font-semibold mb-1">⚠️ Beberapa kompetensi masih perlu ditingkatkan.</p>
            <p className="text-on-surface-variant text-sm mb-3">Rata-rata capaian Anda {overall}% masih di bawah target 75%.</p>
            {belowTarget.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-on-surface">CPL di bawah target:</p>
                {belowTarget.map(c => (
                  <div key={c.kode} className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                    <span className="font-medium">{c.kode}</span> — {c.score}% (target 75%)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
