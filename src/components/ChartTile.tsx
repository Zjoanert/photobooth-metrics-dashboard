import React, { useMemo } from 'react';
import { TileConfig, TimeRange } from '../dashboardTypes';
import { BaseTile } from './BaseTile';
import { useTileData } from '../hooks/useTileData';

interface ChartTileProps {
  tile: TileConfig;
  globalTimeRange: TimeRange;
  isEditMode: boolean;
  onUpdateTile(id: string, patch: Partial<TileConfig>): void;
  onOpenSettings(tile: TileConfig): void;
  onDelete?(id: string): void;
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 150;

const buildPath = (values: number[], width: number, height: number): string => {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export const ChartTile: React.FC<ChartTileProps> = ({
  tile,
  globalTimeRange,
  isEditMode,
  onUpdateTile,
  onOpenSettings,
  onDelete,
}) => {
  const { isLoading, error, series } = useTileData(tile, globalTimeRange);
  const values = useMemo(() => series?.map((p) => p.value) ?? [], [series]);
  const path = useMemo(() => buildPath(values, CHART_WIDTH, CHART_HEIGHT), [values]);
  const yDomain = useMemo(() => {
    if (!values.length) return undefined;
    const max = Math.max(...values);
    const min = Math.min(...values);
    return { min, max };
  }, [values]);
  const yTicks = useMemo(() => {
    if (!yDomain) return [];
    if (yDomain.min === yDomain.max) return [yDomain.max];

    const steps = 3;
    const step = (yDomain.max - yDomain.min) / (steps - 1);
    return Array.from({ length: steps }, (_, i) => yDomain.max - step * i);
  }, [yDomain]);

  const formatTick = (value: number) => value.toFixed(tile.decimals ?? 0);

  return (
    <BaseTile
      tile={tile}
      globalTimeRange={globalTimeRange}
      isEditMode={isEditMode}
      isLoading={isLoading}
      error={error}
      onLocalTimeRangeChange={(mode, range) =>
        onUpdateTile(tile.id, { timeMode: mode, overrideTimeRange: range })
      }
      onOpenSettings={() => onOpenSettings(tile)}
      onDelete={onDelete}
    >
      <div className="chart-wrapper">
        <div className="chart-y-axis" aria-hidden={!yTicks.length}>
          {yTicks.map((tick) => (
            <span key={tick} className="chart-y-label">
              {formatTick(tick)}
            </span>
          ))}
        </div>
        <div className="chart-plot">
          <div className="chart-grid" aria-hidden={!yTicks.length}>
            {yTicks.map((tick) => (
              <span key={tick} className="chart-grid-line" />
            ))}
          </div>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mini-chart"
            aria-label="Upload speed chart"
          >
            <path d={path} fill="none" stroke="var(--primary)" strokeWidth="3" />
            {path && (
              <path
                d={`${path} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`}
                fill="var(--primary-fade)"
                stroke="none"
                opacity={0.3}
              />
            )}
          </svg>
        </div>
      </div>
    </BaseTile>
  );
};
