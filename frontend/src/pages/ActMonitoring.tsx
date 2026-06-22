import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';

export const ActMonitoring = () => {
  const { activeCurriculumId } = useCurriculumStore();
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeCurriculumId) fetchActionPlans();
  }, [activeCurriculumId]);

  const fetchActionPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/act/action-plan?kurikulumId=${activeCurriculumId}`);
      setActionPlans(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(`/api/act/action-plan/${id}/status`, { status: newStatus });
      fetchActionPlans();
    } catch (e) {
      alert('Gagal mengupdate status');
    }
  };

  const activePlans = actionPlans.filter(a => a.status !== 'Completed');
  const completedPlans = actionPlans.filter(a => a.status === 'Completed');

  return (
    <PhaseLayout
      title="ACT: Pusat Tindak Lanjut (CQI)"
      description="Delegasikan perbaikan kurikulum secara berkelanjutan dan pantau rekam jejak penyelesaian isu kritis."
      icon="change_circle"
      iconBgColorClass="bg-error/10"
      iconTextColorClass="text-error"
      tabs={
        <>
          <Link to="/act" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Tindakan Perbaikan</Link>
          <Link to="/act/monitoring" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Monitoring Perbaikan</Link>
          <Link to="/act/dokumentasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Dokumentasi Kegiatan</Link>
          <Link to="/act/finalisasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Finalisasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
        <ArchivedBanner returnPath="/act" />
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex text-on-surface-variant font-caption text-caption mb-2">
              <ol className="inline-flex items-center space-x-1">
                <li><Link className="hover:text-primary transition-colors" to="/act">Tindak Lanjut CQI</Link></li>
                <li><div className="flex items-center"><span className="material-symbols-outlined text-body mx-1">chevron_right</span><span className="text-primary font-medium">Monitoring Action Plan</span></div></li>
              </ol>
            </nav>
            <h2 className="section-title gap-3">
              <span className="text-primary">🛠️</span> Monitoring Action Plan (CQI)
            </h2>
            <p className="page-subtitle">Review dan lacak status pengerjaan usulan perbaikan dari dosen pembina mata kuliah.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Memuat data monitoring...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Column 1: Active Plans */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-error"></span> Sedang Dikerjakan ({activePlans.length})</h3>
              </div>
              <div className="flex flex-col gap-4">
                {activePlans.map(plan => (
                  <div key={plan.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded">{plan.kurikulum?.nama || 'Kurikulum'}</span>
                      <span className="text-xs font-bold text-outline">{new Date(plan.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-1">{plan.title}</h4>
                    <p className="text-sm text-on-surface-variant mb-4">{plan.context}</p>
                    <div className="flex justify-between items-end border-t border-outline-variant pt-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-outline">
                        <span className="material-symbols-outlined text-[16px]">person</span> {plan.assignedTo}
                      </div>
                      <button 
                        onClick={() => handleUpdateStatus(plan.id, 'Completed')}
                        className="px-3 py-1 bg-success/10 text-success rounded text-xs font-bold hover:bg-success hover:text-on-success transition-colors"
                      >
                        Tandai Selesai
                      </button>
                    </div>
                  </div>
                ))}
                {activePlans.length === 0 && <p className="text-center text-on-surface-variant text-sm py-4 italic">Tidak ada Action Plan aktif.</p>}
              </div>
            </div>

            {/* Column 2: Completed Plans */}
            <div className="bg-surface-container border border-outline-variant rounded-xl p-6 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-success"></span> Sudah Selesai ({completedPlans.length})</h3>
              </div>
              <div className="flex flex-col gap-4">
                {completedPlans.map(plan => (
                  <div key={plan.id} className="card border-success/30 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                      <span className="material-symbols-outlined text-8xl">task_alt</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success rounded">Selesai</span>
                      <span className="text-xs font-bold text-outline">{new Date(plan.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <h4 className="font-bold text-on-surface mb-1 line-through decoration-success/30">{plan.title}</h4>
                    <p className="text-sm text-on-surface-variant mb-2">{plan.context}</p>
                    <div className="flex justify-between items-center mt-2 border-t border-outline-variant pt-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-success">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> {plan.assignedTo}
                      </div>
                      <button 
                        onClick={() => handleUpdateStatus(plan.id, 'Active')}
                        className="px-2 py-1 text-outline hover:text-error rounded text-xs font-medium transition-colors"
                      >
                        Batalkan Selesai
                      </button>
                    </div>
                  </div>
                ))}
                {completedPlans.length === 0 && <p className="text-center text-on-surface-variant text-sm py-4 italic">Belum ada Action Plan yang diselesaikan.</p>}
              </div>
            </div>
          </div>
        )}
        </>
      }
    />
  );
};
