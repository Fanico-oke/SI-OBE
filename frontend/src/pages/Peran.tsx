import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Pagination } from '../components/ui/Pagination';

interface User {
  id: string;
  username: string;
  nama: string;
  role: string;
  email?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; badge: string; icon: string; color: string; desc: string }> = {
  ADMIN: { label: 'Administrator', badge: 'badge-error', icon: 'admin_panel_settings', color: 'var(--md-sys-color-error)', desc: 'Kelola sistem, user, dan pengaturan' },
  KAPRODI: { label: 'Kaprodi', badge: 'badge-tertiary', icon: 'school', color: 'var(--md-sys-color-tertiary)', desc: 'Perencanaan & evaluasi kurikulum OBE' },
  DOSEN: { label: 'Dosen', badge: 'badge-primary', icon: 'person', color: 'var(--md-sys-color-primary)', desc: 'Pelaksanaan perkuliahan & penilaian' },
  MAHASISWA: { label: 'Mahasiswa', badge: 'badge-secondary', icon: 'backpack', color: 'var(--md-sys-color-secondary)', desc: 'Lihat capaian pembelajaran & rapor OBE' },
};

export function Peran() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('semua');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', nama: '', role: 'DOSEN', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/users');
      setUsers(res.data);
    } catch { setToast({ msg: 'Gagal memuat data pengguna', type: 'error' }); }
    finally { setLoading(false); }
  };

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    kaprodi: users.filter(u => u.role === 'KAPRODI').length,
    dosen: users.filter(u => u.role === 'DOSEN').length,
    mahasiswa: users.filter(u => u.role === 'MAHASISWA').length,
    recentLogin: users.filter(u => u.lastLoginAt).sort((a, b) => new Date(b.lastLoginAt!).getTime() - new Date(a.lastLoginAt!).getTime())[0],
  }), [users]);

  // Filter
  const filtered = useMemo(() => {
    let list = users;
    if (activeTab !== 'semua') list = list.filter(u => u.role === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.nama.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    return list;
  }, [users, activeTab, search]);

  // Reset page when filters change
  useEffect(() => { setUserPage(1); }, [activeTab, search]);

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus "${nama}"?`)) return;
    try {
      await axios.delete(`/api/auth/users/${id}`);
      setToast({ msg: `${nama} berhasil dihapus`, type: 'success' });
      fetchUsers();
    } catch { setToast({ msg: 'Gagal menghapus pengguna', type: 'error' }); }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', nama: '', role: 'DOSEN', email: '', phone: '' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({ username: u.username, password: '', nama: u.nama, role: u.role, email: u.email || '', phone: u.phone || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nama.trim() || !formData.username.trim()) {
      setToast({ msg: 'Nama dan username wajib diisi', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        await axios.put(`/api/auth/profile/${editingUser.id}`, {
          nama: formData.nama,
          email: formData.email,
          phone: formData.phone,
        });
        setToast({ msg: `${formData.nama} berhasil diperbarui`, type: 'success' });
      } else {
        if (!formData.password.trim()) {
          setToast({ msg: 'Password wajib diisi untuk user baru', type: 'error' });
          setSaving(false);
          return;
        }
        await axios.post('/api/auth/users', formData);
        setToast({ msg: `${formData.nama} berhasil ditambahkan`, type: 'success' });
      }
      setShowModal(false);
      fetchUsers();
    } catch { setToast({ msg: editingUser ? 'Gagal memperbarui' : 'Gagal menambah. Username mungkin sudah ada.', type: 'error' }); }
    finally { setSaving(false); }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return formatDate(iso);
  };

  const tabs = [
    { key: 'semua', label: 'Semua', count: stats.total },
    { key: 'ADMIN', label: 'Admin', count: stats.admin },
    { key: 'KAPRODI', label: 'Kaprodi', count: stats.kaprodi },
    { key: 'DOSEN', label: 'Dosen', count: stats.dosen },
    { key: 'MAHASISWA', label: 'Mahasiswa', count: stats.mahasiswa },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl shadow-lg text-white flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-success' : 'bg-error'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-error/15 text-error text-caption font-bold tracking-tight">ADMIN PANEL</span>
          </div>
          <h2 className="page-header">Manajemen Pengguna</h2>
          <p className="page-subtitle max-w-2xl">Kelola akun, atur role, dan monitor aktivitas pengguna sistem OBE.</p>
        </div>
        <button onClick={openCreate} className="btn-primary shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg">
          <span className="material-symbols-outlined text-[20px]">person_add</span> Tambah Pengguna
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <button
              key={role}
              onClick={() => setActiveTab(activeTab === role ? 'semua' : role)}
              className={`card rounded-2xl p-5 text-left transition-all duration-200 hover-lift cursor-pointer border-2 ${activeTab === role ? 'border-primary shadow-md' : 'border-transparent'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${cfg.color} 15%, transparent)` }}>
                  <span className="material-symbols-outlined icon-fill text-xl" style={{ color: cfg.color }}>{cfg.icon}</span>
                </div>
                <span className={cfg.badge}>{cfg.label}</span>
              </div>
              <h3 className="text-3xl font-bold text-on-surface">{count}</h3>
              <p className="text-caption text-on-surface-variant mt-1">{cfg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="card p-0 overflow-hidden flex flex-col rounded-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant/50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {t.label} <span className="ml-1 opacity-70">({t.count})</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              placeholder="Cari nama atau username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pl-9 pr-4 py-2 w-full sm:w-64 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="text-on-surface-variant">Memuat data pengguna...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state m-6">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined !text-[48px]">group_off</span>
            </div>
            <p className="empty-state-text">
              {search ? `Tidak ditemukan pengguna "${search}"` : 'Tidak ada pengguna untuk kategori ini.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Peran</th>
                  <th>Kontak</th>
                  <th>Login Terakhir</th>
                  <th>Terdaftar</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((userPage - 1) * userPageSize, userPage * userPageSize).map(u => {
                  const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.DOSEN;
                  const initials = u.nama.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <tr key={u.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ background: cfg.color }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{u.nama}</div>
                            <div className="text-caption text-on-surface-variant">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={cfg.badge}>{cfg.label}</span>
                      </td>
                      <td>
                        <div className="text-sm">
                          {u.email ? (
                            <div className="flex items-center gap-1 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[14px]">mail</span>
                              {u.email}
                            </div>
                          ) : (
                            <span className="text-on-surface-variant/50 text-caption">—</span>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-1 text-on-surface-variant mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">call</span>
                              {u.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {u.lastLoginAt ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-sm text-on-surface-variant">{formatTime(u.lastLoginAt)}</span>
                          </div>
                        ) : (
                          <span className="text-on-surface-variant/50 text-caption">Belum pernah login</span>
                        )}
                      </td>
                      <td className="td-mono">{formatDate(u.createdAt)}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(u)} className="table-action-primary" title="Edit">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(u.id, u.nama)} className="table-action-danger" title="Hapus">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={userPage}
              totalItems={filtered.length}
              pageSize={userPageSize}
              onPageChange={(page) => setUserPage(page)}
            />
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-outline-variant/50 bg-surface-container-lowest flex justify-between items-center text-caption text-on-surface-variant">
            <span>Menampilkan {filtered.length} dari {users.length} pengguna</span>
            <div className="flex items-center gap-4">
              {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                <div key={role} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }}></div>
                  <span>{users.filter(u => u.role === role).length} {cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Role Permissions Card */}
      <div className="card rounded-2xl p-6">
        <h3 className="font-h3 text-h3 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">security</span>
          Matriks Hak Akses
        </h3>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Fitur</th>
                <th className="text-center">👑 Kaprodi</th>
                <th className="text-center">👨‍🏫 Dosen</th>
                <th className="text-center">⚙️ Admin</th>
                <th className="text-center">🎓 Mahasiswa</th>
              </tr>
            </thead>
            <tbody>
              {[
                { fitur: 'Kurikulum (CRUD)', kaprodi: '✅ Full', dosen: '❌', admin: '✅ Full', mhs: '❌' },
                { fitur: 'Plan (CPL, BK, MK, Pemetaan)', kaprodi: '✅ Full', dosen: '👁️ Read', admin: '❌', mhs: '❌' },
                { fitur: 'Do (RPS, Tugas, Rubrik, Penilaian)', kaprodi: '👁️ Lihat', dosen: '✅ Kelasnya', admin: '❌', mhs: '❌' },
                { fitur: 'Check (Evaluasi, Audit)', kaprodi: '✅', dosen: '❌', admin: '✅', mhs: '❌' },
                { fitur: 'Act (Rencana Aksi)', kaprodi: '✅', dosen: '❌', admin: '❌', mhs: '❌' },
                { fitur: 'Laporan OBE', kaprodi: '✅', dosen: '❌', admin: '✅', mhs: '✅' },
                { fitur: 'Rapor Saya', kaprodi: '❌', dosen: '❌', admin: '❌', mhs: '✅' },
                { fitur: 'Kelola User', kaprodi: '❌', dosen: '❌', admin: '✅', mhs: '❌' },
                { fitur: 'Settings', kaprodi: '❌', dosen: '❌', admin: '✅', mhs: '❌' },
                { fitur: 'Audit Log', kaprodi: '✅', dosen: '❌', admin: '✅', mhs: '❌' },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="font-medium">{row.fitur}</td>
                  <td className="text-center">{row.kaprodi}</td>
                  <td className="text-center">{row.dosen}</td>
                  <td className="text-center">{row.admin}</td>
                  <td className="text-center">{row.mhs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-h3 text-h3">
                {editingUser ? `Edit — ${editingUser.nama}` : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body space-y-4">
              <div>
                <label className="input-label">Nama Lengkap *</label>
                <input type="text" className="input-base w-full" placeholder="Dr. John Doe, S.Kom., M.T." value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Username *</label>
                  <input
                    type="text"
                    className="input-base w-full"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    disabled={!!editingUser}
                    style={editingUser ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  />
                </div>
                <div>
                  <label className="input-label">{editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password *'}</label>
                  <input type="password" className="input-base w-full" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="input-label">Peran (Role) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => !editingUser && setFormData({...formData, role})}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${formData.role === role ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-outline-variant'} ${editingUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined icon-fill text-[18px]" style={{ color: cfg.color }}>{cfg.icon}</span>
                        <span className="font-bold text-sm">{cfg.label}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-tight">{cfg.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Email</label>
                  <input type="email" className="input-base w-full" placeholder="john@univ.ac.id" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">No. Telepon</label>
                  <input type="tel" className="input-base w-full" placeholder="0812xxxxxxxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-secondary px-5 py-2.5 rounded-lg" disabled={saving}>Batal</button>
              <button onClick={handleSave} className="btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2" disabled={saving || !formData.nama.trim() || !formData.username.trim()}>
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                {editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
