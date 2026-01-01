export enum TimeRange {
  Today = 'today',
  Month = 'month',
  Always = 'always',
}

export interface CustomTimeRange {
  type: 'custom';
  start: string;
  end: string;
}

export type TimeRangeValue = TimeRange | CustomTimeRange;

export type TileTimeMode = 'global' | 'override';

export type TileType = 'kpi' | 'chart' | 'recency' | 'most-recent';

export type KpiStat = 'count' | 'sum' | 'average' | 'min' | 'max';

export type PresetKey =
  | 'totalPhotos'
  | 'avgPhotoDuration'
  | 'avgUploadDuration'
  | 'uploadSpeed'
  | 'totalPrints';

export interface TileConfig {
  id: string;
  type: TileType;
  label: string;
  presetKey?: PresetKey;
  endpointKey: string;
  applicationName?: string;
  eventName?: string;
  kpiStat?: KpiStat;
  timeMode: TileTimeMode;
  overrideTimeRange?: TimeRangeValue;
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
