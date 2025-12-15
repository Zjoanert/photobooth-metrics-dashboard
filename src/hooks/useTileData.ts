import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TileConfig,
  TimeSeriesPoint,
  TimeRangeValue,
  TimeRange,
  KpiResult,
} from '../dashboardTypes';
import { useEventApi } from '../context/ApiContext';
import { resolveEndpointConfig } from '../api/dashboardEventApi';
import { useSettings } from '../context/SettingsContext';
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
  const { settings } = useSettings();
  const effectiveRange = getEffectiveTimeRange(tile, globalTimeRange);
  const [state, setState] = useState<TileDataResult>({
    isLoading: true,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const endpointConfig = useMemo(() => {
    try {
      return resolveEndpointConfig(
        tile.endpointKey,
        tile.applicationName,
        tile.eventName,
      );
    } catch (error) {
      console.warn('Failed to resolve endpoint config', error);
      return null;
    }
  }, [tile.endpointKey, tile.applicationName, tile.eventName]);

  const fetchData = useCallback(
    async (options?: { showLoading?: boolean }) => {
      const showLoading = options?.showLoading ?? true;

      if (showLoading) {
        setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
      }

      try {
        if (tile.type === 'kpi') {
          const kpi = await eventApi.getKpiByEndpoint(
            tile.endpointKey,
            effectiveRange,
            tile.kpiStat,
            tile.applicationName,
            tile.eventName,
          );
          if (isMountedRef.current) setState({ isLoading: false, kpi });
        } else if (tile.type === 'chart') {
          const series = await eventApi.getSeriesByEndpoint(
            tile.endpointKey,
            effectiveRange,
            tile.applicationName,
            tile.eventName,
          );
          if (isMountedRef.current) setState({ isLoading: false, series });
        } else {
          const latestEventTimestamp = await eventApi.getLatestEventTime(
            tile.endpointKey,
            effectiveRange,
            tile.applicationName,
            tile.eventName,
          );
          if (isMountedRef.current)
            setState({
              isLoading: false,
              latestEventTimestamp,
            });
        }
      } catch (e) {
        if (isMountedRef.current)
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: (e as Error).message ?? 'Unknown error',
          }));
      }
    },
    [
      effectiveRange,
      eventApi,
      tile.applicationName,
      tile.endpointKey,
      tile.eventName,
      tile.kpiStat,
      tile.type,
    ],
  );

  useEffect(() => {
    setState({ isLoading: true });
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (settings.apiMode !== 'http' || !endpointConfig) return;
    if (typeof EventSource === 'undefined') return;

    const baseUrl = settings.apiBaseUrl.replace(/\/$/, '');
    const streamUrl = `${baseUrl}/events/${endpointConfig.applicationName}/${endpointConfig.eventName}/stream`;
    const stream = new EventSource(streamUrl);

    const handleMessage = () => fetchData({ showLoading: false });
    stream.onmessage = handleMessage;
    stream.onerror = (error) => {
      console.warn('Event stream error', error);
    };

    return () => {
      stream.close();
    };
  }, [endpointConfig, fetchData, settings.apiBaseUrl, settings.apiMode]);

  return state;
}
