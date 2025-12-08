import React from 'react';
import { TileConfig, TimeRange } from '../dashboardTypes';
import { KpiTile } from './KpiTile';
import { ChartTile } from './ChartTile';
import { TileSettingsDialog } from './TileSettingsDialog';

interface TileGridProps {
  tiles: TileConfig[];
  isEditMode: boolean;
  globalTimeRange: TimeRange;
  onTilesReorder(next: TileConfig[]): void;
  onTileChange(id: string, patch: Partial<TileConfig>): void;
  onTileDelete(id: string): void;
}

export const TileGrid: React.FC<TileGridProps> = ({
  tiles,
  isEditMode,
  globalTimeRange,
  onTilesReorder,
  onTileChange,
  onTileDelete,
}) => {
  const [activeTile, setActiveTile] = React.useState<TileConfig | null>(null);

  const handleSaveTile = (nextTile: TileConfig) => {
    onTileChange(nextTile.id, nextTile);
    setActiveTile(null);
  };

  const handleDeleteTile = (id: string) => {
    if (activeTile?.id === id) {
      setActiveTile(null);
    }
    onTileDelete(id);
  };

  return (
    <div className="tile-grid">
      {tiles.map((tile) => {
        const common = {
          tile,
          globalTimeRange,
          isEditMode,
          onUpdateTile: onTileChange,
          onOpenSettings: setActiveTile,
          onDelete: handleDeleteTile,
        };

        return tile.type === 'kpi' ? (
          <KpiTile key={tile.id} {...common} />
        ) : (
          <ChartTile key={tile.id} {...common} />
        );
      })}
      {activeTile && (
        <TileSettingsDialog
          tile={activeTile}
          open={Boolean(activeTile)}
          onClose={() => setActiveTile(null)}
          onSave={handleSaveTile}
        />
      )}
    </div>
  );
};
