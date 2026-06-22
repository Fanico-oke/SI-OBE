import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

type TabId = 'general' | 'obe' | 'data' | 'notifications';

// ── localStorage keys ──
const LS_GENERAL = 'si_obe_settings_general';
const LS_NOTIFICATIONS = 'si_obe_settings_notifications';

// ── Type helpers ──
interface GeneralSettings {
  appName: string;
  institutionalAlias: string;
  timezone: string;
  language: string;
  dateFormat: string;
}

interface ObeSettings {
  cloMastery: number;
  ploTarget: number;
  weightFinal: number;
  weightMidterm: number;
  weightAssignment: number;
}

interface NotificationSettings {
  cloAlertEnabled: boolean;
  curriculumAlertEnabled: boolean;
}

// ── Defaults ──
const defaultGeneral: GeneralSettings = {
  appName: 'SI-OBE Academic System',
  institutionalAlias: '',
  timezone: '(GMT+07:00) Jakarta',
  language: 'Indonesian (ID)',
  dateFormat: 'DD/MM/YYYY',
};

const defaultObe: ObeSettings = {
  cloMastery: 75,
  ploTarget: 70,
  weightFinal: 40,
  weightMidterm: 30,
  weightAssignment: 30,
};

const defaultNotifications: NotificationSettings = {
  cloAlertEnabled: true,
  curriculumAlertEnabled: true,
};

// ── Toast component ──
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl bg-primary text-on-primary shadow-lg animate-fade-in">
      <span className="material-symbols-outlined">check_circle</span>
      <span className="font-body text-body font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-body">close</span>
      </button>
    </div>
  );
};

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // ── State per tab ──
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [obe, setObe] = useState<ObeSettings>(defaultObe);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);

  // ── Loading / feedback ──
  const [loadingObe, setLoadingObe] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Load General from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_GENERAL);
      if (raw) setGeneral(JSON.parse(raw));
    } catch { /* ignore corrupt data */ }
  }, []);

  // ── Load Notifications from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_NOTIFICATIONS);
      if (raw) setNotifications(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // ── Load OBE from backend ──
  useEffect(() => {
    let cancelled = false;
    const fetchObe = async () => {
      setLoadingObe(true);
      try {
        const { data } = await axios.get('/api/settings');
        if (cancelled) return;
        const settings: { key: string; value: string; category: string }[] = data;
        const obeMap: Record<string, string> = {};
        settings.forEach((s) => {
          if (s.category === 'obe') obeMap[s.key] = s.value;
        });
        setObe({
          cloMastery: obeMap.clo_mastery ? Number(obeMap.clo_mastery) : defaultObe.cloMastery,
          ploTarget: obeMap.plo_target ? Number(obeMap.plo_target) : defaultObe.ploTarget,
          weightFinal: obeMap.weight_final ? Number(obeMap.weight_final) : defaultObe.weightFinal,
          weightMidterm: obeMap.weight_midterm ? Number(obeMap.weight_midterm) : defaultObe.weightMidterm,
          weightAssignment: obeMap.weight_assignment ? Number(obeMap.weight_assignment) : defaultObe.weightAssignment,
        });
      } catch {
        // If API is unavailable, keep defaults
      } finally {
        if (!cancelled) setLoadingObe(false);
      }
    };
    fetchObe();
    return () => { cancelled = true; };
  }, []);

  // ── Save helpers ──
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const saveGeneral = () => {
    localStorage.setItem(LS_GENERAL, JSON.stringify(general));
    showToast('Pengaturan Umum berhasil disimpan');
  };

  const saveObe = async () => {
    setSaving(true);
    try {
      const entries = [
        { key: 'clo_mastery', value: String(obe.cloMastery), category: 'obe' },
        { key: 'plo_target', value: String(obe.ploTarget), category: 'obe' },
        { key: 'weight_final', value: String(obe.weightFinal), category: 'obe' },
        { key: 'weight_midterm', value: String(obe.weightMidterm), category: 'obe' },
        { key: 'weight_assignment', value: String(obe.weightAssignment), category: 'obe' },
      ];
      await Promise.all(entries.map((e) => axios.put('/api/settings', e)));
      showToast('Konfigurasi OBE berhasil disimpan');
    } catch {
      showToast('Gagal menyimpan — periksa koneksi server');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = () => {
    localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(notifications));
    showToast('Pengaturan Notifikasi berhasil disimpan');
  };

  // ── Discard helpers ──
  const discardChanges = () => {
    if (activeTab === 'general') {
      try {
        const raw = localStorage.getItem(LS_GENERAL);
        setGeneral(raw ? JSON.parse(raw) : defaultGeneral);
      } catch { setGeneral(defaultGeneral); }
    } else if (activeTab === 'notifications') {
      try {
        const raw = localStorage.getItem(LS_NOTIFICATIONS);
        setNotifications(raw ? JSON.parse(raw) : defaultNotifications);
      } catch { setNotifications(defaultNotifications); }
    }
    // OBE discard would re-fetch, but for simplicity we just reset to defaults
    if (activeTab === 'obe') setObe(defaultObe);
  };

  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: 'general', icon: 'tune', label: 'General' },
    { id: 'obe', icon: 'analytics', label: 'OBE Configuration' },
    { id: 'data', icon: 'hub', label: 'Data Integration' },
    { id: 'notifications', icon: 'mail_outline', label: 'Notifications' },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-gap_section">

        {/* Settings Internal Nav */}
        <nav className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                activeTab === tab.id
                  ? 'border-outline-variant bg-surface-container-lowest text-primary shadow-sm ring-2 ring-primary ring-offset-2 font-semibold'
                  : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:scale-[1.02]'
              }`}
            >
 <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="font-body text-body">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-gap_section min-w-0">

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title mb-6">Identity &amp; Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="input-label">Application Name</label>
                      <input
                        className="input-base"
                        type="text"
                        value={general.appName}
                        onChange={(e) => setGeneral({ ...general, appName: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="input-label">Institutional Alias</label>
                      <input
                        className="input-base"
                        placeholder="e.g. Universitas Excellence"
                        type="text"
                        value={general.institutionalAlias}
                        onChange={(e) => setGeneral({ ...general, institutionalAlias: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="input-label">Institution Logo</label>
                    <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group">
 <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                      <p className="font-body text-caption text-on-surface-variant text-center">Drag and drop or click to upload<br/><span className="text-caption  uppercase font-bold">PNG, SVG up to 2MB</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="section-title mb-6">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="input-label">Timezone</label>
                    <select
                      className="input-base bg-surface"
                      value={general.timezone}
                      onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                    >
                      <option>(GMT+07:00) Jakarta</option>
                      <option>(GMT+08:00) Singapore</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="input-label">Primary Language</label>
                    <select
                      className="input-base bg-surface"
                      value={general.language}
                      onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                    >
                      <option>Indonesian (ID)</option>
                      <option>English (US)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="input-label">Date Format</label>
                    <select
                      className="input-base bg-surface"
                      value={general.dateFormat}
                      onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
                    >
                      <option>DD/MM/YYYY</option>
                      <option>MM-DD-YYYY</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save footer for General */}
              <div className="sticky bottom-8 flex justify-end gap-4">
                <button className="btn-secondary px-8 py-3 rounded-xl" onClick={discardChanges}>
                  Discard Changes
                </button>
                <button className="btn-primary px-10 py-3 rounded-xl flex items-center gap-2" onClick={saveGeneral}>
 <span className="material-symbols-outlined ">save</span> Simpan
                </button>
              </div>
            </div>
          )}

          {/* OBE Configuration Tab */}
          {activeTab === 'obe' && (
            <div className="space-y-6">
              {loadingObe ? (
                <div className="card flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary animate-spin text-4xl">progress_activity</span>
                    <p className="font-body text-body text-on-surface-variant">Memuat konfigurasi OBE…</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card">
                    <h3 className="section-title mb-6">Attainment Thresholds</h3>
                    <div className="space-y-6">
                      <div className="p-4 bg-primary-fixed rounded-lg border border-primary/20 flex items-start gap-4">
 <span className="material-symbols-outlined text-primary">info</span>
                        <p className="font-body text-body text-on-primary-fixed-variant">Thresholds define the minimum score required for a Course Learning Outcome (CLO) or Program Learning Outcome (PLO) to be considered 'Attained'.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="input-label">CLO Mastery Level</label>
                            <span className="font-data-mono text-primary font-bold">{obe.cloMastery}%</span>
                          </div>
                          <input
                            className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                            max="100"
                            min="0"
                            type="range"
                            value={obe.cloMastery}
                            onChange={(e) => setObe({ ...obe, cloMastery: Number(e.target.value) })}
                          />
                          <p className="font-body text-caption text-on-surface-variant">Default benchmark for student achievement in individual courses.</p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="input-label">PLO Target Attainment</label>
                            <span className="font-data-mono text-secondary font-bold">{obe.ploTarget}%</span>
                          </div>
                          <input
                            className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
                            max="100"
                            min="0"
                            type="range"
                            value={obe.ploTarget}
                            onChange={(e) => setObe({ ...obe, ploTarget: Number(e.target.value) })}
                          />
                          <p className="font-body text-caption text-on-surface-variant">Global institutional target for program-level excellence.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="section-title mb-6">Default Weightage</h3>
                    <div className="table-container">
                      <table className="table-modern">
                        <thead>
                          <tr>
                            <th>Component</th>
                            <th>Standard Weight (%)</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Final Examination</td>
                            <td>
                              <input
                                className="w-20 input-base p-1 font-data-mono"
                                type="number"
                                value={obe.weightFinal}
                                onChange={(e) => setObe({ ...obe, weightFinal: Number(e.target.value) })}
                              />
                            </td>
                            <td><span className="badge-success">Locked</span></td>
                          </tr>
                          <tr>
                            <td>Mid-term Assessment</td>
                            <td>
                              <input
                                className="w-20 input-base p-1 font-data-mono"
                                type="number"
                                value={obe.weightMidterm}
                                onChange={(e) => setObe({ ...obe, weightMidterm: Number(e.target.value) })}
                              />
                            </td>
                            <td><span className="badge-primary">Editable</span></td>
                          </tr>
                          <tr>
                            <td>Assignments &amp; Projects</td>
                            <td>
                              <input
                                className="w-20 input-base p-1 font-data-mono"
                                type="number"
                                value={obe.weightAssignment}
                                onChange={(e) => setObe({ ...obe, weightAssignment: Number(e.target.value) })}
                              />
                            </td>
                            <td><span className="badge-primary">Editable</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Save footer for OBE */}
                  <div className="sticky bottom-8 flex justify-end gap-4">
                    <button className="btn-secondary px-8 py-3 rounded-xl" onClick={discardChanges}>
                      Discard Changes
                    </button>
                    <button
                      className="btn-primary px-10 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                      onClick={saveObe}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span> Menyimpan…
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined ">save</span> Simpan
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Data Integration Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gap_section">
                <div className="card flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="section-title">SIS Integration</h3>
                    <span className="badge-warning">Tidak Terhubung</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-col gap-2">
                      <label className="input-label">API Endpoint</label>
                      <code className="font-data-mono text-body p-3 bg-surface-container rounded-lg border border-outline-variant block break-all text-on-surface-variant italic">Belum dikonfigurasi</code>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="input-label">API Key</label>
                      <div className="relative">
                        <input className="input-base w-full font-data-mono pr-12" readOnly type="password" value="" placeholder="Belum ada API key"/>
                        <button className="absolute right-3 top-3 text-on-surface-variant hover:text-primary transition-colors">
 <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button className="btn-primary flex-1 py-2 rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" disabled>
 <span className="material-symbols-outlined ">sync</span> Test Connection
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h3 className="section-title mb-6">Sync Schedule</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low">
 <span className="material-symbols-outlined text-on-surface-variant ">schedule</span>
                      <div>
                        <p className="font-body text-body font-bold">Auto-Sync</p>
                        <p className="font-body text-caption text-on-surface-variant">Tidak tersedia — belum ada integrasi</p>
                      </div>
                      <div className="ml-auto">
                        <div className="relative inline-block w-12 h-6 rounded-full bg-surface-container-high p-1 cursor-not-allowed opacity-50">
                          <div className="w-4 h-4 rounded-full bg-surface"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="input-label">Frequency</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="p-3 border border-outline-variant rounded-lg text-center opacity-50 cursor-not-allowed" disabled>Daily</button>
                        <button className="p-3 border border-outline-variant rounded-lg text-center opacity-50 cursor-not-allowed" disabled>Weekly</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="section-title mb-6">Preferensi Notifikasi</h3>
                <div className="space-y-4">
                  {/* CLO Alert Toggle */}
                  <div className="group border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all">
                    <div className="bg-surface-container-low p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary">assignment_late</span>
                        <span className="font-body text-body font-bold">CLO Non-Attainment Alert</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.cloAlertEnabled}
                          onChange={(e) => setNotifications({ ...notifications, cloAlertEnabled: e.target.checked })}
                        />
                        <div className="w-12 h-6 rounded-full peer bg-surface-container-high peer-checked:bg-primary p-1 transition-colors">
                          <div className={`w-4 h-4 rounded-full bg-surface transition-transform ${notifications.cloAlertEnabled ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </label>
                    </div>
                    <div className="p-4 bg-surface">
                      <p className="font-body text-caption text-on-surface-variant italic line-clamp-2">"Dear [Lecturer_Name], This is to notify you that the attainment for course [Course_Code] has fallen below the [Threshold]% threshold..."</p>
                    </div>
                  </div>

                  {/* Curriculum Approval Toggle */}
                  <div className="group border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all">
                    <div className="bg-surface-container-low p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary">verified_user</span>
                        <span className="font-body text-body font-bold">Curriculum Approval Notification</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.curriculumAlertEnabled}
                          onChange={(e) => setNotifications({ ...notifications, curriculumAlertEnabled: e.target.checked })}
                        />
                        <div className="w-12 h-6 rounded-full peer bg-surface-container-high peer-checked:bg-primary p-1 transition-colors">
                          <div className={`w-4 h-4 rounded-full bg-surface transition-transform ${notifications.curriculumAlertEnabled ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </label>
                    </div>
                    <div className="p-4 bg-surface">
                      <p className="font-body text-caption text-on-surface-variant italic line-clamp-2">"Subject: Curriculum [Curriculum_Year] Approved. We are pleased to inform you that the Dean has approved the latest revision..."</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save footer for Notifications */}
              <div className="sticky bottom-8 flex justify-end gap-4">
                <button className="btn-secondary px-8 py-3 rounded-xl" onClick={discardChanges}>
                  Discard Changes
                </button>
                <button className="btn-primary px-10 py-3 rounded-xl flex items-center gap-2" onClick={saveNotifications}>
 <span className="material-symbols-outlined ">save</span> Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};
