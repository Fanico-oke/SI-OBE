import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useActionStore } from '../store/useActionStore';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAppStore } from '../store/useAppStore';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';

export const ActPhase = () => {
  const { actions, addAction, fetchActions, updateActionStatus } = useActionStore();
  const { addToast } = useAppStore();
  const { curriculums, activeCurriculumId, fetchCurriculums } = useCurriculumStore();

  const [cplData, setCplData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkCompleted, setCheckCompleted] = useState(true); // assume true to avoid flash

  // Form State
  const [selectedCpl, setSelectedCpl] = useState<any>(null);
  const [newAction, setNewAction] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (!activeCurriculumId) fetchCurriculums();
  }, []);

  useEffect(() => {
    if (activeCurriculumId) fetchData();
  }, [activeCurriculumId]);

  useEffect(() => {
    if (!activeCurriculumId) return;
    axios.get(`/api/check/status?kurikulumId=${activeCurriculumId}`)
      .then(res => setCheckCompleted(res.data.completed))
      .catch(() => {});
  }, [activeCurriculumId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/act/cpl-red-flags?kurikulumId=${activeCurriculumId}`);
      setCplData(res.data);
      await fetchActions(activeCurriculumId || undefined);
    } catch (e: any) {
      console.error('Act fetchData error:', e.response?.status, e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async () => {
    if (!selectedCpl) {
      addToast('Pilih CPL dari Papan Evaluasi terlebih dahulu.', 'error');
      return;
    }
    if (!newAction || !assignee) {
      addToast('Harap isi semua kolom Action Plan.', 'error');
      return;
    }
    
    try {
      await addAction({
        kurikulumId: activeCurriculumId || curriculums[0]?.id || '',
        title: newAction,
        context: `Perbaikan untuk kegagalan target ${selectedCpl.kode} (${selectedCpl.attainment}%)`,
        assignedTo: assignee,
        priority: 'High',
        cplId: selectedCpl.id
      });
      setNewAction('');
      setAssignee('');
      setSelectedCpl(null);
      addToast('Rencana tindak lanjut berhasil dibuat!', 'success');
      fetchActions();
    } catch (e) {
      addToast('Gagal menambahkan action plan.', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateActionStatus(id, 'Completed');
      addToast('Status Action Plan diperbarui menjadi Completed!', 'success');
    } catch (e) {
      addToast('Gagal update status.', 'error');
    }
  };

  return (
    <PhaseLayout
      title="ACT: Pusat Tindak Lanjut (CQI)"
      description="Delegasikan perbaikan kurikulum secara berkelanjutan dan pantau rekam jejak penyelesaian isu kritis."
      icon="change_circle"
      iconBgColorClass="bg-error/10"
      iconTextColorClass="text-error"
      tabs={
        <>
          <Link to="/act" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Tindakan Perbaikan</Link>
          <Link to="/act/monitoring" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Monitoring Perbaikan</Link>
          <Link to="/act/dokumentasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Dokumentasi Kegiatan</Link>
          <Link to="/act/finalisasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Finalisasi</Link>
        </>
      }
      mainContent={
        <>
          <ArchivedBanner returnPath="/act" />
          {!checkCompleted && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-3 bg-warning/10 border border-warning/30 text-warning">
              <span className="material-symbols-outlined text-[22px]">warning</span>
              <div className="flex-1">
                <strong>Check belum ditandai selesai.</strong>
                <span className="text-on-surface-variant text-sm ml-1">Disarankan review evaluasi CPL terlebih dahulu sebelum membuat Action Plan.</span>
              </div>
              <Link to="/check" className="shrink-0">
                <button className="px-3 py-1.5 rounded-lg bg-warning text-white font-caption text-caption font-medium hover:bg-warning/90 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Ke Check
                </button>
              </Link>
            </div>
          )}
          {/* Pillar 1: Papan Evaluasi (To-Do List) */}
          <div className="card p-0 overflow-hidden flex flex-col">
            <div className="bg-error-container p-4 border-b border-error/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-error-container">
                <span className="material-symbols-outlined">assignment_late</span>
                <h3 className="font-bold">Papan Evaluasi (CPL Kritis)</h3>
              </div>
              <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-xs font-bold">{cplData.length} Isu</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-error"></div></div>
              ) : cplData.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined text-4xl text-success mb-2">check_circle</span>
                  <p className="font-bold text-on-surface">Tidak ada CPL kritis.</p>
                  <p className="text-sm text-on-surface-variant">Kurikulum berjalan dengan baik.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cplData.map((cpl) => (
                    <div 
                      key={cpl.kode} 
                      onClick={() => setSelectedCpl(cpl)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCpl?.kode === cpl.kode ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' : 'border-error/20 bg-error/5 hover:border-error/50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-error">{cpl.kode}</span>
                        <span className="text-xs font-bold text-error">Capaian: {cpl.attainment}% / {cpl.target}%</span>
                      </div>
                      <p className="text-sm text-on-surface line-clamp-2">{cpl.deskripsi}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pillar 3: Log Perubahan Kurikulum */}
          <div className="card p-0 overflow-hidden mt-8">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              <h3 className="font-bold text-on-surface">Log Perubahan Kurikulum (Bukti CQI Asesor)</h3>
            </div>
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="w-1/4">Tindakan / Rencana</th>
                  <th>Konteks Isu</th>
                  <th className="text-center">PIC</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi Lanjutan</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <p className="font-bold text-on-surface">{act.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{new Date(act.createdAt).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="text-on-surface-variant">{act.context}</td>
                    <td className="text-center font-medium">{act.assignedTo}</td>
                    <td className="text-center">
                      {act.status === 'Completed' ? (
                        <span className="badge-success">Completed</span>
                      ) : (
                        <span className="badge-tertiary">Active</span>
                      )}
                    </td>
                    <td className="text-center">
                      {act.status === 'Active' ? (
                        <button 
                          onClick={() => handleComplete(act.id)}
                          className="table-action-primary"
                        >
                          Tandai Selesai
                        </button>
                      ) : (
                        <span className="material-symbols-outlined text-success opacity-50">verified</span>
                      )}
                    </td>
                  </tr>
                ))}
                {actions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-on-surface-variant">Belum ada rekam jejak perubahan kurikulum.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      }
      sideContent={
        <>
          {/* Pillar 2: Form Rencana Aksi */}
          <div className="card p-0 flex flex-col h-full">
            <div className="bg-surface-container p-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              <h3 className="font-bold text-on-surface">Form Rencana Aksi</h3>
            </div>
            <div className="p-6 space-y-4">
              {!selectedCpl ? (
                <div className="h-full flex items-center justify-center p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-lg">
                  <p>Klik salah satu kartu merah di Papan Evaluasi untuk mulai mendelegasikan perbaikan.</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm mb-4">
                    <span className="font-bold text-primary">Fokus Perbaikan:</span> Menyelesaikan kegagalan <strong>{selectedCpl.kode}</strong> (Capaian hanya {selectedCpl.attainment}%).
                  </div>

                  <div>
                    <label className="input-label">Rencana Konkret (Usulan Dosen)</label>
                    <textarea 
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      className="input-base w-full min-h-[100px]" 
                      placeholder="Contoh: Untuk semester depan, metode praktek akan ditambah bobotnya menjadi 60%..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="input-label">Tugaskan Kepada (PIC)</label>
                    <input 
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="input-base w-full" 
                      placeholder="Nama Dosen / Kode Dosen"
                    />
                  </div>

                  <button 
                    onClick={handleAddAction}
                    className="btn-primary w-full py-3 rounded-xl font-bold mt-4 flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    Delegasikan Rencana
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      }
    />
  );
};
