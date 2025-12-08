import { KpiResult, KpiStat, TimeRange, TimeSeriesPoint } from '../dashboardTypes';
import { Event } from './eventsApi';
import { EventStats } from './eventsApi.types';

export interface EventApi {
  getTotalPhotos(range: TimeRange): Promise<KpiResult>;
  getAveragePhotoDuration(range: TimeRange): Promise<KpiResult>;
  getAverageUploadDuration(range: TimeRange): Promise<KpiResult>;
  getUploadSpeedSeries(range: TimeRange): Promise<TimeSeriesPoint[]>;
  getKpiByEndpoint(
    endpointKey: string,
    range: TimeRange,
    stat?: KpiStat,
  ): Promise<KpiResult>;
  getSeriesByEndpoint(
    endpointKey: string,
    range: TimeRange,
  ): Promise<TimeSeriesPoint[]>;
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.append(key, String(value));
  });
  const normalized = search.toString();
  return normalized ? `?${normalized}` : '';
};

const ENDPOINT_MAP: Record<
  string,
  { applicationName: string; eventName: string; defaultStat: KpiStat }
> = {
  totalPhotos: { applicationName: 'frontend', eventName: 'totalPhotos', defaultStat: 'sum' },
  avgPhotoDuration: {
    applicationName: 'frontend',
    eventName: 'avgPhotoDuration',
    defaultStat: 'average',
  },
  avgUploadDuration: {
    applicationName: 'frontend',
    eventName: 'avgUploadDuration',
    defaultStat: 'average',
  },
  uploadSpeed: {
    applicationName: 'frontend',
    eventName: 'uploadSpeed',
    defaultStat: 'average',
  },
  totalPrints: { applicationName: 'print', eventName: 'totalPrints', defaultStat: 'sum' },
};

export const getDefaultKpiStatForEndpoint = (endpointKey: string): KpiStat => {
  const config = ENDPOINT_MAP[endpointKey];
  if (!config) {
    return 'count';
  }
  return config.defaultStat;
};

const getRangeStart = (range: TimeRange): string | undefined => {
  const now = new Date();
  switch (range) {
    case TimeRange.Today: {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case TimeRange.Month: {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      return start.toISOString();
    }
    case TimeRange.Always:
    default:
      return undefined;
  }
};

export class HttpEventApi implements EventApi {
  constructor(private baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async fetchEvents(
    endpointKey: string,
    range: TimeRange,
  ): Promise<Event[]> {
    const config = ENDPOINT_MAP[endpointKey];
    if (!config) {
      throw new Error(`Unknown endpoint key: ${endpointKey}`);
    }

    const from = getRangeStart(range);
    const query = buildQuery({
      applicationName: config.applicationName,
      eventName: config.eventName,
      from,
    });

    const response = await fetch(`${this.baseUrl}/events${query}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<Event[]>;
  }

  private async fetchStats(
    endpointKey: string,
    range: TimeRange,
  ): Promise<EventStats> {
    const config = ENDPOINT_MAP[endpointKey];
    if (!config) {
      throw new Error(`Unknown endpoint key: ${endpointKey}`);
    }

    const from = getRangeStart(range);
    const query = buildQuery({
      applicationName: config.applicationName,
      eventName: config.eventName,
      from,
    });

    const response = await fetch(`${this.baseUrl}/events/stats${query}`);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<EventStats>;
  }

  getTotalPhotos(range: TimeRange): Promise<KpiResult> {
    return this.getKpiByEndpoint('totalPhotos', range);
  }

  getAveragePhotoDuration(range: TimeRange): Promise<KpiResult> {
    return this.getKpiByEndpoint('avgPhotoDuration', range);
  }

  getAverageUploadDuration(range: TimeRange): Promise<KpiResult> {
    return this.getKpiByEndpoint('avgUploadDuration', range);
  }

  getUploadSpeedSeries(range: TimeRange): Promise<TimeSeriesPoint[]> {
    return this.getSeriesByEndpoint('uploadSpeed', range);
  }

  async getKpiByEndpoint(
    endpointKey: string,
    range: TimeRange,
    stat?: KpiStat,
  ): Promise<KpiResult> {
    const config = ENDPOINT_MAP[endpointKey];
    if (!config) {
      throw new Error(`Unknown KPI endpoint: ${endpointKey}`);
    }

    const stats = await this.fetchStats(endpointKey, range);
    const selectedStat = stat ?? config.defaultStat;
    const rawValue = stats[selectedStat];
    const value = rawValue ?? 0;

    return { value };
  }

  async getSeriesByEndpoint(
    endpointKey: string,
    range: TimeRange,
  ): Promise<TimeSeriesPoint[]> {
    const events = await this.fetchEvents(endpointKey, range);
    return events
      .map((event) => ({ timestamp: event.timestamp, value: event.value }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export class MockEventApi implements EventApi {
  private randomDelay() {
    return 300 + Math.random() * 300;
  }

  private async simulateDelay<T>(value: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(value), this.randomDelay());
    });
  }

  async getTotalPhotos(range: TimeRange): Promise<KpiResult> {
    const base = 12000;
    const factor =
      range === TimeRange.Today ? 0.02 : range === TimeRange.Month ? 0.5 : 1;

    const value = Math.round(base * factor);
    const trend = 5;

    return this.simulateDelay({ value, trendPercent: trend });
  }

  async getAveragePhotoDuration(range: TimeRange): Promise<KpiResult> {
    const value =
      range === TimeRange.Today ? 2.4 : range === TimeRange.Month ? 2.5 : 2.6;
    return this.simulateDelay({ value, trendPercent: 0 });
  }

  async getAverageUploadDuration(range: TimeRange): Promise<KpiResult> {
    const value =
      range === TimeRange.Today ? 1.1 : range === TimeRange.Month ? 1.15 : 1.2;
    const trend = -3;
    return this.simulateDelay({ value, trendPercent: trend });
  }

  private pickStatValue(
    stat: KpiStat | undefined,
    values: Partial<Record<KpiStat, number>>,
  ): number {
    const selectedStat = stat ?? 'count';
    return values[selectedStat] ?? 0;
  }

  async getUploadSpeedSeries(range: TimeRange): Promise<TimeSeriesPoint[]> {
    const points: TimeSeriesPoint[] = [];
    const now = new Date();

    const hours = range === TimeRange.Today ? 24 : 24 * 7;
    for (let i = hours; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 60 * 1000);
      const value = 0.5 + Math.sin(i / 3) + Math.random() * 0.3;
      points.push({ timestamp: t.toISOString(), value: Math.max(0, value) });
    }
    return this.simulateDelay(points);
  }

  async getKpiByEndpoint(
    endpointKey: string,
    range: TimeRange,
    stat?: KpiStat,
  ): Promise<KpiResult> {
    switch (endpointKey) {
      case 'totalPhotos':
        return this.simulateDelay({
          value: this.pickStatValue(stat, {
            sum: (await this.getTotalPhotos(range)).value,
            count: (await this.getTotalPhotos(range)).value,
          }),
          trendPercent: 5,
        });
      case 'avgPhotoDuration':
        return this.simulateDelay({
          value: this.pickStatValue(stat, {
            average: (await this.getAveragePhotoDuration(range)).value,
            min: 2.1,
            max: 3.3,
          }),
          trendPercent: 0,
        });
      case 'avgUploadDuration':
        return this.simulateDelay({
          value: this.pickStatValue(stat, {
            average: (await this.getAverageUploadDuration(range)).value,
            min: 0.9,
            max: 1.4,
          }),
          trendPercent: -3,
        });
      default:
        return this.simulateDelay({ value: 42, trendPercent: 0 });
    }
  }

  async getSeriesByEndpoint(
    endpointKey: string,
    range: TimeRange,
  ): Promise<TimeSeriesPoint[]> {
    switch (endpointKey) {
      case 'uploadSpeed':
        return this.getUploadSpeedSeries(range);
      default:
        return this.simulateDelay([]);
    }
  }
}
