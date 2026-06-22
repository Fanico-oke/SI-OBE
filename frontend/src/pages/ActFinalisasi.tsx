import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAppStore } from '../store/useAppStore';

interface PDCASummary {
  plan: { cplCount: number; cpmkCount: number; mkCount: number; ready: boolean };
  do: { kelasTotal: number; kelasWithNilai: number; ready: boolean };
  check: { cplTotal: number; cplWithData: number; cplLulus: number; cplGagal: number; feedbackCount: number; ready: boolean };
  act: { actTotal: number; actCompleted: number; actActive: number; dokCount: number; ready: boolean };
}

export const ActFinalisasi = () => {
  const { activeCurriculumId, activeCurriculumStatus, fetchCurriculums } = useCurriculumStore();
  const { addToast } = useAppStore();
  const navigate = useNavigate();

  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [pdca, setPdca] = useState<PDCASummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (activeCurriculumId) {
      fetchAll();
    }
  }, [activeCurriculumId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apRes, pdcaRes] = await Promise.all([
        axios.get(`/api/act/action-plan?kurikulumId=${activeCurriculumId}`),
        axios.get(`/api/act/pdca-summary?kurikulumId=${activeCurriculumId}`)
      ]);
      setActionPlans(apRes.data);
      setPdca(pdcaRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const completedPlans = actionPlans.filter(a => a.status === 'Completed');

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await axios.post('/api/act/archive', { kurikulumId: activeCurriculumId });
      addToast(res.data.message, 'success');
      setShowConfirm(false);
      await fetchCurriculums();
      navigate('/');
    } catch (e: any) {
      addToast(e.response?.data?.error || 'Gagal mengarsipkan', 'error');
    }
    setArchiving(false);
  };

  const isArchived = activeCurriculumStatus === 'ARCHIVED';

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
          <Link to="/act/monitoring" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Monitoring Perbaikan</Link>
          <Link to="/act/dokumentasi" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Dokumentasi Kegiatan</Link>
          <Link to="/act/finalisasi" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Finalisasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
        <ArchivedBanner returnPath="/act" />

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <>
            {/* PDCA Summary Cards */}
            {pdca && (
              <div className="mb-6">
                <h2 className="section-title flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">assessment</span>
                  Ringkasan Siklus PDCA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* PLAN */}
                  <div className={`card p-4 border-l-4 ${pdca.plan.ready ? 'border-l-success' : 'border-l-outline'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Plan</span>
                      {pdca.plan.ready ? (
                        <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{pdca.plan.cplCount} <span className="text-sm font-normal text-on-surface-variant">CPL</span></p>
                    <div className="text-xs text-on-surface-variant mt-1 space-y-0.5">
                      <p>{pdca.plan.cpmkCount} CPMK terdefinisi</p>
                      <p>{pdca.plan.mkCount} Mata Kuliah dipetakan</p>
                    </div>
                  </div>

                  {/* DO */}
                  <div className={`card p-4 border-l-4 ${pdca.do.ready ? 'border-l-success' : 'border-l-outline'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Do</span>
                      {pdca.do.ready ? (
                        <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{pdca.do.kelasWithNilai}<span className="text-sm font-normal text-on-surface-variant">/{pdca.do.kelasTotal} kelas</span></p>
                    <div className="text-xs text-on-surface-variant mt-1">
                      <p>Kelas yang sudah memiliki data nilai</p>
                    </div>
                  </div>

                  {/* CHECK */}
                  <div className={`card p-4 border-l-4 ${pdca.check.ready ? 'border-l-success' : 'border-l-outline'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Check</span>
                      {pdca.check.ready ? (
                        <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-on-surface">
                      <span className="text-success">{pdca.check.cplLulus}</span>
                      <span className="text-on-surface-variant text-sm font-normal mx-1">/</span>
                      <span className="text-error">{pdca.check.cplGagal}</span>
                    </p>
                    <div className="text-xs text-on-surface-variant mt-1 space-y-0.5">
                      <p>{pdca.check.cplLulus} CPL lulus, {pdca.check.cplGagal} CPL gagal target</p>
                      <p>{pdca.check.feedbackCount} catatan/rekomendasi</p>
                    </div>
                  </div>

                  {/* ACT */}
                  <div className={`card p-4 border-l-4 ${pdca.act.actTotal > 0 ? (pdca.act.actActive === 0 ? 'border-l-success' : 'border-l-warning') : 'border-l-outline'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Act</span>
                      {pdca.act.actTotal > 0 && pdca.act.actActive === 0 ? (
                        <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                      ) : pdca.act.actTotal > 0 ? (
                        <span className="material-symbols-outlined text-warning text-[20px]">hourglass_top</span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{pdca.act.actCompleted}<span className="text-sm font-normal text-on-surface-variant">/{pdca.act.actTotal} selesai</span></p>
                    <div className="text-xs text-on-surface-variant mt-1 space-y-0.5">
                      <p>{pdca.act.actActive} masih aktif</p>
                      <p>{pdca.act.dokCount} dokumentasi kegiatan</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document: Log Audit CQI */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  Dokumen Log Audit CQI
                </h2>
                <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  Cetak Laporan
                </button>
              </div>

              <div className="card p-6 lg:p-8">
                <div className="text-center mb-6 pb-4 border-b border-outline-variant">
                  <h1 className="text-h3 font-bold text-on-surface mb-1">LOG AUDIT & TINDAK LANJUT CQI</h1>
                  <h2 className="text-body text-on-surface-variant">DOKUMEN TINDAK LANJUT EVALUASI KURIKULUM</h2>
                </div>

                <div className="table-container">
                  <table className="table-modern">
                    <thead>
                      <tr>
                        <th className="text-center w-12">No</th>
                        <th className="w-44">Usulan Perbaikan</th>
                        <th>Latar Belakang (Temuan Check)</th>
                        <th className="w-36 text-center">PIC</th>
                        <th className="w-28 text-center">Tgl Selesai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPlans.map((plan: any, idx: number) => (
                        <tr key={plan.id}>
                          <td className="text-center text-on-surface-variant">{idx + 1}</td>
                          <td className="font-bold text-primary">{plan.title}</td>
                          <td className="text-on-surface-variant">{plan.context}</td>
                          <td className="text-center">
                            <span className="badge-secondary whitespace-nowrap">{plan.assignedTo}</span>
                          </td>
                          <td className="text-center td-mono">{new Date(plan.updatedAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                      {completedPlans.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-on-surface-variant italic">Belum ada Action Plan yang diselesaikan.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 flex justify-end">
                  <div className="text-center">
                    <p className="mb-14">Disetujui oleh,<br/>Ketua Program Studi</p>
                    <p className="font-bold underline text-sm">(......................................)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Archive Section */}
            {!isArchived && (
              <div className="card border-2 border-error/30 bg-error/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[28px]">lock</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-on-surface mb-1">Tutup Siklus & Arsipkan Kurikulum</h3>
                    <p className="text-sm text-on-surface-variant mb-3">
                      Tindakan ini akan mengubah status kurikulum aktif menjadi <strong>ARCHIVED</strong>. 
                      Semua data (Plan, Do, Check, Act) akan tetap tersimpan sebagai arsip dan <strong>tidak dapat diedit</strong> lagi. 
                      Ini menandakan satu siklus PDCA telah selesai.
                    </p>
                    <ul className="text-sm text-on-surface-variant space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-success">check</span>
                        Data kurikulum tetap tersimpan dan dapat dilihat
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-success">check</span>
                        Dokumen CQI tetap bisa dicetak
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-error">close</span>
                        Tidak bisa menambah/edit data setelah diarsipkan
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-warning">info</span>
                        Kurikulum baru harus dibuat manual di menu Kurikulum
                      </li>
                    </ul>

                    {!showConfirm ? (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="px-5 py-2.5 bg-error text-white font-bold rounded-xl hover:bg-error/90 transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">archive</span>
                        Arsipkan Kurikulum
                      </button>
                    ) : (
                      <div className="p-4 bg-surface rounded-xl border border-error/30">
                        <p className="font-bold text-error mb-3">⚠️ Apakah Anda yakin ingin mengarsipkan kurikulum ini?</p>
                        <p className="text-sm text-on-surface-variant mb-4">Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleArchive}
                            disabled={archiving}
                            className="px-4 py-2 bg-error text-white font-bold rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {archiving ? (
                              <><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Mengarsipkan...</>
                            ) : (
                              <><span className="material-symbols-outlined text-[16px]">check</span> Ya, Arsipkan Sekarang</>
                            )}
                          </button>
                          <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 bg-surface-variant text-on-surface-variant font-medium rounded-lg hover:bg-outline/20 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </>
      }
    />
  );
};
