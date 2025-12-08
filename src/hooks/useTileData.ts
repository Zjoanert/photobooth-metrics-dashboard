import { useEffect, useState } from 'react';
import { TileConfig, TimeSeriesPoint, TimeRange, KpiResult } from '../dashboardTypes';
import { useEventApi } from '../context/ApiContext';
import { getEffectiveTimeRange } from '../utils/timeRange';

export interface TileDataResult {
  isLoading: boolean;
  error?: string;
  kpi?: KpiResult;
  series?: TimeSeriesPoint[];
}

export function useTileData(
  tile: TileConfig,
  globalTimeRange: TimeRange,
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
          );
          if (!cancelled) setState({ isLoading: false, kpi });
        } else {
          const series = await eventApi.getSeriesByEndpoint(
            tile.endpointKey,
            effectiveRange,
          );
          if (!cancelled) setState({ isLoading: false, series });
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
  }, [tile.type, tile.endpointKey, tile.kpiStat, effectiveRange, eventApi]);

  return state;
}
