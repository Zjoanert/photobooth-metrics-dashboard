import React, { useEffect, useMemo, useState } from 'react';
import { LogLevel } from '../api/logsApi';
import { useLogsData } from '../hooks/useLogsData';
import { useAvailableLogDates } from '../hooks/useAvailableLogDates';

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
  const [customAppInput, setCustomAppInput] = useState<string>('');
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([
    'error',
    'warn',
    'info',
    'log',
  ]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const { dates: availableDates, error: datesError, isLoading: isLoadingDates } =
    useAvailableLogDates(selectedApp);
  const { entries, error, isLoading } = useLogsData(selectedApp, selectedLevels, selectedDate);

  useEffect(() => {
    if (availableDates.length) {
      setSelectedDate((prev) => (prev && availableDates.includes(prev) ? prev : availableDates[0]));
      setDateError(null);
    } else {
      setSelectedDate(null);
    }
  }, [availableDates]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [entries],
  );

  const toggleLevel = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level],
    );
  };

  const handleAppTabClick = (appId: string) => {
    setSelectedApp(appId);
    setCustomAppInput('');
  };

  const handleCustomAppChange = (value: string) => {
    setCustomAppInput(value);
    const trimmed = value.trim();
    if (trimmed) {
      setSelectedApp(trimmed);
    }
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      setSelectedDate(null);
      return;
    }

    if (!availableDates.includes(value)) {
      setDateError('No logs available for that date.');
      return;
    }

    setDateError(null);
    setSelectedDate(value);
  };

  return (
    <div className="logs-page">
      <div className="logs-layout">
        <aside className="logs-app-tabs" aria-label="Applications">
          {APPLICATIONS.map((app) => (
            <button
              key={app.id}
              className={selectedApp === app.id ? 'tab active' : 'tab'}
              onClick={() => handleAppTabClick(app.id)}
            >
              {app.label}
            </button>
          ))}

          <div className="custom-app">
            <label className="field compact">
              <span>Custom application</span>
              <input
                type="text"
                placeholder="Enter application id"
                value={customAppInput}
                onChange={(e) => handleCustomAppChange(e.target.value)}
              />
              <p className="muted helper-text">Fetch logs for any service name.</p>
            </label>
          </div>
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
                <span>Date</span>
                <input
                  type="date"
                  value={selectedDate ?? ''}
                  list="available-log-dates"
                  min={availableDates.length ? availableDates[availableDates.length - 1] : undefined}
                  max={availableDates.length ? availableDates[0] : undefined}
                  onChange={(e) => handleDateChange(e.target.value)}
                  disabled={isLoadingDates || availableDates.length === 0}
                />
                <datalist id="available-log-dates">
                  {availableDates.map((date) => (
                    <option key={date} value={date} />
                  ))}
                </datalist>
                {isLoadingDates && <span className="muted helper-text">Loading available dates…</span>}
                {datesError && <span className="error helper-text">{datesError}</span>}
                {dateError && <span className="error helper-text">{dateError}</span>}
                {!isLoadingDates && !datesError && availableDates.length === 0 && (
                  <span className="muted helper-text">No log dates available.</span>
                )}
              </label>
            </div>
          </header>

          <section className="log-terminal" aria-live="polite">
            {datesError && <p className="error">{datesError}</p>}
            {!selectedDate && !isLoadingDates && (
              <p className="muted">Select a date to view logs.</p>
            )}
            {isLoading && <p className="muted">Loading logs…</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && selectedDate && sortedEntries.length === 0 && (
              <p className="muted">No log lines for this selection.</p>
            )}
            {!isLoading && !error && selectedDate && sortedEntries.length > 0 && (
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
