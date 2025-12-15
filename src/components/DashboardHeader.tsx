import React from 'react';
import { DashboardPreset, TimeRange, TimeRangeValue } from '../dashboardTypes';
import {
  TIME_RANGE_LABELS,
  createDefaultCustomRange,
  ensureValidCustomRange,
  formatTimeRangeLabel,
  fromInputDateTimeValue,
  isCustomRange,
  toInputDateTimeValue,
} from '../utils/timeRange';

interface DashboardHeaderProps {
  globalTimeRange: TimeRangeValue;
  onGlobalTimeRangeChange(range: TimeRangeValue): void;
  presets: DashboardPreset[];
  activePresetId: string;
  onPresetChange(id: string): void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  globalTimeRange,
  onGlobalTimeRangeChange,
  presets,
  activePresetId,
  onPresetChange,
}) => {
  const handleCustomChange = (field: 'start' | 'end', value: string) => {
    const iso = fromInputDateTimeValue(value);
    if (!iso) return;

    const current = isCustomRange(globalTimeRange)
      ? globalTimeRange
      : createDefaultCustomRange();

    const next = ensureValidCustomRange({ ...current, [field]: iso });
    onGlobalTimeRangeChange(next);
  };

  const handleRangeSelect = (value: string) => {
    if (value === 'custom') {
      onGlobalTimeRangeChange(
        isCustomRange(globalTimeRange) ? globalTimeRange : createDefaultCustomRange(),
      );
      return;
    }
    onGlobalTimeRangeChange(value as TimeRange);
  };

  const isCustom = isCustomRange(globalTimeRange);

  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-title">Foto Monitoring</h1>
        <div className="preset-select">
          <label htmlFor="preset">Preset:</label>
          <select
            id="preset"
            className="select-control compact"
            value={activePresetId}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="time-range-picker" role="group" aria-label="Global time range">
        <select
          className="select-control compact"
          value={isCustom ? 'custom' : globalTimeRange ?? TimeRange.Today}
          onChange={(e) => handleRangeSelect(e.target.value)}
        >
          {[TimeRange.Today, TimeRange.Month, TimeRange.Always].map((range) => (
            <option key={range} value={range}>
              {TIME_RANGE_LABELS[range]}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        {isCustom && (
          <div className="custom-range-fields">
            <label className="hint">
              Start
              <input
                type="datetime-local"
                value={toInputDateTimeValue(globalTimeRange.start)}
                onChange={(e) => handleCustomChange('start', e.target.value)}
              />
            </label>
            <label className="hint">
              End
              <input
                type="datetime-local"
                value={toInputDateTimeValue(globalTimeRange.end)}
                onChange={(e) => handleCustomChange('end', e.target.value)}
              />
            </label>
          </div>
        )}
        {!isCustom && <span className="hint">{formatTimeRangeLabel(globalTimeRange)}</span>}
      </div>
    </header>
  );
};
