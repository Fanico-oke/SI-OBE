import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export default function TopNavBar() {
  const { addToast, sidebarCollapsed, darkMode, toggleDarkMode } = useAppStore();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addToast(`Pencarian untuk "${e.currentTarget.value}" dijalankan`, 'info');
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 glass flex justify-between items-center h-16 px-6 sidebar-transition ${
        sidebarCollapsed
          ? 'w-full md:w-[calc(100%-72px)]'
          : 'w-full md:w-[calc(100%-260px)]'
      }`}
    >
      {/* Mobile: Hamburger + Brand */}
      <div className="flex items-center md:hidden">
        <button className="btn-icon">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-h3 text-h3 font-bold text-primary ml-2">SI-OBE</span>
      </div>

      {/* Desktop: Search */}
      <div className="hidden md:flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            className="pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-72 text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Cari sesuatu..."
            type="text"
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="btn-icon"
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button
          onClick={() => addToast('Status Server: Normal & Sinkronisasi Aktif', 'success')}
          className="btn-sm btn-secondary hidden sm:inline-flex"
        >
          <span className="material-symbols-outlined text-[16px]">cloud_done</span>
          <span>Online</span>
        </button>
        <div className="flex gap-1">
          <Link to="/notifikasi" className="btn-icon">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </Link>
          <Link to="/bantuan" className="btn-icon hidden sm:flex">
            <span className="material-symbols-outlined text-[20px]">help</span>
          </Link>
          <Link to="/settings" className="btn-icon hidden sm:flex">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </Link>
        </div>
        <Link to="/profil" className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/30 cursor-pointer flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all ml-1">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
        </Link>
      </div>
    </header>
  );
}