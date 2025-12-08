import { useEffect, useMemo, useState } from 'react';
import { createLogsApi, LogEntry, LogLevel } from '../api/logsApi';
import { TimeRange } from '../dashboardTypes';
import { useSettings } from '../context/SettingsContext';

interface LogsState {
  entries: LogEntry[];
  isLoading: boolean;
  error: string | null;
}

export const useLogsData = (
  applicationId: string,
  levels: LogLevel[],
  range: TimeRange,
): LogsState => {
  const { settings } = useSettings();
  const logsApi = useMemo(
    () => createLogsApi(settings.apiMode, settings.apiBaseUrl),
    [settings],
  );

  const [state, setState] = useState<LogsState>({
    entries: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    logsApi
      .listLogs({ applicationId, levels, range })
      .then((entries) => {
        if (cancelled) return;
        setState({ entries, isLoading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ entries: [], isLoading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, levels, range, logsApi]);

  return state;
};
