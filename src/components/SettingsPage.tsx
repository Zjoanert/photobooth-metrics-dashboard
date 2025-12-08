import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [apiMode, setApiMode] = useState(settings.apiMode);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);
  const [theme, setTheme] = useState(settings.theme);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);

    const trimmed = apiBaseUrl.trim() || 'http://localhost:3001';
    updateSettings({ apiMode, apiBaseUrl: trimmed, theme });
    setSaved(true);
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <h2>API Settings</h2>
        <p className="muted">Control which backend the dashboard should use.</p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <fieldset className="field">
            <legend>Data source</legend>
            <label className="option">
              <input
                type="radio"
                name="apiMode"
                checked={apiMode === 'mock'}
                onChange={() => setApiMode('mock')}
              />
              Use mock data
            </label>
            <label className="option">
              <input
                type="radio"
                name="apiMode"
                checked={apiMode === 'http'}
                onChange={() => setApiMode('http')}
              />
              Use HTTP API
            </label>
          </fieldset>

          <label className="field">
            <span>Base URL for HTTP API</span>
            <input
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              disabled={apiMode === 'mock'}
              placeholder="http://localhost:3001"
              required={apiMode === 'http'}
            />
            <small className="muted">
              Applied to all KPI and time-series requests when HTTP mode is enabled.
            </small>
          </label>

          <fieldset className="field">
            <legend>Theme</legend>
            <div className="option-row">
              <label className="option">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                />
                Light mode
              </label>
              <label className="option">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                />
                Dark mode
              </label>
            </div>
          </fieldset>

          <div className="actions">
            <button type="submit" className="primary">
              Save settings
            </button>
            {saved && <span className="success-text">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
};
