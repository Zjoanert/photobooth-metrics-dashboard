import React, { useEffect, useMemo, useState } from 'react';
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

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => value.toString().padStart(2, '0');
  const timePart = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return days > 0 ? `${days}d ${timePart}` : timePart;
};

export const RecencyTile: React.FC<RecencyTileProps> = ({
  tile,
  globalTimeRange,
  isEditMode,
  onUpdateTile,
  onOpenSettings,
  onDelete,
}) => {
  const { isLoading, error, latestEventTimestamp } = useTileData(tile, globalTimeRange);
  const [elapsedText, setElapsedText] = useState<string>('');

  const lastEventDate = useMemo(
    () => (latestEventTimestamp ? new Date(latestEventTimestamp) : undefined),
    [latestEventTimestamp],
  );

  useEffect(() => {
    if (!lastEventDate) {
      setElapsedText('');
      return undefined;
    }

    const updateElapsed = () => {
      const diff = Date.now() - lastEventDate.getTime();
      setElapsedText(formatDuration(diff));
    };

    updateElapsed();
    const id = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(id);
  }, [lastEventDate]);

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
          <div className="elapsed-time">{elapsedText}</div>
          <div className="elapsed-meta">Last event at {lastEventDate.toLocaleString()}</div>
        </div>
      ) : (
        <p className="muted">No events yet</p>
      )}
    </BaseTile>
  );
};
