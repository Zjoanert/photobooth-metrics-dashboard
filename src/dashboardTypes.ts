export enum TimeRange {
  Today = 'today',
  Month = 'month',
  Always = 'always',
}

export type TileTimeMode = 'global' | 'override';

export type TileType = 'kpi' | 'chart';

export type PresetKey =
  | 'totalPhotos'
  | 'avgPhotoDuration'
  | 'avgUploadDuration'
  | 'uploadSpeed';

export interface TileConfig {
  id: string;
  type: TileType;
  label: string;
  presetKey?: PresetKey;
  endpointKey: string;
  timeMode: TileTimeMode;
  overrideTimeRange?: TimeRange;
  unit?: string;
  decimals?: number;
}

export interface DashboardPreset {
  id: string;
  name: string;
  tiles: TileConfig[];
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface KpiResult {
  value: number;
  trendPercent?: number;
}
