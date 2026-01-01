import { EventApi, getDefaultKpiStatForEndpoint } from '../api/dashboardEventApi';
import { TileConfig, TimeRangeValue } from '../dashboardTypes';
import { formatTimeRangeLabel, getEffectiveTimeRange } from './timeRange';

const formatNumber = (value: number, decimals?: number) => value.toFixed(decimals ?? 0);

const escapeCsv = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const needsEscaping = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsEscaping ? `"${escaped}"` : escaped;
};

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => value.toString().padStart(2, '0');
  const timePart = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return days > 0 ? `${days}d ${timePart}` : timePart;
};

const buildKpiRow = async (
  tile: TileConfig,
  effectiveRange: TimeRangeValue,
  timeRangeLabel: string,
  eventApi: EventApi,
): Promise<string[]> => {
  const kpi = await eventApi.getKpiByEndpoint(
    tile.endpointKey,
    effectiveRange,
    tile.kpiStat,
    tile.applicationName,
    tile.eventName,
  );
  const stat = tile.kpiStat ?? getDefaultKpiStatForEndpoint(tile.endpointKey);
  return [
    tile.label,
    tile.type,
    timeRangeLabel,
    stat,
    '',
    formatNumber(kpi.value, tile.decimals),
    tile.unit ?? '',
    typeof kpi.trendPercent === 'number' ? `${kpi.trendPercent}% vs prev` : '',
  ];
};

const buildChartRows = async (
  tile: TileConfig,
  effectiveRange: TimeRangeValue,
  timeRangeLabel: string,
  eventApi: EventApi,
): Promise<string[][]> => {
  const series = await eventApi.getSeriesByEndpoint(
    tile.endpointKey,
    effectiveRange,
    tile.applicationName,
    tile.eventName,
  );

  if (!series.length) {
    return [[
      tile.label,
      tile.type,
      timeRangeLabel,
      tile.endpointKey,
      '',
      '',
      tile.unit ?? '',
      'No data',
    ]];
  }

  return series.map((point) => [
    tile.label,
    tile.type,
    timeRangeLabel,
    tile.endpointKey,
    point.timestamp,
    formatNumber(point.value, tile.decimals),
    tile.unit ?? '',
    '',
  ]);
};

const buildRecencyRow = async (
  tile: TileConfig,
  effectiveRange: TimeRangeValue,
  timeRangeLabel: string,
  eventApi: EventApi,
): Promise<string[]> => {
  const latestEvent = await eventApi.getLatestEvent(
    tile.endpointKey,
    effectiveRange,
    tile.applicationName,
    tile.eventName,
  );

  const latestEventTimestamp = latestEvent?.timestamp ?? null;

  if (!latestEventTimestamp) {
    return [
      tile.label,
      tile.type,
      timeRangeLabel,
      'latestEvent',
      '',
      '',
      '',
      'No events yet',
    ];
  }

  const lastEventDate = new Date(latestEventTimestamp);
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - lastEventDate.getTime()) / 1000));

  return [
    tile.label,
    tile.type,
    timeRangeLabel,
    'latestEvent',
    lastEventDate.toISOString(),
    String(elapsedSeconds),
    'seconds',
    `Elapsed: ${formatDuration(elapsedSeconds * 1000)}`,
  ];
};

const triggerCsvDownload = (csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-metrics-${new Date().toISOString()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Generates a CSV export for the configured dashboard tiles and triggers a download.
 *
 * @param tiles - Visible dashboard tiles to include in the export.
 * @param globalTimeRange - The global time range selection applied to tiles using the global mode.
 * @param eventApi - API instance used to fetch tile values.
 */
export const downloadDashboardCsv = async (
  tiles: TileConfig[],
  globalTimeRange: TimeRangeValue,
  eventApi: EventApi,
): Promise<void> => {
  const rows: string[][] = [
    ['Tile', 'Type', 'Time Range', 'Metric', 'Timestamp', 'Value', 'Unit', 'Notes'],
  ];

  for (const tile of tiles) {
    const effectiveRange = getEffectiveTimeRange(tile, globalTimeRange);
    const timeRangeLabel = formatTimeRangeLabel(effectiveRange);

    try {
      if (tile.type === 'kpi') {
        rows.push(await buildKpiRow(tile, effectiveRange, timeRangeLabel, eventApi));
      } else if (tile.type === 'chart') {
        rows.push(...(await buildChartRows(tile, effectiveRange, timeRangeLabel, eventApi)));
      } else {
        rows.push(await buildRecencyRow(tile, effectiveRange, timeRangeLabel, eventApi));
      }
    } catch (error) {
      rows.push([
        tile.label,
        tile.type,
        timeRangeLabel,
        tile.endpointKey,
        '',
        '',
        '',
        `Error: ${(error as Error).message ?? 'Failed to export tile'}`,
      ]);
    }
  }

  const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  triggerCsvDownload(csv);
};
