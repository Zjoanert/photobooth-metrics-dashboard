import React, { useState } from 'react';
import { useEventApi } from '../context/ApiContext';
import { downloadDashboardCsv } from '../utils/downloadCsv';
import { DashboardHeader } from './DashboardHeader';
import { DashboardToolbar } from './DashboardToolbar';
import { TileGrid } from './TileGrid';
import { useDashboardState } from '../hooks/useDashboardState';

/**
 * Displays the main metrics dashboard with configurable tiles, presets, and CSV export.
 */
export const DashboardPage: React.FC = () => {
  const eventApi = useEventApi();
  const {
    presets,
    tiles,
    activePreset,
    activePresetId,
    globalTimeRange,
    isEditMode,
    setGlobalTimeRange,
    toggleEditMode,
    handlePresetChange,
    handleTileChange,
    handleAddTile,
    handleDeleteTile,
    handleReorderTiles,
  } = useDashboardState();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadCsv = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadDashboardCsv(tiles, globalTimeRange, eventApi);
    } catch (error) {
      setDownloadError((error as Error).message ?? 'Failed to download metrics');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader
        globalTimeRange={globalTimeRange}
        onGlobalTimeRangeChange={setGlobalTimeRange}
        presets={presets}
        activePresetId={activePresetId}
        onPresetChange={handlePresetChange}
      />

      <DashboardToolbar
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onAddTile={handleAddTile}
        onDownloadCsv={handleDownloadCsv}
        isDownloading={isDownloading}
      />
      {downloadError && <p className="error">{downloadError}</p>}

      <TileGrid
        tiles={tiles}
        isEditMode={isEditMode}
        globalTimeRange={globalTimeRange}
        onTilesReorder={handleReorderTiles}
        onTileChange={handleTileChange}
        onTileDelete={handleDeleteTile}
      />
      {activePreset && (
        <p className="preset-hint">Preset: {activePreset.name}</p>
      )}
    </div>
  );
};
