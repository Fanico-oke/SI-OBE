import { useState, useEffect } from 'react';
import { Link , useParams } from 'react-router-dom';
import axios from 'axios';
import { useModulStore } from '../store/useModulStore';
import { useAppStore } from '../store/useAppStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface CPLAttainment {
  kode: string;
  deskripsi: string;
  attainment: number;
  target: number;
  fullMark: number;
  hasData: boolean;
}

export const CheckEvaluasi = () => {
  const { id } = useParams();
  const { moduls } = useModulStore();
  const { addToast } = useAppStore();
  const { activeCurriculumId } = useCurriculumStore();

  const [cplData, setCplData] = useState<CPLAttainment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkStatus, setCheckStatus] = useState<{ completed: boolean; checkCompletedAt: string | null }>({ completed: false, checkCompletedAt: null });
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchCplAttainment = async () => {
      try {
        const params = activeCurriculumId ? `?kurikulumId=${activeCurriculumId}` : '';
        const res = await axios.get(`/api/check/cpl-attainment${params}`);
        setCplData(res.data);
      } catch (e) {
        console.error('Failed to fetch CPL attainment:', e);
      }
      setLoading(false);
    };
    fetchCplAttainment();
  }, [activeCurriculumId]);

  useEffect(() => {
    if (!activeCurriculumId) return;
    axios.get(`/api/check/status?kurikulumId=${activeCurriculumId}`)
      .then(res => setCheckStatus(res.data))
      .catch(() => {});
  }, [activeCurriculumId]);

  const handleCompleteCheck = async () => {
    if (!activeCurriculumId) return;
    setCompleting(true);
    try {
      await axios.post('/api/check/complete', { kurikulumId: activeCurriculumId });
      setCheckStatus({ completed: true, checkCompletedAt: new Date().toISOString() });
      addToast('✅ Check berhasil ditandai selesai! Anda bisa lanjut ke Act.', 'success');
    } catch (e) {
      addToast('Gagal menandai Check selesai', 'error');
    }
    setCompleting(false);
  };

  const handleSubmitEvaluation = () => {
    addToast('Evaluasi berhasil dikirim ke tahap Act!', 'success');
  };

  const pendingAudits = moduls.filter(m => m.status === 'Review').length;
  const verifiedModuls = moduls.filter(m => m.status === 'Approved').length;

  // Calculate overall attainment as the average of all CPLs with data
  const cplWithData = cplData.filter(c => c.hasData);
  const overallAttainment = cplWithData.length > 0
    ? parseFloat((cplWithData.reduce((sum, c) => sum + c.attainment, 0) / cplWithData.length).toFixed(1))
    : 0;

  return (
    <PhaseLayout
      title="CHECK: Evaluasi & Audit Capaian"
      description="Tinjau tingkat pencapaian modul, verifikasi audit yang tertunda, dan susun laporan evaluasi."
      icon="task_alt"
      iconBgColorClass="bg-success/10"
      iconTextColorClass="text-success"
      tabs={
        <>
          <Link to="/check" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Evaluasi & Audit</Link>
          <Link to="/check/audit" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Audit Capaian</Link>
          <Link to="/check/laporan" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Laporan Evaluasi</Link>
          <Link to="/check/feedback" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Feedback & Rekomendasi</Link>
        </>
      }
      mainContent={
        <>
          <ArchivedBanner returnPath="/check" />
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card flex flex-col justify-between">
              <div className="stat-label mb-2 flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-body">speed</span> Pencapaian Keseluruhan
              </div>
              <div className="flex items-end gap-2">
                <span className="stat-value leading-none">{loading ? '...' : overallAttainment}</span>
                <span className="font-data-mono text-data-mono text-on-surface-variant mb-1">%</span>
              </div>
              <div className="mt-4 w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${overallAttainment}%` }}></div>
              </div>
            </div>

            <div className="card flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning-container rounded-full opacity-50 pointer-events-none"></div>
              <div className="stat-label mb-2 flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-body">pending_actions</span> Audit Tertunda
              </div>
              <div className="flex items-end gap-2">
                <span className="stat-value text-warning leading-none">{pendingAudits}</span>
                <span className="font-body text-body text-on-surface-variant mb-1">items</span>
              </div>
              {pendingAudits > 0 && (
                <div className="mt-4 flex items-center gap-2 text-warning font-caption text-caption bg-warning-container px-2 py-1 rounded w-fit">
<span className="material-symbols-outlined text-body">warning</span> Perlu Tindakan
                </div>
              )}
            </div>

            <div className="card flex flex-col justify-between">
              <div className="stat-label mb-2 flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-body">timeline</span> Progres Evaluasi
              </div>
              <div className="flex items-end gap-2">
                <span className="stat-value leading-none">{verifiedModuls}/{moduls.length}</span>
                <span className="font-body text-body text-on-surface-variant mb-1">modules</span>
              </div>
              <div className="mt-4 flex gap-1 h-2">
                {moduls.map((m, i) => (
                  <div key={i} className={`flex-1 ${m.status === 'Approved' ? 'bg-primary' : 'bg-surface-variant'} ${i === 0 ? 'rounded-l-full' : ''} ${i === moduls.length - 1 ? 'rounded-r-full' : ''}`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="card p-0 flex flex-col">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright rounded-t-xl">
              <h3 className="section-title">
<span className="material-symbols-outlined text-warning">checklist</span>
                Pencapaian Kompetensi
              </h3>
            </div>
            <div className="table-container overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>CPL</th>
                    <th>Deskripsi</th>
                    <th>Target</th>
                    <th>Aktual</th>
                    <th>Selisih</th>
                    <th>Status Audit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cplData.map((cpl) => {
                    const delta = cpl.hasData ? parseFloat((cpl.attainment - cpl.target).toFixed(1)) : null;
                    const meetsTarget = delta !== null && delta >= 0;
                    return (
                    <tr key={cpl.kode} className={!meetsTarget && cpl.hasData ? 'bg-warning-container/30' : ''}>
                      <td className="font-medium">{cpl.kode}</td>
                      <td className="td-code max-w-xs truncate" title={cpl.deskripsi}>{cpl.deskripsi}</td>
                      <td className="td-mono">{cpl.target.toFixed(1)}</td>
                      <td className={`td-mono ${cpl.hasData ? (meetsTarget ? 'font-medium text-secondary' : 'font-medium text-error') : 'text-on-surface-variant'}`}>
                        {cpl.hasData ? cpl.attainment.toFixed(1) : '--'}
                      </td>
                      <td className={`td-mono flex items-center gap-1 ${cpl.hasData ? (meetsTarget ? 'text-secondary' : 'text-error') : 'text-on-surface-variant'}`}>
{cpl.hasData ? (meetsTarget ? <><span className="material-symbols-outlined text-body">arrow_upward</span> +{delta!.toFixed(1)}</> : <><span className="material-symbols-outlined text-body">arrow_downward</span> {delta!.toFixed(1)}</>) : '--'}
                      </td>
                      <td>
                        {cpl.hasData && meetsTarget && (
                          <span className="badge-success inline-flex items-center gap-1">
<span className="material-symbols-outlined ">check_circle</span> Terverifikasi
                          </span>
                        )}
                        {cpl.hasData && !meetsTarget && (
                          <span className="badge-error inline-flex items-center gap-1">
<span className="material-symbols-outlined ">flag</span> Perlu Tinjauan
                          </span>
                        )}
                        {!cpl.hasData && (
                          <span className="badge-warning inline-flex items-center gap-1">
<span className="material-symbols-outlined ">schedule</span> Perlu Tindakan
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <Link to="/check/audit">
<button className="text-primary hover:text-primary-fixed-dim transition-colors"><span className="material-symbols-outlined ">open_in_new</span></button>
                        </Link>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </>
      }
      sideContent={
        <>
          <div className="flex flex-col h-full">
            <h3 className="font-h3 text-h3 text-on-surface mb-4 border-b border-outline-variant pb-2">CPL Capaian</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="flex flex-col gap-2">
              {cplData.map((cpl) => {
                const pct = cpl.hasData ? Math.round(cpl.attainment) : 0;
                const meetsTarget = cpl.hasData && cpl.attainment >= cpl.target;
                const isBelowTarget = cpl.hasData && cpl.attainment < cpl.target;
                return (
                <Link key={cpl.kode} to="/check/audit" className={`p-3 rounded-lg border flex flex-col gap-2 relative overflow-hidden group transition-colors ${isBelowTarget ? 'border-warning bg-warning-container' : 'border-outline-variant hover:bg-surface-variant'}`}>
                  {isBelowTarget && <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>}
                  <div className="flex justify-between items-center pl-2">
                    <span className="font-medium text-on-surface text-body">{cpl.kode}</span>
                    <span className={`font-data-mono text-data-mono ${isBelowTarget ? 'text-warning' : 'text-on-surface-variant'}`}>
                      {cpl.hasData ? `${pct}%` : 'Pending'}
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden ml-2">
                    <div className={`h-full rounded-full transition-all duration-500 ${meetsTarget ? 'bg-secondary' : isBelowTarget ? 'bg-warning' : 'bg-outline-variant'}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </Link>
                );
              })}
            </div>
            )}
          </div>

          {/* Milestone: Tandai Check Selesai */}
          <div className="card mt-6">
            {checkStatus.completed ? (
              <div className="flex items-center gap-3 text-success">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <p className="font-h4 text-h4 font-bold">Check Sudah Selesai</p>
                  <p className="text-on-surface-variant font-caption text-caption">
                    Ditandai selesai pada {new Date(checkStatus.checkCompletedAt!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Link to="/act" className="ml-auto">
                  <button className="btn-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    Lanjut ke Act
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[28px] text-warning">pending</span>
                  <div>
                    <p className="font-h4 text-h4 font-bold text-on-surface">Tandai Check Selesai</p>
                    <p className="text-on-surface-variant font-caption text-caption">Setelah Anda selesai meninjau evaluasi CPL, tandai untuk melanjutkan ke Act.</p>
                  </div>
                </div>
                <button
                  onClick={handleCompleteCheck}
                  disabled={completing || cplWithData.length === 0}
                  className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  {completing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                      Selesaikan Check
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      }
    />
  );
};
