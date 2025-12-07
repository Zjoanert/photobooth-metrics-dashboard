import React from 'react';
import './App.css';
import { DashboardPage } from './components/DashboardPage';
import { SettingsPage } from './components/SettingsPage';
import { ApiProvider } from './context/ApiContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { HttpEventApi, MockEventApi } from './api/dashboardEventApi';

type ActivePage = 'dashboard' | 'settings';

const AppShell: React.FC = () => {
  const [page, setPage] = React.useState<ActivePage>('dashboard');
  const { settings } = useSettings();

  const eventApi = React.useMemo(() => {
    return settings.apiMode === 'http'
      ? new HttpEventApi(settings.apiBaseUrl)
      : new MockEventApi();
  }, [settings]);

  return (
    <ApiProvider eventApi={eventApi}>
      <div className="app-shell">
        <header className="top-nav">
          <h1 className="app-title">Foto Monitoring</h1>
          <div className="nav-actions">
            <button
              className={page === 'dashboard' ? 'active' : ''}
              onClick={() => setPage('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={page === 'settings' ? 'active' : ''}
              onClick={() => setPage('settings')}
            >
              Settings
            </button>
          </div>
        </header>

        {page === 'dashboard' ? <DashboardPage /> : <SettingsPage />}
      </div>
    </ApiProvider>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
};

export default App;
