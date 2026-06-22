import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

interface UserProfile {
  id: number;
  username: string;
  nama: string;
  role: string;
  email: string;
  phone: string;
  bio: string;
  nidn: string;
  faculty: string;
  institution: string;
  avatarUrl: string;
  lastLoginAt: string;
}

interface EditForm {
  nama: string;
  email: string;
  phone: string;
  bio: string;
  nidn: string;
  faculty: string;
  institution: string;
}

const fallback = (val: string | null | undefined, placeholder = '-') =>
  val && val.trim() !== '' ? val : placeholder;

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '-';
  }
};

export const Profil = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    nama: '',
    email: '',
    phone: '',
    bio: '',
    nidn: '',
    faculty: '',
    institution: '',
  });

  // Password change state
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user: authUser, token } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/auth/me${authUser?.id ? `?userId=${authUser.id}` : ''}`);
      const data: UserProfile = res.data;
      setUser(data);
      setEditForm({
        nama: data.nama || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        nidn: data.nidn || '',
        faculty: data.faculty || '',
        institution: data.institution || '',
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditChange = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true);
      setSaveMsg(null);
      await axios.put(`/api/auth/profile/${user.id}`, editForm);
      // Re-fetch to get the canonical data from backend
      await fetchProfile();
      setIsEditing(false);
      setSaveMsg('Profil berhasil diperbarui!');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: any) {
      setSaveMsg(err?.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        nama: user.nama || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        nidn: user.nidn || '',
        faculty: user.faculty || '',
        institution: user.institution || '',
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPwMsg({ type: 'error', text: 'Semua field wajib diisi.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    try {
      setPwSaving(true);
      setPwMsg(null);
      await axios.put('/api/auth/change-password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwMsg({ type: 'success', text: 'Password berhasil diubah!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPwForm(false), 2000);
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err?.response?.data?.error || 'Gagal mengubah password.' });
    } finally {
      setPwSaving(false);
    }
  };

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gap_section">
          <div className="lg:col-span-8 card p-0 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-primary-container p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-32 h-32 rounded-full bg-on-primary-container/20" />
              <div className="h-5 w-48 bg-on-primary-container/20 rounded" />
              <div className="h-4 w-24 bg-on-primary-container/10 rounded-full" />
            </div>
            <div className="flex-1 p-padding_card grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-outline-variant/30 rounded" />
                  <div className="h-4 w-32 bg-outline-variant/20 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 bg-surface-container-high border border-outline-variant rounded-xl p-padding_card">
            <div className="h-5 w-40 bg-outline-variant/30 rounded mb-4" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-surface-container-lowest rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap_section">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-64" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="card text-center max-w-md">
          <span className="material-symbols-outlined text-error text-4xl mb-3">error</span>
          <p className="font-body text-body text-on-surface mb-4">{error}</p>
          <button className="btn-primary px-6 py-2 rounded-lg" onClick={fetchProfile}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full space-y-4">
      {/* Save success/error toast */}
      {saveMsg && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg bg-secondary-container text-on-secondary-container font-body font-semibold animate-fade-in">
          {saveMsg}
        </div>
      )}

      {/* Hero User Card (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gap_section">
        <div className="lg:col-span-8 card p-0 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-primary-container p-8 flex flex-col items-center justify-center text-on-primary-container gap-4">
            <div className="relative">
              <img
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-on-primary-container/30 shadow-lg object-cover"
                src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nama || user.username) + '&size=128&background=6366f1&color=fff'}
              />
              <button className="absolute bottom-0 right-0 p-2 bg-surface text-primary rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-transform">
                <span className="material-symbols-outlined ">edit</span>
              </button>
            </div>
            <div className="text-center">
              <h3 className="font-h3 text-h3 font-bold">{fallback(user.nama, user.username)}</h3>
              <span className="inline-block px-3 py-1 mt-2 bg-primary/20 text-on-primary-container rounded-full text-caption font-semibold capitalize">
                {fallback(user.role, 'User')}
              </span>
            </div>
          </div>
          <div className="flex-1 p-padding_card grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider">NIDN</p>
              <p className="font-data-mono text-data-mono font-medium text-primary">{fallback(user.nidn, 'Belum diisi')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider">Faculty</p>
              <p className="font-body text-body font-semibold">{fallback(user.faculty, 'Belum diisi')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider">Institution</p>
              <p className="font-body text-body">{fallback(user.institution, 'Belum diisi')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider">Account Status</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption  font-bold bg-secondary-container text-on-secondary-container">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Activity Summary Bento Card */}
        <div className="lg:col-span-4 bg-surface-container-high border border-outline-variant rounded-xl p-padding_card flex flex-col justify-between">
          <div>
            <h3 className="section-title mb-4">
              <span className="material-symbols-outlined text-primary">monitoring</span> Activity Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">login</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Last Login</p>
                    <p className="font-data-mono text-data-mono">{formatDateTime(user.lastLoginAt)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">devices</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Active Sessions</p>
                    <p className="font-body text-body font-semibold">-</p>
                  </div>
                </div>
                <button className="text-primary text-caption font-bold hover:underline">Revoke</button>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-caption text-primary font-medium">Academic Year {new Date().getFullYear()}/{new Date().getFullYear() + 1}</p>
            <p className="text-caption  text-on-surface-variant">Profile loaded from server.</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap_section">
        {/* Personal Information */}
        <div className="card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title">
              <span className="material-symbols-outlined text-primary">person_edit</span> Personal Information
            </h3>
            {!isEditing && (
              <button
                className="text-primary text-caption font-bold hover:underline flex items-center gap-1"
                onClick={() => setIsEditing(true)}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span> Edit
              </button>
            )}
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="input-label">Email Address</label>
              <input
                className="input-base w-full"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditChange('email', e.target.value)}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input
                className="input-base w-full"
                type="tel"
                value={editForm.phone}
                onChange={(e) => handleEditChange('phone', e.target.value)}
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="input-label">Bio</label>
              <textarea
                className="input-base w-full resize-none text-body"
                rows={3}
                value={editForm.bio}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                readOnly={!isEditing}
                placeholder="Belum diisi"
              ></textarea>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  className="btn-primary flex-1 py-2.5 rounded-lg disabled:opacity-50"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  className="btn-secondary flex-1 py-2.5 rounded-lg border-2 border-outline-variant text-on-surface-variant"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                className="btn-primary w-full py-2.5 rounded-lg"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Account Security */}
        <div className="card-hover flex flex-col">
          <h3 className="section-title mb-6">
            <span className="material-symbols-outlined text-primary">security</span> Account Security
          </h3>
          <div className="space-y-6 flex-1">
            <div className="p-4 border border-outline-variant/30 rounded-lg bg-surface-container-low/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-body font-semibold">Change Password</span>
                <span className="material-symbols-outlined text-on-surface-variant ">lock_reset</span>
              </div>
              <p className="text-caption text-on-surface-variant mb-3">Manage your password security.</p>
              {!showPwForm ? (
                <button
                  className="btn-secondary w-full py-2 border-2 border-primary text-primary rounded-lg font-bold"
                  onClick={() => { setShowPwForm(true); setPwMsg(null); }}
                >
                  Update Password
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="input-label">Password Saat Ini</label>
                    <input
                      className="input-base w-full"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                  <div>
                    <label className="input-label">Password Baru</label>
                    <input
                      className="input-base w-full"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  {pwMsg && (
                    <p className={`text-caption font-semibold ${pwMsg.type === 'success' ? 'text-secondary' : 'text-error'}`}>
                      {pwMsg.text}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      className="btn-primary flex-1 py-2 rounded-lg disabled:opacity-50"
                      onClick={handleChangePassword}
                      disabled={pwSaving}
                    >
                      {pwSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      className="btn-secondary flex-1 py-2 rounded-lg border-2 border-outline-variant text-on-surface-variant"
                      onClick={() => { setShowPwForm(false); setPwMsg(null); setCurrentPassword(''); setNewPassword(''); }}
                      disabled={pwSaving}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border border-outline-variant/30 rounded-lg bg-surface-container-low/30">
              <div className="flex flex-col">
                <span className="font-body font-semibold">Two-Factor Auth</span>
                <span className="text-caption text-on-surface-variant">SMS or Authenticator App</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input defaultChecked className="sr-only peer" type="checkbox"/>
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 p-3 bg-error-container/30 border border-error/20 rounded-lg text-error">
            <span className="material-symbols-outlined ">warning</span>
            <span className="text-caption font-bold">Recommended: Link Google Account</span>
          </div>
        </div>

        {/* System Preferences */}
        <div className="card-hover">
          <h3 className="section-title mb-6">
            <span className="material-symbols-outlined text-primary">settings_suggest</span> Preferences
          </h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="input-label">System Language</label>
              <select className="input-base w-full appearance-none" defaultValue="English (US)">
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="English (US)">English (US)</option>
              </select>
            </div>
            <div className="pt-4 border-t border-outline-variant/30">
              <p className="font-body font-semibold mb-3">Notification Settings</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body text-on-surface-variant">Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox"/>
                    <div className="w-10 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-on-surface-variant">Curriculum Reminders</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox"/>
                    <div className="w-10 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-on-surface-variant">System Updates</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox"/>
                    <div className="w-10 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/30">
              <p className="font-body font-semibold mb-3">Interface Theme</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 flex flex-col items-center gap-1 rounded-lg bg-surface border-2 border-primary text-primary">
                  <span className="material-symbols-outlined ">light_mode</span>
                  <span className="text-caption font-bold">Light</span>
                </button>
                <button className="flex-1 py-2 flex flex-col items-center gap-1 rounded-lg bg-surface-container-high border-2 border-transparent text-on-surface-variant">
                  <span className="material-symbols-outlined ">dark_mode</span>
                  <span className="text-caption font-bold">Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone / Advanced Options */}
      <div className="bg-surface-container-low/50 border border-outline-variant rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-error-container text-on-error-container rounded-full">
            <span className="material-symbols-outlined">delete_forever</span>
          </div>
          <div>
            <h4 className="font-body font-bold text-on-surface">Request Account Deactivation</h4>
            <p className="text-caption text-on-surface-variant">All your academic history and curriculum logs will be archived according to university policy.</p>
          </div>
        </div>
        <button className="btn-danger px-6 py-2 rounded-lg">Request Deactivation</button>
      </div>
    </div>
  );
};
