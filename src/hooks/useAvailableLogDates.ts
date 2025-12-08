import { useEffect, useMemo, useState } from 'react';
import { createLogsApi } from '../api/logsApi';
import { TimeRange } from '../dashboardTypes';
import { useSettings } from '../context/SettingsContext';

interface AvailableDatesState {
  dates: string[];
  isLoading: boolean;
  error: string | null;
}

export const useAvailableLogDates = (applicationId: string): AvailableDatesState => {
  const { settings } = useSettings();
  const logsApi = useMemo(
    () => createLogsApi(settings.apiMode, settings.apiBaseUrl),
    [settings],
  );

  const [state, setState] = useState<AvailableDatesState>({
    dates: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    if (!applicationId) {
      setState({ dates: [], isLoading: false, error: null });
      return;
    }

    setState({ dates: [], isLoading: true, error: null });

    logsApi
      .listLogs({ applicationId, range: TimeRange.Always })
      .then((entries) => {
        if (cancelled) return;
        const uniqueDates = Array.from(
          new Set(entries.map((entry) => entry.timestamp.slice(0, 10))),
        ).sort((a, b) => b.localeCompare(a));
        setState({ dates: uniqueDates, isLoading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ dates: [], isLoading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, logsApi]);

  return state;
};
