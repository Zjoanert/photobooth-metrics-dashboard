import { KpiResult, TimeRange, TimeSeriesPoint } from '../dashboardTypes';

export interface EventApi {
  getTotalPhotos(range: TimeRange): Promise<KpiResult>;
  getAveragePhotoDuration(range: TimeRange): Promise<KpiResult>;
  getAverageUploadDuration(range: TimeRange): Promise<KpiResult>;
  getUploadSpeedSeries(range: TimeRange): Promise<TimeSeriesPoint[]>;
  getKpiByEndpoint(endpointKey: string, range: TimeRange): Promise<KpiResult>;
  getSeriesByEndpoint(
    endpointKey: string,
    range: TimeRange,
  ): Promise<TimeSeriesPoint[]>;
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
  ): Promise<KpiResult> {
    switch (endpointKey) {
      case 'totalPhotos':
        return this.getTotalPhotos(range);
      case 'avgPhotoDuration':
        return this.getAveragePhotoDuration(range);
      case 'avgUploadDuration':
        return this.getAverageUploadDuration(range);
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
