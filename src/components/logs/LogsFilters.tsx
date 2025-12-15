import React from 'react';
import { LogLevel } from '../../api/logsApi';

interface LogsFiltersProps {
  logLevels: LogLevel[];
  selectedLevels: LogLevel[];
  availableDates: string[];
  selectedDate: string | null;
  isLoadingDates: boolean;
  datesError: string | null;
  dateError: string | null;
  onToggleLevel: (level: LogLevel) => void;
  onDateChange: (value: string) => void;
}

export const LogsFilters: React.FC<LogsFiltersProps> = ({
  logLevels,
  selectedLevels,
  availableDates,
  selectedDate,
  isLoadingDates,
  datesError,
  dateError,
  onToggleLevel,
  onDateChange,
}) => {
  return (
    <div className="logs-filters">
      <label className="field compact">
        <span>Log levels</span>
        <div className="level-options">
          {logLevels.map((level) => (
            <label key={level} className="chip">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level)}
                onChange={() => onToggleLevel(level)}
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
          onChange={(e) => onDateChange(e.target.value)}
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
  );
};
