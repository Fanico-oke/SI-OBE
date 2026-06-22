import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { ArchivedBanner } from '../components/ArchivedBanner';
import { useCurriculumStore } from '../store/useCurriculumStore';

export const CheckLaporanEvaluasi = () => {
  const { activeCurriculumId } = useCurriculumStore();
  const [cplData, setCplData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/check/cpl-attainment${activeCurriculumId ? `?kurikulumId=${activeCurriculumId}` : ''}`);
        setCplData(res.data);
      } catch (e) {
        console.error('Failed to fetch CPL data', e);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeCurriculumId]);

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/api/check/export-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Laporan_Capaian_CPL.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      alert('Gagal mengunduh Excel');
    }
  };

  const handleExportPdf = () => {
    window.print(); // Simple browser print to PDF
  };

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
          <Link to="/check/audit" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Audit Capaian</Link>
          <Link to="/check/laporan" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Laporan Evaluasi</Link>
          <Link to="/check/feedback" className="tab-inactive py-3 whitespace-nowrap px-4 border-b-2 border-transparent -mb-px">Feedback & Rekomendasi</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
        <ArchivedBanner returnPath="/check" />
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="section-title gap-3">
              <span className="text-primary">📑</span> Daftar Capaian CPL & Laporan
            </h2>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Unduh Excel
            </button>
            <button onClick={handleExportPdf} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span> Generate Laporan PDF
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-h1 font-bold mb-2">Laporan Rekapitulasi Capaian Pembelajaran Lulusan (CPL)</h1>
          <p className="text-on-surface-variant">Sistem Informasi Outcome-Based Education (SI-OBE)</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>CPL Code</th>
                  <th className="w-1/3">Deskripsi</th>
                  <th className="text-center">Tingkat Capaian</th>
                  <th className="text-center">Status Lulus</th>
                </tr>
              </thead>
              <tbody>
                {cplData.filter(d => d.hasData).map((cpl: any) => {
                  const isFail = cpl.attainment < cpl.target;
                  return (
                    <tr key={cpl.kode} className={isFail ? 'bg-error/5' : ''}>
                      <td className={`td-code font-bold ${isFail ? 'text-error' : 'text-on-surface'}`}>{cpl.kode}</td>
                      <td>{cpl.deskripsi}</td>
                      <td className="text-center">
                        <span className={`font-bold ${isFail ? 'text-error' : 'text-secondary'}`}>{cpl.attainment}%</span>
                        <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${isFail ? 'bg-error' : 'bg-secondary'}`} style={{ width: `${cpl.attainment}%` }}></div>
                        </div>
                      </td>
                      <td className="text-center">
                        {isFail ? (
                          <span className="badge-error">DI BAWAH TARGET</span>
                        ) : (
                          <span className="badge-neutral">MEMENUHI TARGET</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {cplData.filter(d => d.hasData).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-on-surface-variant">Belum ada data nilai riil untuk dievaluasi.</td>
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
