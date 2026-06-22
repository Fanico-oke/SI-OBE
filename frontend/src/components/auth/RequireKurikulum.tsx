import { Link } from 'react-router-dom';
import { useCurriculumStore } from '../../store/useCurriculumStore';

/**
 * Guard component: blocks Plan/Do/Check/Act pages if no kurikulum is selected
 * OR if no active kurikulum exists (all archived).
 * Shows a friendly message directing user to create or select a kurikulum first.
 */
export const RequireKurikulum = ({ children }: { children: React.ReactNode }) => {
  const { activeCurriculumId, curriculums } = useCurriculumStore();
  const hasActiveCurriculum = curriculums.some(c => c.status === 'ACTIVE');

  if (!activeCurriculumId || !hasActiveCurriculum) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-warning/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[40px] text-warning">lock</span>
        </div>
        <h2 className="font-h2 text-h2 text-on-surface mb-2">
          {!hasActiveCurriculum ? 'Tidak Ada Kurikulum Aktif' : 'Belum Ada Kurikulum Dipilih'}
        </h2>
        <p className="font-body text-body text-on-surface-variant max-w-md mb-6">
          {!hasActiveCurriculum
            ? 'Semua kurikulum sudah diarsipkan. Buat kurikulum baru di halaman Kurikulum untuk memulai siklus PDCA baru.'
            : 'Silakan buat kurikulum baru atau pilih kurikulum yang sudah ada di halaman Kurikulum untuk memulai.'
          }
        </p>
        <Link to="/kurikulum" className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">library_books</span>
          {!hasActiveCurriculum ? 'Buat Kurikulum Baru' : 'Buka Halaman Kurikulum'}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
