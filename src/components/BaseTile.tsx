import React from 'react';
import { TileConfig, TimeRange, TileTimeMode, TimeRangeValue } from '../dashboardTypes';
import {
  TIME_RANGE_LABELS,
  createDefaultCustomRange,
  ensureValidCustomRange,
  formatTimeRangeLabel,
  fromInputDateTimeValue,
  isCustomRange,
  toInputDateTimeValue,
} from '../utils/timeRange';

interface BaseTileProps {
  tile: TileConfig;
  globalTimeRange: TimeRangeValue;
  isEditMode: boolean;
  isLoading: boolean;
  error?: string;
  onLocalTimeRangeChange(mode: TileTimeMode, range?: TimeRangeValue): void;
  onOpenSettings(): void;
  onDelete?(id: string): void;
  children: React.ReactNode;
}

export const BaseTile: React.FC<BaseTileProps> = ({
  tile,
  globalTimeRange,
  isEditMode,
  isLoading,
  error,
  onLocalTimeRangeChange,
  onOpenSettings,
  onDelete,
  children,
}) => {
  const overrideRange = tile.overrideTimeRange ?? TimeRange.Today;

  const handleCustomRangeChange = (
    field: 'start' | 'end',
    value: string,
  ) => {
    const iso = fromInputDateTimeValue(value);
    if (!iso) return;

    const current = isCustomRange(overrideRange)
      ? overrideRange
      : createDefaultCustomRange();

    const next = ensureValidCustomRange({ ...current, [field]: iso });
    onLocalTimeRangeChange('override', next);
  };

  const timeRangeSelector = (
    <div className="tile-time-controls">
      <select
        className="select-control compact"
        value={tile.timeMode}
        onChange={(e) =>
          onLocalTimeRangeChange(e.target.value as TileTimeMode, tile.overrideTimeRange)
        }
      >
        <option value="global">Follow global</option>
        <option value="override">Override</option>
      </select>
      {tile.timeMode === 'override' && (
        <>
          <select
            className="select-control compact"
            value={isCustomRange(overrideRange) ? 'custom' : overrideRange}
            onChange={(e) =>
              onLocalTimeRangeChange(
                'override',
                e.target.value === 'custom'
                  ? createDefaultCustomRange()
                  : ((e.target.value as TimeRange) ?? overrideRange),
              )
            }
          >
            {[TimeRange.Today, TimeRange.Month, TimeRange.Always].map((range) => (
              <option key={range} value={range}>
                {TIME_RANGE_LABELS[range]}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {isCustomRange(overrideRange) && (
            <div className="custom-range-fields">
              <label className="hint">
                Start
                <input
                  type="datetime-local"
                  value={toInputDateTimeValue(overrideRange.start)}
                  onChange={(e) => handleCustomRangeChange('start', e.target.value)}
                />
              </label>
              <label className="hint">
                End
                <input
                  type="datetime-local"
                  value={toInputDateTimeValue(overrideRange.end)}
                  onChange={(e) => handleCustomRangeChange('end', e.target.value)}
                />
              </label>
            </div>
          )}
        </>
      )}
      {tile.timeMode === 'global' && <span className="hint">{formatTimeRangeLabel(globalTimeRange)}</span>}
    </div>
  );

  return (
    <div className="tile">
      <div className="tile-header">
        <div>
          <p className="tile-label">{tile.label}</p>
          {timeRangeSelector}
        </div>
        <div className="tile-actions">
          {isEditMode && <span className="drag-handle" aria-hidden>⋮⋮</span>}
          {isEditMode && onDelete && (
            <button
              className="icon-button danger"
              aria-label="Delete tile"
              onClick={() => onDelete(tile.id)}
            >
              🗑️
            </button>
          )}
          <button className="icon-button" aria-label="Tile settings" onClick={onOpenSettings}>
            ⚙️
          </button>
        </div>
      </div>
      <div className="tile-body">
        {isLoading ? <p className="muted">Loading…</p> : error ? <p className="error">{error}</p> : children}
      </div>
    </div>
  );
};
