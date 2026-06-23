import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useAppStore } from '../store/useAppStore';
import { Pagination } from '../components/ui/Pagination';

export function Laporan() {
  const navigate = useNavigate();
  const { addToast } = useAppStore();

  const [activeTab, setActiveTab] = useState<'ketercapaian'|'portofolio'|'evaluasi'|'cqi'>('ketercapaian');
  const [searchNim, setSearchNim] = useState('');
  const [mkPage, setMkPage] = useState(1);
  const mkPageSize = 10;
  
  // Real Data States
  const [cplData, setCplData] = useState<any[]>([]);
  const [mkEvaluasi, setMkEvaluasi] = useState<any[]>([]);
  const [portofolioData, setPortofolioData] = useState<any>(null);
  const [cqiData, setCqiData] = useState<any[]>([]);
  
  const currentYear = new Date().getFullYear();
  const [angkatan, setAngkatan] = useState(String(currentYear));
  const angkatanOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear; y++) years.push(y);
    return years;
  }, [currentYear]);

  const [semesterFilter, setSemesterFilter] = useState<'all'|'Ganjil'|'Genap'>('all');
  const [loadingCpl, setLoadingCpl] = useState(false);
  const [loadingMk, setLoadingMk] = useState(false);
  const [loadingCqi, setLoadingCqi] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch Ketercapaian CPL Angkatan
  useEffect(() => {
    if (activeTab === 'ketercapaian') {
      setLoadingCpl(true);
      axios.get(`/api/laporan/ketercapaian?angkatan=${angkatan}`)
        .then(res => setCplData(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingCpl(false));
    }
  }, [activeTab, angkatan]);

  // Fetch Evaluasi MK
  useEffect(() => {
    if (activeTab === 'evaluasi') {
      setLoadingMk(true);
      axios.get(`/api/laporan/evaluasi-mk`)
        .then(res => setMkEvaluasi(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingMk(false));
    }
  }, [activeTab]);

  // Fetch CQI
  useEffect(() => {
    if (activeTab === 'cqi') {
      setLoadingCqi(true);
      axios.get(`/api/act/action-plan`)
        .then(res => setCqiData(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingCqi(false));
    }
  }, [activeTab]);

  const handleSearchNim = async () => {
    if (searchNim.trim() === '') return;
    setSearchError('');
    setPortofolioData(null);
    try {
      const res = await axios.get(`/api/laporan/portofolio/${searchNim.trim()}`);
      setPortofolioData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) setSearchError('Mahasiswa dengan NIM tersebut tidak ditemukan.');
      else setSearchError('Terjadi kesalahan saat memuat portofolio.');
    }
  };

  const handleExportExcel = () => {
    if (activeTab === 'evaluasi') {
      const ws = XLSX.utils.json_to_sheet(mkEvaluasi);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Evaluasi_MK");
      XLSX.writeFile(wb, "Laporan_Evaluasi_MK.xlsx");
    } else if (activeTab === 'cqi') {
      const ws = XLSX.utils.json_to_sheet(cqiData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Log_CQI");
      XLSX.writeFile(wb, "Laporan_Log_CQI.xlsx");
    } else {
      addToast('Ekspor Excel hanya tersedia untuk tab Evaluasi MK dan Log CQI.', 'info');
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    try {
      const res = await axios.get('/api/laporan/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Laporan_OBE.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      addToast('Gagal mengunduh PDF laporan.', 'error');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-header flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
            Dashboard Laporan Akreditasi
          </h2>
          <p className="page-subtitle">4 Pilar Laporan Utama Ketercapaian Outcome-Based Education (OBE).</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined">table_view</span> Export Excel
          </button>
          <button onClick={handleExportPdf} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
          </button>
          <button onClick={handlePrintPdf} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined">print</span> Cetak PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-outline-variant gap-8 px-2">
        <button onClick={() => setActiveTab('ketercapaian')} className={`pb-4 text-body font-bold transition-colors whitespace-nowrap ${activeTab === 'ketercapaian' ? 'tab-active' : 'tab-inactive'}`}>1. Ketercapaian Lulusan</button>
        <button onClick={() => setActiveTab('portofolio')} className={`pb-4 text-body font-bold transition-colors whitespace-nowrap ${activeTab === 'portofolio' ? 'tab-active' : 'tab-inactive'}`}>2. Portofolio (SKPI)</button>
        <button onClick={() => setActiveTab('evaluasi')} className={`pb-4 text-body font-bold transition-colors whitespace-nowrap ${activeTab === 'evaluasi' ? 'tab-active' : 'tab-inactive'}`}>3. Evaluasi Mata Kuliah</button>
        <button onClick={() => setActiveTab('cqi')} className={`pb-4 text-body font-bold transition-colors whitespace-nowrap ${activeTab === 'cqi' ? 'tab-active' : 'tab-inactive'}`}>4. Rekam Jejak CQI</button>
      </div>

      {/* Tab Content */}
      <div className="card rounded-xl p-6 min-h-[500px]">
        
        {/* PILAR 1 */}
        {activeTab === 'ketercapaian' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h3 className="section-title">Laporan Ketercapaian CPL Per Angkatan</h3>
                <p className="text-body text-on-surface-variant mt-1">Menampilkan rata-rata ketercapaian seluruh mahasiswa pada angkatan aktif.</p>
              </div>
              <select 
                className="input-base px-4 py-2 font-bold text-primary cursor-pointer"
                value={angkatan}
                onChange={e => setAngkatan(e.target.value)}
              >
                {angkatanOptions.map(y => (
                  <option key={y} value={String(y)}>Angkatan {y}</option>
                ))}
              </select>
            </div>
            
            {loadingCpl ? (
              <div className="h-[400px] flex items-center justify-center text-on-surface-variant">Memuat data agregasi kelas...</div>
            ) : cplData.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">Belum ada data nilai untuk angkatan ini.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl p-6 border border-outline-variant">
                <div className="h-[400px] flex justify-center w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cplData}>
                    <PolarGrid stroke="var(--color-outline-variant)" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 14, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--color-outline)' }} />
                    <Radar name="Ketercapaian Aktual" dataKey="A" stroke="var(--color-primary)" strokeWidth={3} fill="var(--color-primary)" fillOpacity={0.2} dot={{ r: 4, fill: 'var(--color-primary)' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {(() => {
                const sorted = [...cplData].sort((a, b) => b.A - a.A);
                const best = sorted[0];
                const worst = sorted[sorted.length - 1];
                return (
                  <div>
                    <h4 className="font-bold text-h3 text-on-surface mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">insights</span> Analisis Kaprodi
                    </h4>
                    <div className="p-5 bg-surface rounded-xl border border-outline-variant space-y-4 shadow-card">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
                        </div>
                        <div>
                          <strong className="text-on-surface block mb-1">Kekuatan Angkatan:</strong>
                          <p className="text-body text-on-surface-variant leading-relaxed">Mahasiswa angkatan {angkatan} menunjukkan capaian tertinggi pada <strong>{best.subject}</strong> dengan ketercapaian sebesar {best.A}%{best.A >= 75 ? ', telah melampaui target minimum prodi (75%).' : '.'}</p>
                        </div>
                      </div>
                      <div className="h-px bg-outline-variant w-full"></div>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full ${worst.A < 75 ? 'bg-error/10' : 'bg-secondary/10'} flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined ${worst.A < 75 ? 'text-error' : 'text-secondary'} text-[20px]`}>{worst.A < 75 ? 'warning' : 'info'}</span>
                        </div>
                        <div>
                          <strong className="text-on-surface block mb-1">{worst.A < 75 ? 'Area Kritis (Perbaikan):' : 'Capaian Terendah:'}</strong>
                          <p className="text-body text-on-surface-variant leading-relaxed">Capaian terendah terdapat pada <strong>{worst.subject}</strong> dengan ketercapaian {worst.A}%{worst.A < 75 ? `, berada di bawah target minimum prodi (75%). Perlu tindak lanjut segera.` : ', namun masih memenuhi target minimum prodi (75%).'}</p>
                        </div>
                      </div>
                    </div>
                    {worst.A < 75 && (
                      <button onClick={() => navigate('/act')} className="btn-primary mt-6 w-full py-3 rounded-xl font-bold text-body flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">assignment_add</span>
                        Buat Rekomendasi CQI untuk {worst.subject}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
            )}
          </div>
        )}

        {/* PILAR 2 */}
        {activeTab === 'portofolio' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-outline-variant pb-4">
              <h3 className="section-title">Portofolio Mahasiswa (SKPI)</h3>
              <p className="text-body text-on-surface-variant mt-1">Cari berdasarkan NIM untuk melihat rekapitulasi CPL dan kelayakan lulusan secara personal.</p>
            </div>
            <div className="flex gap-4 max-w-lg bg-surface-container-low p-2 rounded-xl border border-outline-variant">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                <input 
                  type="text" 
                  placeholder="Masukkan NIM (mis: 120220001)" 
                  className="input-base w-full pl-10 pr-4 py-3 font-data-mono text-body"
                  value={searchNim}
                  onChange={e => setSearchNim(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchNim()}
                />
              </div>
              <button onClick={handleSearchNim} className="btn-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">search</span> Cari
              </button>
            </div>
            
            {searchError && <div className="text-error font-medium">{searchError}</div>}

            {portofolioData ? (
              <div className="mt-8 card p-0 rounded-xl overflow-hidden shadow-md animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-surface-container-low to-surface-container-lowest p-8 border-b border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                      <span className="material-symbols-outlined text-4xl text-primary">person</span>
                    </div>
                    <div>
                      <h2 className="page-header text-[28px]">{portofolioData.nama}</h2>
                      <p className="font-data-mono text-h3 text-on-surface-variant mt-1">{portofolioData.nim}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-4xl text-primary font-data-mono mb-2">Skor: {portofolioData.averageScore?.toFixed(1)}</div>
                    <div className="text-secondary font-bold text-body bg-secondary/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      {portofolioData.recommendation}
                    </div>
                  </div>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-surface-container-lowest">
                  <div className="h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={(portofolioData.cplScores || []).map((c: any) => ({ subject: c.kode, A: c.score, fullMark: 100 }))}>
                        <PolarGrid stroke="var(--color-outline-variant)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 13, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name={portofolioData.nama} dataKey="A" stroke="var(--color-secondary)" strokeWidth={2} fill="var(--color-secondary)" fillOpacity={0.25} dot={{ r: 4, fill: 'var(--color-secondary)' }}/>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px' }}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-bold text-h3 text-on-surface mb-6 border-b border-outline-variant pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">checklist</span> Rincian Ketercapaian
                    </h4>
                    <ul className="space-y-5">
                      {(portofolioData.cplScores || []).map((c: any) => (
                        <li key={c.kode} className="flex items-center justify-between group">
                          <span className="font-bold text-body text-on-surface group-hover:text-primary transition-colors">{c.kode}</span>
                          <div className="flex items-center gap-4 flex-1 ml-6">
                            <div className="flex-1 bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ease-out ${c.score >= 75 ? 'bg-secondary' : 'bg-error'}`} style={{ width: `${c.score}%` }}></div>
                            </div>
                            <span className={`font-data-mono font-bold w-14 text-right text-h3 ${c.score >= 75 ? 'text-secondary' : 'text-error'}`}>{c.score}%</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => addToast('Fitur cetak transkrip akan segera tersedia.', 'info')} className="btn-secondary mt-8 w-full py-3 border-2 border-primary text-primary rounded-xl font-bold flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">print</span> Cetak Transkrip SKPI
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state h-[400px] flex flex-col items-center justify-center mt-8">
                <span className="material-symbols-outlined text-[80px] mb-6 opacity-20">badge</span>
                <p className="text-h3 font-h3 text-on-surface-variant">Silakan masukkan NIM untuk menampilkan portofolio</p>
                <p className="text-body text-outline mt-2">Sistem akan mengambil data capaian Sub-CPMK secara real-time</p>
              </div>
            )}
          </div>
        )}

        {/* PILAR 3 */}
        {activeTab === 'evaluasi' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center border-b border-outline-variant pb-4">
              <div>
                <h3 className="section-title">Laporan Evaluasi Mata Kuliah</h3>
                <p className="text-body text-on-surface-variant mt-1">Komparasi nilai rata-rata aktual (Success Rate) dengan Target MK yang dijanjikan.</p>
              </div>
              <select
                className="input-base px-4 py-2 font-bold text-primary cursor-pointer"
                value={semesterFilter}
                onChange={e => setSemesterFilter(e.target.value as 'all'|'Ganjil'|'Genap')}
              >
                <option value="all">Semua Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            {loadingMk ? (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant">Memuat data kelas...</div>
            ) : mkEvaluasi.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">Belum ada kelas yang memiliki nilai evaluasi.</div>
            ) : (
              <>
                <div className="h-[350px] mt-6 bg-gradient-to-br from-surface to-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-card">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semesterFilter === 'all' ? mkEvaluasi : mkEvaluasi.filter(mk => mk.semester === semesterFilter)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                  <XAxis dataKey="nama" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 13, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-on-surface-variant)', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'var(--color-surface-container-low)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar name="Success Rate Aktual" dataKey="successRate" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  <Bar name="Target Minimal MK" dataKey="target" fill="var(--color-outline)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="table-container mt-6">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Mata Kuliah</th>
                    <th className="text-center">Success Rate Aktual</th>
                    <th className="text-center">Target Minimal</th>
                    <th className="text-center">Status Evaluasi</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredMk = semesterFilter === 'all' ? mkEvaluasi : mkEvaluasi.filter(mk => mk.semester === semesterFilter);
                    const paginatedMk = filteredMk.slice((mkPage - 1) * mkPageSize, mkPage * mkPageSize);
                    return paginatedMk.map((mk, i) => (
                    <tr key={i}>
                      <td className="font-bold">{mk.nama}</td>
                      <td className="text-center td-mono font-bold text-[18px]">{mk.successRate}%</td>
                      <td className="text-center td-mono text-on-surface-variant">{mk.target}%</td>
                      <td className="text-center">
                        <span className={`inline-flex items-center gap-1 ${mk.successRate >= mk.target ? 'badge-success' : 'badge-error'}`}>
                          <span className="material-symbols-outlined text-[16px]">{mk.successRate >= mk.target ? 'check_circle' : 'cancel'}</span>
                          {mk.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button onClick={() => addToast(`Detail evaluasi untuk ${mk.nama} akan segera tersedia.`, 'info')} className="table-action-secondary">Lihat Detail</button>
                      </td>
                    </tr>
                  ));
                  })()}
                </tbody>
              </table>
              <Pagination
                currentPage={mkPage}
                totalItems={(semesterFilter === 'all' ? mkEvaluasi : mkEvaluasi.filter(mk => mk.semester === semesterFilter)).length}
                pageSize={mkPageSize}
                onPageChange={(page) => setMkPage(page)}
              />
            </div>
            </>
            )}
          </div>
        )}

        {/* PILAR 4 */}
        {activeTab === 'cqi' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-end border-b border-outline-variant pb-4">
              <div>
                <h3 className="section-title">Rekam Jejak CQI (Continuous Quality Improvement)</h3>
                <p className="text-body text-on-surface-variant mt-1">Log historis intervensi Kaprodi dan tindak lanjut Dosen (Closing the Loop).</p>
              </div>
            </div>

            <div className="py-4">
              {loadingCqi ? (
                <div className="text-center p-10 text-on-surface-variant">Memuat Rekam Jejak CQI...</div>
              ) : cqiData.filter(d => d.status === 'Completed').length === 0 ? (
                <div className="text-center p-10 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">Belum ada rekam jejak CQI yang terselesaikan.</div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary/20 before:via-outline-variant before:to-transparent">
                  {cqiData.filter(d => d.status === 'Completed').map((cqi, index) => (
                    <div key={cqi.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-surface shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 ${index % 2 === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined">{index % 2 === 0 ? 'assignment_turned_in' : 'update'}</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] card hover:border-primary/30">
                        <div className="flex items-center justify-between space-x-2 mb-3">
                          <div className={`font-bold text-h3 text-on-surface ${index % 2 === 0 ? 'text-primary' : ''}`}>{cqi.title}</div>
                          <time className="font-data-mono font-bold text-caption text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                            {new Date(cqi.updatedAt).toLocaleDateString('id-ID')}
                          </time>
                        </div>
                        <div className="text-body text-on-surface leading-relaxed">
                          {cqi.context}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="badge-success">Status: {cqi.status}</span>
                          <span className="badge-neutral">PIC: {cqi.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
