import React, { useMemo, useState } from 'react';
import { LogLevel } from '../api/logsApi';
import { TimeRange } from '../dashboardTypes';
import { useLogsData } from '../hooks/useLogsData';
import { TIME_RANGE_LABELS } from '../utils/timeRange';

const APPLICATIONS = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'printer', label: 'Printer' },
  { id: 'storage', label: 'Storage' },
  { id: 'camera', label: 'Camera' },
  { id: 'metrics', label: 'Metrics' },
];

const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'log', 'debug'];

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const normalizeMessage = (message: string | string[]): string => {
  return Array.isArray(message) ? message.join(' ') : message;
};

export const LogsPage: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<string>(APPLICATIONS[0].id);
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([
    'error',
    'warn',
    'info',
    'log',
  ]);
  const [range, setRange] = useState<TimeRange>(TimeRange.Today);

  const { entries, error, isLoading } = useLogsData(selectedApp, selectedLevels, range);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [entries],
  );

  const toggleLevel = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level],
    );
  };

  return (
    <div className="logs-page">
      <div className="logs-layout">
        <aside className="logs-app-tabs" aria-label="Applications">
          {APPLICATIONS.map((app) => (
            <button
              key={app.id}
              className={selectedApp === app.id ? 'tab active' : 'tab'}
              onClick={() => setSelectedApp(app.id)}
            >
              {app.label}
            </button>
          ))}
        </aside>

        <div className="logs-content">
          <header className="logs-header">
            <div>
              <h2>Application logs</h2>
              <p className="muted">
                Inspect recent log output per service. Use filters to narrow down the results.
              </p>
            </div>
            <div className="logs-filters">
              <label className="field compact">
                <span>Log levels</span>
                <div className="level-options">
                  {LOG_LEVELS.map((level) => (
                    <label key={level} className="chip">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={() => toggleLevel(level)}
                      />
                      {level.toUpperCase()}
                    </label>
                  ))}
                </div>
              </label>

              <label className="field compact">
                <span>Range</span>
                <select value={range} onChange={(e) => setRange(e.target.value as TimeRange)}>
                  {(Object.keys(TIME_RANGE_LABELS) as Array<keyof typeof TIME_RANGE_LABELS>).map(
                    (key) => (
                      <option key={key} value={key}>
                        {TIME_RANGE_LABELS[key as TimeRange]}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </header>

          <section className="log-terminal" aria-live="polite">
            {isLoading && <p className="muted">Loading logs…</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && sortedEntries.length === 0 && (
              <p className="muted">No log lines for this selection.</p>
            )}
            {!isLoading && !error && sortedEntries.length > 0 && (
              <div className="log-lines">
                {sortedEntries.map((entry, index) => (
                  <div className={`log-line level-${entry.level}`} key={`${entry.timestamp}-${index}`}>
                    <span className="log-time">{formatTimestamp(entry.timestamp)}</span>
                    <span className="log-level">{entry.level.toUpperCase()}</span>
                    <span className="log-message">{normalizeMessage(entry.message)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
