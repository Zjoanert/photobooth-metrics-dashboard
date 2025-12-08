import React, { useEffect, useMemo, useState } from 'react';
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
      id: 'total-prints',
      type: 'kpi',
      label: 'Total prints',
      presetKey: 'totalPrints',
      endpointKey: 'totalPrints',
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

const STORAGE_KEY = 'dashboardState';

interface PersistedDashboardState {
  tiles: TileConfig[];
  activePresetId: string;
  globalTimeRange: TimeRange;
}

const readDashboardState = (): PersistedDashboardState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedDashboardState>;
    return {
      tiles: parsed.tiles ?? [],
      activePresetId: parsed.activePresetId || 'default',
      globalTimeRange: parsed.globalTimeRange ?? TimeRange.Today,
    };
  } catch (error) {
    console.warn('Failed to read dashboard state, falling back to defaults', error);
    return null;
  }
};

export const DashboardPage: React.FC = () => {
  const presets = useMemo(() => createInitialPresets(), []);
  const savedState = useMemo(() => readDashboardState(), []);

  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>(
    savedState?.globalTimeRange ?? TimeRange.Today,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePresetId, setActivePresetId] = useState(
    savedState?.activePresetId ?? 'default',
  );
  const [tiles, setTiles] = useState<TileConfig[]>(() => {
    const presetId = savedState?.activePresetId ?? 'default';
    const preset = presets.find((p) => p.id === presetId) ?? presets[0];

    if (savedState?.tiles) {
      return savedState.tiles;
    }

    return preset?.tiles ?? [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const payload: PersistedDashboardState = {
      tiles,
      activePresetId,
      globalTimeRange,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [tiles, activePresetId, globalTimeRange]);

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
