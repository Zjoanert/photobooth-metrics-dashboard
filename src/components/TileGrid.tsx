import React from 'react';
import { TileConfig, TimeRangeValue } from '../dashboardTypes';
import { KpiTile } from './KpiTile';
import { ChartTile } from './ChartTile';
import { TileSettingsDialog } from './TileSettingsDialog';
import { RecencyTile } from './RecencyTile';

interface TileGridProps {
  tiles: TileConfig[];
  isEditMode: boolean;
  globalTimeRange: TimeRangeValue;
  onTilesReorder(sourceId: string, targetId: string): void;
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
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

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

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isEditMode) return;

    setDraggingId(id);
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    if (!isEditMode) return;

    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggingId;

    if (sourceId && sourceId !== targetId) {
      onTilesReorder(sourceId, targetId);
    }

    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
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

        const content = (() => {
          switch (tile.type) {
            case 'kpi':
              return <KpiTile {...common} />;
            case 'chart':
              return <ChartTile {...common} />;
            case 'recency':
              return <RecencyTile {...common} />;
            default:
              return null;
          }
        })();

        return (
          <div
            key={tile.id}
            className={`tile-wrapper${draggingId === tile.id ? ' dragging' : ''}`}
            draggable={isEditMode}
            onDragStart={(event) => handleDragStart(event, tile.id)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, tile.id)}
            onDragEnd={handleDragEnd}
          >
            {content}
          </div>
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
