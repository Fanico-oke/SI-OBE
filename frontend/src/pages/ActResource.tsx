import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';

export const ActResource = () => {
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActionPlans();
  }, []);

  const fetchActionPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/act/action-plan');
      setActionPlans(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
          <Link to="/act" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Tindakan Perbaikan</Link>
          <Link to="/act/monitoring" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Monitoring Perbaikan</Link>
          <Link to="/act/dokumentasi" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Dokumentasi Kegiatan</Link>
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
                <li><div className="flex items-center"><span className="material-symbols-outlined text-body mx-1">chevron_right</span><span className="text-primary font-medium">Resource Management</span></div></li>
              </ol>
            </nav>
            <h2 className="section-title gap-3">
              <span className="text-primary">💼</span> Resource Management
            </h2>
            <p className="page-subtitle">Alokasi dana atau sumber daya untuk mendukung pelaksanaan Action Plan Dosen.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Memuat data...</div>
        ) : (
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Usulan Perbaikan (Action Plan)</th>
                  <th>Pengusul</th>
                  <th>Kebutuhan Resource</th>
                  <th className="w-32">Status Approval</th>
                </tr>
              </thead>
              <tbody>
                {actionPlans.filter(a => a.priority === 'High' || a.priority === 'Medium').map((plan: any) => (
                  <tr key={plan.id}>
                    <td>
                      <div className="font-bold">{plan.title}</div>
                      <div className="text-xs text-on-surface-variant mt-1 line-clamp-1">{plan.context}</div>
                    </td>
                    <td className="font-medium">{plan.assignedTo}</td>
                    <td>
                      <span className="badge-neutral">Dana / Modul Praktek Tambahan</span>
                    </td>
                    <td>
                      <button className="table-action-primary">Approve</button>
                    </td>
                  </tr>
                ))}
                {actionPlans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-on-surface-variant italic">Belum ada kebutuhan resource dari Action Plan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        </>
      }
    />
  );
};
