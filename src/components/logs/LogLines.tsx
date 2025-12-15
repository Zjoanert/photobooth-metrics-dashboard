import React from 'react';
import { LogEntry } from '../../api/logsApi';

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const normalizeMessage = (message: string | string[]): string =>
  Array.isArray(message) ? message.join(' ') : message;

interface LogLinesProps {
  entries: LogEntry[];
  isLoading: boolean;
  error: string | null;
  datesError: string | null;
  downloadError: string | null;
  selectedDate: string | null;
}

export const LogLines: React.FC<LogLinesProps> = ({
  entries,
  isLoading,
  error,
  datesError,
  downloadError,
  selectedDate,
}) => {
  return (
    <section className="log-terminal" aria-live="polite">
      {datesError && <p className="error">{datesError}</p>}
      {!selectedDate && !isLoading && <p className="muted">Select a date to view logs.</p>}
      {isLoading && <p className="muted">Loading logs…</p>}
      {error && <p className="error">{error}</p>}
      {downloadError && <p className="error">{downloadError}</p>}
      {!isLoading && !error && selectedDate && entries.length === 0 && (
        <p className="muted">No log lines for this selection.</p>
      )}
      {!isLoading && !error && selectedDate && entries.length > 0 && (
        <div className="log-lines">
          {entries.map((entry, index) => (
            <div className={`log-line level-${entry.level}`} key={`${entry.timestamp}-${index}`}>
              <span className="log-time">{formatTimestamp(entry.timestamp)}</span>
              <span className="log-level">{entry.level.toUpperCase()}</span>
              <span className="log-message">{normalizeMessage(entry.message)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
