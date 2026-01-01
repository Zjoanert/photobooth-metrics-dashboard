import { useEffect, useMemo, useState } from 'react';
import { DashboardPreset, TileConfig, TimeRange, TimeRangeValue } from '../dashboardTypes';
import { getDefaultKpiStatForEndpoint } from '../api/dashboardEventApi';

const STORAGE_KEY = 'dashboardState';

interface PersistedDashboardState {
  tiles: TileConfig[];
  activePresetId: string;
  globalTimeRange: TimeRangeValue;
}

/**
 * Returns the default dashboard layout presets with configured tiles.
 */
const createInitialPresets = (): DashboardPreset[] => {
  const defaultTiles: TileConfig[] = [
    { "id": "custom-1767120434597",
      "type": "kpi",
      "label": "Fotostrip gestart",
      "endpointKey": "start-foto",
      "kpiStat": "count",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "start-foto",
      "unit": "keren" 
    }, { 
      "id": "custom-1767110486811",
      "type": "most-recent",
      "label": "Ruimte over",
      "endpointKey": "remaining-space",
      "kpiStat": "average",
      "timeMode": "global",
      "decimals": 1, 
      "applicationName": "storage",
      "eventName": "remaining-space",
      "unit": "MB" 
    }, { 
      "id": "total-prints",
      "type": "kpi",
      "label": "Prints rol 1",
      "endpointKey": "print-rol-25-1",
      "kpiStat": "sum",
      "timeMode": "override",
      "unit": "vellen",
      "decimals": 0, 
      "applicationName": "printer",
      "eventName": "print-rol-25-1"
    }, { 
      "id": "custom-1766927998934",
      "type": "kpi",
      "label": "Prints rol 2",
      "endpointKey": "print-rol-25-02",
      "kpiStat": "count",
      "timeMode": "override",
      "decimals": 0, 
      "applicationName": "printer",
      "eventName": "print-rol-25-02",
      "unit": "vellen"
    }, { 
      "id": "custom-1767115471795",
      "type": "recency",
      "label": "Frontend uptime",
      "endpointKey": "startup",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "startup" 
    }, { 
      "id": "custom-1767109463474",
      "type": "recency",
      "label": "Storage server uptime",
      "endpointKey": "startup",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "storage",
      "eventName": "startup" 
    }, { 
      "id": "custom-1766927038808",
      "type": "recency",
      "label": "Printer uptime",
      "endpointKey": "startup",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "printer",
      "eventName": "startup" 
    }, { 
      "id": "custom-1767111416945",
      "type": "recency",
      "label": "Camera uptime",
      "endpointKey": "startup",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "camera",
      "eventName": "startup" 
    }, { 
      "id": "custom-1766576601885",
      "type": "recency",
      "label": "Metrics uptime",
      "endpointKey": "startup",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "metrics",
      "eventName": "startup" 
    }, { 
      "id": "avg-photo-time",
      "type": "kpi",
      "label": "Avg. photo time (s)",
      "endpointKey": "capture-image-seconds",
      "kpiStat": "average",
      "timeMode": "global",
      "unit": "s",
      "decimals": 1, 
      "applicationName": "camera",
      "eventName": "capture-image-seconds" 
    }, { 
      "id": "custom-1767185491727",
      "type": "kpi",
      "label": "Ontwerp A",
      "endpointKey": "choose-design-",
      "kpiStat": "count",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "choose-design-",
      "unit": "keren" 
    }, {
      "id": "custom-1767185519307",
      "type": "kpi",
      "label": "Ontwerp B",
      "endpointKey": "choose-design-",
      "kpiStat": "count",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "choose-design-",
      "unit": "keren" 
    }, { 
      "id": "total-photos",
      "type": "kpi",
      "label": "Geen fotostrip gemaakt",
      "endpointKey": "cancel-foto",
      "kpiStat": "count",
      "timeMode": "global",
      "unit": "keren",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "cancel-foto" 
    }, { 
      "id": "upload-speed",
      "type": "chart",
      "label": "Upload speed (MB/s)",
      "endpointKey": "upload-speed",
      "timeMode": "global",
      "unit": "MB/s",
      "decimals": 2, 
      "applicationName": "frontend",
      "eventName": "upload-speed",
      "kpiStat": "count" 
    }, { 
      "id": "custom-1767186255175",
      "type": "chart",
      "label": "Google upload snelheid",
      "endpointKey": "google-upload-speed",
      "kpiStat": "sum",
      "timeMode": "global",
      "decimals": 0, 
      "applicationName": "frontend",
      "eventName": "google-upload-speed",
      "unit": "MB/s" 
    }
  ];

  return [
    {
      id: 'default',
      name: 'Standard',
      tiles: defaultTiles,
    },
  ];
};

/**
 * Reads persisted dashboard state from localStorage if available.
 */
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

/**
 * Persists dashboard state in localStorage while guarding against server-side rendering.
 */
const persistDashboardState = (state: PersistedDashboardState) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export interface UseDashboardStateResult {
  presets: DashboardPreset[];
  tiles: TileConfig[];
  activePreset: DashboardPreset;
  activePresetId: string;
  globalTimeRange: TimeRangeValue;
  isEditMode: boolean;
  setGlobalTimeRange: (value: TimeRangeValue) => void;
  toggleEditMode: () => void;
  handlePresetChange: (id: string) => void;
  handleTileChange: (id: string, patch: Partial<TileConfig>) => void;
  handleAddTile: () => void;
  handleDeleteTile: (id: string) => void;
  handleReorderTiles: (sourceId: string, targetId: string) => void;
}

/**
 * Encapsulates dashboard state management including presets, tiles, and persistence.
 */
export const useDashboardState = (): UseDashboardStateResult => {
  const presets = useMemo(() => createInitialPresets(), []);
  const savedState = useMemo(() => readDashboardState(), []);

  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRangeValue>(
    savedState?.globalTimeRange ?? TimeRange.Today,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePresetId, setActivePresetId] = useState(savedState?.activePresetId ?? 'default');
  const [tiles, setTiles] = useState<TileConfig[]>(() => {
    const presetId = savedState?.activePresetId ?? 'default';
    const preset = presets.find((p) => p.id === presetId) ?? presets[0];

    if (savedState?.tiles?.length) {
      return savedState.tiles;
    }

    return preset?.tiles ?? [];
  });

  useEffect(() => {
    persistDashboardState({
      tiles,
      activePresetId,
      globalTimeRange,
    });
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
    setTiles((prev) => prev.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
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

  return {
    presets,
    tiles,
    activePreset,
    activePresetId,
    globalTimeRange,
    isEditMode,
    setGlobalTimeRange,
    toggleEditMode: () => setIsEditMode((value) => !value),
    handlePresetChange,
    handleTileChange,
    handleAddTile,
    handleDeleteTile,
    handleReorderTiles,
  };
};

