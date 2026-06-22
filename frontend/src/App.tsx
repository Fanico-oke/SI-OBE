import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { useAuthStore } from './store/authStore';
import { RoleGuard } from './components/auth/RoleGuard';
import { RequireKurikulum } from './components/auth/RequireKurikulum';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Laporan } from './pages/Laporan';
import { Notifikasi } from './pages/Notifikasi';
import { Peran } from './pages/Peran';
import { AuditLog } from './pages/AuditLog';
import { AuditLogDetail } from './pages/AuditLogDetail';
import { Bantuan } from './pages/Bantuan';
import { Kurikulum } from './pages/Kurikulum';
import { KurikulumDetail } from './pages/KurikulumDetail';
import { KurikulumCreate } from './pages/KurikulumCreate';
import { Profil } from './pages/Profil';
import { Settings } from './pages/Settings';

// Plan Phase
import { PlanEditor } from './pages/PlanEditor';
import { PlanMapping } from './pages/PlanMapping';
import { PlanIndikator } from './pages/PlanIndikator';
import { PlanReferensi } from './pages/PlanReferensi';
import { PlanBKMK } from './pages/PlanBKMK';

// Do Phase
import { DoModul } from './pages/DoModul';
import { DoModulDetail } from './pages/DoModulDetail';
import { DoModulRPS } from './pages/DoModulRPS';
import { DoModulAktivitas } from './pages/DoModulAktivitas';
import { DoTugasAsesmen } from './pages/DoTugasAsesmen';
import { DoRubrikEditor } from './pages/DoRubrikEditor';
import { DoMateriPembelajaran } from './pages/DoMateriPembelajaran';
import { DoPenilaian } from './pages/DoPenilaian';

// Check Phase
import { CheckEvaluasi } from './pages/CheckEvaluasi';
import { CheckAuditCapaian } from './pages/CheckAuditCapaian';
import { CheckLaporanEvaluasi } from './pages/CheckLaporanEvaluasi';
import { CheckFeedback } from './pages/CheckFeedback';

// Act Phase
import { ActPhase } from './pages/ActPhase';
import { ActMonitoring } from './pages/ActMonitoring';
import { ActDokumentasi } from './pages/ActDokumentasi';
import { ActFinalisasi } from './pages/ActFinalisasi';
import { RaporOBE } from './pages/RaporOBE';

import { useEffect } from 'react';
import { useCurriculumStore } from './store/useCurriculumStore';

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const validateToken = useAuthStore(state => state.validateToken);
  const fetchCurriculums = useCurriculumStore(state => state.fetchCurriculums);

  // Validate token on app load — auto logout if expired
  useEffect(() => {
    validateToken();
  }, []);

  // Auto-detect active kurikulum on app load
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurriculums();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="laporan" element={<RoleGuard roles={['KAPRODI', 'ADMIN', 'MAHASISWA']}><Laporan /></RoleGuard>} />
          <Route path="notifikasi" element={<Notifikasi />} />
          <Route path="peran" element={<RoleGuard roles={['ADMIN']}><Peran /></RoleGuard>} />
          <Route path="audit-log">
            <Route index element={<RoleGuard roles={['ADMIN', 'KAPRODI']}><AuditLog /></RoleGuard>} />
            <Route path=":id" element={<RoleGuard roles={['ADMIN', 'KAPRODI']}><AuditLogDetail /></RoleGuard>} />
          </Route>
          <Route path="bantuan" element={<Bantuan />} />
          
          <Route path="kurikulum">
            <Route index element={<RoleGuard roles={['ADMIN', 'KAPRODI']} readOnlyFor={['DOSEN']}><Kurikulum /></RoleGuard>} />
            <Route path="create" element={<RoleGuard roles={['ADMIN', 'KAPRODI']}><KurikulumCreate /></RoleGuard>} />
            
            {/* Context Kurikulum */}
            <Route path=":id">
              <Route index element={<RoleGuard roles={['ADMIN', 'KAPRODI']} readOnlyFor={['DOSEN']}><KurikulumDetail /></RoleGuard>} />
              
            </Route>
          </Route>

          {/* PDCA Routes */}
          <Route path="plan">
            <Route index element={<RoleGuard roles={['KAPRODI']} readOnlyFor={['DOSEN']}><RequireKurikulum><PlanEditor /></RequireKurikulum></RoleGuard>} />
            <Route path="mapping" element={<RoleGuard roles={['KAPRODI']} readOnlyFor={['DOSEN']}><RequireKurikulum><PlanMapping /></RequireKurikulum></RoleGuard>} />
            <Route path="bkmk" element={<RoleGuard roles={['KAPRODI']} readOnlyFor={['DOSEN']}><RequireKurikulum><PlanBKMK /></RequireKurikulum></RoleGuard>} />
            <Route path="indikator" element={<RoleGuard roles={['KAPRODI']} readOnlyFor={['DOSEN']}><RequireKurikulum><PlanIndikator /></RequireKurikulum></RoleGuard>} />
            <Route path="referensi" element={<RoleGuard roles={['KAPRODI']} readOnlyFor={['DOSEN']}><RequireKurikulum><PlanReferensi /></RequireKurikulum></RoleGuard>} />
          </Route>
          
          <Route path="do">
            <Route index element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoModul /></RequireKurikulum></RoleGuard>} />
            <Route path="detail" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoModulDetail /></RequireKurikulum></RoleGuard>} />
            <Route path="rps" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoModulRPS /></RequireKurikulum></RoleGuard>} />
            <Route path="rps/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoModulRPS /></RequireKurikulum></RoleGuard>} />
            <Route path="aktivitas/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoModulAktivitas /></RequireKurikulum></RoleGuard>} />
            <Route path="tugas" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoTugasAsesmen /></RequireKurikulum></RoleGuard>} />
            <Route path="tugas/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoTugasAsesmen /></RequireKurikulum></RoleGuard>} />
            <Route path="rubrik" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoRubrikEditor /></RequireKurikulum></RoleGuard>} />
            <Route path="rubrik/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoRubrikEditor /></RequireKurikulum></RoleGuard>} />
            <Route path="materi/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoMateriPembelajaran /></RequireKurikulum></RoleGuard>} />
            <Route path="penilaian" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoPenilaian /></RequireKurikulum></RoleGuard>} />
            <Route path="penilaian/:kelasId" element={<RoleGuard roles={['DOSEN']} readOnlyFor={['KAPRODI']}><RequireKurikulum><DoPenilaian /></RequireKurikulum></RoleGuard>} />
          </Route>

          <Route path="check">
            <Route index element={<RoleGuard roles={['KAPRODI', 'ADMIN']}><RequireKurikulum><CheckEvaluasi /></RequireKurikulum></RoleGuard>} />
            <Route path="audit" element={<RoleGuard roles={['KAPRODI', 'ADMIN']}><RequireKurikulum><CheckAuditCapaian /></RequireKurikulum></RoleGuard>} />
            <Route path="laporan" element={<RoleGuard roles={['KAPRODI', 'ADMIN']}><RequireKurikulum><CheckLaporanEvaluasi /></RequireKurikulum></RoleGuard>} />
            <Route path="feedback" element={<RoleGuard roles={['KAPRODI', 'ADMIN']}><RequireKurikulum><CheckFeedback /></RequireKurikulum></RoleGuard>} />
          </Route>

          <Route path="act">
            <Route index element={<RoleGuard roles={['KAPRODI']}><RequireKurikulum><ActPhase /></RequireKurikulum></RoleGuard>} />
            <Route path="monitoring" element={<RoleGuard roles={['KAPRODI']}><RequireKurikulum><ActMonitoring /></RequireKurikulum></RoleGuard>} />
            <Route path="dokumentasi" element={<RoleGuard roles={['KAPRODI']}><RequireKurikulum><ActDokumentasi /></RequireKurikulum></RoleGuard>} />
            <Route path="finalisasi" element={<RoleGuard roles={['KAPRODI']}><RequireKurikulum><ActFinalisasi /></RequireKurikulum></RoleGuard>} />
          </Route>

          <Route path="profil" element={<Profil />} />
          <Route path="rapor-obe" element={<RoleGuard roles={['MAHASISWA']}><RaporOBE /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard roles={['ADMIN']}><Settings /></RoleGuard>} />
          
          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
