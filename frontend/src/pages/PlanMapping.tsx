import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import axios from 'axios';
import { PhaseLayout } from '../components/layout/PhaseLayout';
import { sortByKode } from '../utils/naturalSort';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';
import { ArchivedBanner } from '../components/ArchivedBanner';

interface PLData { id: string; kode: string; deskripsi: string; }
interface CPLData { id: string; kode: string; deskripsi: string; }
interface BKData { id: string; kode: string; nama: string; }
interface MKData { id: string; kode: string; nama: string; sks: number; semester: number; tipe: string; }
interface SnDiktiData { id: string; kode: string; deskripsi: string; }
interface CPMKData { id: string; kode: string; deskripsi: string; cplId: string; }
interface Mapping { id: string; plId?: string; cplId?: string; bkId?: string; mkId?: string; snDiktiId?: string; cpmkId?: string; }

const API = '';

export const PlanMapping = () => {
  const { activeCurriculumId: id, activeCurriculumStatus } = useCurriculumStore();
  const { user } = useAuthStore();
  const isReadOnly = user?.role === 'DOSEN' || activeCurriculumStatus === 'ARCHIVED';
  const { addToast } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pl-cpl'|'cpl-bk'|'bk-mk'|'cpl-mk'|'sn-dikti-cpl'|'pl-mk'|'mk-cpmk'>('pl-cpl');
  const [syncing, setSyncing] = useState(false);

  const handleSyncToDo = async () => {
    if (!id) return;
    setSyncing(true);
    try {
      const res = await axios.post(`${API}/api/pemetaan/sync-to-do`, { kurikulumId: id });
      addToast(res.data.message, 'success');
      // Refresh MK↔CPMK data
      const mkCpmkRes = await axios.get(`${API}/api/pemetaan/mk-cpmk?kurikulumId=${id}`);
      setMapMkCpmk(mkCpmkRes.data);
    } catch {
      addToast('Gagal sinkronisasi ke Do', 'error');
    } finally {
      setSyncing(false);
    }
  };
  
  const [plList, setPlList] = useState<PLData[]>([]);
  const [cplList, setCplList] = useState<CPLData[]>([]);
  const [bkList, setBkList] = useState<BKData[]>([]);
  const [mkList, setMkList] = useState<MKData[]>([]);
  const [snDiktiList, setSnDiktiList] = useState<SnDiktiData[]>([]);
  const [cpmkList, setCpmkList] = useState<CPMKData[]>([]);
  
  const [mapPlCpl, setMapPlCpl] = useState<Mapping[]>([]);
  const [mapCplBk, setMapCplBk] = useState<Mapping[]>([]);
  const [mapBkMk, setMapBkMk] = useState<Mapping[]>([]);
  const [mapCplMk, setMapCplMk] = useState<Mapping[]>([]);
  const [mapSnDiktiCpl, setMapSnDiktiCpl] = useState<Mapping[]>([]);
  const [mapPlMk, setMapPlMk] = useState<Mapping[]>([]);
  const [mapMkCpmk, setMapMkCpmk] = useState<Mapping[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        const q = `?kurikulumId=${id}`;
        const [pl, cpl, bk, mk, sn, cpmk, m0, m1, m2, m3, m4, m5, m6] = await Promise.all([
          axios.get(`${API}/api/profil-lulusan${q}`),
          axios.get(`${API}/api/cpl${q}`),
          axios.get(`${API}/api/bahan-kajian${q}`),
          axios.get(`${API}/api/mata-kuliah${q}`),
          axios.get(`${API}/api/cpl-sn-dikti${q}`),
          axios.get(`${API}/api/cpmk${q}`),
          axios.get(`${API}/api/pemetaan/pl-cpl${q}`),
          axios.get(`${API}/api/pemetaan/cpl-bk${q}`),
          axios.get(`${API}/api/pemetaan/bk-mk${q}`),
          axios.get(`${API}/api/pemetaan/cpl-mk${q}`),
          axios.get(`${API}/api/pemetaan/sn-dikti-cpl${q}`),
          axios.get(`${API}/api/pemetaan/pl-mk${q}`),
          axios.get(`${API}/api/pemetaan/mk-cpmk${q}`)
        ]);
        setPlList(pl.data); setCplList(cpl.data); setBkList(bk.data); setMkList(mk.data);
        setSnDiktiList(sn.data); setCpmkList(cpmk.data);
        setMapPlCpl(m0.data); setMapCplBk(m1.data); setMapBkMk(m2.data); setMapCplMk(m3.data);
        setMapSnDiktiCpl(m4.data); setMapPlMk(m5.data); setMapMkCpmk(m6.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  const hasMap = (list: Mapping[], key1: string, val1: string, key2: string, val2: string) =>
    list.some((m: any) => m[key1] === val1 && m[key2] === val2);

  const toggleMap = async (endpoint: string, mapState: Mapping[], setMapState: any, body: any) => {
    try {
      const res = await axios.post(`${API}/api/pemetaan/${endpoint}/toggle`, body);
      if (res.data.action === 'added') {
        setMapState([...mapState, { id: Date.now().toString(), ...body }]);
      } else {
        const keys = Object.keys(body);
        setMapState(mapState.filter((m: any) => !(m[keys[0]] === body[keys[0]] && m[keys[1]] === body[keys[1]])));
      }
    } catch (e) { console.error(e); }
  };

  const tabs = [
    { key: 'sn-dikti-cpl' as const, label: 'SN-DIKTI ↔ CPL', count: mapSnDiktiCpl.length },
    { key: 'pl-cpl' as const, label: 'PL ↔ CPL', count: mapPlCpl.length },
    { key: 'cpl-bk' as const, label: 'CPL ↔ BK', count: mapCplBk.length },
    { key: 'bk-mk' as const, label: 'MK ↔ BK', count: mapBkMk.length },
    { key: 'cpl-mk' as const, label: 'CPL ↔ MK', count: mapCplMk.length },
    { key: 'pl-mk' as const, label: 'PL ↔ MK', count: mapPlMk.length },
    { key: 'mk-cpmk' as const, label: 'MK ↔ CPMK', count: mapMkCpmk.length }
  ];

  return (
    <PhaseLayout
      title="PLAN: Perencanaan Kurikulum"
      description="Lakukan pemetaan antara Profil Lulusan, CPL, Bahan Kajian, dan Mata Kuliah."
      icon="table_chart"
      iconBgColorClass="bg-secondary/10"
      iconTextColorClass="text-secondary"
      tabs={
        <>
          <Link to="/plan" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Profil & CPL</Link>
          <Link to="/plan/bkmk" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Bahan Kajian & Mata Kuliah</Link>
          <Link to="/plan/mapping" className="tab-active py-3 whitespace-nowrap px-4 -mb-px">Matriks Pemetaan</Link>
          <Link to="/plan/indikator" className="tab-inactive py-3 whitespace-nowrap px-4 -mb-px">Indikator Penilaian</Link>
        </>
      }
      sideContent={null}
      mainContent={
        <>
          <ArchivedBanner returnPath="/plan" />

        {isReadOnly && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30 text-warning flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            Mode Baca — Hubungi Kaprodi untuk mengubah data
          </div>
        )}

        {!isReadOnly && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleSyncToDo}
              disabled={syncing}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className={`material-symbols-outlined text-[20px] ${syncing ? 'animate-spin' : ''}`}>
                {syncing ? 'progress_activity' : 'sync'}
              </span>
              {syncing ? 'Menyinkronkan...' : 'Sinkronisasi ke Do'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Profil Lulusan', value: plList.length, icon: 'badge', color: 'primary' },
            { label: 'CPL Prodi', value: cplList.length, icon: 'school', color: 'secondary' },
            { label: 'Bahan Kajian', value: bkList.length, icon: 'menu_book', color: 'tertiary' },
            { label: 'Mata Kuliah', value: mkList.length, icon: 'class', color: 'primary' }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon bg-${s.color}/10`}>
                <span className={`material-symbols-outlined text-${s.color}`}>{s.icon}</span>
              </div>
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-outline-variant mb-6">
          <nav className="flex gap-1 overflow-x-auto no-scrollbar pb-px">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-body text-sm font-medium transition-colors shrink-0 ${
                  activeTab === t.key
                    ? 'border-primary text-primary -mb-px'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline -mb-px'
                }`}>
                {t.label} <span className="ml-1 text-on-surface-variant font-caption text-xs bg-surface-container px-1.5 py-0.5 rounded">{t.count}</span>
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
        ) : (
          <div className="card p-4 overflow-hidden relative" style={{ isolation: 'isolate' }}>
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto relative">
              {activeTab === 'pl-cpl' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>CPL \ PL</th>
                      {sortByKode(plList).map(pl => (
                        <th key={pl.id} title={pl.deskripsi}>{pl.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(cplList).map(cpl => (
                      <tr key={cpl.id}>
                        <td title={cpl.deskripsi}>{cpl.kode}</td>
                        {sortByKode(plList).map(pl => {
                          const isActive = hasMap(mapPlCpl, 'plId', pl.id, 'cplId', cpl.id);
                          return (
                            <td key={pl.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('pl-cpl', mapPlCpl, setMapPlCpl, { plId: pl.id, cplId: cpl.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'cpl-bk' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>CPL \ BK</th>
                      {sortByKode(bkList).map(bk => (
                        <th key={bk.id} title={bk.nama}>{bk.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(cplList).map(cpl => (
                      <tr key={cpl.id}>
                        <td title={cpl.deskripsi}>{cpl.kode}</td>
                        {sortByKode(bkList).map(bk => {
                          const isActive = hasMap(mapCplBk, 'cplId', cpl.id, 'bkId', bk.id);
                          return (
                            <td key={bk.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('cpl-bk', mapCplBk, setMapCplBk, { cplId: cpl.id, bkId: bk.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'bk-mk' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>MK \ BK</th>
                      {sortByKode(bkList).map(bk => (
                        <th key={bk.id} title={bk.nama}>{bk.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(mkList).map(mk => (
                      <tr key={mk.id}>
                        <td title={mk.nama}>{mk.kode}</td>
                        {sortByKode(bkList).map(bk => {
                          const isActive = hasMap(mapBkMk, 'bkId', bk.id, 'mkId', mk.id);
                          return (
                            <td key={bk.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('bk-mk', mapBkMk, setMapBkMk, { bkId: bk.id, mkId: mk.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'cpl-mk' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>MK \ CPL</th>
                      {sortByKode(cplList).map(cpl => (
                        <th key={cpl.id} title={cpl.deskripsi}>{cpl.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(mkList).map(mk => (
                      <tr key={mk.id}>
                        <td title={mk.nama}>{mk.kode}</td>
                        {sortByKode(cplList).map(cpl => {
                          const isActive = hasMap(mapCplMk, 'cplId', cpl.id, 'mkId', mk.id);
                          return (
                            <td key={cpl.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('cpl-mk', mapCplMk, setMapCplMk, { cplId: cpl.id, mkId: mk.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'sn-dikti-cpl' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>CPL \ SN-DIKTI</th>
                      {sortByKode(snDiktiList).map(sn => (
                        <th key={sn.id} title={sn.deskripsi}>{sn.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(cplList).map(cpl => (
                      <tr key={cpl.id}>
                        <td title={cpl.deskripsi}>{cpl.kode}</td>
                        {sortByKode(snDiktiList).map(sn => {
                          const isActive = hasMap(mapSnDiktiCpl, 'cplId', cpl.id, 'snDiktiId', sn.id);
                          return (
                            <td key={sn.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('sn-dikti-cpl', mapSnDiktiCpl, setMapSnDiktiCpl, { cplId: cpl.id, snDiktiId: sn.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'pl-mk' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>MK \ PL</th>
                      {sortByKode(plList).map(pl => (
                        <th key={pl.id} title={pl.deskripsi}>{pl.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(mkList).map(mk => (
                      <tr key={mk.id}>
                        <td title={mk.nama}>{mk.kode}</td>
                        {sortByKode(plList).map(pl => {
                          const isActive = hasMap(mapPlMk, 'mkId', mk.id, 'plId', pl.id);
                          return (
                            <td key={pl.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('pl-mk', mapPlMk, setMapPlMk, { mkId: mk.id, plId: pl.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'mk-cpmk' && (
                <table className="table-matrix">
                  <thead className="sticky top-0 z-[2]">
                    <tr>
                      <th>CPMK \ MK</th>
                      {sortByKode(mkList).map(mk => (
                        <th key={mk.id} title={mk.nama}>{mk.kode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortByKode(cpmkList).map(cpmk => (
                      <tr key={cpmk.id}>
                        <td title={cpmk.deskripsi}>{cpmk.kode}</td>
                        {sortByKode(mkList).map(mk => {
                          const isActive = hasMap(mapMkCpmk, 'cpmkId', cpmk.id, 'mkId', mk.id);
                          return (
                            <td key={mk.id}>
                              <div 
                                onClick={() => !isReadOnly && toggleMap('mk-cpmk', mapMkCpmk, setMapMkCpmk, { cpmkId: cpmk.id, mkId: mk.id })}
                                className={`w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all duration-300 shadow-sm ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive ? 'bg-primary border-primary text-on-primary shadow-primary/30' + (!isReadOnly ? ' hover:scale-110' : '') : 'bg-surface-container-low border-outline-variant text-transparent' + (!isReadOnly ? ' hover:border-primary/50 hover:bg-primary/5' : '')}`}>
                                {isActive && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        </>
      }
    />
  );
};
