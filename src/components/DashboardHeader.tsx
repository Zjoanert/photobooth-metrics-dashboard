import React from 'react';
import { DashboardPreset, TimeRange } from '../dashboardTypes';
import { TIME_RANGE_LABELS } from '../utils/timeRange';

interface DashboardHeaderProps {
  globalTimeRange: TimeRange;
  onGlobalTimeRangeChange(range: TimeRange): void;
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
  return (
    <header className="dashboard-header">
      <div>
        <h1 className="dashboard-title">Foto Monitoring</h1>
        <div className="preset-select">
          <label htmlFor="preset">Preset:</label>
          <select
            id="preset"
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
      <div className="segmented-control" role="group" aria-label="Global time range">
        {([TimeRange.Today, TimeRange.Month, TimeRange.Always] as TimeRange[]).map(
          (range) => (
            <button
              key={range}
              className={
                globalTimeRange === range ? 'segmented-button active' : 'segmented-button'
              }
              onClick={() => onGlobalTimeRangeChange(range)}
            >
              {TIME_RANGE_LABELS[range]}
            </button>
          ),
        )}
      </div>
    </header>
  );
};
