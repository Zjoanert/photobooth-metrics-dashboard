import { useEffect, useMemo, useRef, useState } from 'react';
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

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [state, setState] = useState<LogsState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  const dateBounds = useMemo(() => {
    if (!selectedDate) return null;

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return { dayStart, dayEnd } as const;
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedDate || !dateBounds) {
      setState({ entries: [], isLoading: false, error: null });
      return () => {
        cancelled = true;
      };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    logsApi
      .listLogs({
        applicationId,
        levels,
        from: dateBounds.dayStart.toISOString(),
        to: dateBounds.dayEnd.toISOString(),
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
  }, [applicationId, dateBounds, levels, logsApi, selectedDate]);

  useEffect(() => {
    if (settings.apiMode !== 'http' || !dateBounds) return;
    if (typeof EventSource === 'undefined') return;

    const baseUrl = settings.apiBaseUrl.replace(/\/$/, '');
    const streamUrl = `${baseUrl}/logs/${applicationId}/stream`;
    const stream = new EventSource(streamUrl);

    const handleMessage = (event: MessageEvent<string>) => {
      if (!event.data) return;

      try {
        const entry = JSON.parse(event.data) as LogEntry;
        if (entry.applicationId !== applicationId) return;
        const entryTime = new Date(entry.timestamp).getTime();
        const matchesDate =
          entryTime >= dateBounds.dayStart.getTime() && entryTime < dateBounds.dayEnd.getTime();
        const matchesLevel = levels.includes(entry.level);

        if (!matchesDate || !matchesLevel) return;

        if (isMountedRef.current) {
          setState((prev) => {
            const nextEntries = [...prev.entries, entry].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            );
            return { ...prev, entries: nextEntries };
          });
        }
      } catch (error) {
        console.warn('Failed to parse log event', error);
      }
    };

    stream.onmessage = handleMessage;
    stream.onerror = (error) => {
      console.warn('Log stream error', error);
    };

    return () => {
      stream.close();
    };
  }, [applicationId, dateBounds, levels, settings.apiBaseUrl, settings.apiMode]);

  return state;
};
