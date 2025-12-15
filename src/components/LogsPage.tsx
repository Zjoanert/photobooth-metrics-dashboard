import React, { useEffect, useMemo, useState } from 'react';
import { LogLevel } from '../api/logsApi';
import { downloadLogFile } from '../utils/downloadLogs';
import { useLogsData } from '../hooks/useLogsData';
import { useAvailableLogDates } from '../hooks/useAvailableLogDates';
import { ApplicationsPanel } from './logs/ApplicationsPanel';
import { LogsFilters } from './logs/LogsFilters';
import { LogsActions } from './logs/LogsActions';
import { LogLines } from './logs/LogLines';

const APPLICATIONS = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'printer', label: 'Printer' },
  { id: 'storage', label: 'Storage' },
  { id: 'camera', label: 'Camera' },
  { id: 'metrics', label: 'Metrics' },
];

const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'log', 'debug'];

/**
 * Presents a log viewer with application selection, filtering, and download controls.
 */
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
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = () => {
    setDownloadError(null);

    if (!selectedDate) {
      setDownloadError('Select a date before downloading logs.');
      return;
    }

    setIsDownloading(true);
    try {
      downloadLogFile(sortedEntries, selectedApp, selectedDate);
    } catch (error) {
      setDownloadError((error as Error).message ?? 'Failed to download logs');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="logs-page">
      <div className="logs-layout">
        <ApplicationsPanel
          applications={APPLICATIONS}
          selectedApp={selectedApp}
          customAppInput={customAppInput}
          onSelectApp={handleAppTabClick}
          onCustomAppChange={handleCustomAppChange}
        />

        <div className="logs-content">
          <header className="logs-header">
            <div>
              <h2>Application logs</h2>
              <p className="muted">
                Inspect recent log output per service. Use filters to narrow down the results.
              </p>
            </div>
            <div className="logs-controls">
              <LogsFilters
                logLevels={LOG_LEVELS}
                selectedLevels={selectedLevels}
                availableDates={availableDates}
                selectedDate={selectedDate}
                isLoadingDates={isLoadingDates}
                datesError={datesError}
                dateError={dateError}
                onToggleLevel={toggleLevel}
                onDateChange={handleDateChange}
              />

              <LogsActions
                disabled={!selectedDate || isDownloading || isLoading}
                isDownloading={isDownloading}
                onDownload={handleDownload}
              />
            </div>
          </header>

          <LogLines
            entries={sortedEntries}
            isLoading={isLoading}
            error={error}
            datesError={datesError}
            downloadError={downloadError}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};
