import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', { username, password });
      const { token, ...userData } = res.data;
      login(userData, token);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Gagal terhubung ke server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      await axios.post('/api/auth/seed');
      alert('Berhasil men-generate 4 akun dummy: kaprodi, dosen, 120220001, admin. (Password: 123)');
    } catch (e) {
      alert('Gagal generate dummy. Pastikan backend jalan.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Dark Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-dark relative overflow-hidden flex-col justify-between p-12">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-tertiary/30 to-primary/20 blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 to-tertiary/10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

        {/* Brand Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] icon-fill">school</span>
            </div>
            <span className="text-on-surface-dark font-bold text-2xl tracking-tight">SI-OBE</span>
          </div>
        </div>

        {/* Center hero text */}
        <div className="relative z-10 animate-fade-in-up">
          <h1 className="text-5xl font-bold text-on-surface-dark leading-tight tracking-tight mb-6">
            Kelola Kurikulum<br/>
            <span className="text-tertiary">Berbasis OBE</span><br/>
            dengan Mudah.
          </h1>
          <p className="text-on-surface-dark-dim text-lg max-w-md leading-relaxed">
            Platform terintegrasi untuk siklus Plan-Do-Check-Act dalam pengelolaan Outcome-Based Education.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          <div className="animate-stagger" style={{ '--i': 0 } as any}>
            <p className="text-4xl font-bold text-tertiary">4</p>
            <p className="text-on-surface-dark-dim text-sm mt-1">Fase PDCA</p>
          </div>
          <div className="animate-stagger" style={{ '--i': 1 } as any}>
            <p className="text-4xl font-bold text-secondary">100%</p>
            <p className="text-on-surface-dark-dim text-sm mt-1">OBE Compliance</p>
          </div>
          <div className="animate-stagger" style={{ '--i': 2 } as any}>
            <p className="text-4xl font-bold text-primary-fixed-dim">CQI</p>
            <p className="text-on-surface-dark-dim text-sm mt-1">Continuous Improvement</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="flex-1 flex flex-col justify-center bg-background px-6 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] icon-fill">school</span>
              </div>
              <span className="text-on-surface font-bold text-2xl tracking-tight">SI-OBE</span>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2">
              Selamat Datang 👋
            </h2>
            <p className="text-on-surface-variant mb-8">
              Masuk ke portal untuk mengelola kurikulum OBE Anda
            </p>
          </div>

          <form className="space-y-5 animate-fade-in-up" style={{ animationDelay: '200ms' }} onSubmit={handleLogin}>
            <div>
              <label className="input-label">Username</label>
              <input
                type="text"
                required
                className="input-base mt-1"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                className="input-base mt-1"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-error text-sm bg-error/10 p-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk ke Portal
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
