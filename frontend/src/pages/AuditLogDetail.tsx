import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

interface ActionPlanDetail {
  id: string;
  kurikulumId: string;
  title: string;
  context: string;
  assignedTo: string;
  priority: string;
  status: string;
  cplId: string | null;
  cpl: {
    id: string;
    kode: string;
    deskripsi: string;
    kategori: string | null;
  } | null;
  kurikulum: {
    id: string;
    nama: string;
    prodi: string;
    tahunMulai: number;
    tahunSelesai: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export const AuditLogDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ActionPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/act/action-plan/${id}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return 'badge-error';
      case 'Medium': return 'badge-warning';
      case 'Low': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'badge-success';
      case 'Active': return 'badge-primary';
      default: return 'badge-neutral';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="w-full card p-0 overflow-hidden">
          <header className="flex items-center justify-between px-padding_card py-5 border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="bg-primary-container/10 p-2.5 rounded-lg">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
              </div>
              <div>
                <h2 className="section-title">Log Detail</h2>
                <p className="font-data-mono text-caption text-on-surface-variant tracking-wider uppercase">Memuat...</p>
              </div>
            </div>
          </header>
          <div className="p-padding_card">
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
              <p className="text-on-surface-variant">Memuat detail log...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="w-full space-y-4">
        <div className="w-full card p-0 overflow-hidden">
          <header className="flex items-center justify-between px-padding_card py-5 border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="bg-error/10 p-2.5 rounded-lg">
                <span className="material-symbols-outlined text-error">error</span>
              </div>
              <div>
                <h2 className="section-title">Log Detail</h2>
                <p className="font-data-mono text-caption text-error tracking-wider uppercase">Error</p>
              </div>
            </div>
            <button
              className="btn-icon p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
              onClick={() => navigate('/audit-log')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>
          <div className="p-padding_card">
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-4xl text-error">cloud_off</span>
              <p className="text-on-surface-variant">{error || 'Data tidak ditemukan.'}</p>
              <Link to="/audit-log">
                <button className="btn-primary px-6 py-2 rounded-lg mt-2">← Kembali ke Audit Log</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const txId = data.id.substring(0, 8).toUpperCase();

  return (
    <div className="w-full space-y-4">
      {/* Modal Container (Bento/Card Layout) */}
      <div className="w-full card p-0 overflow-hidden">
        {/* Header Section */}
        <header className="flex items-center justify-between px-padding_card py-5 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-4">
            <div className="bg-primary-container/10 p-2.5 rounded-lg">
 <span className="material-symbols-outlined text-primary">receipt_long</span>
            </div>
            <div>
              <h2 className="section-title">Log Detail</h2>
              <p className="font-data-mono text-caption text-on-surface-variant tracking-wider uppercase">TXID: {txId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
              onClick={() => window.print()}
            >
 <span className="material-symbols-outlined ">print</span>
              Print Log
            </button>
            <button
              className="btn-icon p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
              onClick={() => navigate('/audit-log')}
            >
 <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="p-padding_card space-y-gap_section">
          {/* Summary Section (Bento Row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
              <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wide">
 <span className="material-symbols-outlined text-body">calendar_today</span>
                Timestamp
              </span>
              <p className="font-data-mono text-body font-medium text-on-surface">{formatDate(data.createdAt)}</p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
              <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wide">
 <span className="material-symbols-outlined text-body">person</span>
                User (Assigned To)
              </span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-caption  font-bold border border-outline-variant">
                  {getInitials(data.assignedTo)}
                </div>
                <p className="font-body text-body font-semibold text-on-surface">{data.assignedTo}</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
              <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wide">
 <span className="material-symbols-outlined text-body">bolt</span>
                Status & Priority
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={getStatusBadge(data.status)}>{data.status}</span>
                <span className={getPriorityBadge(data.priority)}>{data.priority} Priority</span>
              </div>
            </div>
          </div>

          {/* Action Plan Detail Section */}
          <section className="space-y-4">
            <h3 className="section-title">
 <span className="material-symbols-outlined text-secondary">description</span>
              Detail Rencana Aksi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant rounded-xl border border-outline-variant overflow-hidden shadow-card">
              {/* Title & Context */}
              <div className="bg-surface-container-lowest p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-neutral text-caption font-bold uppercase">Title</span>
                </div>
                <div className="space-y-3 font-data-mono text-[13px] text-on-surface bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <p className="font-medium">{data.title}</p>
                </div>
              </div>
              {/* Context */}
              <div className="bg-surface p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-primary text-caption font-bold uppercase">Context / Catatan</span>
                </div>
                <div className="space-y-3 font-data-mono text-[13px] text-on-surface-variant bg-secondary/5 p-4 rounded-lg border border-secondary/10">
                  <p>{data.context || 'Tidak ada catatan konteks.'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CPL Information Section */}
          <section className="space-y-4">
            <h3 className="section-title">
 <span className="material-symbols-outlined text-secondary">psychology</span>
              CPL Terkait
            </h3>
            {data.cpl ? (
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge-primary text-caption font-bold">{data.cpl.kode}</span>
                  {data.cpl.kategori && (
                    <span className="badge-neutral text-caption">{data.cpl.kategori}</span>
                  )}
                </div>
                <p className="font-data-mono text-[13px] text-on-surface-variant leading-relaxed">
                  {data.cpl.deskripsi}
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-2xl text-outline mb-1">link_off</span>
                <p className="text-on-surface-variant text-sm">Tidak ada CPL yang dikaitkan dengan action plan ini.</p>
              </div>
            )}
          </section>

          {/* Metadata Section */}
          <section className="bg-surface-container-highest/30 rounded-xl p-6 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/30 pb-2">
 <span className="material-symbols-outlined text-on-surface-variant">info</span>
              <h3 className="font-body text-body font-bold text-on-surface uppercase tracking-widest">Metadata</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Action Plan ID</span>
                <span className="font-data-mono text-body text-on-surface">{data.id}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Kurikulum</span>
                <span className="font-data-mono text-body text-on-surface">
                  {data.kurikulum ? data.kurikulum.nama : data.kurikulumId.substring(0, 8)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Program Studi</span>
                <span className="font-data-mono text-body text-on-surface">
                  {data.kurikulum ? data.kurikulum.prodi : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Tahun Kurikulum</span>
                <span className="font-data-mono text-body text-on-surface">
                  {data.kurikulum ? `${data.kurikulum.tahunMulai} - ${data.kurikulum.tahunSelesai}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Dibuat</span>
                <span className="font-data-mono text-body text-on-surface">{formatDate(data.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-on-surface-variant font-medium text-caption uppercase">Terakhir Diubah</span>
                <span className="font-data-mono text-body text-on-surface">{formatDate(data.updatedAt)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <footer className="px-padding_card py-6 bg-surface-container-low border-t border-outline-variant flex justify-between items-center gap-3">
          <Link to="/audit-log">
            <button className="btn-secondary px-6 py-2.5 rounded-lg active:scale-95">
              ← Kembali ke Audit Log
            </button>
          </Link>
          <button className="btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2 active:scale-95">
 <span className="material-symbols-outlined ">file_download</span>
            Export CSV
          </button>
        </footer>
      </div>
    </div>
  );
};
