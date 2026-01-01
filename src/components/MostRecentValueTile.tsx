import React, { useMemo } from 'react';
import { TileConfig, TimeRangeValue } from '../dashboardTypes';
import { BaseTile } from './BaseTile';
import { useTileData } from '../hooks/useTileData';

interface RecencyTileProps {
  tile: TileConfig;
  globalTimeRange: TimeRangeValue;
  isEditMode: boolean;
  onUpdateTile(id: string, patch: Partial<TileConfig>): void;
  onOpenSettings(tile: TileConfig): void;
  onDelete?(id: string): void;
}

export const MostRecentValueTile: React.FC<RecencyTileProps> = ({
  tile,
  globalTimeRange,
  isEditMode,
  onUpdateTile,
  onOpenSettings,
  onDelete,
}) => {
  const { isLoading, error, latestEvent } = useTileData(tile, globalTimeRange);

  const lastEventDate = useMemo(
    () => (latestEvent ? new Date(latestEvent.timestamp) : undefined),
    [latestEvent],
  );

  return (
    <BaseTile
      tile={tile}
      globalTimeRange={globalTimeRange}
      isEditMode={isEditMode}
      isLoading={isLoading}
      error={error}
      onLocalTimeRangeChange={(mode, range) =>
        onUpdateTile(tile.id, { timeMode: mode, overrideTimeRange: range })
      }
      onOpenSettings={() => onOpenSettings(tile)}
      onDelete={onDelete}
    >
      {lastEventDate ? (
        <div className="elapsed-timer">
          <div className="elapsed-time">{latestEvent?.value}</div>
          <div className="elapsed-meta">At {lastEventDate.toLocaleString()}</div>
        </div>
      ) : (
        <p className="muted">No events yet</p>
      )}
    </BaseTile>
  );
};
