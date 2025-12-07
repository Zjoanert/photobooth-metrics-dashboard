import React from 'react';

export type ApiMode = 'mock' | 'http';

export interface DashboardSettings {
  apiMode: ApiMode;
  apiBaseUrl: string;
}

interface SettingsContextValue {
  settings: DashboardSettings;
  updateSettings(next: DashboardSettings): void;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  apiMode: 'mock',
  apiBaseUrl: 'http://localhost:3001',
};

const STORAGE_KEY = 'dashboardSettings';

const readSettings = (): DashboardSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<DashboardSettings>;
    return {
      apiMode: parsed.apiMode === 'http' ? 'http' : 'mock',
      apiBaseUrl: parsed.apiBaseUrl || DEFAULT_SETTINGS.apiBaseUrl,
    };
  } catch (error) {
    console.warn('Failed to read settings, falling back to defaults', error);
    return DEFAULT_SETTINGS;
  }
};

export const SettingsContext = React.createContext<SettingsContextValue | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = React.useState<DashboardSettings>(() =>
    readSettings(),
  );

  const updateSettings = (next: DashboardSettings) => {
    setSettings(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('SettingsContext missing');
  return ctx;
}
