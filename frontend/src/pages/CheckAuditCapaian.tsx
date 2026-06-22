import { useState, useEffect } from 'react';
import { Link , useParams } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';

interface CPLData { id: string; kode: string; deskripsi: string; attainment: number; target: number; fullMark: number; hasData: boolean; }
interface CPLWithCpmk { id: string; kode: string; cpmk?: { id: string }[]; }

const API = '';

export const CheckAuditCapaian = () => {
  const { id } = useParams();
  const { activeCurriculumId } = useCurriculumStore();
  const [cplList, setCplList] = useState<CPLData[]>([]);
  const [cplMkCountMap, setCplMkCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Mock data for CPL achievement
  const [radarData, setRadarData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, cplRes] = await Promise.all([
          axios.get(`/api/check/cpl-attainment${activeCurriculumId ? `?kurikulumId=${activeCurriculumId}` : ''}`),
          axios.get('/api/cpl'),
        ]);
        const attainmentData = res.data;
        setCplList(attainmentData);

        // Build a map of CPL kode → number of CPMK (as proxy for MK pengukur)
        const cplArr: CPLWithCpmk[] = Array.isArray(cplRes.data) ? cplRes.data : [];
        const countMap: Record<string, number> = {};
        cplArr.forEach((c) => { countMap[c.kode] = c.cpmk?.length || 0; });
        setCplMkCountMap(countMap);
        
        // Map real backend attainment data to Radar Chart
        const mappedRadar = attainmentData.map((c: any) => ({
          subject: c.kode,
          A: c.attainment,
          target: c.target,
          fullMark: c.fullMark,
          hasData: c.hasData
        }));
        setRadarData(mappedRadar);

        // Derive bar chart data from the same CPL attainment response
        const mappedBar = attainmentData
          .filter((c: any) => c.hasData)
          .map((c: any) => ({
            name: c.kode,
            attainment: c.attainment,
            target: c.target,
          }));
        setBarData(mappedBar);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [activeCurriculumId]);

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
          <Link to="/check/audit" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Audit Capaian</Link>
          <Link to="/check/laporan" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Laporan Evaluasi</Link>
          <Link to="/check/feedback" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Feedback & Rekomendasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
        <ArchivedBanner returnPath="/check" />
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex text-on-surface-variant font-caption text-caption mb-2">
              <ol className="inline-flex items-center space-x-1">
                <li><Link className="hover:text-primary transition-colors" to="/check">Evaluasi Kurikulum</Link></li>
                <li><div className="flex items-center"><span className="material-symbols-outlined text-body mx-1">chevron_right</span><span className="text-primary font-medium">Audit Capaian</span></div></li>
              </ol>
            </nav>
            <h2 className="section-title gap-3">
              <span className="text-primary">📊</span> Audit Capaian CPL Prodi
            </h2>
            <p className="page-subtitle">Helicopter view pencapaian CPL berdasarkan agregasi nilai mahasiswa dari seluruh mata kuliah.</p>
          </div>
          <div className="flex gap-3">
            <select className="input-base px-4 py-2 font-medium">
              <option>Angkatan 2023</option>
              <option>Angkatan 2024</option>
              <option>Semua Angkatan</option>
            </select>
            <button className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Ekspor PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart Card */}
            <div className="card flex flex-col h-[500px]">
              <h3 className="font-h3 text-h3 text-on-surface mb-2">Radar Capaian Lulusan (CPL)</h3>
              <p className="text-caption text-on-surface-variant mb-6">Membandingkan skor rata-rata capaian prodi terhadap target institusi (75%).</p>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--color-outline-variant)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-outline)' }} />
                    <Radar name="Target Institusi" dataKey="target" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.1} strokeDasharray="3 3" />
                    <Radar name="Capaian Riil" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.5} />
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Red Flags / Summary */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">verified</span>
                    <span className="stat-value">{radarData.filter(d => d.hasData && d.A >= d.target).length}</span>
                  </div>
                  <p className="text-body font-medium text-on-surface">CPL Memenuhi Target</p>
                  <p className="text-caption text-on-surface-variant">&ge; 75% capaian</p>
                </div>
                <div className="bg-error-container text-on-error-container rounded-xl border border-error/20 p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">warning</span>
                    <span className="text-h2 font-bold text-error">{radarData.filter(d => d.hasData && d.A < d.target).length}</span>
                  </div>
                  <p className="text-body font-medium">CPL Di Bawah Target</p>
                  <p className="text-caption opacity-80">&lt; 75% capaian</p>
                </div>
              </div>

              <div className="card flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="section-title">
                    <span className="material-symbols-outlined text-error">flag</span> CPL Kritis (Red Flags)
                  </h3>
                  <Link to="/check/laporan" className="text-primary text-caption hover:underline">Lihat Laporan Detail</Link>
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                  {radarData.filter(d => d.hasData && d.A < d.target).map(cpl => {
                    const cplObj = cplList.find((c: any) => c.kode === cpl.subject);
                    return (
                      <div key={cpl.subject} className="p-4 border border-error/30 rounded-lg bg-surface relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-on-surface">{cpl.subject}</span>
                          <span className="px-2 py-1 bg-error-container text-on-error-container text-caption rounded-md font-bold">{cpl.A}% / {cpl.target}%</span>
                        </div>
                        <p className="text-caption text-on-surface-variant line-clamp-2" title={cplObj?.deskripsi}>{cplObj?.deskripsi}</p>
                        <div className="mt-3 pt-3 border-t border-surface-variant flex justify-between items-center">
                          <span className="text-caption text-on-surface-variant">Dari {cplMkCountMap[cpl.subject] || 0} CPMK pengukur</span>
                          <button className="text-primary text-caption font-medium hover:underline">Analisis Gap &rarr;</button>
                        </div>
                      </div>
                    );
                  })}
                  {radarData.filter(d => d.hasData && d.A < d.target).length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                      <p>Semua CPL memenuhi target. Kerja bagus!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bar Chart Section */}
            <div className="lg:col-span-2 card h-[400px] flex flex-col">
              <h3 className="font-h3 text-h3 text-on-surface mb-2">Capaian CPL vs Target</h3>
              <p className="text-caption text-on-surface-variant mb-6">Membandingkan skor capaian setiap CPL terhadap target yang ditetapkan.</p>
              
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: 'var(--color-surface-container-low)' }} contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-outline-variant)' }} />
                    <Legend />
                    <Bar name="Target" dataKey="target" fill="var(--color-surface-variant)" radius={[4, 4, 0, 0]} />
                    <Bar name="Capaian" dataKey="attainment" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        </>
      }
    />
  );
};
