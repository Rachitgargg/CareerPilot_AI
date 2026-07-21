import { useEffect, useState } from 'react';
import { User, Palette, ShieldCheck, Plug, Bell, CreditCard, Download, Trash2 } from 'lucide-react';
import type { NotificationPreference } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { settingsService } from '@/services/profileService';
import { cn } from '@/utils/cn';

const sections = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
  { id: 'integrations', label: 'API & Integrations', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('privacy');
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    settingsService.getPrivacyPreferences().then(setPreferences);
  }, []);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
    const target = preferences.find((p) => p.id === id);
    if (target) settingsService.updatePreference(id, !target.enabled);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setFeedback(null);
    try {
      await settingsService.exportData();
      setFeedback('Data exported successfully! Check your downloads folder.');
    } catch {
      alert('Failed to export account data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    const doubleCheck = confirm('Are you sure you want to permanently delete your account? This action is irreversible.');
    if (!doubleCheck) return;

    setIsDeleting(true);
    setFeedback(null);
    try {
      await settingsService.deleteAccount();
      setFeedback('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        localStorage.removeItem('careerpilot_session_id');
        window.location.href = '/';
      }, 2000);
    } catch {
      alert('Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout header={{ title: 'Settings' }}>
      <div className="px-4 md:px-container-padding py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-card-gap max-w-5xl mx-auto w-full">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible scrollbar-none">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-full md:rounded-xl whitespace-nowrap font-body-md text-body-md transition-colors',
                activeSection === section.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              )}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          {activeSection === 'privacy' ? (
            <>
              <div>
                <h2 className="font-headline-md text-headline-md text-primary">Privacy & Data</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Control how your data is used to improve CareerPilot AI's models.
                </p>
              </div>

              {feedback && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-panel p-4 text-xs font-metadata">
                  {feedback}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex items-start justify-between gap-6"
                  >
                    <div>
                      <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">{pref.label}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        {pref.description}
                      </p>
                    </div>
                    <Switch checked={pref.enabled} onCheckedChange={() => togglePreference(pref.id)} />
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Export your data</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Download a copy of all your CareerPilot AI data.
                  </p>
                </div>
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? 'Exporting...' : (
                    <>
                      <Download size={16} className="mr-1" /> Export
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-error-container/40 rounded-card border border-error/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-body-lg text-body-lg font-semibold text-on-error-container">
                    Delete account
                  </h3>
                  <p className="font-body-md text-body-md text-on-error-container/80 mt-1">
                    Permanently remove your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : (
                    <>
                      <Trash2 size={16} className="mr-1" /> Delete
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-surface-container-low rounded-card p-10 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                {sections.find((s) => s.id === activeSection)?.label} settings coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
