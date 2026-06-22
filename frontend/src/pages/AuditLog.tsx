import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActionStore } from '../store/useActionStore';
import axios from 'axios';

export function AuditLog() {
  const { actions, fetchActions, isLoading } = useActionStore();
  const [mkList, setMkList] = useState<any[]>([]);
  const [cplList, setCplList] = useState<any[]>([]);
  const [filterCpl, setFilterCpl] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    fetchActions();
    // Fetch real MK & CPL data for filters
    axios.get('/api/mata-kuliah').then(r => setMkList(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    axios.get('/api/cpl').then(r => setCplList(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [fetchActions]);

  // Filter actions
  const filtered = actions.filter(act => {
    if (filterCpl && act.cpl?.kode !== filterCpl) return false;
    if (filterPriority && act.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="w-full space-y-4">

      <div className="space-y-6">
          
          {/* Smart Filters */}
          <div className="card flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <select className="input-base px-3 py-2 text-sm" value={filterCpl} onChange={e => setFilterCpl(e.target.value)}>
                <option value="">Semua CPL</option>
                {cplList.map(c => (
                  <option key={c.id} value={c.kode}>{c.kode} — {c.deskripsi?.substring(0, 40)}...</option>
                ))}
              </select>
              <select className="input-base px-3 py-2 text-sm" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="">Semua Prioritas</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
            <button onClick={() => alert('Mengekspor Borang Akreditasi...')} className="btn-primary w-full sm:w-auto px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">download</span> Export Borang
            </button>
          </div>

          {/* Timeline View */}
          <div className="card p-6 md:p-8">
            <h3 className="section-title mb-8">Jejak CQI (Continuous Quality Improvement)</h3>
            
            {isLoading ? (
              <div className="p-8 text-center text-on-surface-variant">Memuat Log Audit...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state p-8 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline">history_toggle_off</span>
                <p>{actions.length > 0 ? 'Tidak ada log yang sesuai filter.' : 'Belum ada Log Rencana Aksi (Audit Trail) yang tercatat.'}</p>
              </div>
            ) : (
              <div className="relative pl-6 md:pl-8 border-l-2 border-outline-variant/50 space-y-8">
                {filtered.map((act, index) => {
                  const isResolved = act.status === 'Completed';
                  const isHighPriority = act.priority === 'High';
                  
                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[35px] md:-left-[43px] w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm ring-4 ring-surface-container-lowest transition-transform group-hover:scale-110 ${
                        isResolved ? 'bg-success text-on-success' : 
                        isHighPriority ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[12px] md:text-[14px]">
                          {isResolved ? 'check' : 'build'}
                        </span>
                      </div>

                      {/* Timeline Card */}
                      <div className={`card transition-all duration-300 hover:shadow-md ${
                        isResolved ? 'border-success/30 hover:border-success/50' : 
                        isHighPriority ? 'border-error/30 hover:border-error/50' : 'border-outline-variant hover:border-primary/40'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-data-mono text-xs text-on-surface-variant font-bold">
                                {new Date(act.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                act.priority === 'High' ? 'badge-error' : act.priority === 'Medium' ? 'badge-tertiary' : 'badge-success'
                              }`}>{act.priority}</span>
                              {isResolved && (
                                <span className="badge-success text-[10px]">Resolved</span>
                              )}
                            </div>
                            <h4 className="font-h4 text-h4 text-on-surface leading-tight">{act.title}</h4>
                          </div>
                          
                          <div className="shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-sm font-medium">
                              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                              {act.assignedTo}
                            </span>
                          </div>
                        </div>

                        <p className="text-body font-body text-on-surface-variant mb-4 leading-relaxed">
                          {act.context || 'Tidak ada catatan konteks untuk tindakan ini.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/5 text-primary text-xs font-medium border border-primary/10" title="Transaction ID">
                            <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                            Trx: {act.id.substring(0,8).toUpperCase()}
                          </span>
                          {act.cpl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary-container/50 text-on-secondary-container text-xs font-medium border border-secondary-container">
                              <span className="material-symbols-outlined text-[14px]">psychology</span>
                              {act.cpl.kode || 'CPL Terkait'}
                            </span>
                          )}
                          <Link to={`/audit-log/${act.id}`} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:bg-primary/20 transition-colors ml-auto">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
