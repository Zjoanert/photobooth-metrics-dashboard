import React, { useMemo, useState } from 'react';
import {
  DashboardPreset,
  TileConfig,
  TimeRange,
} from '../dashboardTypes';
import { DashboardHeader } from './DashboardHeader';
import { DashboardToolbar } from './DashboardToolbar';
import { TileGrid } from './TileGrid';

const createInitialPresets = (): DashboardPreset[] => {
  const defaultTiles: TileConfig[] = [
    {
      id: 'total-photos',
      type: 'kpi',
      label: 'Total photos',
      presetKey: 'totalPhotos',
      endpointKey: 'totalPhotos',
      timeMode: 'global',
      unit: '',
      decimals: 0,
    },
    {
      id: 'avg-photo-time',
      type: 'kpi',
      label: 'Avg. photo time (s)',
      presetKey: 'avgPhotoDuration',
      endpointKey: 'avgPhotoDuration',
      timeMode: 'global',
      unit: 's',
      decimals: 1,
    },
    {
      id: 'avg-upload-time',
      type: 'kpi',
      label: 'Avg. upload time (s)',
      presetKey: 'avgUploadDuration',
      endpointKey: 'avgUploadDuration',
      timeMode: 'global',
      unit: 's',
      decimals: 1,
    },
    {
      id: 'upload-speed',
      type: 'chart',
      label: 'Upload speed (MB/s)',
      presetKey: 'uploadSpeed',
      endpointKey: 'uploadSpeed',
      timeMode: 'global',
      unit: 'MB/s',
      decimals: 2,
    },
  ];

  return [
    {
      id: 'default',
      name: 'Standard',
      tiles: defaultTiles,
    },
  ];
};

export const DashboardPage: React.FC = () => {
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>(TimeRange.Today);
  const [isEditMode, setIsEditMode] = useState(false);
  const [presets] = useState<DashboardPreset[]>(() => createInitialPresets());
  const [activePresetId, setActivePresetId] = useState('default');
  const [tiles, setTiles] = useState<TileConfig[]>(() => {
    const preset = createInitialPresets().find((p) => p.id === 'default');
    return preset?.tiles ?? [];
  });

  const activePreset = useMemo(
    () => presets.find((p) => p.id === activePresetId) ?? presets[0],
    [activePresetId, presets],
  );

  const handlePresetChange = (id: string) => {
    setActivePresetId(id);
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      setTiles(preset.tiles);
    }
  };

  const handleTileChange = (id: string, patch: Partial<TileConfig>) => {
    setTiles((prev) =>
      prev.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)),
    );
  };

  const handleAddTile = () => {
    const newTile: TileConfig = {
      id: `custom-${Date.now()}`,
      type: 'kpi',
      label: 'New tile',
      endpointKey: 'totalPhotos',
      timeMode: 'global',
      decimals: 0,
    };
    setTiles((prev) => [...prev, newTile]);
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
        onToggleEditMode={() => setIsEditMode((v) => !v)}
        onAddTile={handleAddTile}
      />

      <TileGrid
        tiles={tiles}
        isEditMode={isEditMode}
        globalTimeRange={globalTimeRange}
        onTilesReorder={setTiles}
        onTileChange={handleTileChange}
      />
      {activePreset && (
        <p className="preset-hint">Preset: {activePreset.name}</p>
      )}
    </div>
  );
};
