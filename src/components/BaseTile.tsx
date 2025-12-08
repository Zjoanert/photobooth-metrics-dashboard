import React from 'react';
import { TileConfig, TimeRange, TileTimeMode } from '../dashboardTypes';
import { TIME_RANGE_LABELS } from '../utils/timeRange';

interface BaseTileProps {
  tile: TileConfig;
  globalTimeRange: TimeRange;
  isEditMode: boolean;
  isLoading: boolean;
  error?: string;
  onLocalTimeRangeChange(mode: TileTimeMode, range?: TimeRange): void;
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
  const timeRangeSelector = (
    <div className="tile-time-controls">
      <select
        value={tile.timeMode}
        onChange={(e) =>
          onLocalTimeRangeChange(e.target.value as TileTimeMode, tile.overrideTimeRange)
        }
      >
        <option value="global">Follow global</option>
        <option value="override">Override</option>
      </select>
      {tile.timeMode === 'override' && (
        <select
          value={tile.overrideTimeRange}
          onChange={(e) =>
            onLocalTimeRangeChange(
              'override',
              (e.target.value as TimeRange) ?? tile.overrideTimeRange,
            )
          }
        >
          {[TimeRange.Today, TimeRange.Month, TimeRange.Always].map((range) => (
            <option key={range} value={range}>
              {TIME_RANGE_LABELS[range]}
            </option>
          ))}
        </select>
      )}
      {tile.timeMode === 'global' && <span className="hint">{TIME_RANGE_LABELS[globalTimeRange]}</span>}
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
