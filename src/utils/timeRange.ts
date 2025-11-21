import { TileConfig, TimeRange } from '../dashboardTypes';

export function getEffectiveTimeRange(
  tile: TileConfig,
  globalTimeRange: TimeRange,
): TimeRange {
  return tile.timeMode === 'override' && tile.overrideTimeRange
    ? tile.overrideTimeRange
    : globalTimeRange;
}

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  [TimeRange.Today]: 'Today',
  [TimeRange.Month]: 'This month',
  [TimeRange.Always]: 'Always',
};
