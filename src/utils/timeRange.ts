import { CustomTimeRange, TileConfig, TimeRange, TimeRangeValue } from '../dashboardTypes';

export function isCustomRange(range: TimeRangeValue): range is CustomTimeRange {
  return typeof range === 'object' && range?.type === 'custom';
}

export function getEffectiveTimeRange(
  tile: TileConfig,
  globalTimeRange: TimeRangeValue,
): TimeRangeValue {
  return tile.timeMode === 'override' && tile.overrideTimeRange
    ? tile.overrideTimeRange
    : globalTimeRange;
}

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  [TimeRange.Today]: 'Today',
  [TimeRange.Month]: 'This month',
  [TimeRange.Always]: 'Always',
};

export const formatTimeRangeLabel = (range: TimeRangeValue): string => {
  if (isCustomRange(range)) {
    return `${formatDateTimeLabel(range.start)} – ${formatDateTimeLabel(range.end)}`;
  }

  return TIME_RANGE_LABELS[range];
};

export const formatDateTimeLabel = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
};

const pad = (value: number): string => value.toString().padStart(2, '0');

export const toInputDateTimeValue = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const fromInputDateTimeValue = (value: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

export const createDefaultCustomRange = (): CustomTimeRange => {
  const end = new Date();
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  return { type: 'custom', start: start.toISOString(), end: end.toISOString() };
};

export const ensureValidCustomRange = (range: CustomTimeRange): CustomTimeRange => {
  const startTime = new Date(range.start).getTime();
  const endTime = new Date(range.end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return range;
  }

  if (endTime < startTime) {
    return { ...range, end: range.start };
  }

  return range;
};
