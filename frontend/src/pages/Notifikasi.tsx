import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

export function Notifikasi() {
  const navigate = useNavigate();
  const { addToast } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifikasi');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifikasi/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifikasi/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-gap_section">
        <div>
          <h1 className="page-header mb-1">Notifikasi</h1>
          <p className="page-subtitle">Stay updated with curriculum alerts, system changes, and audit reports.</p>
        </div>
        <button onClick={() => {
          markAllAsRead();
          addToast('Semua notifikasi ditandai sebagai dibaca', 'success');
        }} className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg self-start sm:self-auto border border-transparent hover:border-primary/20 active:scale-95">
 <span className="material-symbols-outlined ">done_all</span>
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 border-b border-outline-variant">
        <button className="tab-active px-4 py-2">
          All Notifications
        </button>
        <button className="tab-inactive px-4 py-2 rounded-t-lg">
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List Container */}
      <div className="card p-0 overflow-hidden flex flex-col">
        {/* Date Header */}
        <div className="px-6 py-3 bg-surface-container flex items-center justify-between border-b border-outline-variant">
          <span className="font-caption text-caption text-on-surface-variant font-bold uppercase tracking-wider">Today</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state p-8 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">notifications_off</span>
            <p>Tidak ada notifikasi saat ini.</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            // Determine styles based on original rich UI
            const isWarning = notif.type === 'WARNING';
            const isSuccess = notif.type === 'SUCCESS';
            const isInfo = notif.type === 'INFO' || (!isWarning && !isSuccess);

            return (
              <div key={notif.id} className={`flex flex-col sm:flex-row gap-4 p-6 border-b border-outline-variant transition-colors relative group ${notif.isRead ? 'hover:bg-surface-container-low' : 'bg-primary-fixed/20 hover:bg-primary-fixed/30'}`}>
                {/* Unread Indicator */}
                {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                
                <div className="shrink-0 pt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    isWarning ? 'bg-error-container text-on-error-container' :
                    isSuccess ? 'bg-secondary-fixed text-on-secondary-fixed' :
                    'bg-secondary-container text-on-secondary-container'
                  }`}>
                    <span className="material-symbols-outlined icon-fill">
                      {isWarning ? 'warning' : isSuccess ? 'task_alt' : 'update'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`absolute top-6 right-6 text-xs tabular-nums whitespace-nowrap ${notif.isRead ? 'text-outline' : 'text-on-surface-variant'}`}>
                    {new Date(notif.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', hour12: false})}
                  </span>
                  <div className="pr-16 mb-1">
                    <h3 className={`font-h3 text-h3 truncate ${notif.isRead ? 'text-on-surface-variant' : 'text-on-surface font-bold'}`}>
                      {notif.title}
                    </h3>
                  </div>
                  <p className={`font-body text-body ${isWarning ? 'mb-3' : ''} ${notif.isRead ? 'text-outline' : 'text-on-surface-variant'}`}>
                    {notif.message}
                  </p>

                  {/* Badges / Tags based on original UI */}
                  {isWarning && (
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={(e) => { e.stopPropagation(); navigate('/do'); }} className="badge-neutral inline-flex items-center px-2 py-1 hover:bg-surface-container-high transition-colors active:scale-95">
                        Perlu Tindakan
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/plan'); }} className="inline-flex items-center px-2 py-1 rounded bg-tertiary-fixed border border-tertiary/20 font-caption text-caption text-tertiary hover:bg-tertiary/20 transition-colors active:scale-95">
                        Plan Phase
                      </button>
                    </div>
                  )}
                  {isSuccess && (
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={(e) => { e.stopPropagation(); navigate('/audit-log'); }} className="badge-neutral inline-flex items-center gap-1 px-2 py-1 hover:bg-surface-container-high transition-colors active:scale-95">
                        <span className="material-symbols-outlined text-body">history</span>
                        Audit Log
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons based on original UI */}
                {!notif.isRead && (
                  <div className="shrink-0 sm:self-center mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        markAsRead(notif.id); 
                        if (isWarning) navigate('/do');
                        else if (isSuccess) navigate('/laporan');
                      }} 
                      className={`px-4 py-2 font-caption text-caption rounded-lg transition-colors shadow-sm active:scale-95 ${
                      isWarning ? 'btn-primary' :
                      isSuccess ? 'btn-secondary' :
                      'btn-ghost'
                    }`}>
                      {isWarning ? 'Review Modul' : isSuccess ? 'View Report' : 'Dismiss'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      <div className="mt-6 flex justify-center">
        <button className="btn-secondary px-6 py-2.5 rounded-full">
          Load earlier notifications
        </button>
      </div>
    </div>
  );
}
