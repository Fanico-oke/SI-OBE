import { useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

interface ArchivedBannerProps {
  /** Where to redirect when clicking "Kembali ke..." */
  returnPath: string;
}

/**
 * Shows a warning banner when dosen is viewing an archived curriculum.
 * Includes a button to switch back to the active curriculum.
 */
export const ArchivedBanner = ({ returnPath }: ArchivedBannerProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeCurriculumId, curriculums, fetchCurriculums } = useCurriculumStore();

  useEffect(() => {
    if (curriculums.length === 0) {
      fetchCurriculums();
    }
  }, [curriculums.length, fetchCurriculums]);

  const isRelevantRole = user?.role === 'DOSEN' || user?.role === 'KAPRODI';
  const currentCurriculum = curriculums.find(c => c.id === activeCurriculumId);
  const isArchived = currentCurriculum?.status === 'ARCHIVED';
  const activeCurriculum = curriculums.find(c => c.status === 'ACTIVE');

  if (!isArchived || !isRelevantRole) return null;

  return (
    <div className="bg-warning/10 text-warning border border-warning/30 p-4 rounded-xl font-body text-body mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[24px]">inventory_2</span>
        <div>
          <strong>Mode Lihat Saja</strong> — Anda sedang melihat kurikulum arsip <strong>{currentCurriculum?.nama}</strong>.
          <br /><span className="text-on-surface-variant text-sm">Data bersifat read-only, tidak dapat diedit.</span>
        </div>
      </div>
      {activeCurriculum && (
        <button
          onClick={() => {
            useCurriculumStore.getState().setActiveCurriculum(activeCurriculum.id);
            navigate(returnPath);
          }}
          className="shrink-0 px-4 py-2 rounded-lg bg-primary text-on-primary font-caption text-caption font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Kembali ke {activeCurriculum.nama}
        </button>
      )}
    </div>
  );
};
