import { useEffect, useMemo, useState } from 'react';
import { createLogsApi, LogEntry, LogLevel } from '../api/logsApi';
import { useSettings } from '../context/SettingsContext';

interface LogsState {
  entries: LogEntry[];
  isLoading: boolean;
  error: string | null;
}

export const useLogsData = (
  applicationId: string,
  levels: LogLevel[],
  selectedDate: string | null,
): LogsState => {
  const { settings } = useSettings();
  const logsApi = useMemo(
    () => createLogsApi(settings.apiMode, settings.apiBaseUrl),
    [settings],
  );

  const [state, setState] = useState<LogsState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    if (!selectedDate) {
      setState({ entries: [], isLoading: false, error: null });
      return () => {
        cancelled = true;
      };
    }

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    logsApi
      .listLogs({
        applicationId,
        levels,
        from: dayStart.toISOString(),
        to: dayEnd.toISOString(),
      })
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
  }, [applicationId, levels, selectedDate, logsApi]);

  return state;
};
