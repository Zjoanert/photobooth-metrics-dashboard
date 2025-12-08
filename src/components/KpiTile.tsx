import React from 'react';
import { TileConfig, TimeRange } from '../dashboardTypes';
import { BaseTile } from './BaseTile';
import { useTileData } from '../hooks/useTileData';

interface KpiTileProps {
  tile: TileConfig;
  globalTimeRange: TimeRange;
  isEditMode: boolean;
  onUpdateTile(id: string, patch: Partial<TileConfig>): void;
  onOpenSettings(tile: TileConfig): void;
  onDelete?(id: string): void;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  tile,
  globalTimeRange,
  isEditMode,
  onUpdateTile,
  onOpenSettings,
  onDelete,
}) => {
  const { isLoading, error, kpi } = useTileData(tile, globalTimeRange);
  const decimals = tile.decimals ?? 0;
  const valueText = kpi?.value.toFixed(decimals) ?? '--';

  return (
    <BaseTile
      tile={tile}
      globalTimeRange={globalTimeRange}
      isEditMode={isEditMode}
      isLoading={isLoading}
      error={error}
      onLocalTimeRangeChange={(mode, range) =>
        onUpdateTile(tile.id, {
          timeMode: mode,
          overrideTimeRange: range,
        })
      }
      onOpenSettings={() => onOpenSettings(tile)}
      onDelete={onDelete}
    >
      <div className="kpi">
        <div className="kpi-value">
          {valueText}
          {tile.unit && <span className="kpi-unit"> {tile.unit}</span>}
        </div>
        {typeof kpi?.trendPercent === 'number' && (
          <div className={`kpi-trend ${kpi.trendPercent >= 0 ? 'positive' : 'negative'}`}>
            {kpi.trendPercent >= 0 ? '+' : ''}
            {kpi.trendPercent}% vs prev
          </div>
        )}
      </div>
    </BaseTile>
  );
};
