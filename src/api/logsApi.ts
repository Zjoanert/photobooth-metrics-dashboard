import { TimeRange } from '../dashboardTypes';

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  applicationId: string;
  timestamp: string;
  level: LogLevel;
  message: string | string[];
}

export interface ListLogsParams {
  applicationId: string;
  levels?: LogLevel[];
  range?: TimeRange;
}

export interface LogsApi {
  listLogs(params: ListLogsParams): Promise<LogEntry[]>;
}

const buildQueryString = (
  params: Record<string, string | number | undefined>,
): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.append(key, String(value));
  });
  const normalized = search.toString();
  return normalized ? `?${normalized}` : '';
};

const getRangeBounds = (
  range?: TimeRange,
): { from?: string; to?: string } => {
  if (!range) return {};

  const now = new Date();
  const to = now.toISOString();

  switch (range) {
    case TimeRange.Today: {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to };
    }
    case TimeRange.Month: {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      return { from: start.toISOString(), to };
    }
    case TimeRange.Always:
    default:
      return { to };
  }
};

export class HttpLogsApi implements LogsApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async listLogs(params: ListLogsParams): Promise<LogEntry[]> {
    const { from, to } = getRangeBounds(params.range);
    const query = buildQueryString({
      level: params.levels?.length ? params.levels.join(',') : undefined,
      from,
      to,
    });

    const response = await fetch(
      `${this.baseUrl}/logs/${params.applicationId}${query}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as LogEntry[];
    return data.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }
}

const MOCK_MESSAGES: Record<LogLevel, string[]> = {
  log: ['Processing request', 'Dispatching job', 'Received heartbeat'],
  info: ['Step completed', 'Configuration loaded', 'Session started'],
  warn: ['Slow response detected', 'Retrying upload', 'Queue is growing'],
  error: ['Failed to process image', 'Printer unavailable', 'Upload failed'],
  debug: ['Verbose trace', 'Payload inspected', 'Cache miss occurred'],
};

const buildMockTimeline = (applicationId: string): LogEntry[] => {
  const now = new Date();
  const base = new Date(now);
  base.setMinutes(0, 0, 0);

  const offsets = [0, 2, 5, 9, 13, 18, 25, 32, 40, 50, 63, 75];
  const levels: LogLevel[] = [
    'info',
    'log',
    'warn',
    'info',
    'error',
    'log',
    'debug',
    'warn',
    'info',
    'error',
    'debug',
    'info',
  ];

  return offsets.map((minuteOffset, index) => {
    const timestamp = new Date(base.getTime() - minuteOffset * 60 * 1000);
    const level = levels[index % levels.length];
    const messages = MOCK_MESSAGES[level];
    const message = messages[index % messages.length];

    return { applicationId, timestamp: timestamp.toISOString(), level, message };
  });
};

export class MockLogsApi implements LogsApi {
  async listLogs(params: ListLogsParams): Promise<LogEntry[]> {
    const { from, to } = getRangeBounds(params.range);
    const fromTime = from ? new Date(from).getTime() : undefined;
    const toTime = to ? new Date(to).getTime() : undefined;

    const allEntries = buildMockTimeline(params.applicationId);
    const selectedLevels: LogLevel[] = params.levels?.length
      ? params.levels
      : (['log', 'info', 'warn', 'error'] as LogLevel[]);

    return allEntries
      .filter((entry) => {
        const time = new Date(entry.timestamp).getTime();
        const matchesFrom = fromTime ? time >= fromTime : true;
        const matchesTo = toTime ? time <= toTime : true;
        return matchesFrom && matchesTo && selectedLevels.includes(entry.level);
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const createLogsApi = (mode: 'mock' | 'http', baseUrl: string): LogsApi => {
  return mode === 'http' ? new HttpLogsApi(baseUrl) : new MockLogsApi();
};
