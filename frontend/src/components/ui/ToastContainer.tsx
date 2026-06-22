import { useAppStore } from '../../store/useAppStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  const colors = {
    success: 'bg-success text-on-success',
    error: 'bg-error text-on-error',
    info: 'bg-primary text-on-primary',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 ${colors[toast.type]}`}
        >
          <span className="material-symbols-outlined text-[20px] icon-fill">
            {icons[toast.type]}
          </span>
          <span className="font-body text-body font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
