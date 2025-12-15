import { useEffect, useState } from 'react';
import {
  TileConfig,
  TimeSeriesPoint,
  TimeRangeValue,
  KpiResult,
} from '../dashboardTypes';
import { useEventApi } from '../context/ApiContext';
import { getEffectiveTimeRange } from '../utils/timeRange';

export interface TileDataResult {
  isLoading: boolean;
  error?: string;
  kpi?: KpiResult;
  series?: TimeSeriesPoint[];
  latestEventTimestamp?: string | null;
}

export function useTileData(
  tile: TileConfig,
  globalTimeRange: TimeRangeValue,
): TileDataResult {
  const eventApi = useEventApi();
  const effectiveRange = getEffectiveTimeRange(tile, globalTimeRange);
  const [state, setState] = useState<TileDataResult>({
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ isLoading: true });

    const load = async () => {
      try {
        if (tile.type === 'kpi') {
          const kpi = await eventApi.getKpiByEndpoint(
            tile.endpointKey,
            effectiveRange,
            tile.kpiStat,
            tile.applicationName,
            tile.eventName,
          );
          if (!cancelled) setState({ isLoading: false, kpi });
        } else if (tile.type === 'chart') {
          const series = await eventApi.getSeriesByEndpoint(
            tile.endpointKey,
            effectiveRange,
            tile.applicationName,
            tile.eventName,
          );
          if (!cancelled) setState({ isLoading: false, series });
        } else {
          const latestEventTimestamp = await eventApi.getLatestEventTime(
            tile.endpointKey,
            effectiveRange,
            tile.applicationName,
            tile.eventName,
          );
          if (!cancelled)
            setState({
              isLoading: false,
              latestEventTimestamp,
            });
        }
      } catch (e) {
        if (!cancelled)
          setState({
            isLoading: false,
            error: (e as Error).message ?? 'Unknown error',
          });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    tile.type,
    tile.endpointKey,
    tile.kpiStat,
    tile.applicationName,
    tile.eventName,
    effectiveRange,
    eventApi,
  ]);

  return state;
}
