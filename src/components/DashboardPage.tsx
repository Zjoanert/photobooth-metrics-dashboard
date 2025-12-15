import React, { useEffect, useMemo, useState } from 'react';
import { DashboardPreset, TileConfig, TimeRange, TimeRangeValue } from '../dashboardTypes';
import { getDefaultKpiStatForEndpoint } from '../api/dashboardEventApi';
import { useEventApi } from '../context/ApiContext';
import { downloadDashboardCsv } from '../utils/downloadCsv';
import { DashboardHeader } from './DashboardHeader';
import { DashboardToolbar } from './DashboardToolbar';
import { TileGrid } from './TileGrid';

const createInitialPresets = (): DashboardPreset[] => {
  const defaultTiles: TileConfig[] = [
    {
      id: 'total-photos',
      type: 'kpi',
      label: "Totaal aantal foto's",
      presetKey: 'totalPhotos',
      endpointKey: 'totalPhotos',
      kpiStat: getDefaultKpiStatForEndpoint('totalPhotos'),
      timeMode: 'global',
      unit: '',
      decimals: 0,
    },
    {
      id: 'total-prints',
      type: 'kpi',
      label: 'Totaal aantal afdrukken',
      presetKey: 'totalPrints',
      endpointKey: 'totalPrints',
      kpiStat: getDefaultKpiStatForEndpoint('totalPrints'),
      timeMode: 'global',
      unit: '',
      decimals: 0,
    },
    {
      id: 'avg-photo-time',
      type: 'kpi',
      label: 'Gemiddelde fototijd (s)',
      presetKey: 'avgPhotoDuration',
      endpointKey: 'avgPhotoDuration',
      kpiStat: getDefaultKpiStatForEndpoint('avgPhotoDuration'),
      timeMode: 'global',
      unit: 's',
      decimals: 1,
    },
    {
      id: 'avg-upload-time',
      type: 'kpi',
      label: 'Gemiddelde uploadtijd (s)',
      presetKey: 'avgUploadDuration',
      endpointKey: 'avgUploadDuration',
      kpiStat: getDefaultKpiStatForEndpoint('avgUploadDuration'),
      timeMode: 'global',
      unit: 's',
      decimals: 1,
    },
    {
      id: 'last-photo-age',
      type: 'recency',
      label: 'Tijd sinds laatste foto',
      presetKey: 'totalPhotos',
      endpointKey: 'totalPhotos',
      timeMode: 'global',
    },
    {
      id: 'upload-speed',
      type: 'chart',
      label: 'Uploadsnelheid (MB/s)',
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
  globalTimeRange: TimeRangeValue;
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
  const eventApi = useEventApi();

  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRangeValue>(
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

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
      kpiStat: getDefaultKpiStatForEndpoint('totalPhotos'),
      timeMode: 'global',
      decimals: 0,
    };
    setTiles((prev) => [...prev, newTile]);
  };

  const handleDeleteTile = (id: string) => {
    setTiles((prev) => prev.filter((tile) => tile.id !== id));
  };

  const handleReorderTiles = (sourceId: string, targetId: string) => {
    setTiles((prev) => {
      const next = [...prev];
      const sourceIndex = next.findIndex((tile) => tile.id === sourceId);
      const targetIndex = next.findIndex((tile) => tile.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return prev;
      }

      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

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
        onToggleEditMode={() => setIsEditMode((v) => !v)}
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
